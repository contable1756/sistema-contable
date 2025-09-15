# compras/serializers.py
from rest_framework import serializers
from .models import Compra, Proveedor

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ['id', 'rif', 'nombre', 'direccion']

class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = '__all__'
    
    def create(self, validated_data):
        return Compra.objects.create(**validated_data)

    def create(self, validated_data):
        proveedor_data = validated_data.pop('proveedor')
        proveedor, created = Proveedor.objects.get_or_create(
            rif=proveedor_data.rif,
            defaults=proveedor_data
        )
        compra = Compra.objects.create(proveedor=proveedor, **validated_data)
        return compra