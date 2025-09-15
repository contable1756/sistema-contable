# contabilidad/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import CuentaContable, AsientoContable, Movimiento
from .serializers import CuentaContableSerializer, AsientoContableSerializer
import pandas as pd
from django.http import HttpResponse

class CuentaContableViewSet(viewsets.ModelViewSet):
    queryset = CuentaContable.objects.all().order_by('codigo')
    serializer_class = CuentaContableSerializer

class AsientoContableViewSet(viewsets.ModelViewSet):
    queryset = AsientoContable.objects.all().order_by('-fecha')
    serializer_class = AsientoContableSerializer

@api_view(['GET'])
def balance_comprobacion(request):
    cuentas = CuentaContable.objects.all()
    resultado = []

    for cuenta in cuentas:
        movimientos = Movimiento.objects.filter(cuenta=cuenta)
        debe = movimientos.aggregate(Sum('debe'))['debe__sum'] or 0
        haber = movimientos.aggregate(Sum('haber'))['haber__sum'] or 0
        resultado.append({
            'codigo': cuenta.codigo,
            'nombre': cuenta.nombre,
            'tipo': cuenta.tipo,
            'debe': round(debe, 2),
            'haber': round(haber, 2)
        })

    return Response(resultado)


# INICIO BALANCE GENERAL
@api_view(['GET'])
def balance_general(request):
    """
    Retorna el Balance General agrupado por clasificación
    """
    activo = []
    pasivo = []
    patrimonio = []

    cuentas = CuentaContable.objects.prefetch_related('movimientos').order_by('codigo')

    for cuenta in cuentas:
        saldo = cuenta.calcular_saldo()  # Asegúrate de tener este método
        if saldo == 0:
            continue

        data = {
            'codigo': cuenta.codigo,
            'nombre': cuenta.nombre,
            'saldo': float(saldo),
        }

        # Clasificar
        if cuenta.clasificacion.startswith('1'):
            activo.append(data)
        elif cuenta.clasificacion.startswith('2'):
            pasivo.append(data)
        elif cuenta.clasificacion.startswith('3'):
            patrimonio.append(data)

    total_activo = sum(item['saldo'] for item in activo)
    total_pasivo = sum(item['saldo'] for item in pasivo)
    total_patrimonio = sum(item['saldo'] for item in patrimonio)

    return Response({
        'activo': activo,
        'pasivo': pasivo,
        'patrimonio': patrimonio,
        'total_activo': total_activo,
        'total_pasivo': total_pasivo,
        'total_patrimonio': total_patrimonio,
        'verificacion': round(total_activo, 2) == round(total_pasivo + total_patrimonio, 2)
    })
#FIN BALANCE GENERAL

@api_view(['GET'])
def libro_diario(request):
    """
    Retorna todos los asientos contables ordenados por fecha.
    Formato:
    [
        {
            "id": 1,
            "fecha": "2025-09-09",
            "descripcion": "Compra de insumos",
            "usuario": "Admin Sistema",
            "movimientos": [
                {"cuenta": "1101", "nombre": "Caja", "debe": 500, "haber": 0},
                {"cuenta": "2101", "nombre": "Proveedores", "debe": 0, "haber": 500}
            ],
            "total_debe": 500,
            "total_haber": 500
        }
    ]
    """
    asientos = AsientoContable.objects.all().order_by('-fecha')
    resultado = []

    for asiento in asientos:
        movimientos_data = []
        total_debe = 0
        total_haber = 0

        for movimiento in asiento.movimientos.all():
            debe = float(movimiento.debe)
            haber = float(movimiento.haber)
            total_debe += debe
            total_haber += haber
            movimientos_data.append({
                'cuenta': movimiento.cuenta.codigo,
                'nombre': movimiento.cuenta.nombre,
                'debe': round(debe, 2),
                'haber': round(haber, 2),
            })

        resultado.append({
            'id': asiento.id,
            'fecha': asiento.fecha,
            'descripcion': asiento.descripcion,
            'usuario': f"{asiento.usuario.nombre} {asiento.usuario.apellido}" if asiento.usuario else "Sistema",
            'movimientos': movimientos_data,
            'total_debe': round(total_debe, 2),
            'total_haber': round(total_haber, 2),
        })

    return Response(resultado)

