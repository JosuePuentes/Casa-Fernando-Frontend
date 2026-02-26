import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesasDisponibles, getMesas } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import './ClienteArea.css';

export default function ClienteSeleccionMesa() {
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMesasDisponibles();
        setMesas(res.data || []);
      } catch (e) {
        if (e.response?.status === 404) {
          try {
            const r = await getMesas();
            setMesas(r.data || []);
          } catch (_) {
            setError('No se pudieron cargar las mesas. Use el acceso de personal.');
          }
        } else {
          setError('No se pudieron cargar las mesas disponibles.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelect = (mesa) => {
    if (user) {
      navigate('/cliente/menu', { state: { mesaId: mesa.id, mesaNumero: mesa.numero } });
    } else {
      setSelectedMesa(mesa);
    }
  };

  const handleLoginPresencial = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const { data } = await login(loginForm.email, loginForm.password);
      if (data.user.rol !== 'cliente') {
        setLoginError('Use el acceso de cliente para ordenar en mesa.');
        return;
      }
      authLogin(data.user, data.access_token);
      navigate('/cliente/menu', {
        state: { mesaId: selectedMesa.id, mesaNumero: selectedMesa.numero },
      });
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegistroRedirect = () => {
    sessionStorage.setItem('pendingMesa', JSON.stringify({
      mesaId: selectedMesa.id,
      mesaNumero: selectedMesa.numero,
    }));
    navigate('/');
  };

  return (
    <div className="cliente-area">
      <div className="cliente-header">
        <img src="/logo.png" alt="Casa Fernando" className="cliente-logo" />
        <h1 className="cf-gradient-text">CASA FERNANDO</h1>
      </div>
      <div className="cliente-content">
        <div className="mesa-mensaje cf-card">
          <p>En alguna esquina de la mesa encontrará el número de mesa.</p>
          <p><strong>Por favor, seleccione su mesa:</strong></p>
        </div>
        {loading && <p>Cargando mesas...</p>}
        {error && <p className="home-error">{error}</p>}
        {!selectedMesa ? (
          <>
            <div className="mesas-grid">
              {mesas.map((m) => (
                <button
                  key={m.id}
                  className="cf-btn cf-card mesa-btn"
                  onClick={() => handleSelect(m)}
                >
                  Mesa {m.numero}
                </button>
              ))}
            </div>
            {!loading && !error && mesas.length === 0 && (
              <p>No hay mesas disponibles en este momento.</p>
            )}
          </>
        ) : (
          <div className="mesa-login-form cf-card">
            <h3>Mesa {selectedMesa.numero} seleccionada</h3>
            <p>Inicie sesión para continuar con su pedido:</p>
            <form onSubmit={handleLoginPresencial}>
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
              {loginError && <p className="home-error">{loginError}</p>}
              <button type="submit" className="cf-btn" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Iniciar sesión'}
              </button>
            </form>
            <p className="mesa-registro-link">
              ¿No tiene cuenta?{' '}
              <button type="button" className="cf-link" onClick={handleRegistroRedirect}>
                Regístrese aquí
              </button>
            </p>
            <button
              type="button"
              className="cf-btn-outline cf-btn"
              onClick={() => setSelectedMesa(null)}
            >
              Cambiar mesa
            </button>
          </div>
        )}
        {!selectedMesa && (
          <button className="cf-btn-outline cf-btn" onClick={() => navigate('/cliente')}>
            Volver
          </button>
        )}
      </div>
    </div>
  );
}
