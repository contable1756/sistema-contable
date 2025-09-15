// src/pages/Cuentas/ListaCuentas.tsx
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

interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  nivel: number;
}

const ListaCuentas = () => {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        const res = await apiClient.get('/contabilidad/cuentas/');
        setCuentas(res.data.results);
      } catch (err: any) {
        setError('Error al cargar las cuentas contables');
      } finally {
        setLoading(false);
      }
    };
    cargarCuentas();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📌 Cuentas Contables
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Nivel</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cuentas.length > 0 ? (
                cuentas.map((cuenta) => (
                  <TableRow key={cuenta.id}>
                    <TableCell>{cuenta.codigo}</TableCell>
                    <TableCell>{cuenta.nombre}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          bgcolor:
                            cuenta.tipo === 'activo' ? 'success.light' :
                            cuenta.tipo === 'pasivo' ? 'warning.light' :
                            cuenta.tipo === 'patrimonio' ? 'info.light' :
                            cuenta.tipo === 'ingreso' ? 'primary.light' : 'error.light',
                          color: 'text.primary',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8rem',
                        }}
                      >
                        {cuenta.tipo.charAt(0).toUpperCase() + cuenta.tipo.slice(1)}
                      </Typography>
                    </TableCell>
                    <TableCell>{cuenta.nivel}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay cuentas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ListaCuentas;