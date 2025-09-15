// src/components/Ventas/FormVenta.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import apiClient from '../../services/apiClient.ts';

const FormVenta = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    cliente_rif: '',
    cliente_nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    numero_factura: '',
    subtotal: '',
    base_imponible_general: '',
    impuesto_general: '',
    total_venta: '',
  });

  // Clientes encontrados tras Enter
  const [clientes, setClientes] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // Buscar cliente al presionar Enter
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rif = formData.cliente_rif.trim();

      if (rif.length < 3) return;

      try {
        const res = await apiClient.get('/ventas/clientes/', {
          params: { rif }
        });

        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        
        if (data.length > 0) {
          setClientes(data);
          setSuggestionsOpen(true);
          // Auto-completar nombre
          setFormData((prev) => ({
            ...prev,
            cliente_nombre: data[0].nombre
          }));
        } else {
          setClientes([]);
          setSuggestionsOpen(false);
        }
      } catch (err) {
        console.error('Error al buscar cliente:', err);
        setClientes([]);
        setSuggestionsOpen(false);
      }
    }
  };

  // Seleccionar un cliente de la lista
  const seleccionarCliente = (cli) => {
    setFormData((prev) => ({
      ...prev,
      cliente_rif: cli.rif,
      cliente_nombre: cli.nombre,
    }));
    setClientes([]);
    setSuggestionsOpen(false);
  };

  // Manejar cambios generales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let clienteId;

      // Buscar cliente por RIF
      const searchRes = await apiClient.get(`/ventas/clientes/?rif=${formData.cliente_rif}`);
      const found = Array.isArray(searchRes.data)
        ? searchRes.data[0]
        : (searchRes.data.results?.[0] || null);

      if (found) {
        clienteId = found.id;
      } else {
        // Crear nuevo cliente
        const createRes = await apiClient.post('/ventas/clientes/', {
          rif: formData.cliente_rif,
          nombre: formData.cliente_nombre || 'Sin nombre',
          direccion: '',
        });
        clienteId = createRes.data.id;
      }

      // Datos finales para enviar
      const ventaData = {
        cliente_id: clienteId,
        fecha: formData.fecha,
        numero_factura: formData.numero_factura,
        numero_control: '', // opcional
        subtotal: parseFloat(formData.subtotal) || 0,
        total: parseFloat(formData.total_venta) || 0,
        base_imponible_general: parseFloat(formData.base_imponible_general) || 0,
        impuesto_general: parseFloat(formData.impuesto_general) || 0,
        base_imponible_reducida: 0,
        impuesto_reducido: 0,
        base_imponible_adicional: 0,
        impuesto_adicional: 0,
        estado: 'emitida',
      };

      await apiClient.post('/ventas/ventas/', ventaData);
      setSuccess(true);

      // Resetear
      setFormData({
        cliente_rif: '',
        cliente_nombre: '',
        fecha: new Date().toISOString().split('T')[0],
        numero_factura: '',
        subtotal: '',
        base_imponible_general: '',
        impuesto_general: '',
        total_venta: '',
      });
      setClientes([]);
      setSuggestionsOpen(false);

      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.cliente
          ? 'Cliente inválido.'
          : err.response?.data?.numero_factura
            ? 'La factura ya existe.'
            : 'Error al registrar la venta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        📦 Nueva Venta
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>✅ Venta registrada exitosamente</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Campo principal: RIF Cliente */}
          <Grid item xs={12}>
            <TextField
              label="Buscar Cliente por RIF (Enter para buscar)"
              name="cliente_rif"
              fullWidth
              required
              value={formData.cliente_rif}
              onChange={(e) => setFormData(prev => ({ ...prev, cliente_rif: e.target.value }))}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ej: V-98765432-1"
              helperText="Presiona Enter para buscar o crear cliente"
            />
            
            {/* Sugerencias tras Enter */}
            {suggestionsOpen && clientes.length > 0 && (
              <List dense sx={{ border: '1px solid #ccc', borderRadius: 1, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                {clientes.map((c) => (
                  <React.Fragment key={c.id}>
                    <ListItem button onClick={() => seleccionarCliente(c)}>
                      <ListItemText
                        primary={c.nombre}
                        secondary={`RIF: ${c.rif}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Grid>

          {/* Nombre editable */}
          <Grid item xs={12}>
            <TextField
              label="Nombre del Cliente"
              name="cliente_nombre"
              fullWidth
              value={formData.cliente_nombre}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          {/* Resto del formulario */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              fullWidth
              required
              value={formData.fecha}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de Factura"
              name="numero_factura"
              fullWidth
              required
              value={formData.numero_factura}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Subtotal"
              type="number"
              name="subtotal"
              fullWidth
              required
              value={formData.subtotal}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ inputProps: { step: "0.01" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Base Imponible General (16%)"
              type="number"
              name="base_imponible_general"
              fullWidth
              value={formData.base_imponible_general}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ inputProps: { step: "0.01" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Impuesto General"
              type="number"
              name="impuesto_general"
              fullWidth
              value={formData.impuesto_general}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ inputProps: { step: "0.01" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Total Venta"
              type="number"
              name="total_venta"
              fullWidth
              required
              value={formData.total_venta}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ inputProps: { step: "0.01" } }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Registrando...' : 'Registrar Venta'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormVenta;