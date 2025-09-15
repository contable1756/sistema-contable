# contabilidad/models.py
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class CuentaContable(models.Model):
    # Tipos de cuenta según el P.C.G.A.
    TIPOS = [
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ]

    # Clasificación según el P.C.G.A.
    CLASIFICACIONES = [
        ('1', 'ACTIVO'),
        ('11', 'ACTIVO CIRCULANTE'),
        ('111', 'DISPONIBLE'),
        ('1111', 'EFECTIVO'),
        ('1112', 'BANCOS NACIONALES'),
        ('1113', 'BANCOS EN EL EXTERIOR'),
        ('112', 'REALIZABLE'),
        ('1121', 'EFECTOS POR COBRAR'),
        ('1122', 'CUENTAS POR COBRAR CLIENTES'),
        ('1123', 'OTRAS CUENTAS POR COBRAR'),
        ('1124', 'INVENTARIOS'),
        ('113', 'PREPAGADOS'),
        ('1131', 'GASTOS PAGADOS POR ANTICIPADO'),
        ('1133', 'ANTICIPOS PAGADOS'),
        ('1134', 'INVERSIONES'),
        ('12', 'ACTIVO FIJO'),
        ('1210', 'TERRENOS'),
        ('1220', 'EDIFICIOS'),
        ('1221', '-DEPREC. ACUM. EDIFICIOS'),
        ('1222', 'LOCALES COMERCIALES'),
        ('1223', '-DEPREC. ACUM. LOCALES COMERCIALES'),
        ('1224', 'GALPONES'),
        ('1225', '-DEPREC. ACUM. GALPONES'),
        ('1240', 'MAQUINARIAS'),
        ('1241', '-DEPREC. ACUM. MAQUINARIA'),
        ('1250', 'INSTALACIONES'),
        ('1251', '-DEPREC. ACUM. INST. DEL INMUEBLE'),
        ('1260', 'MOBILIARIOS Y EQUIPOS DE OFICINA'),
        ('1261', '-DEPREC. ACUM. MOBILIARIOS y EQ.DE OFIC.'),
        ('1270', 'VEHICULOS DE REPARTO'),
        ('1271', '-DEPREC. ACUM. VEHICULOS DE REPARTO'),
        ('1272', 'VEHICULOS DE OFICINA'),
        ('1273', '-DEPREC. ACUM. VEHICULOS DE OFICINA'),
        ('13', 'CARGOS DIFERIDOS'),
        ('1310', 'PROYECTOS EN PROCESO'),
        ('14', 'OTROS ACTIVOS'),
        ('1410', 'DEPOSITOS ENTREGADOS EN GARANTIA'),
        ('1420', 'INTANGIBLES'),
        ('2', 'PASIVO'),
        ('21', 'PASIVO CIRCULANTE'),
        ('211', 'EFECTOS POR PAGAR'),
        ('2110', 'EXP MERCANTILES'),
        ('212', 'CUENTAS POR PAGAR'),
        ('2120', 'CUENTAS POR PAGAR'),
        ('215', 'OTRAS CUENTAS POR PAGAR'),
        ('2150', 'OTRAS CUENTAS POR PAGAR'),
        ('22', 'RETENCIONES Y APORTES POR PAGAR'),
        ('2210', 'RETENCIONES POR PAGAR'),
        ('2220', 'APORTES POR PAGAR'),
        ('2230', 'REMUNERACIONES POR PAGAR'),
        ('2240', 'GASTOS ACUMULADOS POR PAGAR'),
        ('24', 'LARGO PLAZO'),
        ('2410', 'HIPOTECAS'),
        ('25', 'CONTINGENTE'),
        ('2510', 'APARTADOS PRESTACIONES SOCIALES'),
        ('26', 'DIFERIDO'),
        ('2610', 'CREDITOS DIFERIDOS'),
        ('3', 'CUENTAS DE PATRIMONIO'),
        ('31', 'CAPITAL'),
        ('3110', 'CAPITAL SOCIAL'),
        ('3120', 'ACTUALIZACION DE CAPITAL'),
        ('32', 'RESERVAS'),
        ('3210', 'RESERVAS'),
        ('33', 'SUPERAVIT'),
        ('3310', 'UTILIDADES NO DISTRIBUIDAS'),
        ('35', 'CUENTAS DE RESULTADO'),
        ('3510', 'RESULTADO DEL EJERCICIO'),
        ('4', 'INGRESOS'),
        ('41', 'INGRESOS'),
        ('4110', 'INGRESOS POR SERVICIOS'),
        ('4120', 'DESCUENTOS Y DEVOLUCIONES EN VENTAS'),
        ('43', 'OTROS INGRESOS'),
        ('4320', 'INTERESES GANADOS'),
        ('4330', 'INGRESOS POR DIVIDENDOS'),
        ('4340', 'REGALIAS'),
        ('5', 'COSTOS'),
        ('51', 'COSTO DE VENTAS'),
        ('5110', 'INVENTARIO INICIAL DE MERCANCIAS'),
        ('5120', 'COMPRAS NETAS NACIONALES'),
        ('5130', 'COMPRAS NETAS EN EL EXTERIOR'),
        ('5190', 'INVENTARIO FINAL DE MERCANCIAS'),
        ('6', 'GASTOS'),
        ('61', 'GASTOS ADMINISTRATIVOS'),
        ('6101', 'REMUNERACIONES'),
        ('6120', 'GASTOS DE OFICINA Y VENTAS'),
        ('6121', 'GASTOS DEPRECIACION'),
        ('6122', 'GASTOS BANCARIOS Y FINANCIEROS'),
    ]

    codigo = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    clasificacion = models.CharField(max_length=10, choices=CLASIFICACIONES)
    nivel = models.PositiveIntegerField(default=1)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    class Meta:
        verbose_name = "Cuenta Contable"
        verbose_name_plural = "Cuentas Contables"
        
    def calcular_saldo(self):
        """
        Calcula el saldo de la cuenta según su tipo.
        - Para activos y gastos: Debe - Haber
        - Para pasivos, patrimonio e ingresos: Haber - Debe
        """
        from contabilidad.models import Movimiento
        movimientos = self.movimientos.all()
        
        debe = sum(m.debe for m in movimientos)
        haber = sum(m.haber for m in movimientos)
        
        if self.tipo in ['activo', 'gasto']:
            return debe - haber
        else:
            return haber - debe

class AsientoContable(models.Model):
    fecha = models.DateField()
    descripcion = models.TextField()
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Asiento {self.id} - {self.fecha}"

    class Meta:
        verbose_name = "Asiento Contable"
        verbose_name_plural = "Asientos Contables"
        ordering = ['-creado_en']


class Movimiento(models.Model):
    asiento = models.ForeignKey(AsientoContable, on_delete=models.CASCADE, related_name='movimientos')
    cuenta = models.ForeignKey(CuentaContable, on_delete=models.PROTECT, related_name='movimientos')
    debe = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    haber = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.cuenta.codigo} - {self.debe}/{self.haber}"

    class Meta:
        verbose_name = "Movimiento"
        verbose_name_plural = "Movimientos"
        
        
class TipoCuenta(models.Model):
    nombre = models.CharField(max_length=20)

class ClasificacionCuenta(models.Model):
    codigo = models.CharField(max_length=10)
    nombre = models.CharField(max_length=100)