import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ClienteArea.css';

export default function ClienteTipoPedido() {
  const navigate = useNavigate();

  return (
    <div className="cliente-area">
      <div className="cliente-header">
        <img src="/logo.png" alt="Casa Fernando" className="cliente-logo" />
        <h1 className="cf-gradient-text">CASA FERNANDO</h1>
      </div>
      <div className="cliente-content">
        <h2>¿Cómo desea ordenar?</h2>
        <div className="cliente-opciones">
          <button className="cf-btn cf-card opcion-card" onClick={() => navigate('/cliente/online')}>
            <span className="opcion-icon">📱</span>
            <span>Pedido en línea</span>
            <span className="opcion-desc">Para llevar o delivery</span>
          </button>
          <button className="cf-btn cf-card opcion-card" onClick={() => navigate('/cliente/presencial')}>
            <span className="opcion-icon">🍽️</span>
            <span>Estoy en el restaurante</span>
            <span className="opcion-desc">Seleccionar mesa y ordenar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
