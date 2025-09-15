# sistema_contable/management/commands/cargar_datos_prueba.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from contabilidad.models import CuentaContable, AsientoContable, Movimiento
from compras.models import Proveedor, Compra
from ventas.models import Cliente, Venta
from decimal import Decimal
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Carga datos de prueba para el sistema contable'

    def handle(self, *args, **options):
        # === 1. Limpiar datos anteriores (opcional) ===
        confirm = input("⚠️ ¿Eliminar todos los datos existentes? (s/n): ")
        if confirm.lower() == 's':
            self.stdout.write("🧹 Limpiando base de datos...")
            AsientoContable.objects.all().delete()
            Movimiento.objects.all().delete()
            Compra.objects.all().delete()
            Venta.objects.all().delete()
            Proveedor.objects.all().delete()
            Cliente.objects.all().delete()
            CuentaContable.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS("✅ Datos eliminados"))

        # === 2. Crear usuario admin si no existe ===
        admin_email = 'admin@contable.com'
        if not User.objects.filter(correo=admin_email).exists():
            User.objects.create_superuser(
                correo=admin_email,
                nombre='Admin',
                apellido='Sistema',
                password='123456'
            )
            self.stdout.write(self.style.SUCCESS("✅ Superusuario creado: admin@contable.com / 123456"))
        else:
            self.stdout.write("👤 Superusuario ya existe")

        # === 3. Crear Plan de Cuentas (básico) ===
        cuentas_data = [
            # Activo
            {'codigo': '1111', 'nombre': 'EFECTIVO', 'tipo': 'activo', 'clasificacion': '1111'},
            {'codigo': '1122', 'nombre': 'CUENTAS POR COBRAR CLIENTES', 'tipo': 'activo', 'clasificacion': '1122'},
            {'codigo': '1124', 'nombre': 'INVENTARIOS', 'tipo': 'activo', 'clasificacion': '1124'},

            # Pasivo
            {'codigo': '2110', 'nombre': 'EXP MERCANTILES', 'tipo': 'pasivo', 'clasificacion': '2110'},
            {'codigo': '2120', 'nombre': 'CUENTAS POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2120'},

            # Patrimonio
            {'codigo': '3110', 'nombre': 'CAPITAL SOCIAL', 'tipo': 'patrimonio', 'clasificacion': '3110'},
            {'codigo': '3310', 'nombre': 'UTILIDADES NO DISTRIBUIDAS', 'tipo': 'patrimonio', 'clasificacion': '3310'},

            # Ingresos
            {'codigo': '4110', 'nombre': 'INGRESOS POR SERVICIOS', 'tipo': 'ingreso', 'clasificacion': '4110'},

            # Costos
            {'codigo': '5120', 'nombre': 'COMPRAS NETAS NACIONALES', 'tipo': 'gasto', 'clasificacion': '5120'},

            # Gastos
            {'codigo': '6101', 'nombre': 'REMUNERACIONES', 'tipo': 'gasto', 'clasificacion': '6101'},
            {'codigo': '6120', 'nombre': 'GASTOS DE OFICINA Y VENTAS', 'tipo': 'gasto', 'clasificacion': '6120'},
        ]

        for data in cuentas_
            cuenta, created = CuentaContable.objects.get_or_create(
                codigo=data['codigo'],
                defaults=data
            )
            if created:
                self.stdout.write(f"✅ Creada cuenta: {cuenta.codigo} - {cuenta.nombre}")

        # === 4. Crear proveedor y cliente de prueba ===
        proveedor, _ = Proveedor.objects.get_or_create(
            rif='J-87654321-0',
            defaults={
                'nombre': 'Proveedor XYZ',
                'direccion': 'Av. Principal, Ciudad',
                'telefono': '0212-1234567',
                'email': 'contacto@proveedorxyz.com'
            }
        )

        cliente, _ = Cliente.objects.get_or_create(
            rif='V-98765432-1',
            defaults={
                'nombre': 'Cliente ABC',
                'direccion': 'Calle Central, Caracas'
            }
        )

        self.stdout.write(f"🏢 Proveedor creado: {proveedor}")
        self.stdout.write(f"🧑‍💼 Cliente creado: {cliente}")

        # === 5. Crear asiento inicial (apertura con efectivo) ===
        try:
            cuenta_efectivo = CuentaContable.objects.get(codigo='1111')
            cuenta_capital = CuentaContable.objects.get(codigo='3110')

            asiento_apertura = AsientoContable.objects.create(
                fecha='2025-09-01',
                descripcion='Capital inicial depositado en efectivo',
                usuario=User.objects.get(correo=admin_email)
            )

            Movimiento.objects.create(
                asiento=asiento_apertura,
                cuenta=cuenta_efectivo,
                debe=Decimal('10000.00'),
                haber=Decimal('0.00')
            )
            Movimiento.objects.create(
                asiento=asiento_apertura,
                cuenta=cuenta_capital,
                debe=Decimal('0.00'),
                haber=Decimal('10000.00')
            )

            self.stdout.write("🏦 Asiento de apertura creado: +10,000 Bs en Efectivo")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error al crear asiento de apertura: {e}"))

        # === 6. Instrucciones finales ===
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS("🚀 DATOS DE PRUEBA CARGADOS CON ÉXITO"))
        self.stdout.write("="*50)
        self.stdout.write("🔑 Login: admin@contable.com / 123456")
        self.stdout.write("🛒 Siguiente paso:")
        self.stdout.write("   1. Inicia sesión en el frontend")
        self.stdout.write("   2. Registra una COMPRA usando RIF: J-87654321-0")
        self.stdout.write("   3. Registra una VENTA usando RIF: V-98765432-1")
        self.stdout.write("📊 Luego verifica:")
        self.stdout.write("   - Estado de Resultados")
        self.stdout.write("   - Balance General")
        self.stdout.write("="*50)