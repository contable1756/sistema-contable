// src/components/Compras/FormCompra.tsx
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

const FormCompra = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    proveedor_rif: '',
    proveedor_nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    numero_factura: '',
    subtotal: '',
    base_imponible_general: '',
    impuesto_general: '',
    total_compra: '',
  });

  // Proveedores encontrados tras Enter
  const [proveedores, setProveedores] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // Buscar proveedor SOLO al presionar Enter
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rif = formData.proveedor_rif.trim();

      if (rif.length < 3) return;

      try {
        const res = await apiClient.get('/compras/proveedores/', {
          params: { rif }
        });

        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        
        if (data.length > 0) {
          setProveedores(data);
          setSuggestionsOpen(true);
          // Auto-completar nombre con el primer resultado
          setFormData((prev) => ({
            ...prev,
            proveedor_nombre: data[0].nombre
          }));
        } else {
          setProveedores([]);
          setSuggestionsOpen(false);
          // Si no existe, deja que el usuario escriba el nombre manualmente
        }
      } catch (err) {
        console.error('Error al buscar proveedor:', err);
        setProveedores([]);
        setSuggestionsOpen(false);
      }
    }
  };

  // Seleccionar un proveedor de la lista
  const seleccionarProveedor = (prov) => {
    setFormData((prev) => ({
      ...prev,
      proveedor_rif: prov.rif,
      proveedor_nombre: prov.nombre,
    }));
    setProveedores([]);
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
      let proveedorId;

      // Buscar por RIF antes de crear
      const searchRes = await apiClient.get(`/compras/proveedores/?rif=${formData.proveedor_rif}`);
      
      // ✅ Corrección aquí: `searchRes.data` puede ser array o { results: [...] }
      const found = Array.isArray(searchRes.data)
        ? searchRes.data[0]
        : (searchRes.data.results && searchRes.data.results.length > 0)
          ? searchRes.data.results[0]
          : null;

      if (found) {
        proveedorId = found.id;
      } else {
        // Crear nuevo proveedor
        const createRes = await apiClient.post('/compras/proveedores/', {
          rif: formData.proveedor_rif,
          nombre: formData.proveedor_nombre || 'Sin nombre',
          direccion: '',
        });
        proveedorId = createRes.data.id;
      }

      // Registrar compra
      const compraData = {
        proveedor: proveedorId,
        fecha: formData.fecha,
        numero_factura: formData.numero_factura,
        numero_control: '',
        subtotal: parseFloat(formData.subtotal) || 0,
        total_compra: parseFloat(formData.total_compra) || 0,
        base_imponible_general: parseFloat(formData.base_imponible_general) || 0,
        impuesto_general: parseFloat(formData.impuesto_general) || 0,
        base_imponible_reducida: 0,
        impuesto_reducido: 0,
        base_imponible_adicional: 0,
        impuesto_adicional: 0,
      };

      await apiClient.post('/compras/compras/', compraData);
      setSuccess(true);

      // Resetear formulario
      setFormData({
        proveedor_rif: '',
        proveedor_nombre: '',
        fecha: new Date().toISOString().split('T')[0],
        numero_factura: '',
        subtotal: '',
        base_imponible_general: '',
        impuesto_general: '',
        total_compra: '',
      });
      setProveedores([]);
      setSuggestionsOpen(false);

      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.proveedor
          ? 'Error con el proveedor.'
          : err.response?.data?.numero_factura
            ? 'La factura ya existe.'
            : 'Error al registrar la compra.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        🛒 Nueva Compra
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>✅ Compra registrada exitosamente</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Campo principal: RIF */}
          <Grid item xs={12}>
            <TextField
              label="Buscar Proveedor por RIF (Enter para buscar)"
              name="proveedor_rif"
              fullWidth
              required
              value={formData.proveedor_rif}
              onChange={(e) => setFormData(prev => ({ ...prev, proveedor_rif: e.target.value }))}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ej: J-12345678-9"
              helperText="Presiona Enter para buscar o crear proveedor"
            />
            
            {/* Sugerencias tras Enter */}
            {suggestionsOpen && proveedores.length > 0 && (
              <List dense sx={{ border: '1px solid #ccc', borderRadius: 1, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                {proveedores.map((p) => (
                  <React.Fragment key={p.id}>
                    <ListItem button onClick={() => seleccionarProveedor(p)}>
                      <ListItemText
                        primary={p.nombre}
                        secondary={`RIF: ${p.rif}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Grid>

          {/* Nombre editable (útil si se crea uno nuevo) */}
          <Grid item xs={12}>
            <TextField
              label="Nombre del Proveedor"
              name="proveedor_nombre"
              fullWidth
              value={formData.proveedor_nombre}
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
              label="Total Compra"
              type="number"
              name="total_compra"
              fullWidth
              required
              value={formData.total_compra}
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
            {loading ? 'Registrando...' : 'Registrar Compra'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormCompra;