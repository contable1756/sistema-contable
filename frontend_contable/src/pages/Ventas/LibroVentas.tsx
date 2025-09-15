// src/pages/Ventas/LibroVentas.tsx
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
  Button,
} from '@mui/material';
import apiClient from '../../services/apiClient.ts';

const LibroVentas = () => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarLibro = async () => {
      try {
        const res = await apiClient.get('/ventas/reportes/libro-ventas/');
        setVentas(res.data);
      } catch (err: any) {
        console.error('Error al cargar libro de ventas:', err);
        setError('No se pudo cargar el Libro de Ventas');
      } finally {
        setLoading(false);
      }
    };
    cargarLibro();
  }, []);

  // Totales generales
  const totalGeneral = ventas.reduce((sum, v) => sum + v.total_venta, 0);
  const impuestoGeneral = ventas.reduce((sum, v) => sum + v.impuesto_general, 0);
  const impuestoReducido = ventas.reduce((sum, v) => sum + v.impuesto_reducido, 0);
  const impuestoAdicional = ventas.reduce((sum, v) => sum + v.impuesto_adicional, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📘 Libro de Ventas - Contribuyente Ordinario
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Período: 01-09-2025 al 30-09-2025 • RIF: J-12789123-1 • POWER CAUCHO, C.A.
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell><strong>Oper.</strong></TableCell>
              <TableCell><strong>Día</strong></TableCell>
              <TableCell><strong>N° Factura</strong></TableCell>
              <TableCell><strong>N° Control</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>R.I.F</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell align="right"><strong>Total Ventas</strong></TableCell>
              <TableCell align="right"><strong>Sin Débito</strong></TableCell>
              <TableCell align="right"><strong>Base 16%</strong></TableCell>
              <TableCell align="right"><strong>Imp. 16%</strong></TableCell>
              <TableCell align="right"><strong>Base 8%</strong></TableCell>
              <TableCell align="right"><strong>Imp. 8%</strong></TableCell>
              <TableCell align="right"><strong>Base 22%</strong></TableCell>
              <TableCell align="right"><strong>Imp. 22%</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventas.length > 0 ? (
              ventas.map((v, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{new Date(v.fecha).getDate()}</TableCell>
                  <TableCell>{v.numero_factura}</TableCell>
                  <TableCell>{v.numero_control || ''}</TableCell>
                  <TableCell>{v.nombre_cliente}</TableCell>
                  <TableCell>{v.rif_cliente}</TableCell>
                  <TableCell>F</TableCell>
                  <TableCell align="right">{parseFloat(v.total_venta).toFixed(2)}</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">{parseFloat(v.base_imponible_general).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {parseFloat(v.impuesto_general).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{parseFloat(v.base_imponible_reducida).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'warning.main' }}>
                    {parseFloat(v.impuesto_reducido).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{parseFloat(v.base_imponible_adicional).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {parseFloat(v.impuesto_adicional).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} align="center">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totales */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
          <Typography><strong>Total Ventas:</strong> {totalGeneral.toFixed(2)}</Typography>
          <Typography><strong>IVA 16%:</strong> {impuestoGeneral.toFixed(2)}</Typography>
          <Typography><strong>IVA 8%:</strong> {impuestoReducido.toFixed(2)}</Typography>
          <Typography><strong>IVA 22%:</strong> {impuestoAdicional.toFixed(2)}</Typography>
        </Box>
      </Paper>

      {/* Botón Exportar (futuro) */}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          color="success"
          disabled
          // href="/api/ventas/reportes/libro-ventas/excel/"
        >
          📥 Exportar a Excel
        </Button>
      </Box>
    </Box>
  );
};

export default LibroVentas;