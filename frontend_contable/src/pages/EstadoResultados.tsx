// src/pages/EstadoResultados.tsx
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
import apiClient from '../services/apiClient.ts';

// Tipos para el Estado de Resultados
interface CuentaResultado {
  codigo: string;
  nombre: string;
  saldo: number;
}

interface EstadoResultadosData {
  ingresos: CuentaResultado[];
  total_ingresos: number;
  costo_ventas: CuentaResultado[];
  total_costo_ventas: number;
  utilidad_bruta: number;
  gastos_operativos: CuentaResultado[];
  total_gastos_operativos: number;
  utilidad_operativa: number;
  otros_ingresos: CuentaResultado[];
  total_otros_ingresos: number;
  utilidad_neta: number;
}

const EstadoResultados = () => {
  const [data, setData] = useState<EstadoResultadosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEstadoResultados = async () => {
      try {
        const res = await apiClient.get('/contabilidad/reportes/estado-resultados/');
        setData(res.data);
      } catch (err: any) {
        console.error('Error al cargar Estado de Resultados:', err);
        setError('No se pudo cargar el Estado de Resultados.');
      } finally {
        setLoading(false);
      }
    };
    cargarEstadoResultados();
  }, []);

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

  if (!data) {
    return <Alert sx={{ m: 3 }}>No hay datos disponibles.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary" align="center">
        📈 ESTADO DE RESULTADOS
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" align="center" gutterBottom>
        Del período contable
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table size="small">
          <TableBody>
            {/* INGRESOS */}
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="h6" fontWeight="bold">INGRESOS</Typography>
              </TableCell>
            </TableRow>
            {data.ingresos.length > 0 ? (
              data.ingresos.map((c) => (
                <TableRow key={c.codigo}>
                  <TableCell>{c.codigo}</TableCell>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" color="textSecondary">
                  No hay ingresos registrados
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={2}>
                <strong>Total Ingresos</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{data.total_ingresos.toFixed(2)}</strong>
              </TableCell>
            </TableRow>

            {/* COSTO DE VENTAS */}
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  COSTO DE VENTAS
                </Typography>
              </TableCell>
            </TableRow>
            {data.costo_ventas.length > 0 ? (
              data.costo_ventas.map((c) => (
                <TableRow key={c.codigo}>
                  <TableCell>{c.codigo}</TableCell>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" color="textSecondary">
                  No hay costos de ventas registrados
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={2}>Total Costo de Ventas</TableCell>
              <TableCell align="right">{data.total_costo_ventas.toFixed(2)}</TableCell>
            </TableRow>

            {/* UTILIDAD BRUTA */}
            <TableRow>
              <TableCell colSpan={2}>
                <strong>UTILIDAD BRUTA</strong>
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: 'success.main', fontWeight: 'bold' }}
              >
                {data.utilidad_bruta.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* GASTOS OPERATIVOS */}
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                  GASTOS OPERATIVOS
                </Typography>
              </TableCell>
            </TableRow>
            {data.gastos_operativos.length > 0 ? (
              data.gastos_operativos.map((c) => (
                <TableRow key={c.codigo}>
                  <TableCell>{c.codigo}</TableCell>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" color="textSecondary">
                  No hay gastos operativos registrados
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={2}>Total Gastos Operativos</TableCell>
              <TableCell align="right">{data.total_gastos_operativos.toFixed(2)}</TableCell>
            </TableRow>

            {/* UTILIDAD OPERATIVA */}
            <TableRow>
              <TableCell colSpan={2}>
                <strong>UTILIDAD OPERATIVA</strong>
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: 'info.main', fontWeight: 'bold' }}
              >
                {data.utilidad_operativa.toFixed(2)}
              </TableCell>
            </TableRow>

            {/* OTROS INGRESOS */}
            {data.otros_ingresos.length > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                      OTROS INGRESOS
                    </Typography>
                  </TableCell>
                </TableRow>
                {data.otros_ingresos.map((c) => (
                  <TableRow key={c.codigo}>
                    <TableCell>{c.codigo}</TableCell>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell align="right">{c.saldo.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>Total Otros Ingresos</TableCell>
                  <TableCell align="right">{data.total_otros_ingresos.toFixed(2)}</TableCell>
                </TableRow>
              </>
            )}

            {/* UTILIDAD NETA */}
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="h6" fontWeight="bold">
                  UTILIDAD NETA DEL EJERCICIO
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: 'success.main',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                }}
              >
                {data.utilidad_neta.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EstadoResultados;