# contabilidad/views.py
@api_view(['GET'])
def libro_mayor(request):
    cuenta_id = request.query_params.get('cuenta_id')
    if not cuenta_id:
        return Response(
            {'error': 'Debe proporcionar cuenta_id'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        cuenta = CuentaContable.objects.get(id=cuenta_id)
    except CuentaContable.DoesNotExist:
        return Response(
            {'error': 'Cuenta no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    movimientos = Movimiento.objects.filter(cuenta=cuenta).select_related('asiento').order_by('asiento__fecha')
    resultado = []

    saldo = 0
    for mov in movimientos:
        debe = float(mov.debe)
        haber = float(mov.haber)
        saldo += debe - haber
        resultado.append({
            'fecha': mov.asiento.fecha,
            'asiento_id': mov.asiento.id,
            'descripcion': mov.asiento.descripcion,
            'debe': debe,
            'haber': haber,
            'saldo': round(saldo, 2)
        })

    return Response({
        'cuenta': {
            'codigo': cuenta.codigo,
            'nombre': cuenta.nombre,
            'tipo': cuenta.tipo
        },
        'movimientos': resultado
    })
    
@api_view(['GET'])
def exportar_libro_diario_excel(request):
    asientos = AsientoContable.objects.all().order_by('-fecha')
    data = []

    for asiento in asientos:
        for movimiento in asiento.movimientos.all():
            data.append({
                'Fecha': asiento.fecha,
                'Asiento ID': asiento.id,
                'Descripción': asiento.descripcion,
                'Cuenta': movimiento.cuenta.codigo,
                'Nombre': movimiento.cuenta.nombre,
                'Debe': movimiento.debe,
                'Haber': movimiento.haber,
            })

    df = pd.DataFrame(data)
    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="libro-diario.xlsx"'
    df.to_excel(response, index=False)
    return response


@api_view(['GET'])
def estado_resultados(request):
    """
    Genera el Estado de Resultados según el P.C.G.A. venezolano
    """
    # 1. INGRESOS (Cuentas que empiezan con '4')
    ingresos = []
    total_ingresos = 0

    cuentas_ingresos = CuentaContable.objects.filter(clasificacion__startswith='4').order_by('codigo')
    for cuenta in cuentas_ingresos:
        saldo = cuenta.calcular_saldo()  # Haber - Debe
        if saldo != 0:
            ingresos.append({
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'saldo': float(saldo)
            })
            total_ingresos += saldo

    # 2. COSTO DE VENTAS (Cuentas que empiezan con '5')
    costo_ventas = []
    total_costo = 0

    cuentas_costo = CuentaContable.objects.filter(clasificacion__startswith='5').order_by('codigo')
    for cuenta in cuentas_costo:
        saldo = cuenta.calcular_saldo()  # Debe - Haber
        if saldo != 0:
            costo_ventas.append({
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'saldo': float(saldo)
            })
            total_costo += saldo

    utilidad_bruta = total_ingresos - total_costo

    # 3. GASTOS OPERATIVOS (Gastos administrativos y de ventas: '6')
    gastos = []
    total_gastos = 0

    cuentas_gastos = CuentaContable.objects.filter(clasificacion__startswith='6').order_by('codigo')
    for cuenta in cuentas_gastos:
        saldo = cuenta.calcular_saldo()  # Debe - Haber
        if saldo != 0:
            gastos.append({
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'saldo': float(saldo)
            })
            total_gastos += saldo

    utilidad_operativa = utilidad_bruta - total_gastos

    # 4. Otros ingresos y gastos (si los tienes, ej: '43', '7', etc.)
    otros_ingresos = []
    total_otros_ingresos = 0

    cuentas_otros_ingresos = CuentaContable.objects.filter(
        clasificacion__startswith='43'  # "OTROS INGRESOS"
    ).order_by('codigo')

    for cuenta in cuentas_otros_ingresos:
        saldo = cuenta.calcular_saldo()
        if saldo != 0:
            otros_ingresos.append({
                'codigo': cuenta.codigo,
                'nombre': cuenta.nombre,
                'saldo': float(saldo)
            })
            total_otros_ingresos += saldo

    # 5. Utilidad Neta
    utilidad_neta = utilidad_operativa + total_otros_ingresos

    return Response({
        'ingresos': ingresos,
        'total_ingresos': round(float(total_ingresos), 2),
        'costo_ventas': costo_ventas,
        'total_costo_ventas': round(float(total_costo), 2),
        'utilidad_bruta': round(float(utilidad_bruta), 2),
        'gastos_operativos': gastos,
        'total_gastos_operativos': round(float(total_gastos), 2),
        'utilidad_operativa': round(float(utilidad_operativa), 2),
        'otros_ingresos': otros_ingresos,
        'total_otros_ingresos': round(float(total_otros_ingresos), 2),
        'utilidad_neta': round(float(utilidad_neta), 2),
    })