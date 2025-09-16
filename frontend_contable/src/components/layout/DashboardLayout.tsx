// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
  IconButton,
  Typography,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalance,
  Receipt,
  Assessment,
  ExitToApp,
  AddCircle,
  AddBox, MenuBook, ShoppingCart, Sell,
} from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Summarize from '@mui/icons-material/Summarize';
import Balance from '@mui/icons-material/Balance';
import Book from '@mui/icons-material/Book';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

const drawerWidth = 240;

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Libro Diario', icon: <Book />, path: '/reportes/libro-diario' },
    { text: 'Libro Mayor', icon: <MenuBook />, path: '/reportes/libro-mayor' },
    { text: 'Balance de Comprobación', icon: <Assessment />, path: '/reportes/balance' },
    { text: 'Estado de Resultados', icon: <Summarize />, path: '/reportes/resultados' },
    { text: 'Balance General', icon: <Balance />, path: '/reportes/general' },
    { text: 'Cuentas Contables', icon: <AccountBalance />, path: '/cuentas' },
    { text: 'Nueva Cuenta', icon: <AddBox />, path: '/cuentas/nueva' },
    { text: 'Asientos Contables', icon: <Receipt />, path: '/asientos' },
    { text: 'Nuevo Asiento', icon: <AddCircle />, path: '/asientos/nuevo' },
    { text: 'Compras', icon: <ShoppingCart />, path: '/compras' },
    { text: 'Libro de Compras', icon: <Book />, path: '/compras/libro' },
    { text: 'Ventas', icon: <Sell />, path: '/ventas' },    
    { text: 'Libro de Ventas', icon: <ReceiptLong />, path: '/ventas/libro' }

  ];


  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap>
          📊 Sistema Contable
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp color="error" />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ color: 'error' }} />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Panel de Control
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="menú de navegación"
      >
        {/* Drawer en móviles */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer en desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // Alto del AppBar
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;