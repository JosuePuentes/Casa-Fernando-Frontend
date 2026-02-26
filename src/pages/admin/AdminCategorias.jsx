import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias, crearCategoria } from '../../services/api';
import './AdminCRUD.css';

export default function AdminCategorias() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', orden: 0 });
  const [, setLoading] = useState(true);

  useEffect(() => {
    getCategorias().then(({ data }) => setItems(data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await crearCategoria(form);
      setItems([...items, data]);
      setForm({ nombre: '', descripcion: '', orden: 0 });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  return (
    <div className="admin-crud">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Categorías</h1>
      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          className="cf-input"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="cf-input"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <input
          type="number"
          className="cf-input"
          placeholder="Orden"
          value={form.orden}
          onChange={(e) => setForm({ ...form, orden: +e.target.value })}
        />
        <button type="submit" className="cf-btn">Crear</button>
      </form>
      <ul className="crud-list">
        {items.map((c) => (
          <li key={c.id}>{c.nombre} - {c.descripcion || '-'}</li>
        ))}
      </ul>
    </div>
  );
}
