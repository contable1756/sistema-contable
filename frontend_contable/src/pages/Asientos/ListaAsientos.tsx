// src/pages/Asientos/ListaAsientos.tsx
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
  IconButton,
  Collapse,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import apiClient from '../../services/apiClient.ts';

// Tipos actualizados: debe y haber pueden ser string o number
interface Movimiento {
  cuenta: {
    codigo: string;
    nombre: string;
  };
  debe: string | number;
  haber: string | number;
}

interface Usuario {
  nombre: string;
  apellido: string;
}

interface AsientoContable {
  id: number;
  fecha: string;
  descripcion: string;
  usuario: Usuario | null;
  movimientos: Movimiento[];
}

const ListaAsientos = () => {
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const cargarAsientos = async () => {
      try {
        const res = await apiClient.get('/contabilidad/asientos/');
        
        // Manejar paginación
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);

        // Aseguramos que sea un array válido
        if (!Array.isArray(data)) {
          throw new Error('La respuesta no es un array');
        }

        setAsientos(data);
      } catch (err: any) {
        console.error('Error al cargar asientos:', err);
        setError('No se pudieron cargar los asientos contables.');
      } finally {
        setLoading(false);
      }
    };

    cargarAsientos();
  }, []);

  // Función segura para convertir a número
  const toNumber = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  // Calcular totalDebe de forma segura
  const totalDebe = (movs: Movimiento[] = []): number => {
    return movs.reduce((sum, m) => sum + toNumber(m.debe), 0);
  };

  // Calcular totalHaber de forma segura
  const totalHaber = (movs: Movimiento[] = []): number => {
    return movs.reduce((sum, m) => sum + toNumber(m.haber), 0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📝 Asientos Contables
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
              <TableRow>
                <TableCell />
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Descripción</strong></TableCell>
                <TableCell align="right"><strong>Debe</strong></TableCell>
                <TableCell align="right"><strong>Haber</strong></TableCell>
                <TableCell><strong>Usuario</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asientos.length > 0 ? (
                asientos.map((asiento) => {
                  const debeTotal = totalDebe(asiento.movimientos);
                  const haberTotal = totalHaber(asiento.movimientos);

                  return (
                    <React.Fragment key={asiento.id}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setOpenId(openId === asiento.id ? null : asiento.id)}
                            aria-label={openId === asiento.id ? "Cerrar detalles" : "Ver detalles"}
                          >
                            {openId === asiento.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{asiento.id}</TableCell>
                        <TableCell>{new Date(asiento.fecha).toLocaleDateString()}</TableCell>
                        <TableCell>{asiento.descripcion}</TableCell>
                        <TableCell align="right">
                          <Typography color="success.main" fontWeight="bold">
                            {debeTotal.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="primary.main" fontWeight="bold">
                            {haberTotal.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {asiento.usuario
                            ? `${asiento.usuario.nombre} ${asiento.usuario.apellido}`
                            : 'Sistema'}
                        </TableCell>
                      </TableRow>

                      {/* Fila colapsable con movimientos */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0 }}>
                          <Collapse in={openId === asiento.id} timeout="auto">
                            <Box sx={{ margin: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Detalle de movimientos:
                              </Typography>
                              <Table size="small" sx={{ backgroundColor: '#fafafa' }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Cuenta</strong></TableCell>
                                    <TableCell><strong>Nombre</strong></TableCell>
                                    <TableCell align="right"><strong>Debe</strong></TableCell>
                                    <TableCell align="right"><strong>Haber</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {asiento.movimientos?.map((m, idx) => {
                                    const debeNum = toNumber(m.debe);
                                    const haberNum = toNumber(m.haber);

                                    return (
                                      <TableRow key={idx}>
                                        <TableCell>{m.cuenta?.codigo || '—'}</TableCell>
                                        <TableCell>{m.cuenta?.nombre || '—'}</TableCell>
                                        <TableCell align="right">
                                          {debeNum > 0 ? debeNum.toFixed(2) : ''}
                                        </TableCell>
                                        <TableCell align="right">
                                          {haberNum > 0 ? haberNum.toFixed(2) : ''}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No hay asientos registrados.</Typography>
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

export default ListaAsientos;