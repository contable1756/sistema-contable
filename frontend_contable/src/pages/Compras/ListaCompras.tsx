// src/pages/Compras/ListaCompras.tsx
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
import FormCompra from '../../components/Compras/FormCompra.tsx';
import apiClient from '../../services/apiClient.ts'
const ListaCompras = () => {
  const [compras, setCompras] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        const res = await apiClient.get('compras/compras/');
        setCompras(res.data.results);
      } catch (err) {
        console.error(err);
      }
    };
    cargarCompras();
  }, []);

  const handleSuccess =  async () => {
    // Recargar lista
    const res = await apiClient.get('compras/compras/');
    setCompras(res.data.results);
    setShowForm(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        🛒 Compras Registradas
      </Typography>

      {!showForm ? (
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{ mb: 3 }}
        >
          + Nueva Compra
        </Button>
      ) : (
        <FormCompra onSuccess={handleSuccess} />
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Factura</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>IVA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compras.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.numero_factura}</TableCell>
                <TableCell>{c.proveedor.nombre}</TableCell>
                <TableCell>{new Date(c.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{parseFloat(c.total_compra).toFixed(2)}</TableCell>
                <TableCell>{(parseFloat(c.impuesto_general) || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListaCompras;