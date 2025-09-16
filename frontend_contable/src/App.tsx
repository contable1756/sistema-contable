// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ListaCuentas from './pages/Cuentas/ListaCuentas.tsx';
import ListaAsientos from './pages/Asientos/ListaAsientos.tsx';
import FormCuentaContable from './components/Cuentas/FormCuentaContable.tsx';
import FormAsientoContable from './components/Asientos/FormAsientoContable.tsx';
import BalanceComprobacion from './pages/Reportes/BalanceComprobacion.tsx';
import LibroDiario from './pages/Reportes/LibroDiario.tsx';
import LibroMayor from './pages/Reportes/LibroMayor.tsx';
import ListaCompras from './pages/Compras/ListaCompras.tsx';
import LibroCompras from './pages/Compras/LibroCompras.tsx';
import ListaVentas from './pages/Ventas/ListaVentas.tsx';
import LibroVentas from './pages/Ventas/LibroVentas.tsx';
import EstadoResultados from './pages/EstadoResultados.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { useEffect, useState } from 'react';

// Ruta protegida con manejo de carga
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Simula una verificación rápida del estado de autenticación
    setChecked(true);
  }, [isAuthenticated]);

  if (!checked) {
    return null; // O un spinner si prefieres
  }

  return isAuthenticated ? children : <Login />;
};

function App() {
  return (
    <Routes>
      {/* Página pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas dentro del layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cuentas"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <ListaCuentas />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cuentas/nueva"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <FormCuentaContable />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/asientos"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <ListaAsientos />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/asientos/nuevo"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <FormAsientoContable />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reportes/balance"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <BalanceComprobacion />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reportes/libro-diario"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <LibroDiario />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reportes/libro-mayor"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <LibroMayor />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/compras"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <ListaCompras />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/compras/libro"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <LibroCompras />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ventas"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <ListaVentas />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ventas/libro"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <LibroVentas />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reportes/resultados"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <EstadoResultados />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;