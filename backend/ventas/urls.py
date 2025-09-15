# ventas/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Registrar el ViewSet con el router
router = DefaultRouter()
router.register(r'ventas', views.VentaViewSet, basename='venta')
router.register(r'clientes', views.ClienteViewSet)

# Incluir solo las rutas del router + endpoints personalizados
urlpatterns = [
    path('', include(router.urls)),  # Incluye todas las rutas del ViewSet
    path('reportes/libro-ventas/', views.libro_ventas),  # Endpoint personalizado
    path('corregir-ventas-sin-asiento/', views.corregir_ventas_sin_asiento_api),
]