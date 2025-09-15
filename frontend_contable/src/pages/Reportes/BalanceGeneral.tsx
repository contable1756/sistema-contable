// pages/Reportes/BalanceGeneral.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import apiClient from '../../services/apiClient.ts';

const BalanceGeneral = () => {
  const [data, setData] = useState<{ activo: number; pasivo: number; patrimonio: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await apiClient.get('/contabilidad/reportes/balance-general/');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return <CircularProgress />;
  if (!data) return <Alert severity="error">Error al cargar datos</Alert>;

  const totalPasivoPatrimonio = data.pasivo + data.patrimonio;

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
        📊 Balance General
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
          <Box>
            <Typography variant="h6" color="success.main">ACTIVO</Typography>
            <Typography fontSize="1.5rem">
              {data.activo.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="primary.main">PASIVO + PATRIMONIO</Typography>
            <Typography fontSize="1.5rem">
              {totalPasivoPatrimonio.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
            </Typography>
            <Typography variant="body2">
              Pasivo: {data.pasivo.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })} | 
              Patrimonio: {data.patrimonio.toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default BalanceGeneral;