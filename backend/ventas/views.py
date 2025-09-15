# ventas/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .models import Venta, Cliente
from .serializers import VentaSerializer, ClienteSerializer
from contabilidad.models import AsientoContable, Movimiento, CuentaContable
from decimal import Decimal
from django.core.management import call_command
import io
import sys

User = get_user_model()

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by('-fecha')
    serializer_class = VentaSerializer

    def perform_create(self, serializer):
        # Guardar la venta
        venta = serializer.save(usuario=self.request.user)

        # Obtener cuentas del plan de cuentas (ajusta según tu estructura)
        try:
            cuenta_caja = CuentaContable.objects.get(codigo="1111")  # Efectivo
            cuenta_ventas = CuentaContable.objects.get(codigo="4110")  # Ingresos por servicios
        except CuentaContable.DoesNotExist:
            raise Exception("Las cuentas contables requeridas no existen. Verifica el Plan de Cuentas.")

        # Crear asiento contable
        asiento = AsientoContable.objects.create(
            fecha=venta.fecha,
            descripcion=f"Venta N° {venta.numero_factura} a {venta.cliente.nombre}",
            usuario=self.request.user
        )

        # Movimientos: Debe (caja), Haber (ventas)
        Movimiento.objects.create(
            asiento=asiento,
            cuenta=cuenta_caja,
            debe=venta.total,
            haber=Decimal('0.00')
        )
        Movimiento.objects.create(
            asiento=asiento,
            cuenta=cuenta_ventas,
            debe=Decimal('0.00'),
            haber=venta.total
        )

        # Asociar asiento a la venta
        venta.asiento = asiento
        venta.save()

@api_view(['GET'])
def libro_ventas(request):
    ventas = Venta.objects.all().order_by('fecha')
    data = []

    for v in ventas:
        data.append({
            'operacion': v.id,
            'dia': v.fecha.day,
            'numero_factura': v.numero_factura,
            'numero_control': v.numero_control or '',
            'nombre_cliente': v.cliente.nombre,
            'rif_cliente': v.cliente.rif,
            'tipo_transaccion': 'F',
            'total_venta': float(v.total),
            'ventas_sin_derecho_fiscal': 0.0,
            'base_general': float(v.base_imponible_general),
            'impuesto_general': float(v.impuesto_general),
            'base_reducida': float(v.base_imponible_reducida),
            'impuesto_reducido': float(v.impuesto_reducido),
            'base_adicional': float(v.base_imponible_adicional),
            'impuesto_adicional': float(v.impuesto_adicional),
        })

    return Response(data)

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

    def get_queryset(self):
        queryset = Cliente.objects.all()
        rif = self.request.query_params.get('rif')
        if rif:
            queryset = queryset.filter(rif__iexact=rif)
        return queryset
    
@api_view(['POST'])
def corregir_ventas_sin_asiento_api(request):
    """
    Endpoint para corregir ventas sin asiento desde el frontend
    """
    # Capturar salida del comando
    old_stdout = sys.stdout
    sys.stdout = captured_output = io.StringIO()

    try:
        call_command('corregir_ventas_sin_asiento')
        output = captured_output.getvalue()
        sys.stdout = old_stdout

        return Response({
            'success': True,
            'message': 'Ventas corregidas exitosamente',
            'log': output
        })
    except Exception as e:
        sys.stdout = old_stdout
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)