# compras/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'compras', views.CompraViewSet, basename='compra')
router.register(r'proveedores', views.ProveedorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('proveedores/', views.lista_proveedores),
    path('reportes/libro-compras/', views.libro_compras),
]