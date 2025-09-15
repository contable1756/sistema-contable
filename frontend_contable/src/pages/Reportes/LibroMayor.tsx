// src/pages/Reportes/LibroMayor.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import apiClient from '../../services/apiClient.ts';

interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
}

interface Movimiento {
  fecha: string;
  asiento_id: number;
  descripcion: string;
  debe: number;
  haber: number;
  saldo: number;
}

const LibroMayor = () => {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [selectedCuenta, setSelectedCuenta] = useState<number | ''>('');
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar todas las cuentas
  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        const res = await apiClient.get('/contabilidad/cuentas/');
        setCuentas(res.data.results || res.data);
      } catch (err) {
        setError('Error al cargar las cuentas');
      }
    };
    cargarCuentas();
  }, []);

  const handleBuscar = async () => {
    if (!selectedCuenta) {
      setError('Debe seleccionar una cuenta');
      return;
    }

    setLoading(true);
    setError('');
    setMovimientos([]);

    try {
      const res = await apiClient.get(`/contabilidad/reportes/libro-mayor/`, {
        params: { cuenta_id: selectedCuenta }
      });

      setMovimientos(res.data.movimientos);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'Error al cargar el Libro Mayor'
      );
    } finally {
      setLoading(false);
    }
  };

  const cuentaSeleccionada = cuentas.find(c => c.id === selectedCuenta);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📘 Libro Mayor
      </Typography>

      {/* Filtro */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <FormControl fullWidth>
            <InputLabel id="cuenta-select-label">Seleccionar Cuenta</InputLabel>
            <Select
              labelId="cuenta-select-label"
              value={selectedCuenta}
              label="Seleccionar Cuenta"
              onChange={(e) => setSelectedCuenta(e.target.value as number)}
            >
              {cuentas.map((cuenta) => (
                <MenuItem key={cuenta.id} value={cuenta.id}>
                  {cuenta.codigo} - {cuenta.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleBuscar}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Cargando...' : 'Buscar'}
          </Button>
        </Box>

        {cuentaSeleccionada && (
          <Box mt={2}>
            <Typography variant="body1">
              <strong>Cuenta:</strong> {cuentaSeleccionada.codigo} - {cuentaSeleccionada.nombre} | 
              <strong> Tipo:</strong> {cuentaSeleccionada.tipo}
            </Typography>
          </Box>
        )}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && movimientos.length > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Asiento</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell align="right"><strong>Debe</strong></TableCell>
                <TableCell align="right"><strong>Haber</strong></TableCell>
                <TableCell align="right"><strong>Saldo</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((mov, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(mov.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{mov.asiento_id}</TableCell>
                  <TableCell>{mov.descripcion}</TableCell>
                  <TableCell align="right">
                    {mov.debe > 0 ? (
                      <Typography color="success.main">
                        {mov.debe.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">
                    {mov.haber > 0 ? (
                      <Typography color="primary.main">
                        {mov.haber.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {mov.saldo.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !movimientos.length && selectedCuenta && (
        <Alert severity="info">No hay movimientos para esta cuenta.</Alert>
      )}
    </Box>
  );
};

export default LibroMayor;