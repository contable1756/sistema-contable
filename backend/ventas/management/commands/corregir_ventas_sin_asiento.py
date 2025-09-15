# ventas/management/commands/corregir_ventas_sin_asiento.py
from django.core.management.base import BaseCommand
from ventas.models import Venta
from contabilidad.models import AsientoContable, Movimiento
from decimal import Decimal

class Command(BaseCommand):
    help = 'Crea asientos contables para ventas que no tienen uno asociado'

    def handle(self, *args, **options):
        ventas_sin_asiento = Venta.objects.filter(asiento__isnull=True)
        total_corregidas = 0

        for venta in ventas_sin_asiento:
            try:
                # Buscar cuentas contables
                cuenta_caja = AsientoContable.objects.get(codigo="1111")  # Efectivo
                cuenta_ventas = AsientoContable.objects.get(codigo="4110")  # Ingresos

                # Crear asiento
                asiento = AsientoContable.objects.create(
                    fecha=venta.fecha,
                    descripcion=f"Corrección: Venta N° {venta.numero_factura} a {venta.cliente.nombre}",
                    usuario=venta.usuario or None
                )

                # Movimientos
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

                # Asociar al asiento
                venta.asiento = asiento
                venta.save()

                self.stdout.write(
                    self.style.SUCCESS(f'✅ Asiento creado para Venta {venta.id}')
                )
                total_corregidas += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error en Venta {venta.id}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'✅ Total de ventas corregidas: {total_corregidas}')
        )