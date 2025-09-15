# contabilidad/management/commands/cargar_plan_cuentas.py
from django.core.management.base import BaseCommand
from contabilidad.models import CuentaContable, TipoCuenta, ClasificacionCuenta

class Command(BaseCommand):
    help = 'Carga el Plan de Cuentas completo del P.C.G.A. venezolano'

    def handle(self, *args, **options):
        # === 1. Crear Tipos de Cuenta si no existen ===
        tipos_data = [
            ('activo', 'Activo'),
            ('pasivo', 'Pasivo'),
            ('patrimonio', 'Patrimonio'),
            ('ingreso', 'Ingreso'),
            ('gasto', 'Gasto'),
        ]

        for codigo, nombre in tipos_data:
            tipo, created = TipoCuenta.objects.get_or_create(
                nombre=codigo,
                defaults={'nombre': nombre}
            )
            if created:
                self.stdout.write(f"✅ Tipo creado: {tipo.nombre}")

        # === 2. Crear Clasificaciones si no existen ===
        clasificaciones_data = [
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

        for codigo, nombre in clasificaciones_data:
            clasificacion, created = ClasificacionCuenta.objects.get_or_create(
                codigo=codigo,
                defaults={'nombre': nombre}
            )
            if created:
                self.stdout.write(f"✅ Clasificación creada: {clasificacion.codigo} - {clasificacion.nombre}")

        # === 3. Crear Cuentas Contables ===
        cuentas_data = [
            # Activo
            {'codigo': '1111', 'nombre': 'EFECTIVO', 'tipo': 'activo', 'clasificacion': '1111'},
            {'codigo': '1112', 'nombre': 'BANCOS NACIONALES', 'tipo': 'activo', 'clasificacion': '1112'},
            {'codigo': '1113', 'nombre': 'BANCOS EN EL EXTERIOR', 'tipo': 'activo', 'clasificacion': '1113'},
            {'codigo': '1121', 'nombre': 'EFECTOS POR COBRAR', 'tipo': 'activo', 'clasificacion': '1121'},
            {'codigo': '1122', 'nombre': 'CUENTAS POR COBRAR CLIENTES', 'tipo': 'activo', 'clasificacion': '1122'},
            {'codigo': '1123', 'nombre': 'OTRAS CUENTAS POR COBRAR', 'tipo': 'activo', 'clasificacion': '1123'},
            {'codigo': '1124', 'nombre': 'INVENTARIOS', 'tipo': 'activo', 'clasificacion': '1124'},
            {'codigo': '1131', 'nombre': 'GASTOS PAGADOS POR ANTICIPADO', 'tipo': 'activo', 'clasificacion': '1131'},
            {'codigo': '1133', 'nombre': 'ANTICIPOS PAGADOS', 'tipo': 'activo', 'clasificacion': '1133'},
            {'codigo': '1134', 'nombre': 'INVERSIONES', 'tipo': 'activo', 'clasificacion': '1134'},
            {'codigo': '1210', 'nombre': 'TERRENOS', 'tipo': 'activo', 'clasificacion': '1210'},
            {'codigo': '1220', 'nombre': 'EDIFICIOS', 'tipo': 'activo', 'clasificacion': '1220'},
            {'codigo': '1221', 'nombre': '-DEPREC. ACUM. EDIFICIOS', 'tipo': 'activo', 'clasificacion': '1221'},
            {'codigo': '1222', 'nombre': 'LOCALES COMERCIALES', 'tipo': 'activo', 'clasificacion': '1222'},
            {'codigo': '1223', 'nombre': '-DEPREC. ACUM. LOCALES COMERCIALES', 'tipo': 'activo', 'clasificacion': '1223'},
            {'codigo': '1224', 'nombre': 'GALPONES', 'tipo': 'activo', 'clasificacion': '1224'},
            {'codigo': '1225', 'nombre': '-DEPREC. ACUM. GALPONES', 'tipo': 'activo', 'clasificacion': '1225'},
            {'codigo': '1240', 'nombre': 'MAQUINARIAS', 'tipo': 'activo', 'clasificacion': '1240'},
            {'codigo': '1241', 'nombre': '-DEPREC. ACUM. MAQUINARIA', 'tipo': 'activo', 'clasificacion': '1241'},
            {'codigo': '1250', 'nombre': 'INSTALACIONES', 'tipo': 'activo', 'clasificacion': '1250'},
            {'codigo': '1251', 'nombre': '-DEPREC. ACUM. INST. DEL INMUEBLE', 'tipo': 'activo', 'clasificacion': '1251'},
            {'codigo': '1260', 'nombre': 'MOBILIARIOS Y EQUIPOS DE OFICINA', 'tipo': 'activo', 'clasificacion': '1260'},
            {'codigo': '1261', 'nombre': '-DEPREC. ACUM. MOBILIARIOS y EQ.DE OFIC.', 'tipo': 'activo', 'clasificacion': '1261'},
            {'codigo': '1270', 'nombre': 'VEHICULOS DE REPARTO', 'tipo': 'activo', 'clasificacion': '1270'},
            {'codigo': '1271', 'nombre': '-DEPREC. ACUM. VEHICULOS DE REPARTO', 'tipo': 'activo', 'clasificacion': '1271'},
            {'codigo': '1272', 'nombre': 'VEHICULOS DE OFICINA', 'tipo': 'activo', 'clasificacion': '1272'},
            {'codigo': '1273', 'nombre': '-DEPREC. ACUM. VEHICULOS DE OFICINA', 'tipo': 'activo', 'clasificacion': '1273'},
            {'codigo': '1310', 'nombre': 'PROYECTOS EN PROCESO', 'tipo': 'activo', 'clasificacion': '1310'},
            {'codigo': '1410', 'nombre': 'DEPOSITOS ENTREGADOS EN GARANTIA', 'tipo': 'activo', 'clasificacion': '1410'},
            {'codigo': '1420', 'nombre': 'INTANGIBLES', 'tipo': 'activo', 'clasificacion': '1420'},

            # Pasivo
            {'codigo': '2110', 'nombre': 'EXP MERCANTILES', 'tipo': 'pasivo', 'clasificacion': '2110'},
            {'codigo': '2120', 'nombre': 'CUENTAS POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2120'},
            {'codigo': '2150', 'nombre': 'OTRAS CUENTAS POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2150'},
            {'codigo': '2210', 'nombre': 'RETENCIONES POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2210'},
            {'codigo': '2220', 'nombre': 'APORTES POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2220'},
            {'codigo': '2230', 'nombre': 'REMUNERACIONES POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2230'},
            {'codigo': '2240', 'nombre': 'GASTOS ACUMULADOS POR PAGAR', 'tipo': 'pasivo', 'clasificacion': '2240'},
            {'codigo': '2410', 'nombre': 'HIPOTECAS', 'tipo': 'pasivo', 'clasificacion': '2410'},
            {'codigo': '2510', 'nombre': 'APARTADOS PRESTACIONES SOCIALES', 'tipo': 'pasivo', 'clasificacion': '2510'},
            {'codigo': '2610', 'nombre': 'CREDITOS DIFERIDOS', 'tipo': 'pasivo', 'clasificacion': '2610'},

            # Patrimonio
            {'codigo': '3110', 'nombre': 'CAPITAL SOCIAL', 'tipo': 'patrimonio', 'clasificacion': '3110'},
            {'codigo': '3120', 'nombre': 'ACTUALIZACION DE CAPITAL', 'tipo': 'patrimonio', 'clasificacion': '3120'},
            {'codigo': '3210', 'nombre': 'RESERVAS', 'tipo': 'patrimonio', 'clasificacion': '3210'},
            {'codigo': '3310', 'nombre': 'UTILIDADES NO DISTRIBUIDAS', 'tipo': 'patrimonio', 'clasificacion': '3310'},
            {'codigo': '3510', 'nombre': 'RESULTADO DEL EJERCICIO', 'tipo': 'patrimonio', 'clasificacion': '3510'},

            # Ingresos
            {'codigo': '4110', 'nombre': 'INGRESOS POR SERVICIOS', 'tipo': 'ingreso', 'clasificacion': '4110'},
            {'codigo': '4120', 'nombre': 'DESCUENTOS Y DEVOLUCIONES EN VENTAS', 'tipo': 'ingreso', 'clasificacion': '4120'},
            {'codigo': '4320', 'nombre': 'INTERESES GANADOS', 'tipo': 'ingreso', 'clasificacion': '4320'},
            {'codigo': '4330', 'nombre': 'INGRESOS POR DIVIDENDOS', 'tipo': 'ingreso', 'clasificacion': '4330'},
            {'codigo': '4340', 'nombre': 'REGALIAS', 'tipo': 'ingreso', 'clasificacion': '4340'},

            # Costos
            {'codigo': '5110', 'nombre': 'INVENTARIO INICIAL DE MERCANCIAS', 'tipo': 'gasto', 'clasificacion': '5110'},
            {'codigo': '5120', 'nombre': 'COMPRAS NETAS NACIONALES', 'tipo': 'gasto', 'clasificacion': '5120'},
            {'codigo': '5130', 'nombre': 'COMPRAS NETAS EN EL EXTERIOR', 'tipo': 'gasto', 'clasificacion': '5130'},
            {'codigo': '5190', 'nombre': 'INVENTARIO FINAL DE MERCANCIAS', 'tipo': 'gasto', 'clasificacion': '5190'},

            # Gastos
            {'codigo': '6101', 'nombre': 'REMUNERACIONES', 'tipo': 'gasto', 'clasificacion': '6101'},
            {'codigo': '6120', 'nombre': 'GASTOS DE OFICINA Y VENTAS', 'tipo': 'gasto', 'clasificacion': '6120'},
            {'codigo': '6121', 'nombre': 'GASTOS DEPRECIACION', 'tipo': 'gasto', 'clasificacion': '6121'},
            {'codigo': '6122', 'nombre': 'GASTOS BANCARIOS Y FINANCIEROS', 'tipo': 'gasto', 'clasificacion': '6122'},
        ]

        total_creadas = 0
        for data in cuentas_data:
            cuenta, created = CuentaContable.objects.get_or_create(
                codigo=data['codigo'],
                defaults={
                    'nombre': data['nombre'],
                    'tipo': data['tipo'],
                    'clasificacion': data['clasificacion'],
                    'nivel': len(data['codigo']) // 2 + 1,
                    'descripcion': f"Cuenta {data['nombre']}"
                }
            )
            if created:
                total_creadas += 1
                self.stdout.write(f"✅ Cuenta creada: {cuenta.codigo} - {cuenta.nombre}")

        # === Mensaje final ===
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS("🚀 PLAN DE CUENTAS CARGADO CON ÉXITO"))
        self.stdout.write("="*50)
        self.stdout.write(f"📊 Total de cuentas creadas: {total_creadas}")
        self.stdout.write("💡 Ahora puedes registrar compras, ventas y asientos")
        self.stdout.write("📈 Verifica: Estado de Resultados y Balance General")
        self.stdout.write("="*50)