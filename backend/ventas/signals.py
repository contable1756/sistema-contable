# ventas/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Venta
from contabilidad.models import AsientoContable, Movimiento, CuentaContable

@receiver(post_save, sender=Venta)
def crear_asiento_venta(sender, instance, created, **kwargs):
    if created and instance.asiento is None:
        # Obtén las cuentas (ajusta según tu plan de cuentas)
        cuenta_caja = CuentaContable.objects.get(codigo="1111")  # Efectivo
        cuenta_ventas = CuentaContable.objects.get(codigo="4110")  # Ingresos por servicios

        asiento = AsientoContable.objects.create(
            fecha=instance.fecha,
            descripcion=f"Venta N° {instance.numero_factura} a {instance.cliente.nombre}",
            usuario=instance.usuario
        )

        Movimiento.objects.create(asiento=asiento, cuenta=cuenta_caja, debe=instance.total, haber=0)
        Movimiento.objects.create(asiento=asiento, cuenta=cuenta_ventas, debe=0, haber=instance.total)

        instance.asiento = asiento
        instance.save()