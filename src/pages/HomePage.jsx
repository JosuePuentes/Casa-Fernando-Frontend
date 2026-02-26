import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, registerCliente } from '../services/api';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const [mode, setMode] = useState(() => {
    return sessionStorage.getItem('pendingMesa') ? 'registro' : 'lobby';
  }); // lobby | login-cliente | login-admin | registro
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginCliente, setLoginCliente] = useState({ email: '', password: '' });
  const [loginAdmin, setLoginAdmin] = useState({ email: '', password: '' });
  const [registro, setRegistro] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    cedula: '',
    direccion: '',
    telefono: '',
  });

  React.useEffect(() => {
    if (user) {
      if (user.rol === 'admin' || user.rol === 'mesonera' || user.rol === 'punto_venta') {
        navigate('/admin/dashboard');
      } else {
        const pending = sessionStorage.getItem('pendingMesa');
        if (pending) {
          try {
            const { mesaId, mesaNumero } = JSON.parse(pending);
            sessionStorage.removeItem('pendingMesa');
            navigate('/cliente/menu', { state: { mesaId, mesaNumero } });
          } catch {
            navigate('/cliente');
          }
        } else {
          navigate('/cliente');
        }
      }
    }
  }, [user, navigate]);

  const handleLoginCliente = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(loginCliente.email, loginCliente.password);
      if (data.user.rol !== 'cliente') {
        setError('Use el acceso de personal para empleados.');
        return;
      }
      authLogin(data.user, data.access_token);
      navigate('/cliente');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(loginAdmin.email, loginAdmin.password);
      if (data.user.rol === 'cliente') {
        setError('Use el acceso de cliente.');
        return;
      }
      authLogin(data.user, data.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerCliente({
        email: registro.email,
        password: registro.password,
        nombre: registro.nombre,
        apellido: registro.apellido,
        cedula: registro.cedula,
        direccion: registro.direccion,
        telefono: registro.telefono,
      });
      const { data } = await login(registro.email, registro.password);
      authLogin(data.user, data.access_token);
      navigate('/cliente');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-bg-images">
        <div className="home-bg-overlay" />
        <div className="home-bg-img home-bg-1" />
        <div className="home-bg-img home-bg-2" />
        <div className="home-bg-img home-bg-3" />
      </div>
      <div className="home-hero">
        <img src="/logo.png" alt="Casa Fernando" className="home-logo" />
        <h1 className="cf-gradient-text">CASA FERNANDO</h1>
        <p className="home-subtitle">RESTO-BAR</p>
        <p className="home-tagline">Cocina a la parrilla · Ambiente acogedor</p>
      </div>

      <div className="home-actions">
        {mode === 'lobby' && (
          <>
            <button className="cf-btn" onClick={() => setMode('login-cliente')}>
              Entrar como Cliente
            </button>
            <button className="cf-btn cf-btn-outline" onClick={() => setMode('registro')}>
              Registrarse
            </button>
            <button className="cf-btn cf-btn-outline" onClick={() => setMode('login-admin')}>
              Personal / Admin
            </button>
          </>
        )}

        {mode === 'login-cliente' && (
          <form className="home-form" onSubmit={handleLoginCliente}>
            <h2>Iniciar sesión (Cliente)</h2>
            <input
              type="email"
              className="cf-input"
              placeholder="Correo electrónico"
              value={loginCliente.email}
              onChange={(e) => setLoginCliente({ ...loginCliente, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="cf-input"
              placeholder="Contraseña"
              value={loginCliente.password}
              onChange={(e) => setLoginCliente({ ...loginCliente, password: e.target.value })}
              required
            />
            {error && <p className="home-error">{error}</p>}
            <button type="submit" className="cf-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button type="button" className="cf-btn-outline cf-btn" onClick={() => { setMode('lobby'); setError(''); sessionStorage.removeItem('pendingMesa'); }}>
              Volver
            </button>
          </form>
        )}

        {mode === 'login-admin' && (
          <form className="home-form" onSubmit={handleLoginAdmin}>
            <h2>Iniciar sesión (Personal)</h2>
            <input
              type="text"
              className="cf-input"
              placeholder="Usuario / Correo"
              value={loginAdmin.email}
              onChange={(e) => setLoginAdmin({ ...loginAdmin, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="cf-input"
              placeholder="Contraseña"
              value={loginAdmin.password}
              onChange={(e) => setLoginAdmin({ ...loginAdmin, password: e.target.value })}
              required
            />
            {error && <p className="home-error">{error}</p>}
            <button type="submit" className="cf-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button type="button" className="cf-btn-outline cf-btn" onClick={() => { setMode('lobby'); setError(''); }}>
              Volver
            </button>
          </form>
        )}

        {mode === 'registro' && (
          <form className="home-form" onSubmit={handleRegistro}>
            <h2>Registrarse como Cliente</h2>
            <input
              type="text"
              className="cf-input"
              placeholder="Número de cédula"
              value={registro.cedula}
              onChange={(e) => setRegistro({ ...registro, cedula: e.target.value })}
              required
            />
            <input
              type="text"
              className="cf-input"
              placeholder="Nombre"
              value={registro.nombre}
              onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
              required
            />
            <input
              type="text"
              className="cf-input"
              placeholder="Apellido"
              value={registro.apellido}
              onChange={(e) => setRegistro({ ...registro, apellido: e.target.value })}
              required
            />
            <input
              type="text"
              className="cf-input"
              placeholder="Dirección"
              value={registro.direccion}
              onChange={(e) => setRegistro({ ...registro, direccion: e.target.value })}
            />
            <input
              type="tel"
              className="cf-input"
              placeholder="Teléfono"
              value={registro.telefono}
              onChange={(e) => setRegistro({ ...registro, telefono: e.target.value })}
              required
            />
            <input
              type="email"
              className="cf-input"
              placeholder="Correo electrónico"
              value={registro.email}
              onChange={(e) => setRegistro({ ...registro, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="cf-input"
              placeholder="Contraseña"
              value={registro.password}
              onChange={(e) => setRegistro({ ...registro, password: e.target.value })}
              required
            />
            {error && <p className="home-error">{error}</p>}
            <button type="submit" className="cf-btn" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            <button type="button" className="cf-btn-outline cf-btn" onClick={() => { setMode('lobby'); setError(''); sessionStorage.removeItem('pendingMesa'); }}>
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
