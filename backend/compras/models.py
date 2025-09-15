# compras/models.py
from django.db import models
from usuarios.models import Usuario
from contabilidad.models import AsientoContable, CuentaContable
from decimal import Decimal

class Proveedor(models.Model):
    """
    Proveedor o entidad desde la cual se adquieren bienes o servicios.
    """
    TIPO_PROVEEDOR = [
        ('PJ', 'Persona Jurídica'),
        ('PN', 'Persona Natural'),
    ]

    rif = models.CharField(max_length=20, unique=True, verbose_name="RIF")
    nombre = models.CharField(max_length=150, verbose_name="Nombre/Razón Social")
    direccion = models.TextField(blank=True, null=True, verbose_name="Dirección")
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")
    tipo_proveedor = models.CharField(
        max_length=2,
        choices=TIPO_PROVEEDOR,
        default='PJ',
        verbose_name="Tipo de Proveedor"
    )
    email = models.EmailField(blank=True, null=True)

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.rif})"


class Compra(models.Model):
    """
    Representa una factura de compra registrada.
    """
    # Encabezado de la factura
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, verbose_name="Proveedor")
    fecha = models.DateField(verbose_name="Fecha de Compra")
    numero_factura = models.CharField(max_length=50, verbose_name="Número de Factura")
    numero_control = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Número de Control"
    )
    planilla_importacion = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Planilla de Importación"
    )

    # Totales
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    descuento = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_compra = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total Incluye IVA")

    # Campos para IVA por tasa
    base_imponible_general = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Base Alicuota General (16%)"
    )
    impuesto_general = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Impuesto Alicuota General"
    )

    base_imponible_reducida = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Base Alicuota Reducida (8%)"
    )
    impuesto_reducido = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Impuesto Alicuota Reducida"
    )

    base_imponible_adicional = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Base Alicuota Adicional (22%)"
    )
    impuesto_adicional = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Impuesto Alicuota Adicional"
    )

    # Relaciones
    asiento = models.OneToOneField(
        AsientoContable,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Asiento Contable"
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Registrado por"
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Compra"
        verbose_name_plural = "Compras"
        ordering = ['-fecha']
        unique_together = ['proveedor', 'numero_factura']  # Evita duplicados

    def __str__(self):
        return f"Compra {self.numero_factura} - {self.proveedor.nombre}"

    def save(self, *args, **kwargs):
        """
        Sobrescribimos save para asegurar que los cálculos estén correctos antes de guardar.
        """
        # Validación básica
        if self.total_compra < 0:
            raise ValueError("El total no puede ser negativo.")

        super().save(*args, **kwargs)


class DetalleCompra(models.Model):
    """
    Línea de detalle de una compra (productos o servicios).
    Opcional: útil si manejas inventario.
    """
    compra = models.ForeignKey(Compra, on_delete=models.CASCADE, related_name='detalles')
    descripcion = models.CharField(max_length=200, verbose_name="Descripción")
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    total_linea = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = "Detalle de Compra"
        verbose_name_plural = "Detalles de Compra"

    def save(self, *args, **kwargs):
        self.total_linea = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.descripcion} x{self.cantidad}"