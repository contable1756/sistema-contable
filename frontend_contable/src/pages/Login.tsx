// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import apiClient from '../services/apiClient.ts'; // ✅ Sin .ts
import { useAuth } from '../context/AuthContext.tsx'; // ✅ Sin .tsx
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.correo || !formData.password) {
      setError('Por favor, ingresa correo y contraseña');
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando login:', { correo: formData.correo });
      
      const response = await apiClient.post('usuarios/login/', {
        correo: formData.correo.trim(),
        password: formData.password,
      });

      console.log('Respuesta:', response.data);
      
      const { access } = response.data;

      if (!access) throw new Error('No se recibió el token');

      login(access);
      setSuccess('Inicio de sesión exitoso');
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 401) {
        setError('Credenciales inválidas');
      } else if (err.response?.status === 400) {
        setError('Solicitud incorrecta');
      } else {
        setError('Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', px: 2 }}>
      <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
        <Typography component="h1" variant="h5" fontWeight="bold" color="primary" gutterBottom>
          📊 Sistema Contable
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" mb={3}>
          Iniciar Sesión
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="correo"
            label="Correo"
            name="correo"
            autoComplete="email"
            autoFocus
            value={formData.correo}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Ingresar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;