import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dash">
      <header className="admin-header">
        <img src="/logo.png" alt="Casa Fernando" className="dash-logo" />
        <h1 className="cf-gradient-text">Panel de Administración</h1>
        <div className="header-actions">
          <span>{user?.nombre} {user?.apellido}</span>
          <button className="cf-btn-outline cf-btn" onClick={() => logout()}>Salir</button>
        </div>
      </header>

      <nav className="admin-nav">
        <Link to="/admin/categorias" className="admin-card cf-card">
          <span className="admin-icon">📁</span>
          <span>Categorías</span>
        </Link>
        <Link to="/admin/platos" className="admin-card cf-card">
          <span className="admin-icon">🍽️</span>
          <span>Platos</span>
        </Link>
        <Link to="/admin/mesas" className="admin-card cf-card">
          <span className="admin-icon">🪑</span>
          <span>Mesas</span>
        </Link>
        {user?.rol === 'admin' && (
          <Link to="/admin/empleados" className="admin-card cf-card">
            <span className="admin-icon">👥</span>
            <span>Usuarios</span>
          </Link>
        )}
        {(user?.rol === 'mesonera' || user?.rol === 'admin' || user?.rol === 'punto_venta') && (
          <Link to="/mesonera" className="admin-card cf-card">
            <span className="admin-icon">🔔</span>
            <span>Mesonera</span>
          </Link>
        )}
        <Link to="/facturacion" className="admin-card cf-card">
          <span className="admin-icon">📄</span>
          <span>Facturación</span>
        </Link>
      </nav>
    </div>
  );
}
