# inicializar_db.py
import os
import django
from django.core.management import call_command

def setup():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_contable.settings')
    django.setup()

    print("🔹 Aplicando migraciones...")
    call_command('migrate')

    print("🔹 Cargando roles...")
    call_command('loaddata', 'fixtures/roles.json')

    print("🔹 Cargando usuarios...")
    call_command('loaddata', 'fixtures/usuarios.json')

    print("🔹 Cargando cuentas contables...")
    call_command('loaddata', 'fixtures/cuentas_contables.json')

    print("🔹 Cargando clientes y proveedores...")
    call_command('loaddata', 'fixtures/clientes.json')
    call_command('loaddata', 'fixtures/proveedores.json')

    print("🔹 Cargando asientos y movimientos...")
    call_command('loaddata', 'fixtures/asientos.json')
    call_command('loaddata', 'fixtures/movimientos.json')

    print("🔹 Cargando ventas y compras...")
    call_command('loaddata', 'fixtures/ventas.json')
    call_command('loaddata', 'fixtures/compras.json')

    print("✅ Sistema inicializado con éxito.")

if __name__ == '__main__':
    setup()