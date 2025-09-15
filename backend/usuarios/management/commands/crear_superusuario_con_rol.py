# usuarios/management/commands/crear_superusuario_con_rol.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from usuarios.models import Usuario
from usuarios.models import Rol  # Ajusta según dónde tengas el modelo Rol

User = get_user_model()

class Command(BaseCommand):
    help = 'Crea un superusuario con rol asignado si no existe'

    def handle(self, *args, **options):
        # === 1. Definir credenciales del superusuario ===
        correo = 'admin@contable.com'
        nombre = 'Admin'
        apellido = 'Sistema'
        password = '123456'

        # === 2. Crear roles si no existen ===
        roles_data = [
            {'codigo': 'admin', 'nombre': 'Administrador'},
            {'codigo': 'contador', 'nombre': 'Contador'},
            {'codigo': 'empleado', 'nombre': 'Empleado'},
        ]

        for role_data in roles_data:
            rol, created = Rol.objects.get_or_create(
                codigo=role_data['codigo'],
                defaults={'nombre': role_data['nombre']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Rol creado: {rol.nombre} ({rol.codigo})")
                )
            else:
                self.stdout.write(f"👤 Rol ya existe: {rol.nombre}")

        # Obtener el rol de administrador
        try:
            rol_admin = Rol.objects.get(codigo='admin')
        except Rol.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("❌ No se encontró el rol 'admin'. No se puede asignar.")
            )
            return

        # === 3. Crear superusuario si no existe ===
        usuario, created = Usuario.objects.get_or_create(
            correo=correo,
            defaults={
                'nombre': nombre,
                'apellido': apellido,
                'is_staff': True,
                'is_superuser': True,
                'rol': rol_admin
            }
        )

        if created:
            usuario.set_password(password)
            usuario.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"🎉 Superusuario creado: {correo} | Contraseña: {password}"
                )
            )
        else:
            # Si ya existe, aseguramos que tenga los permisos y rol correctos
            if not usuario.is_staff or not usuario.is_superuser:
                usuario.is_staff = True
                usuario.is_superuser = True
                usuario.save()
                self.stdout.write(
                    self.style.WARNING("⚠️ Permisos de superusuario restablecidos")
                )

            # Asignar rol admin si no tiene
            if not usuario.rol:
                usuario.rol = rol_admin
                usuario.save()
                self.stdout.write(
                    self.style.SUCCESS("✅ Rol 'admin' asignado al superusuario existente")
                )
            elif usuario.rol.codigo != 'admin':
                usuario.rol = rol_admin
                usuario.save()
                self.stdout.write(
                    self.style.SUCCESS("🔄 Rol actualizado a 'admin'")
                )

            self.stdout.write(
                self.style.NOTICE(f"👤 Superusuario ya existe: {correo}")
            )

        # === Mensaje final ===
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS("🚀 Sistema listo para usar"))
        self.stdout.write("="*50)
        self.stdout.write(f"🔑 Correo: {correo}")
        self.stdout.write(f"🔐 Contraseña: {password}")
        self.stdout.write(f"🎯 Accede al admin en: http://localhost:8000/admin/")
        self.stdout.write("="*50)