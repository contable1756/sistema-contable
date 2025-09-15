# contabilidad/serializers.py
from rest_framework import serializers
from .models import CuentaContable, AsientoContable, Movimiento

class CuentaContableSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuentaContable
        fields = '__all__'

# contabilidad/serializers.py
class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimiento
        fields = ['cuenta', 'debe', 'haber']

    def validate(self, data):
        if data['debe'] == 0 and data['haber'] == 0:
            raise serializers.ValidationError("El movimiento debe tener debe o haber mayor a 0.")
        
        # Validación por tipo de cuenta
        if data['cuenta'].tipo == 'activo':
            if data['haber'] > 0:
                raise serializers.ValidationError("No se puede registrar haber en una cuenta de activo.")
        elif data['cuenta'].tipo == 'pasivo':
            if data['debe'] > 0:
                raise serializers.ValidationError("No se puede registrar debe en una cuenta de pasivo.")
        elif data['cuenta'].tipo == 'ingreso':
            if data['debe'] > 0:
                raise serializers.ValidationError("No se puede registrar debe en una cuenta de ingreso.")
        elif data['cuenta'].tipo == 'gasto':
            if data['haber'] > 0:
                raise serializers.ValidationError("No se puede registrar haber en una cuenta de gasto.")

        return data

class AsientoContableSerializer(serializers.ModelSerializer):
    movimientos = MovimientoSerializer(many=True)

    class Meta:
        model = AsientoContable
        fields = ['id', 'fecha', 'descripcion', 'usuario', 'movimientos']

    def validate(self, data):
        total_debe = sum(item['debe'] for item in data['movimientos'])
        total_haber = sum(item['haber'] for item in data['movimientos'])
        if abs(total_debe - total_haber) > 0.01:  # Tolerancia por decimales
            raise serializers.ValidationError("El asiento no está balanceado: debe ≠ haber.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['usuario'] = user
        movimientos_data = validated_data.pop('movimientos')
        asiento = AsientoContable.objects.create(**validated_data)
        for movimiento in movimientos_data:
            Movimiento.objects.create(asiento=asiento, **movimiento)
        return asiento