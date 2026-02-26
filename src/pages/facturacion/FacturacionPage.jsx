import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buscarComandas, getComandaDetalle, actualizarComanda } from '../../services/api';
import './FacturacionPage.css';

export default function FacturacionPage() {
  const [comandas, setComandas] = useState([]);
  const [filtros, setFiltros] = useState({ nombre: '', cedula: '', fecha_desde: '', fecha_hasta: '' });
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.nombre) params.nombre = filtros.nombre;
      if (filtros.cedula) params.cedula = filtros.cedula;
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
      const { data } = await buscarComandas(params);
      setComandas(data || []);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const { data } = await getComandaDetalle(id);
      setDetalle(data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await actualizarComanda(id, { estado });
      if (detalle?.id === id) setDetalle({ ...detalle, estado });
      setComandas(comandas.map((c) => (c.id === id ? { ...c, estado } : c)));
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  return (
    <div className="facturacion-page">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Facturación</h1>
      <div className="filtros cf-card">
        <input
          className="cf-input"
          placeholder="Nombre"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
        />
        <input
          className="cf-input"
          placeholder="Cédula"
          value={filtros.cedula}
          onChange={(e) => setFiltros({ ...filtros, cedula: e.target.value })}
        />
        <input
          type="date"
          className="cf-input"
          value={filtros.fecha_desde}
          onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
        />
        <input
          type="date"
          className="cf-input"
          value={filtros.fecha_hasta}
          onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
        />
        <button className="cf-btn" onClick={buscar} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      <div className="resultados">
        <table className="fact-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comandas.map((c) => (
              <tr key={c.id}>
                <td>{c.numero}</td>
                <td>{c.mesa_numero || '-'}</td>
                <td>{c.cliente_nombre} {c.cliente_apellido}</td>
                <td>${c.total?.toFixed(2)}</td>
                <td>{c.estado}</td>
                <td>
                  <button className="cf-btn-outline cf-btn" onClick={() => verDetalle(c.id)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detalle && (
        <div className="detalle-modal cf-card">
          <h3>Detalle: {detalle.numero}</h3>
          <p>Cliente: {detalle.cliente ? `${detalle.cliente.nombre} ${detalle.cliente.apellido}` : detalle.cliente_nombre}</p>
          <p>Subtotal: ${detalle.subtotal?.toFixed(2)}</p>
          <p>Impuesto: ${detalle.impuesto?.toFixed(2)}</p>
          <p>Total: ${detalle.total?.toFixed(2)}</p>
          <p>Estado: {detalle.estado}</p>
          <div className="estado-actions">
            {['pendiente', 'en_preparacion', 'lista', 'entregada', 'pagada'].map((est) => (
              <button
                key={est}
                className="cf-btn"
                onClick={() => actualizarEstado(detalle.id, est)}
                disabled={detalle.estado === est}
              >
                {est.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button className="cf-btn-outline cf-btn" onClick={() => setDetalle(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
