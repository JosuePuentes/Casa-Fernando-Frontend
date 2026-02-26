import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlatos, getCategorias, crearPlato, actualizarPlato, eliminarPlato } from '../../services/api';
import './AdminCRUD.css';

export default function AdminPlatos() {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: 0, categoria_id: null, imagen_url: '', disponible: true,
  });
  const [editing, setEditing] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatos(), getCategorias()])
      .then(([p, c]) => {
        setPlatos(p.data || []);
        setCategorias(c.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await actualizarPlato(editing.id, form);
        setPlatos(platos.map((p) => (p.id === editing.id ? data : p)));
        setEditing(null);
      } else {
        const { data } = await crearPlato({ ...form, categoria_id: form.categoria_id || undefined });
        setPlatos([...platos, data]);
      }
      setForm({ nombre: '', descripcion: '', precio: 0, categoria_id: null, imagen_url: '', disponible: true });
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar?')) return;
    try {
      await eliminarPlato(id);
      setPlatos(platos.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || 'Error');
    }
  };

  return (
    <div className="admin-crud">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Platos</h1>
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
          step="0.01"
          className="cf-input"
          placeholder="Precio"
          value={form.precio || ''}
          onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
        />
        <select
          className="cf-input"
          value={form.categoria_id || ''}
          onChange={(e) => setForm({ ...form, categoria_id: e.target.value ? +e.target.value : null })}
        >
          <option value="">Sin categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <input
          className="cf-input"
          placeholder="URL imagen"
          value={form.imagen_url}
          onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={form.disponible}
            onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
          />
          Disponible
        </label>
        <button type="submit" className="cf-btn">{editing ? 'Actualizar' : 'Crear'}</button>
      </form>
      <ul className="crud-list">
        {platos.map((p) => (
          <li key={p.id}>
            {p.nombre} - ${p.precio?.toFixed(2)}
            <div>
              <button className="cf-btn-outline cf-btn" onClick={() => { setEditing(p); setForm(p); }}>Editar</button>
              <button className="cf-btn" onClick={() => handleDelete(p.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
