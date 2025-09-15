# ventas/models.py
from django.db import models
from contabilidad.models import AsientoContable
from usuarios.models import Usuario

class Cliente(models.Model):
    rif = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=150)
    direccion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

class Venta(models.Model):
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('emitida', 'Emitida'),
        ('anulada', 'Anulada'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha = models.DateField()
    numero_factura = models.CharField(max_length=50, unique=True)
    numero_control = models.CharField(max_length=50, blank=True, null=True)

    # Totales generales
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    # Desglose de IVA (campos obligatorios para reportes fiscales)
    base_imponible_general = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)   # 16%
    impuesto_general = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    base_imponible_reducida = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)   # 8%
    impuesto_reducido = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    base_imponible_adicional = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # 22%
    impuesto_adicional = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='borrador')

    # Relación contable
    asiento = models.OneToOneField(AsientoContable, on_delete=models.SET_NULL, null=True, blank=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Venta {self.numero_factura} - {self.total}"

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ['-fecha']