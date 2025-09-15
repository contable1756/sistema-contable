// src/pages/Compras/LibroCompras.tsx
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
} from '@mui/material';
import apiClient from '../../services/apiClient.ts';

const LibroCompras = () => {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarLibro = async () => {
      try {
        const res = await apiClient.get('/compras/reportes/libro-compras/');
        console.log(res.data)
        setCompras(res.data);
      } catch (err: any) {
        console.error('Error al cargar libro de compras:', err);
        setError('No se pudo cargar el Libro de Compras');
      } finally {
        setLoading(false);
      }
    };
    cargarLibro();
  }, []);

  // Totales generales
  const totalGeneral = compras.reduce((sum, c) => sum + c.total_compra, 0);
  const impuestoGeneral = compras.reduce((sum, c) => sum + c.impuesto_general, 0);
  const impuestoReducido = compras.reduce((sum, c) => sum + c.impuesto_reducido, 0);
  const impuestoAdicional = compras.reduce((sum, c) => sum + c.impuesto_adicional, 0);

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
        📘 Libro de Compras - Contribuyente Ordinario
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
              <TableCell><strong>Proveedor</strong></TableCell>
              <TableCell><strong>R.I.F</strong></TableCell>
              <TableCell><strong>Tipo Prov.</strong></TableCell>
              <TableCell align="right"><strong>Total Compras</strong></TableCell>
              <TableCell align="right"><strong>Sin Crédito</strong></TableCell>
              <TableCell align="right"><strong>Base 16%</strong></TableCell>
              <TableCell align="right"><strong>Imp. 16%</strong></TableCell>
              <TableCell align="right"><strong>Base 8%</strong></TableCell>
              <TableCell align="right"><strong>Imp. 8%</strong></TableCell>
              <TableCell align="right"><strong>Base 22%</strong></TableCell>
              <TableCell align="right"><strong>Imp. 22%</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compras.length > 0 ? (
              compras.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{new Date(c.fecha).getDate()}</TableCell>
                  <TableCell>{c.numero_factura}</TableCell>
                  <TableCell>{c.numero_control || ''}</TableCell>
                  <TableCell>{c.nombre_proveedor}</TableCell>
                  <TableCell>{c.rif_proveedor}</TableCell>
                  <TableCell>PJ</TableCell>
                  <TableCell align="right">{parseFloat(c.total_compra).toFixed(2)}</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">{parseFloat(c.base_imponible_general).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {parseFloat(c.impuesto_general).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{parseFloat(c.base_imponible_reducida).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'warning.main' }}>
                    {parseFloat(c.impuesto_reducido).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{parseFloat(c.base_imponible_adicional).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {parseFloat(c.impuesto_adicional).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} align="center">
                  No hay compras registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totales */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
          <Typography><strong>Total Compras:</strong> {totalGeneral.toFixed(2)}</Typography>
          <Typography><strong>IVA 16%:</strong> {impuestoGeneral.toFixed(2)}</Typography>
          <Typography><strong>IVA 8%:</strong> {impuestoReducido.toFixed(2)}</Typography>
          <Typography><strong>IVA 22%:</strong> {impuestoAdicional.toFixed(2)}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LibroCompras;