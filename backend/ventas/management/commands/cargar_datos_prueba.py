# ventas/management/commands/cargar_datos_prueba.py
from django.core.management.base import BaseCommand
from decimal import Decimal
from usuarios.models import Usuario
from contabilidad.models import CuentaContable, AsientoContable, Movimiento
from compras.models import Proveedor, Compra
from ventas.models import Cliente, Venta

class Command(BaseCommand):
    help = 'Carga datos de prueba: 3 compras y 3 ventas con asientos contables'

    def handle(self, *args, **options):
        # === 1. Obtener usuario admin (ID=1) ===
        try:
            usuario = Usuario.objects.get(id=1)
            self.stdout.write(f"👤 Usuario encontrado: {usuario.nombre} {usuario.apellido}")
        except Usuario.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("❌ No se encontró un usuario con ID=1. Crea un superusuario primero.")
            )
            return

        # === 2. Crear o obtener proveedor ===
        proveedor, _ = Proveedor.objects.get_or_create(
            rif='J-87654321-0',
            defaults={
                'nombre': 'Proveedor XYZ',
                'direccion': 'Av. Principal, Ciudad',
                'telefono': '0212-1234567',
                'email': 'contacto@proveedorxyz.com',
                'tipo_proveedor': 'PJ'
            }
        )

        # === 3. Crear o obtener cliente ===
        cliente, _ = Cliente.objects.get_or_create(
            rif='V-98765432-1',
            defaults={
                'nombre': 'Cliente ABC',
                'direccion': 'Calle Central, Caracas'
            }
        )

        # === 4. Obtener cuentas contables clave ===
        try:
            cuenta_efectivo = CuentaContable.objects.get(codigo='1111')      # Efectivo
            cuenta_compras = CuentaContable.objects.get(codigo='5120')      # Compras Nacionales
            cuenta_iva = CuentaContable.objects.get(codigo='2110')          # EXP MERCANTILES (IVA)
            cuenta_proveedores = CuentaContable.objects.get(codigo='2120')  # CUENTAS POR PAGAR
            cuenta_ventas = CuentaContable.objects.get(codigo='4110')       # INGRESOS POR SERVICIOS
        except CuentaContable.DoesNotExist as e:
            self.stdout.write(
                self.style.ERROR(f"❌ No se encontró una cuenta contable requerida: {e}")
            )
            return

        # === 5. Registrar 3 COMPRAS ===
        compras_data = [
            {'numero_factura': 'C-001', 'subtotal': Decimal('500.00'), 'impuesto_general': Decimal('80.00'), 'total': Decimal('580.00')},
            {'numero_factura': 'C-002', 'subtotal': Decimal('300.00'), 'impuesto_general': Decimal('48.00'), 'total': Decimal('348.00')},
            {'numero_factura': 'C-003', 'subtotal': Decimal('700.00'), 'impuesto_general': Decimal('112.00'), 'total': Decimal('812.00')}
        ]

        for data in compras_data:
            compra, created = Compra.objects.get_or_create(
                numero_factura=data['numero_factura'],
                proveedor=proveedor,
                defaults={
                    'fecha': '2025-09-12',
                    'subtotal': data['subtotal'],
                    'descuento': Decimal('0.00'),
                    'total_compra': data['total'],
                    'base_imponible_general': data['subtotal'],
                    'impuesto_general': data['impuesto_general'],
                    'usuario': usuario
                }
            )

            if created:
                asiento = AsientoContable.objects.create(
                    fecha=compra.fecha,
                    descripcion=f"Compra N° {compra.numero_factura} a {proveedor.nombre}",
                    usuario=usuario
                )

                Movimiento.objects.create(asiento=asiento, cuenta=cuenta_compras, debe=data['subtotal'], haber=Decimal('0.00'))
                Movimiento.objects.create(asiento=asiento, cuenta=cuenta_iva, debe=data['impuesto_general'], haber=Decimal('0.00'))
                Movimiento.objects.create(asiento=asiento, cuenta=cuenta_proveedores, debe=Decimal('0.00'), haber=data['total'])
                compra.asiento = asiento
                compra.save()

                self.stdout.write(f"✅ Compra creada: {compra.numero_factura}")

        # === 6. Registrar 3 VENTAS ===
        ventas_data = [
            {'numero_factura': 'V-001', 'subtotal': Decimal('1000.00'), 'impuesto_general': Decimal('160.00'), 'total': Decimal('1160.00')},
            {'numero_factura': 'V-002', 'subtotal': Decimal('600.00'), 'impuesto_general': Decimal('96.00'), 'total': Decimal('696.00')},
            {'numero_factura': 'V-003', 'subtotal': Decimal('900.00'), 'impuesto_general': Decimal('144.00'), 'total': Decimal('1044.00')}
        ]

        for data in ventas_data:
            venta, created = Venta.objects.get_or_create(
                numero_factura=data['numero_factura'],
                cliente=cliente,
                defaults={
                    'fecha': '2025-09-12',
                    'subtotal': data['subtotal'],
                    'total': data['total'],
                    'base_imponible_general': data['subtotal'],
                    'impuesto_general': data['impuesto_general'],
                    'estado': 'emitida',
                    'usuario': usuario
                }
            )

            if created:
                asiento = AsientoContable.objects.create(
                    fecha=venta.fecha,
                    descripcion=f"Venta N° {venta.numero_factura} a {cliente.nombre}",
                    usuario=usuario
                )

                Movimiento.objects.create(asiento=asiento, cuenta=cuenta_efectivo, debe=data['total'], haber=Decimal('0.00'))
                Movimiento.objects.create(asiento=asiento, cuenta=cuenta_ventas, debe=Decimal('0.00'), haber=data['subtotal'])
                Movimiento.objects.create(asiento=asiento, cuenta=cuenta_iva, debe=Decimal('0.00'), haber=data['impuesto_general'])
                venta.asiento = asiento
                venta.save()

                self.stdout.write(f"✅ Venta creada: {venta.numero_factura}")

        # === 7. Mensaje final ===
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("🚀 DATOS DE PRUEBA CARGADOS"))
        self.stdout.write("="*60)
        self.stdout.write("Accede a:")
        self.stdout.write("  - Estado de Resultados")
        self.stdout.write("  - Balance General")
        self.stdout.write("="*60)