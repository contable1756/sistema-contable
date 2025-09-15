// src/components/Cuentas/FormCuentaContable.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import apiClient from '../../services/apiClient.ts';
import { CuentaContable } from '../../types';

interface Clasificacion {
  value: string;
  label: string;
  nivel: number;
}

// Estructura completa del Plan de Cuentas P.C.G.A.
const CLASIFICACIONES_COMPLETAS: Clasificacion[] = [
  // ACTIVO
  { value: '1', label: 'ACTIVO', nivel: 1 },
  { value: '11', label: 'ACTIVO CIRCULANTE', nivel: 2 },
  { value: '111', label: 'DISPONIBLE', nivel: 3 },
  { value: '1111', label: 'EFECTIVO', nivel: 4 },
  { value: '1112', label: 'BANCOS NACIONALES', nivel: 4 },
  { value: '1113', label: 'BANCOS EN EL EXTERIOR', nivel: 4 },
  { value: '112', label: 'REALIZABLE', nivel: 3 },
  { value: '1121', label: 'EFECTOS POR COBRAR', nivel: 4 },
  { value: '1122', label: 'CUENTAS POR COBRAR CLIENTES', nivel: 4 },
  { value: '1123', label: 'OTRAS CUENTAS POR COBRAR', nivel: 4 },
  { value: '1124', label: 'INVENTARIOS', nivel: 4 },
  { value: '113', label: 'PREPAGADOS', nivel: 3 },
  { value: '1131', label: 'GASTOS PAGADOS POR ANTICIPADO', nivel: 4 },
  { value: '1133', label: 'ANTICIPOS PAGADOS', nivel: 4 },
  { value: '1134', label: 'INVERSIONES', nivel: 4 },
  { value: '12', label: 'ACTIVO FIJO', nivel: 2 },
  { value: '1210', label: 'TERRENOS', nivel: 3 },
  { value: '1220', label: 'EDIFICIOS', nivel: 3 },
  { value: '1221', label: '-DEPREC. ACUM. EDIFICIOS', nivel: 4 },
  { value: '1222', label: 'LOCALES COMERCIALES', nivel: 3 },
  { value: '1223', label: '-DEPREC. ACUM. LOCALES COMERCIALES', nivel: 4 },
  { value: '1224', label: 'GALPONES', nivel: 3 },
  { value: '1225', label: '-DEPREC. ACUM. GALPONES', nivel: 4 },
  { value: '1240', label: 'MAQUINARIAS', nivel: 3 },
  { value: '1241', label: '-DEPREC. ACUM. MAQUINARIA', nivel: 4 },
  { value: '1250', label: 'INSTALACIONES', nivel: 3 },
  { value: '1251', label: '-DEPREC. ACUM. INST. DEL INMUEBLE', nivel: 4 },
  { value: '1260', label: 'MOBILIARIOS Y EQUIPOS DE OFICINA', nivel: 3 },
  { value: '1261', label: '-DEPREC. ACUM. MOBILIARIOS y EQ.DE OFIC.', nivel: 4 },
  { value: '1270', label: 'VEHICULOS DE REPARTO', nivel: 3 },
  { value: '1271', label: '-DEPREC. ACUM. VEHICULOS DE REPARTO', nivel: 4 },
  { value: '1272', label: 'VEHICULOS DE OFICINA', nivel: 3 },
  { value: '1273', label: '-DEPREC. ACUM. VEHICULOS DE OFICINA', nivel: 4 },
  { value: '13', label: 'CARGOS DIFERIDOS', nivel: 2 },
  { value: '1310', label: 'PROYECTOS EN PROCESO', nivel: 3 },
  { value: '14', label: 'OTROS ACTIVOS', nivel: 2 },
  { value: '1410', label: 'DEPOSITOS ENTREGADOS EN GARANTIA', nivel: 3 },
  { value: '1420', label: 'INTANGIBLES', nivel: 3 },

  // PASIVO
  { value: '2', label: 'PASIVO', nivel: 1 },
  { value: '21', label: 'PASIVO CIRCULANTE', nivel: 2 },
  { value: '211', label: 'EFECTOS POR PAGAR', nivel: 3 },
  { value: '2110', label: 'EXP MERCANTILES', nivel: 4 },
  { value: '212', label: 'CUENTAS POR PAGAR', nivel: 3 },
  { value: '2120', label: 'CUENTAS POR PAGAR', nivel: 4 },
  { value: '215', label: 'OTRAS CUENTAS POR PAGAR', nivel: 3 },
  { value: '2150', label: 'OTRAS CUENTAS POR PAGAR', nivel: 4 },
  { value: '22', label: 'RETENCIONES Y APORTES POR PAGAR', nivel: 2 },
  { value: '2210', label: 'RETENCIONES POR PAGAR', nivel: 3 },
  { value: '2220', label: 'APORTES POR PAGAR', nivel: 3 },
  { value: '2230', label: 'REMUNERACIONES POR PAGAR', nivel: 3 },
  { value: '2240', label: 'GASTOS ACUMULADOS POR PAGAR', nivel: 3 },
  { value: '24', label: 'LARGO PLAZO', nivel: 2 },
  { value: '2410', label: 'HIPOTECAS', nivel: 3 },
  { value: '25', label: 'CONTINGENTE', nivel: 2 },
  { value: '2510', label: 'APARTADOS PRESTACIONES SOCIALES', nivel: 3 },
  { value: '26', label: 'DIFERIDO', nivel: 2 },
  { value: '2610', label: 'CREDITOS DIFERIDOS', nivel: 3 },

  // PATRIMONIO
  { value: '3', label: 'CUENTAS DE PATRIMONIO', nivel: 1 },
  { value: '31', label: 'CAPITAL', nivel: 2 },
  { value: '3110', label: 'CAPITAL SOCIAL', nivel: 3 },
  { value: '3120', label: 'ACTUALIZACION DE CAPITAL', nivel: 3 },
  { value: '32', label: 'RESERVAS', nivel: 2 },
  { value: '3210', label: 'RESERVAS', nivel: 3 },
  { value: '33', label: 'SUPERAVIT', nivel: 2 },
  { value: '3310', label: 'UTILIDADES NO DISTRIBUIDAS', nivel: 3 },
  { value: '35', label: 'CUENTAS DE RESULTADO', nivel: 2 },
  { value: '3510', label: 'RESULTADO DEL EJERCICIO', nivel: 3 },

  // INGRESOS
  { value: '4', label: 'INGRESOS', nivel: 1 },
  { value: '41', label: 'INGRESOS', nivel: 2 },
  { value: '4110', label: 'INGRESOS POR SERVICIOS', nivel: 3 },
  { value: '4120', label: 'DESCUENTOS Y DEVOLUCIONES EN VENTAS', nivel: 3 },
  { value: '43', label: 'OTROS INGRESOS', nivel: 2 },
  { value: '4320', label: 'INTERESES GANADOS', nivel: 3 },
  { value: '4330', label: 'INGRESOS POR DIVIDENDOS', nivel: 3 },
  { value: '4340', label: 'REGALIAS', nivel: 3 },

  // GASTOS
  { value: '5', label: 'COSTOS', nivel: 1 },
  { value: '51', label: 'COSTO DE VENTAS', nivel: 2 },
  { value: '5110', label: 'INVENTARIO INICIAL DE MERCANCIAS', nivel: 3 },
  { value: '5120', label: 'COMPRAS NETAS NACIONALES', nivel: 3 },
  { value: '5130', label: 'COMPRAS NETAS EN EL EXTERIOR', nivel: 3 },
  { value: '5190', label: 'INVENTARIO FINAL DE MERCANCIAS', nivel: 3 },
  { value: '6', label: 'GASTOS', nivel: 1 },
  { value: '61', label: 'GASTOS ADMINISTRATIVOS', nivel: 2 },
  { value: '6101', label: 'REMUNERACIONES', nivel: 3 },
  { value: '6120', label: 'GASTOS DE OFICINA Y VENTAS', nivel: 3 },
  { value: '6121', label: 'GASTOS DEPRECIACION', nivel: 3 },
  { value: '6122', label: 'GASTOS BANCARIOS Y FINANCIEROS', nivel: 3 },
];

