// src/components/Asientos/FormAsientoContable.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import apiClient from '../../services/apiClient.ts';

interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
}

interface MovimientoForm {
  cuenta: CuentaContable | null;
  debe: string;
  haber: string;
}

interface FormAsientoProps {
  onSuccess?: () => void;
}

const FormAsientoContable: React.FC<FormAsientoProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState('');
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoForm[]>([
    { cuenta: null, debe: '', haber: '' },
  ]);

  // Cargar cuentas contables
  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        const res = await apiClient.get('/contabilidad/cuentas/');
        setCuentas(res.data.results);
      } catch (err) {
        console.error('Error al cargar cuentas:', err);
        setError('No se pudieron cargar las cuentas contables');
      }
    };
    cargarCuentas();
  }, []);

  const agregarMovimiento = () => {
    setMovimientos([...movimientos, { cuenta: null, debe: '', haber: '' }]);
  };

  const eliminarMovimiento = (index: number) => {
    if (movimientos.length > 1) {
      setMovimientos(movimientos.filter((_, i) => i !== index));
    }
  };

  const actualizarMovimiento = (index: number, field: string, value: any) => {
    const nuevosMovimientos = [...movimientos];
    if (field === 'cuenta') {
      nuevosMovimientos[index].cuenta = value;
    } else {
      nuevosMovimientos[index][field] = value;
    }
    setMovimientos(nuevosMovimientos);
  };

  const calcularTotales = () => {
    const totalDebe = movimientos.reduce(
      (sum, m) => sum + (parseFloat(m.debe) || 0),
      0
    );
    const totalHaber = movimientos.reduce(
      (sum, m) => sum + (parseFloat(m.haber) || 0),
      0
    );
    return { totalDebe, totalHaber };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const { totalDebe, totalHaber } = calcularTotales();

    // Validar movimientos
    const movimientosValidos = movimientos.filter(
      (m) => m.cuenta && (parseFloat(m.debe) > 0 || parseFloat(m.haber) > 0)
    );

    if (movimientosValidos.length === 0) {
      setError('Debes agregar al menos un movimiento válido.');
      setLoading(false);
      return;
    }

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      setError('El asiento no está balanceado: debe ≠ haber');
      setLoading(false);
      return;
    }

    const data = {
      fecha,
      descripcion,
      movimientos: movimientosValidos.map((m) => ({
        cuenta: m.cuenta?.id,
        debe: parseFloat(m.debe) || 0,
        haber: parseFloat(m.haber) || 0,
      })),
    };

    try {
      await apiClient.post('/contabilidad/asientos/', data);
      setSuccess(true);
      // Resetear formulario
      setDescripcion('');
      setMovimientos([{ cuenta: null, debe: '', haber: '' }]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'Error al guardar el asiento. Verifica los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const { totalDebe, totalHaber } = calcularTotales();

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        📝 Nuevo Asiento Contable
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Asiento registrado exitosamente!
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
              label="Fecha"
              type="date"
              fullWidth
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>

        {/* Movimientos */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Movimientos (Debe y Haber)
        </Typography>

        {movimientos.map((mov, index) => (
          <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={5}>
              <Autocomplete
                options={cuentas}
                getOptionLabel={(option) =>
                  option ? `${option.codigo} - ${option.nombre}` : ''
                }
                value={mov.cuenta}
                onChange={(_, value) =>
                  actualizarMovimiento(index, 'cuenta', value)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Cuenta" required />
                )}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Debe"
                type="number"
                fullWidth
                size="small"
                value={mov.debe}
                onChange={(e) =>
                  actualizarMovimiento(index, 'debe', e.target.value)
                }
                disabled={loading}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Haber"
                type="number"
                fullWidth
                size="small"
                value={mov.haber}
                onChange={(e) =>
                  actualizarMovimiento(index, 'haber', e.target.value)
                }
                disabled={loading}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
              {movimientos.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => eliminarMovimiento(index)}
                  disabled={loading}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}

        {/* Totales */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Total Debe:</strong> {totalDebe.toFixed(2)} | 
            <strong> Total Haber:</strong> {totalHaber.toFixed(2)} |
            <strong> Diferencia:</strong> {(totalDebe - totalHaber).toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            startIcon={<Add />}
            onClick={agregarMovimiento}
            disabled={loading}
            size="small"
          >
            Agregar Movimiento
          </Button>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Registrar Asiento'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormAsientoContable;