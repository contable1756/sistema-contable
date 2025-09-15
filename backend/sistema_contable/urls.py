# sistema_contable/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/contabilidad/', include('contabilidad.urls')),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/compras/', include('compras.urls')),
    path('api/ventas/', include('ventas.urls')),
]