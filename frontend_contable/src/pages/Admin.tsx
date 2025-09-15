// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import apiClient from '../services/apiClient.ts';

// Tipos
interface CuentaResultado {
  codigo: string;
  nombre: string;
  saldo: number;
}

interface BalanceGeneralData {
  activo: CuentaResultado[];
  pasivo: CuentaResultado[];
  patrimonio: CuentaResultado[];
  total_activo: number;
  total_pasivo: number;
  total_patrimonio: number;
  verificacion: boolean;
}

interface ResultadoCorreccion {
  success: boolean;
  message?: string;
  log?: string;
  error?: string;
}

const Admin = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultadoCorreccion | null>(null);
  const [balance, setBalance] = useState<BalanceGeneralData | null>(null);

  // Corregir ventas sin asiento
  const corregirVentas = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await apiClient.post<{ message: string; log: string }>('/ventas/corregir-ventas-sin-asiento/');
      setResult({
        success: true,
        message: res.data.message,
        log: res.data.log,
      });
    } catch (err: any) {
      setResult({
        success: false,
        error: err.response?.data?.error || err.message || 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar balance general
  const cargarBalance = async () => {
    try {
      const res = await apiClient.get<BalanceGeneralData>('/contabilidad/balance-general/');
      setBalance(res.data);
    } catch (err) {
      console.error('Error al cargar balance general:', err);
      setBalance(null);
    }
  };

  useEffect(() => {
    cargarBalance();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        🔧 Herramientas de Administración
      </Typography>

      {/* Corrección de Ventas */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>🛠️ Corregir Ventas sin Asiento</Typography>
        <Button
          variant="contained"
          color="warning"
          onClick={corregirVentas}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Corregir Ventas'}
        </Button>

        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              {result.log || result.error}
            </pre>
          </Alert>
        )}
      </Paper>

      {/* Balance General */}
      {balance && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>📊 Balance General</Typography>

          <Grid container spacing={3}>
            {/* Activo */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">ACTIVO</Typography>
              <Table size="small">
                <TableBody>
                  {balance.activo.map((c) => (
                    <TableRow key={c.codigo}>
                      <TableCell>{c.codigo}</TableCell>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{balance.total_activo.toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            {/* Pasivo */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">PASIVO</Typography>
              <Table size="small">
                <TableBody>
                  {balance.pasivo.map((c) => (
                    <TableRow key={c.codigo}>
                      <TableCell>{c.codigo}</TableCell>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{balance.total_pasivo.toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            {/* Patrimonio */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">PATRIMONIO</Typography>
              <Table size="small">
                <TableBody>
                  {balance.patrimonio.map((c) => (
                    <TableRow key={c.codigo}>
                      <TableCell>{c.codigo}</TableCell>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{balance.total_patrimonio.toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          <Alert 
            severity={balance.verificacion ? "success" : "error"} 
            sx={{ mt: 3 }}
          >
            {balance.verificacion 
              ? "✅ El Balance General está equilibrado." 
              : "❌ El Balance General NO está equilibrado."}
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default Admin;