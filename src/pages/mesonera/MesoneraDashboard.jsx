import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocketMesonera } from '../../hooks/useWebSocket';
import { getNotificaciones, atenderNotificacion, getComandasMesonera } from '../../services/api';
import './MesoneraDashboard.css';

export default function MesoneraDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = localStorage.getItem('token');
  const [notifs, setNotifs] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);

  const { connected } = useWebSocketMesonera(token, (msg) => {
    if (msg.type === 'notificacion_cliente') {
      loadNotifs();
    }
  });

  const loadNotifs = () => getNotificaciones().then(({ data }) => setNotifs(data || []));
  const loadComandas = () => getComandasMesonera().then(({ data }) => setComandas(data || []));

  useEffect(() => {
    const load = () => {
      loadNotifs();
      loadComandas();
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const handleAtender = async (notif) => {
    try {
      await atenderNotificacion(notif.id);
      setNotifs((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  return (
    <div className="mesonera-dash">
      <header className="mesonera-header">
        <img src="/logo.png" alt="Casa Fernando" className="dash-logo" />
        <h1 className="cf-gradient-text">Módulo Mesonera</h1>
        <div className="header-actions">
          <span className={connected ? 'ws-on' : 'ws-off'}>
            {connected ? '● Conectado' : '○ Desconectado'}
          </span>
          <span>{user?.nombre} {user?.apellido}</span>
          <button className="cf-btn-outline cf-btn" onClick={() => logout()}>Salir</button>
        </div>
      </header>

      <div className="mesonera-grid">
        <section className="mesonera-section cf-card">
          <h2>🔔 Notificaciones de clientes</h2>
          {notifs.length === 0 && <p>No hay notificaciones pendientes</p>}
          <ul className="notif-list">
            {notifs.map((n) => (
              <li key={n.id} className="notif-item">
                <div>
                  <strong>Mesa {n.mesa_id || 'N/A'}</strong>
                  <span>{n.mensaje}</span>
                </div>
                <button className="cf-btn" onClick={() => handleAtender(n)}>
                  Atender
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mesonera-section cf-card">
          <h2>Comandas</h2>
          <ul className="comanda-list">
            {comandas.slice(0, 10).map((c) => (
              <li key={c.id}>
                <span>{c.numero}</span>
                <span>Mesa {c.mesa_numero || '-'}</span>
                <span>{c.cliente_nombre}</span>
                <span>${c.total?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
