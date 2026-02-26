import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesasDisponibles, getMesas } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ClienteArea.css';

export default function ClienteSeleccionMesa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    navigate('/cliente/menu', { state: { mesaId: mesa.id, mesaNumero: mesa.numero } });
  };

  return (
    <div className="cliente-area">
      <div className="cliente-header">
        <img src="/logo.png" alt="Casa Fernando" className="cliente-logo" />
        <h1 className="cf-gradient-text">CASA FERNANDO</h1>
      </div>
      <div className="cliente-content">
        <div className="mesa-mensaje cf-card">
          <p>En alguna esquina del negocio encontrará el número de mesa.</p>
          <p><strong>Por favor, seleccione su mesa:</strong></p>
        </div>
        {loading && <p>Cargando mesas...</p>}
        {error && <p className="home-error">{error}</p>}
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
        <button className="cf-btn-outline cf-btn" onClick={() => navigate('/cliente')}>
          Volver
        </button>
      </div>
    </div>
  );
}
