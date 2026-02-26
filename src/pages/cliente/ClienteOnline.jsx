import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ClienteArea.css';

export default function ClienteOnline() {
  const navigate = useNavigate();

  return (
    <div className="cliente-area">
      <div className="cliente-header">
        <img src="/logo.png" alt="Casa Fernando" className="cliente-logo" />
        <h1 className="cf-gradient-text">CASA FERNANDO</h1>
      </div>
      <div className="cliente-content">
        <p>Pedido en línea (para llevar o delivery)</p>
        <button
          className="cf-btn"
          onClick={() => navigate('/cliente/menu', { state: { fromOnline: true } })}
        >
          Ver menú y ordenar
        </button>
        <button className="cf-btn-outline cf-btn" onClick={() => navigate('/cliente')}>
          Volver
        </button>
      </div>
    </div>
  );
}
