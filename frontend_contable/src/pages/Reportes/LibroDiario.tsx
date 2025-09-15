// src/pages/Reportes/LibroDiario.tsx
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
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import apiClient from '../../services/apiClient.ts';

interface Movimiento {
  cuenta: string;
  nombre: string;
  debe: number;
  haber: number;
}

interface AsientoDiario {
  id: number;
  fecha: string;
  descripcion: string;
  usuario: string;
  movimientos: Movimiento[];
  total_debe: number;
  total_haber: number;
}

const LibroDiario = () => {
  const [asientos, setAsientos] = useState<AsientoDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const cargarLibro = async () => {
      try {
        const res = await apiClient.get('/contabilidad/reportes/libro-diario/');
        setAsientos(res.data);
      } catch (err: any) {
        setError('Error al cargar el Libro Diario');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarLibro();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📘 Libro Diario
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
                <TableCell />
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell><strong>Usuario</strong></TableCell>
                <TableCell align="right"><strong>Total Debe</strong></TableCell>
                <TableCell align="right"><strong>Total Haber</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asientos.length > 0 ? (
                asientos.map((asiento) => (
                  <React.Fragment key={asiento.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setOpenId(openId === asiento.id ? null : asiento.id)}
                        >
                          {openId === asiento.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{asiento.id}</TableCell>
                      <TableCell>{new Date(asiento.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{asiento.descripcion}</TableCell>
                      <TableCell>
                        <Chip label={asiento.usuario} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main">
                          {asiento.total_debe.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="primary.main">
                          {asiento.total_haber.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 0 }}>
                        <Collapse in={openId === asiento.id} timeout="auto">
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="subtitle2" gutterBottom color="textSecondary">
                              Detalle de movimientos:
                            </Typography>
                            <Table size="small" sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Cuenta</strong></TableCell>
                                  <TableCell><strong>Nombre</strong></TableCell>
                                  <TableCell align="right"><strong>Debe</strong></TableCell>
                                  <TableCell align="right"><strong>Haber</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {asiento.movimientos.map((mov, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{mov.cuenta}</TableCell>
                                    <TableCell>{mov.nombre}</TableCell>
                                    <TableCell align="right">
                                      {mov.debe > 0 && (
                                        <Typography color="success.main">
                                          {mov.debe.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {mov.haber > 0 && (
                                        <Typography color="primary.main">
                                          {mov.haber.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
                                        </Typography>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay asientos registrados
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

export default LibroDiario;