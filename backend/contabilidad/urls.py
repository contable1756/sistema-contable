# contabilidad/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cuentas', views.CuentaContableViewSet)
router.register(r'asientos', views.AsientoContableViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('reportes/balance-comprobacion/', views.balance_comprobacion),
    path('reportes/estado-resultados/', views.estado_resultados),
    path('reportes/balance-general/', views.balance_general),
    path('reportes/libro-diario/', views.libro_diario),
    path('reportes/libro-mayor/', views.libro_mayor),
]