interface CuentaFormData {
  codigo: string;
  nombre: string;
  tipo: string;
  clasificacion: string;
  nivel: number;
}

const tiposCuenta = [
  { value: 'activo', label: 'Activo' },
  { value: 'pasivo', label: 'Pasivo' },
  { value: 'patrimonio', label: 'Patrimonio' },
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'gasto', label: 'Gasto' },
];

interface FormCuentaProps {
  onSuccess?: (cuenta: CuentaContable) => void;
}

const FormCuentaContable: React.FC<FormCuentaProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CuentaFormData>({
    codigo: '',
    nombre: '',
    tipo: 'activo',
    clasificacion: '',
    nivel: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Reiniciar campos dependientes
    if (name === 'tipo') {
      setFormData({
        ...formData,
        tipo: value,
        clasificacion: '',
        nivel: 1,
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filtrar clasificaciones por tipo
  const clasificacionesPorTipo = CLASIFICACIONES_COMPLETAS.filter(cls =>
    formData.tipo === 'activo' && ['1', '11', '12', '13', '14'].some(prefix => cls.value.startsWith(prefix)) ||
    formData.tipo === 'pasivo' && ['2', '21', '22', '24', '25', '26'].some(prefix => cls.value.startsWith(prefix)) ||
    formData.tipo === 'patrimonio' && ['3', '31', '32', '33', '35'].some(prefix => cls.value.startsWith(prefix)) ||
    formData.tipo === 'ingreso' && ['4', '41', '43'].some(prefix => cls.value.startsWith(prefix)) ||
    formData.tipo === 'gasto' && ['5', '6'].some(prefix => cls.value.startsWith(prefix))
  );

  // Nivel 1
  const niveles1 = Array.from(new Set(clasificacionesPorTipo
    .filter(c => c.nivel === 1)
    .map(c => c.value)))
    .map(v => ({
      value: v,
      label: CLASIFICACIONES_COMPLETAS.find(c => c.value === v)?.label || v
    }));

  // Nivel 2
  const niveles2 = formData.clasificacion.length >= 1
    ? Array.from(new Set(clasificacionesPorTipo
        .filter(c => c.nivel === 2 && c.value.startsWith(formData.clasificacion.charAt(0)))
        .map(c => c.value)))
      .map(v => ({
        value: v,
        label: CLASIFICACIONES_COMPLETAS.find(c => c.value === v)?.label || v
      }))
    : [];

  // Nivel 3 o 4
  const niveles3 = formData.clasificacion.length >= 2
    ? clasificacionesPorTipo
        .filter(c => c.nivel >= 3 && c.value.startsWith(formData.clasificacion.substring(0, 2)))
        .map(c => ({
          value: c.value,
          label: c.label
        }))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.post('/contabilidad/cuentas/', formData);
      setSuccess(true);
      // Resetear formulario
      setFormData({
        codigo: '',
        nombre: '',
        tipo: 'activo',
        clasificacion: '',
        nivel: 1,
      });
      // Notificar éxito
      if (onSuccess) onSuccess(response.data);
    } catch (err: any) {
      const res = err.response?.data;
      setError(
        res?.codigo
          ? `Código: ${res.codigo[0]}`
          : res?.nombre
          ? `Nombre: ${res.nombre[0]}`
          : res?.clasificacion
          ? `Clasificación: ${res.clasificacion[0]}`
          : 'Error al crear la cuenta. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        📌 Nueva Cuenta Contable
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Cuenta creada exitosamente!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Código"
              name="codigo"
              fullWidth
              required
              value={formData.codigo}
              onChange={handleChange}
              disabled={loading}
              error={!!error.includes('Código')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Tipo"
              name="tipo"
              fullWidth
              required
              value={formData.tipo}
              onChange={handleChange}
              disabled={loading}
              SelectProps={{ native: true }}
            >
              {tiposCuenta.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              required
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              error={!!error.includes('Nombre')}
            />
          </Grid>

          {/* Selector Jerárquico */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Nivel 1"
              name="nivel1"
              fullWidth
              value={formData.clasificacion.length >= 1 ? formData.clasificacion.charAt(0) : ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  clasificacion: e.target.value,
                  nivel: 1,
                });
              }}
              disabled={loading || !niveles1.length}
              SelectProps={{ native: true }}
            >
              <option value="">Seleccionar...</option>
              {niveles1.map((cls) => (
                <option key={cls.value} value={cls.value.charAt(0)}>
                  {cls.label}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Nivel 2"
              name="nivel2"
              fullWidth
              value={formData.clasificacion.length >= 2 ? formData.clasificacion.substring(0, 2) : ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  clasificacion: e.target.value,
                  nivel: 2,
                });
              }}
              disabled={loading || !niveles2.length}
              SelectProps={{ native: true }}
            >
              <option value="">Seleccionar...</option>
              {niveles2.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Nivel 3/4"
              name="nivel3"
              fullWidth
              value={formData.clasificacion}
              onChange={(e) => {
                const val = e.target.value;
                const nivel = val.length <= 2 ? 2 : val.length <= 3 ? 3 : 4;
                setFormData({
                  ...formData,
                  clasificacion: val,
                  nivel,
                });
              }}
              disabled={loading || !niveles3.length}
              SelectProps={{ native: true }}
              error={!!error.includes('Clasificación')}
            >
              <option value="">Seleccionar...</option>
              {niveles3.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Crear Cuenta'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormCuentaContable;