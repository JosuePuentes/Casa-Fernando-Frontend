import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMesasAdmin, crearMesa, actualizarMesa, eliminarMesa } from '../../services/api';
import './AdminCRUD.css';

export default function AdminMesas() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ numero: '', capacidad: 4, ubicacion: '' });
  const [editing, setEditing] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    getMesasAdmin().then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await actualizarMesa(editing.id, form);
        setItems(items.map((m) => (m.id === editing.id ? data : m)));
        setEditing(null);
      } else {
        const { data } = await crearMesa(form);
        setItems([...items, data]);
      }
      setForm({ numero: '', capacidad: 4, ubicacion: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar mesa?')) return;
    try {
      await eliminarMesa(id);
      setItems(items.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  return (
    <div className="admin-crud">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Mesas</h1>
      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          className="cf-input"
          placeholder="Número"
          value={form.numero}
          onChange={(e) => setForm({ ...form, numero: e.target.value })}
          required
        />
        <input
          type="number"
          className="cf-input"
          placeholder="Capacidad"
          value={form.capacidad}
          onChange={(e) => setForm({ ...form, capacidad: +e.target.value })}
        />
        <input
          className="cf-input"
          placeholder="Ubicación"
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
        />
        <button type="submit" className="cf-btn">{editing ? 'Actualizar' : 'Crear'}</button>
      </form>
      <ul className="crud-list">
        {items.map((m) => (
          <li key={m.id}>
            Mesa {m.numero} - Cap: {m.capacidad} - {m.ubicacion || '-'}
            <div>
              <button className="cf-btn-outline cf-btn" onClick={() => { setEditing(m); setForm(m); }}>Editar</button>
              <button className="cf-btn" onClick={() => handleDelete(m.id)}>Desactivar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
