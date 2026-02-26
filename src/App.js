import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPersonal from './pages/LoginPersonal';
import ClienteTipoPedido from './pages/cliente/ClienteTipoPedido';
import ClienteOnline from './pages/cliente/ClienteOnline';
import ClienteSeleccionMesa from './pages/cliente/ClienteSeleccionMesa';
import ClienteMenu from './pages/cliente/ClienteMenu';
import MesoneraDashboard from './pages/mesonera/MesoneraDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategorias from './pages/admin/AdminCategorias';
import AdminPlatos from './pages/admin/AdminPlatos';
import AdminMesas from './pages/admin/AdminMesas';
import AdminEmpleados from './pages/admin/AdminEmpleados';
import FacturacionPage from './pages/facturacion/FacturacionPage';
import './index.css';

function ProtectedAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  if (!user || (user.rol !== 'admin' && user.rol !== 'mesonera' && user.rol !== 'punto_venta')) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedAdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.rol !== 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/acceso-personal" element={<LoginPersonal />} />
          <Route path="/cliente" element={<ClienteTipoPedido />} />
          <Route path="/cliente/online" element={<ClienteOnline />} />
          <Route path="/cliente/presencial" element={<ClienteSeleccionMesa />} />
          <Route path="/cliente/menu" element={<ClienteMenu />} />
          <Route
            path="/mesonera"
            element={
              <ProtectedAdmin>
                <MesoneraDashboard />
              </ProtectedAdmin>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdmin>
                <AdminDashboard />
              </ProtectedAdmin>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <ProtectedAdmin>
                <AdminCategorias />
              </ProtectedAdmin>
            }
          />
          <Route
            path="/admin/platos"
            element={
              <ProtectedAdmin>
                <AdminPlatos />
              </ProtectedAdmin>
            }
          />
          <Route
            path="/admin/mesas"
            element={
              <ProtectedAdmin>
                <AdminMesas />
              </ProtectedAdmin>
            }
          />
          <Route
            path="/admin/empleados"
            element={
              <ProtectedAdminOnly>
                <AdminEmpleados />
              </ProtectedAdminOnly>
            }
          />
          <Route
            path="/facturacion"
            element={
              <ProtectedAdmin>
                <FacturacionPage />
              </ProtectedAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
