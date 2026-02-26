import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { buscarComandas, getComandaDetalle, actualizarComanda } from '../../services/api';
import './FacturacionPage.css';

const FORMAS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta_debito', label: 'Tarjeta débito' },
  { value: 'tarjeta_credito', label: 'Tarjeta crédito' },
  { value: 'transferencia', label: 'Transferencia' },
];

function TicketPreview({ comanda, formaPago, onClose }) {
  const ticketRef = useRef(null);

  const imprimir = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - Casa Fernando</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; max-width: 300px; margin: 0 auto; }
            h1 { text-align: center; font-size: 1.4rem; margin-bottom: 8px; }
            .subtitle { text-align: center; font-size: 0.9rem; margin-bottom: 24px; }
            .line { border-bottom: 1px dashed #333; margin: 12px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-weight: bold; font-size: 1.1rem; margin-top: 12px; }
            .forma-pago { margin-top: 8px; font-size: 0.9rem; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
    ventana.close();
  };

  const exportarPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 200] });
    const lines = [];
    doc.setFontSize(14);
    doc.text('CASA FERNANDO', 40, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('RESTO-BAR', 40, 22, { align: 'center' });
    doc.setFontSize(8);
    let y = 35;
    doc.text(`Comanda: ${comanda.numero || '-'}`, 5, y); y += 6;
    doc.text(`Cliente: ${comanda.cliente ? `${comanda.cliente.nombre} ${comanda.cliente.apellido}` : (comanda.cliente_nombre || '') + ' ' + (comanda.cliente_apellido || '')}`, 5, y); y += 6;
    doc.text(`Mesa: ${comanda.mesa_numero || '-'}`, 5, y); y += 6;
    doc.text(`Forma de pago: ${FORMAS_PAGO.find(f => f.value === formaPago)?.label || formaPago}`, 5, y); y += 8;
    (comanda.items || comanda.platos || []).forEach((item) => {
      const nombre = item.plato?.nombre || item.nombre || 'Plato';
      const cant = item.cantidad || 1;
      const precio = item.precio_unitario || item.plato?.precio || 0;
      doc.text(`${cant}x ${nombre}`, 5, y);
      doc.text(`$${(precio * cant).toFixed(2)}`, 70, y);
      y += 5;
    });
    y += 4;
    doc.text(`Subtotal: $${(comanda.subtotal || 0).toFixed(2)}`, 5, y); y += 5;
    doc.text(`Impuesto: $${(comanda.impuesto || 0).toFixed(2)}`, 5, y); y += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $${(comanda.total || 0).toFixed(2)}`, 5, y); y += 10;
    doc.setFont(undefined, 'normal');
    doc.text('Gracias por su visita', 40, y, { align: 'center' });
    doc.save(`ticket-${comanda.numero || comanda.id}.pdf`);
  };

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal cf-card" onClick={(e) => e.stopPropagation()}>
        <h3>Preliminar del ticket</h3>
        <div ref={ticketRef} className="ticket-preview">
          <h1>CASA FERNANDO</h1>
          <p className="subtitle">RESTO-BAR</p>
          <div className="line" />
          <div className="row"><span>Comanda:</span><span>{comanda.numero || '-'}</span></div>
          <div className="row"><span>Cliente:</span><span>{comanda.cliente ? `${comanda.cliente.nombre} ${comanda.cliente.apellido}` : `${comanda.cliente_nombre || ''} ${comanda.cliente_apellido || ''}`}</span></div>
          <div className="row"><span>Mesa:</span><span>{comanda.mesa_numero || '-'}</span></div>
          <div className="row"><span>Forma de pago:</span><span>{FORMAS_PAGO.find(f => f.value === formaPago)?.label || formaPago}</span></div>
          <div className="line" />
          {(comanda.items || comanda.platos || []).map((item, i) => (
            <div key={i} className="row">
              <span>{(item.cantidad || 1)}x {item.plato?.nombre || item.nombre || 'Plato'}</span>
              <span>${((item.precio_unitario || item.plato?.precio || 0) * (item.cantidad || 1)).toFixed(2)}</span>
            </div>
          ))}
          <div className="line" />
          <div className="row"><span>Subtotal:</span><span>${(comanda.subtotal || 0).toFixed(2)}</span></div>
          <div className="row"><span>Impuesto:</span><span>${(comanda.impuesto || 0).toFixed(2)}</span></div>
          <div className="row total"><span>TOTAL:</span><span>${(comanda.total || 0).toFixed(2)}</span></div>
          <p className="gracias">Gracias por su visita</p>
        </div>
        <div className="ticket-actions">
          <button className="cf-btn" onClick={imprimir}>Imprimir</button>
          <button className="cf-btn" onClick={exportarPDF}>Exportar PDF</button>
          <button className="cf-btn-outline cf-btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function FacturacionPage() {
  const [comandas, setComandas] = useState([]);
  const [filtros, setFiltros] = useState({ nombre: '', cedula: '', fecha_desde: '', fecha_hasta: '' });
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formaPago, setFormaPago] = useState('efectivo');
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [procesando, setProcesando] = useState(false);

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

  const cobrarComanda = async (c) => {
    try {
      const { data } = await getComandaDetalle(c.id);
      setDetalle(data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  const cargarDetalleCompleto = async (id) => {
    try {
      const { data } = await getComandaDetalle(id);
      setDetalle(data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  const totalizarYFacturar = async () => {
    if (!detalle) return;
    setProcesando(true);
    try {
      await actualizarComanda(detalle.id, { estado: 'pagada', forma_pago: formaPago });
      setComandas(comandas.map((co) => (co.id === detalle.id ? { ...co, estado: 'pagada' } : co)));
      setMostrarTicket(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al registrar pago');
    } finally {
      setProcesando(false);
    }
  };

  const cerrarPago = () => {
    setDetalle(null);
    setMostrarTicket(false);
    setFormaPago('efectivo');
  };

  return (
    <div className="facturacion-page">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Facturación</h1>
      <div className="filtros cf-card">
        <input
          className="cf-input"
          placeholder="Nombre del cliente"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
        />
        <input
          className="cf-input"
          placeholder="Número de cédula"
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
              <th>Monto a pagar</th>
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
                  {c.estado !== 'pagada' ? (
                    <button className="cf-btn" onClick={() => cobrarComanda(c)}>Cobrar</button>
                  ) : (
                    <button className="cf-btn-outline cf-btn" onClick={() => cargarDetalleCompleto(c.id)}>Ver</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalle && !mostrarTicket && (
        <div className="pago-modal-overlay" onClick={cerrarPago}>
          <div className="pago-modal cf-card" onClick={(e) => e.stopPropagation()}>
            <h3>Cobrar comanda {detalle.numero}</h3>
            <div className="pago-info">
              <p><strong>Cliente:</strong> {detalle.cliente ? `${detalle.cliente.nombre} ${detalle.cliente.apellido}` : `${detalle.cliente_nombre || ''} ${detalle.cliente_apellido || ''}`}</p>
              <p><strong>Mesa:</strong> {detalle.mesa_numero || '-'}</p>
              <p><strong>Monto a pagar:</strong> <span className="monto-total">${(detalle.total || 0).toFixed(2)}</span></p>
            </div>
            <div className="forma-pago-select">
              <label>Método de pago:</label>
              <select
                className="cf-input"
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
              >
                {FORMAS_PAGO.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="pago-actions">
              <button className="cf-btn" onClick={totalizarYFacturar} disabled={procesando}>
                {procesando ? 'Procesando...' : 'Totalizar venta'}
              </button>
              <button className="cf-btn-outline cf-btn" onClick={cerrarPago}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarTicket && detalle && (
        <TicketPreview
          comanda={detalle}
          formaPago={formaPago}
          onClose={cerrarPago}
        />
      )}
    </div>
  );
}
