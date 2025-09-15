# compras/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Compra
from contabilidad.models import AsientoContable, Movimiento, CuentaContable

@receiver(post_save, sender=Compra)
def crear_asiento_compra(sender, instance, created, **kwargs):
    """
    Crea automáticamente un asiento contable cuando se registra una compra.
    Usa cuentas predeterminadas (ajusta según tu Plan de Cuentas P.C.G.A.)
    """
    if not created or instance.asiento:
        return

    # Obtén cuentas del plan de cuentas (ajusta según tu estructura)
    try:
        cuenta_proveedores = CuentaContable.objects.get(codigo="2120")  # Cuentas por Pagar
        cuenta_compras = CuentaContable.objects.get(codigo="5120")      # Compras Netas Nacionales
        cuenta_iva = CuentaContable.objects.get(codigo="2110")          # Efectos por Pagar (IVA)
    except CuentaContable.DoesNotExist:
        # Si no existen, no crees el asiento (mejor notificar)
        return

    # Desglose del IVA
    total_iva = (
        instance.impuesto_general +
        instance.impuesto_reducido +
        instance.impuesto_adicional
    )

    # Crear asiento
    asiento = AsientoContable.objects.create(
        fecha=instance.fecha,
        descripcion=f"Compra N° {instance.numero_factura} a {instance.proveedor.nombre}",
        usuario=instance.usuario
    )

    # Movimientos
    Movimiento.objects.create(
        asiento=asiento,
        cuenta=cuenta_compras,
        debe=instance.subtotal,
        haber=0
    )
    Movimiento.objects.create(
        asiento=asiento,
        cuenta=cuenta_iva,
        debe=total_iva,
        haber=0
    )
    Movimiento.objects.create(
        asiento=asiento,
        cuenta=cuenta_proveedores,
        debe=0,
        haber=instance.total_compra
    )

    # Asociar al modelo Compra
    instance.asiento = asiento
    instance.save(update_fields=['asiento'])