# usuarios/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny  # ✅ Importa AllowAny

User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]  # ✅ Permite acceso sin token

    def post(self, request):
        correo = request.data.get('correo')
        password = request.data.get('password')

        print("🔍 POST /api/usuarios/login/ recibido")
        print("Datos:", request.data)

        if not correo or not password:
            return Response(
                {'error': 'Correo y contraseña son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=correo, password=password)
        if not user:
            print(f"❌ Autenticación fallida para: {correo}")
            return Response(
                {'error': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'La cuenta está inactiva.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        print(f"✅ Login exitoso: {user.correo}")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'id': user.id,
            'correo': user.correo,
            'nombre': user.nombre,
            'apellido': user.apellido,
            'rol_codigo': getattr(user.rol, 'codigo', None),
            'rol_nombre': getattr(user.rol, 'nombre', 'Sin rol'),
        }, status=status.HTTP_200_OK)