import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, registerCliente } from '../services/api';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTab, setModalTab] = useState('login'); // 'login' | 'registro'
  const [modoPersonal, setModoPersonal] = useState(false); // para login de empleados
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
    if (sessionStorage.getItem('pendingMesa')) {
      setModalAbierto(true);
      setModalTab('registro');
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      const esPersonal = ['admin', 'mesonera', 'punto_venta'].includes(user.rol);
      if (esPersonal) {
        navigate('/admin/dashboard');
      } else {
        // Clientes siempre al portal de clientes, nunca al administrativo
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(loginForm.email, loginForm.password);
      const esPersonal = ['admin', 'mesonera', 'punto_venta'].includes(data.user.rol);
      if (modoPersonal && !esPersonal) {
        setError('Use el acceso de cliente para clientes.');
        return;
      }
      if (!modoPersonal && esPersonal) {
        setError('Use el acceso de personal para empleados.');
        return;
      }
      authLogin(data.user, data.access_token);
      setModalAbierto(false);
      if (esPersonal) navigate('/admin/dashboard');
      else navigate('/cliente');
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
      setModalAbierto(false);
      // Usuarios cliente siempre al portal de clientes
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
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (tab = 'login') => {
    setModalTab(tab);
    setModoPersonal(false);
    setError('');
    setModalAbierto(true);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-logo">
          <img src="/logo.png" alt="Casa Fernando" className="home-logo-small" />
          <span className="home-brand">CASA FERNANDO</span>
        </div>
        <button className="cf-btn cf-btn-header" onClick={() => abrirModal('login')}>
          Iniciar sesión
        </button>
      </header>

      <div className="home-bg-images">
        <div className="home-bg-overlay" />
        <div className="home-bg-img home-bg-1" />
        <div className="home-bg-img home-bg-2" />
        <div className="home-bg-img home-bg-3" />
      </div>

      <main className="home-main">
        <section className="home-hero">
          <img src="/logo.png" alt="Casa Fernando" className="home-logo" />
          <h1 className="cf-gradient-text">CASA FERNANDO</h1>
          <p className="home-subtitle">RESTO-BAR</p>
          <p className="home-tagline">Cocina a la parrilla · Ambiente acogedor</p>
        </section>

        <section className="home-info">
          <h2>Sobre nosotros</h2>
          <p>
            En Casa Fernando ofrecemos los mejores cortes de carne, cerdo a la parrilla y platos tradicionales
            en un ambiente familiar. Nuestra cocina combina recetas de siempre con el sabor inconfundible
            del carbón y la parrilla.
          </p>
        </section>

        <section className="home-gallery">
          <h2>Nuestra cocina</h2>
          <div className="home-gallery-grid">
            <div className="home-gallery-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544025162-d76694265947?w=600')" }}>
              <span>Carne a la parrilla</span>
            </div>
            <div className="home-gallery-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=600')" }}>
              <span>Cerdo asado</span>
            </div>
            <div className="home-gallery-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558030006-450675393462?w=600')" }}>
              <span>Parrilla mixta</span>
            </div>
            <div className="home-gallery-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600')" }}>
              <span>Platos del día</span>
            </div>
          </div>
        </section>
      </main>

      {modalAbierto && (
        <div className="home-modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="home-modal cf-card" onClick={(e) => e.stopPropagation()}>
            <div className="home-modal-tabs">
              <button
                className={modalTab === 'login' ? 'active' : ''}
                onClick={() => { setModalTab('login'); setError(''); }}
              >
                Iniciar sesión
              </button>
              <button
                className={modalTab === 'registro' ? 'active' : ''}
                onClick={() => { setModalTab('registro'); setError(''); }}
              >
                Crear cuenta
              </button>
            </div>

            {modalTab === 'login' && (
              <form className="home-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  className="cf-input"
                  placeholder="Correo electrónico"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  className="cf-input"
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="cf-link home-modal-personal"
                  onClick={() => setModoPersonal(!modoPersonal)}
                >
                  {modoPersonal ? '← Acceso cliente' : '¿Eres personal? Acceder'}
                </button>
                {error && <p className="home-error">{error}</p>}
                <button type="submit" className="cf-btn" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            )}

            {modalTab === 'registro' && (
              <form className="home-form" onSubmit={handleRegistro}>
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
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </form>
            )}

            <button className="home-modal-close" onClick={() => setModalAbierto(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
