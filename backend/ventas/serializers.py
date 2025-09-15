# ventas/serializers.py
from rest_framework import serializers
from .models import Venta, Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'rif', 'nombre', 'direccion']

class VentaSerializer(serializers.ModelSerializer):
    # Solo lectura: muestra datos completos del cliente
    cliente = ClienteSerializer(read_only=True)
    
    # Para escritura, usa cliente_id
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        source='cliente',
        write_only=True
    )

    class Meta:
        model = Venta
        fields = '__all__'