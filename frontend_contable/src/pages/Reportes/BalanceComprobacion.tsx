// src/pages/Reportes/BalanceComprobacion.tsx
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
  Chip,
} from '@mui/material';
import apiClient from '../../services/apiClient.ts';

interface CuentaBalance {
  codigo: string;
  nombre: string;
  tipo: string;
  debe: number;
  haber: number;
}

const BalanceComprobacion = () => {
  const [cuentas, setCuentas] = useState<CuentaBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarBalance = async () => {
      try {
        const response = await apiClient.get('/contabilidad/reportes/balance-comprobacion/');
        setCuentas(response.data);
      } catch (err: any) {
        setError('Error al cargar el balance de comprobación');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarBalance();
  }, []);

  const totalDebe = cuentas.reduce((sum, c) => sum + c.debe, 0);
  const totalHaber = cuentas.reduce((sum, c) => sum + c.haber, 0);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'activo': return 'success';
      case 'pasivo': return 'warning';
      case 'patrimonio': return 'info';
      case 'ingreso': return 'primary';
      case 'gasto': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📊 Balance de Comprobación
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell align="right"><strong>Debe</strong></TableCell>
                <TableCell align="right"><strong>Haber</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cuentas.length > 0 ? (
                cuentas.map((cuenta) => (
                  <TableRow key={cuenta.codigo}>
                    <TableCell>{cuenta.codigo}</TableCell>
                    <TableCell>{cuenta.nombre}</TableCell>
                    <TableCell>
                      <Chip
                        label={cuenta.tipo.charAt(0).toUpperCase() + cuenta.tipo.slice(1)}
                        size="small"
                        color={getTipoColor(cuenta.tipo)}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography color={cuenta.debe > 0 ? 'text.primary' : 'text.secondary'}>
                        {cuenta.debe.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color={cuenta.haber > 0 ? 'text.primary' : 'text.secondary'}>
                        {cuenta.haber.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Totales */}
      {!loading && cuentas.length > 0 && (
        <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Totales:</Typography>
            <Box>
              <Typography component="span" fontWeight="bold" color="success.main">
                Debe: {totalDebe.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
              </Typography>
              {' | '}
              <Typography component="span" fontWeight="bold" color="primary.main">
                Haber: {totalHaber.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
              </Typography>
              {' | '}
              <Typography
                component="span"
                fontWeight="bold"
                color={Math.abs(totalDebe - totalHaber) < 0.01 ? 'success.main' : 'error.main'}
              >
                Diferencia: {(totalDebe - totalHaber).toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BalanceComprobacion;