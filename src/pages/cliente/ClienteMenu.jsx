import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenu, crearComandaCliente, notificarMesonera } from '../../services/api';
import './ClienteArea.css';

export default function ClienteMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mesaId, mesaNumero, fromOnline } = location.state || {};
  const isPresencial = !!mesaId;

  const [platos, setPlatos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mesoneraAtendiendo] = useState(null);
  const [llamando, setLlamando] = useState(false);

  useEffect(() => {
    getMenu()
      .then(({ data }) => setPlatos(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar el menú'))
      .finally(() => setLoading(false));
  }, []);

  const platosDelDia = platos.filter((p) => p.es_plato_del_dia || p.plato_del_dia);

  const agregar = (plato) => {
    const idx = carrito.findIndex((c) => c.plato_id === plato.id);
    if (idx >= 0) {
      const nuevo = [...carrito];
      nuevo[idx].cantidad += 1;
      setCarrito(nuevo);
    } else {
      setCarrito([...carrito, { plato_id: plato.id, cantidad: 1, observaciones: '', plato }]);
    }
  };

  const quitar = (platoId) => {
    const idx = carrito.findIndex((c) => c.plato_id === platoId);
    if (idx < 0) return;
    const item = carrito[idx];
    if (item.cantidad <= 1) {
      setCarrito(carrito.filter((c) => c.plato_id !== platoId));
    } else {
      const nuevo = [...carrito];
      nuevo[idx].cantidad -= 1;
      setCarrito(nuevo);
    }
  };

  const totalCarrito = carrito.reduce(
    (acc, c) => acc + (c.plato?.precio || 0) * c.cantidad,
    0
  );

  const handlePedir = async () => {
    if (carrito.length === 0) {
      setError('Agregue al menos un plato');
      return;
    }
    const cedula = user?.cedula || prompt('Número de cédula:');
    const nombre = user?.nombre || prompt('Nombre:');
    const apellido = user?.apellido || prompt('Apellido:');
    const direccion = user?.direccion || prompt('Dirección (opcional):');
    const telefono = user?.telefono || prompt('Teléfono:');
    if (!cedula || !nombre || !apellido || !telefono) {
      setError('Complete los datos requeridos');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await crearComandaCliente({
        cliente: { cedula, nombre, apellido, direccion: direccion || undefined, telefono },
        mesa_id: mesaId || null,
        platos: carrito.map((c) => ({
          plato_id: c.plato_id,
          cantidad: c.cantidad,
          observaciones: c.observaciones || undefined,
        })),
        forma_pago: 'efectivo',
      });
      setCarrito([]);
      alert('¡Pedido enviado correctamente!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar el pedido');
    } finally {
      setEnviando(false);
    }
  };

  const handleLlamarMesonera = async () => {
    if (!mesaId) return;
    if (navigator.vibrate) navigator.vibrate([100]);
    setLlamando(true);
    try {
      await notificarMesonera(mesaId);
      alert('Se ha notificado a la mesonera. En breve será atendido.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al llamar');
    } finally {
      setLlamando(false);
    }
  };

  const porCategoria = platos.reduce((acc, p) => {
    const cat = p.categoria || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  if (!mesaId && !fromOnline) {
    return (
      <div className="cliente-area">
        <p>Seleccione si es pedido en línea o presencial.</p>
        <button className="cf-btn" onClick={() => navigate('/cliente')}>Volver</button>
      </div>
    );
  }

  return (
    <div className="cliente-area cliente-menu">
      <div className="cliente-header">
        <img src="/logo.png" alt="Casa Fernando" className="cliente-logo" />
        <h1 className="cf-gradient-text">CASA FERNANDO</h1>
        {isPresencial && (
          <p className="mesa-info">Mesa {mesaNumero}</p>
        )}
      </div>

      {mesoneraAtendiendo && (
        <div className="mesonera-atendiendo cf-card">
          <p>Le atiende: <strong>{mesoneraAtendiendo.nombre}</strong></p>
          {mesoneraAtendiendo.foto_url && (
            <img src={mesoneraAtendiendo.foto_url} alt="" className="mesonera-foto" />
          )}
        </div>
      )}

      {platosDelDia.length > 0 && (
        <div className="platos-del-dia-banner cf-card">
          <h3>🔥 Platos del día</h3>
          <div className="platos-del-dia-list">
            {platosDelDia.map((p) => (
              <span key={p.id} className="plato-dia-badge">{p.nombre}</span>
            ))}
          </div>
        </div>
      )}
      {platosDelDia.length === 0 && platos.length > 0 && (
        <div className="platos-del-dia-banner cf-card">
          <h3>🔥 Especialidades de la casa</h3>
          <p>Descubre nuestras parrillas y platos destacados</p>
        </div>
      )}

      <div className="menu-grid">
        {Object.entries(porCategoria).map(([cat, items]) => (
          <section key={cat} className="categoria-section">
            <h3>{cat}</h3>
            <div className="platos-list">
              {items.map((p) => (
                <div key={p.id} className="plato-card cf-card">
                  {p.imagen_url && <img src={p.imagen_url} alt="" className="plato-img" />}
                  <div className="plato-info">
                    <h4>{p.nombre}</h4>
                    <p className="plato-desc">{p.descripcion}</p>
                    <p className="plato-precio">${p.precio?.toFixed(2)}</p>
                    <div className="plato-actions">
                      <button className="cf-btn" onClick={() => agregar(p)}>+</button>
                      <span>{carrito.find((c) => c.plato_id === p.id)?.cantidad || 0}</span>
                      <button className="cf-btn cf-btn-outline" onClick={() => quitar(p.id)}>-</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="carrito-fixed">
        <div className="carrito-resumen">
          <span>Carrito: {carrito.reduce((a, c) => a + c.cantidad, 0)} items</span>
          <span>Total: ${(totalCarrito * 1.12).toFixed(2)}</span>
        </div>
        <div className="carrito-actions">
          {isPresencial && (
            <button
              className="cf-btn cf-btn-llamar"
              onMouseDown={handleLlamarMesonera}
              onTouchStart={(e) => { e.preventDefault(); handleLlamarMesonera(); }}
              disabled={llamando}
              title="Mantenga presionado para notificar a la mesonera"
            >
              {llamando ? 'Notificado ✓' : '🔔 Llamar mesonera'}
            </button>
          )}
          <button className="cf-btn" onClick={handlePedir} disabled={enviando || carrito.length === 0}>
            {enviando ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>
      </div>

      {error && <p className="home-error">{error}</p>}
    </div>
  );
}
