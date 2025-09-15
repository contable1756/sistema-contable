// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ListaCuentas from './pages/Cuentas/ListaCuentas.tsx';
import ListaAsientos from './pages/Asientos/ListaAsientos.tsx'
import FormCuentaContable from './components/Cuentas/FormCuentaContable.tsx';
import FormAsientoContable from './components/Asientos/FormAsientoContable.tsx';
import BalanceComprobacion from './pages/Reportes/BalanceComprobacion.tsx';
import LibroDiario from './pages/Reportes/LibroDiario.tsx';
import LibroMayor from './pages/Reportes/LibroMayor.tsx';
import ListaCompras from './pages/Compras/ListaCompras.tsx';
import LibroCompras from './pages/Compras/LibroCompras.tsx';
import ListaVentas from './pages/Ventas/ListaVentas.tsx';
import LibroVentas from './pages/Ventas/LibroVentas.tsx';
import EstadoResultados from './pages/EstadoResultados.tsx'
import { useAuth } from './context/AuthContext.tsx';
import { useEffect, useState } from 'react';

// Ruta protegida
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, [isAuthenticated]);

  if (!checked) return null;
  return isAuthenticated ? children : <Login />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      <Route path="/compras" element={<DashboardLayout><ListaCompras /></DashboardLayout>} />
      <Route path="/compras/libro" element={<DashboardLayout><LibroCompras /></DashboardLayout>} />
      <Route path="/ventas" element={<DashboardLayout><ListaVentas /></DashboardLayout>} />
      <Route path="/ventas/libro" element={<DashboardLayout><LibroVentas /></DashboardLayout>} />
      <Route path="/reportes/resultados" element={<EstadoResultados />} />
    </Routes>
  );
}

export default App;