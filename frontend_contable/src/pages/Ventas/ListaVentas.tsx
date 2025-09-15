// src/pages/Ventas/ListaVentas.tsx
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
  Button,
} from '@mui/material';
import FormVenta from '../../components/Ventas/FormVenta.tsx';
import apiClient from '../../services/apiClient.ts';

const ListaVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const res = await apiClient.get('ventas/ventas/');
        console.log(res.data.results)
        setVentas(res.data.results);
      } catch (err) {
        console.error('Error al cargar ventas:', err);
      }
    };
    cargarVentas();
  }, []);

  const handleSuccess = () => {
    const cargarVentas = async () => {
      try {
        const res = await apiClient.get('ventas/ventas/');
        setVentas(res.data.results);
        setShowForm(false);
      } catch (err) {
        console.error('Error al recargar ventas:', err);
      }
    };
    cargarVentas();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📦 Ventas Registradas
      </Typography>

      {!showForm ? (
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{ mb: 3 }}
        >
          + Nueva Venta
        </Button>
      ) : (
        <FormVenta onSuccess={handleSuccess} />
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Factura</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>IVA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventas.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.numero_factura}</TableCell>
                <TableCell>{v.cliente.nombre}</TableCell>
                <TableCell>{new Date(v.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{parseFloat(v.total).toFixed(2)}</TableCell>
                <TableCell>{(parseFloat(v.impuesto_general) || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListaVentas;