import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import './LoginPersonal.css';

export default function LoginPersonal() {
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user && ['admin', 'mesonera', 'punto_venta'].includes(user.rol)) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      if (data.user.rol === 'cliente') {
        setError('Use el acceso de cliente en la página principal.');
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

  return (
    <div className="login-personal">
      <div className="login-personal-card cf-card">
        <img src="/logo.png" alt="Casa Fernando" className="login-personal-logo" />
        <h1>Acceso personal</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="cf-input"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="cf-input"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="home-error">{error}</p>}
          <button type="submit" className="cf-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <a href="/" className="login-personal-back">← Volver al inicio</a>
      </div>
    </div>
  );
}
