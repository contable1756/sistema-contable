// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import apiClient from '../services/apiClient.ts';

interface BalanceData {
  total_activo: number;
  total_pasivo: number;
  total_patrimonio: number;
}

interface EstadoResultadosData {
  utilidad_neta: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos del resumen
  const [totalCuentas, setTotalCuentas] = useState(0);
  const [totalAsientos, setTotalAsientos] = useState(0);
  const [utilidadNeta, setUtilidadNeta] = useState(0);

  // Datos para el gráfico
  const [totalActivo, setTotalActivo] = useState(0);
  const [totalPasivo, setTotalPasivo] = useState(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null);

        // Cargar cuentas
        const resCuentas = await apiClient.get('/contabilidad/cuentas/');
        const cuentasCount = Array.isArray(resCuentas.data)
          ? resCuentas.data.length
          : resCuentas.data.count || 0;
        setTotalCuentas(cuentasCount);

        // Cargar asientos
        const resAsientos = await apiClient.get('/contabilidad/asientos/');
        const asientosCount = Array.isArray(resAsientos.data)
          ? resAsientos.data.length
          : resAsientos.data.count || 0;
        setTotalAsientos(asientosCount);

        // Cargar estado de resultados
        const resResultados = await apiClient.get('/contabilidad/reportes/estado-resultados/');
        setUtilidadNeta(resResultados.data.utilidad_neta || 0);

        // Cargar balance general
        const resBalance = await apiClient.get('/contabilidad/reportes/balance-general/');
        setTotalActivo(resBalance.data.total_activo || 0);
        setTotalPasivo(resBalance.data.total_pasivo || 0);

      } catch (err: any) {
        console.error('Error al cargar datos del dashboard:', err);
        setError(
          err.response?.status === 404
            ? 'No se encontró el recurso. Verifica que los endpoints estén bien definidos.'
            : 'No se pudieron cargar los datos del dashboard. Revisa el backend.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        📊 Dashboard Contable
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardHeader title="Total de Cuentas" />
            <CardContent>
              <Typography variant="h5">{totalCuentas}</Typography>
              <Typography color="textSecondary">Cuentas registradas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardHeader title="Asientos Registrados" />
            <CardContent>
              <Typography variant="h5">{totalAsientos}</Typography>
              <Typography color="textSecondary">Movimientos contables</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardHeader title="Utilidad Neta" />
            <CardContent>
              <Typography variant="h5" color="success.main">
                {utilidadNeta.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
              </Typography>
              <Typography color="textSecondary">Estado de resultados</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico Activo vs Pasivo */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          📈 Activo vs Pasivo
        </Typography>

        {(totalActivo === 0 && totalPasivo === 0) ? (
          <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
            No hay datos suficientes para mostrar el gráfico.
          </Typography>
        ) : (
          <BarChart
            series={[
              { data: [totalActivo], label: 'Activo', color: '#2e7d32' },
              { data: [totalPasivo], label: 'Pasivo', color: '#d32f2f' },
            ]}
            xAxis={[{ scaleType: 'band', data: ['Balance'] }]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
              },
            }}
            sx={{
              [`& .MuiBarElement-root`]: {
                borderRadius: 6,
              },
            }}
          />
        )}
      </Paper>

      {/* Mensaje de bienvenida */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'primary.light', color: 'white' }}>
        <Typography variant="body1" align="center">
          Bienvenido al sistema contable. Usa el menú lateral para navegar entre módulos.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;