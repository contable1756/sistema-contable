# compras/views.py
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Compra, Proveedor
from .serializers import CompraSerializer, ProveedorSerializer
from contabilidad.models import AsientoContable, Movimiento, CuentaContable
from decimal import Decimal

User = get_user_model()

class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all().order_by('-fecha')
    serializer_class = CompraSerializer

    def perform_create(self, serializer):
        # Guardar la compra
        compra = serializer.save(usuario=self.request.user)

        # Obtener cuentas del plan de cuentas (ajusta según tu estructura)
        try:
            cuenta_proveedores = CuentaContable.objects.get(codigo="2120")  # Cuentas por Pagar
            cuenta_compras = CuentaContable.objects.get(codigo="5120")      # Compras Netas Nacionales
            cuenta_iva = CuentaContable.objects.get(codigo="2110")          # Efectos por Pagar (IVA)
        except CuentaContable.DoesNotExist:
            raise Exception("Las cuentas contables requeridas no existen. Verifica el Plan de Cuentas.")

        # Calcular total IVA
        total_iva = (
            compra.impuesto_general +
            compra.impuesto_reducido +
            compra.impuesto_adicional
        )

        # Crear asiento contable
        asiento = AsientoContable.objects.create(
            fecha=compra.fecha,
            descripcion=f"Compra N° {compra.numero_factura} a {compra.proveedor.nombre}",
            usuario=self.request.user
        )

        # Movimientos: Debe (compras + IVA), Haber (proveedor)
        Movimiento.objects.create(
            asiento=asiento,
            cuenta=cuenta_compras,
            debe=compra.subtotal,
            haber=Decimal('0.00')
        )
        Movimiento.objects.create(
            asiento=asiento,
            cuenta=cuenta_iva,
            debe=total_iva,
            haber=Decimal('0.00')
        )
        Movimiento.objects.create(
            asiento=asiento,
            cuenta=cuenta_proveedores,
            debe=Decimal('0.00'),
            haber=compra.total_compra
        )

        # Asociar asiento a la compra
        compra.asiento = asiento
        compra.save()

@api_view(['GET'])
def libro_compras(request):
    compras = Compra.objects.all().order_by('fecha')
    data = []

    for c in compras:
        data.append({
            'operacion': c.id,
            'dia': c.fecha.day,
            'numero_factura': c.numero_factura,
            'numero_control': c.numero_control or '',
            'nombre_proveedor': c.proveedor.nombre,
            'rif_proveedor': c.proveedor.rif,
            'tipo_transaccion': 'F',
            'total_compra': float(c.total_compra),
            'compras_sin_derecho_fiscal': 0.0,
            'base_general': float(c.base_imponible_general),
            'impuesto_general': float(c.impuesto_general),
            'base_reducida': float(c.base_imponible_reducida),
            'impuesto_reducido': float(c.impuesto_reducido),
            'base_adicional': float(c.base_imponible_adicional),
            'impuesto_adicional': float(c.impuesto_adicional),
        })

    return Response(data)

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

    def get_queryset(self):
        """
        Permite filtrar por `rif` o `nombre`
        Ej: /api/compras/proveedores/?rif=J-123&search=ABC
        """
        queryset = Proveedor.objects.all()
        rif = self.request.query_params.get('rif', None)
        search = self.request.query_params.get('search', None)

        if rif:
            queryset = queryset.filter(rif__iexact=rif)
        if search:
            queryset = queryset.filter(nombre__icontains=search)

        return queryset
    
@api_view(['GET'])
def lista_proveedores(request):
    """
    Endpoint simple para búsquedas rápidas.
    Usa ?rif=... o ?search=...
    """
    rif = request.query_params.get('rif')
    search = request.query_params.get('search')

    if rif:
        proveedores = Proveedor.objects.filter(rif__iexact=rif)
    elif search:
        proveedores = Proveedor.objects.filter(nombre__icontains=search)
    else:
        proveedores = Proveedor.objects.none()

    serializer = ProveedorSerializer(proveedores, many=True)
    return Response(serializer.data)