import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerAdmin } from '../../services/api';
import './AdminCRUD.css';

export default function AdminEmpleados() {
  const [form, setForm] = useState({
    email: '', password: '', nombre: '', apellido: '', cedula: '', direccion: '', telefono: '', rol: 'mesonera', foto: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        apellido: form.apellido,
        rol: form.rol,
        cedula: form.cedula,
        direccion: form.direccion,
        telefono: form.telefono,
      };
      await registerAdmin(payload);
      setSuccess(true);
      setForm({ email: '', password: '', nombre: '', apellido: '', cedula: '', direccion: '', telefono: '', rol: 'mesonera', foto: null });
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(Array.isArray(d) ? d.map((x) => x.msg).join(', ') : d || 'Error al crear empleado');
    }
  };

  return (
    <div className="admin-crud">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Crear Empleado</h1>
      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          className="cf-input"
          placeholder="Cédula"
          value={form.cedula}
          onChange={(e) => setForm({ ...form, cedula: e.target.value })}
          required
        />
        <input
          className="cf-input"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="cf-input"
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          required
        />
        <input
          className="cf-input"
          placeholder="Dirección"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />
        <input
          className="cf-input"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          required
        />
        <input
          type="email"
          className="cf-input"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="cf-input"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="cf-input"
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
        >
          <option value="mesonera">Mesonera</option>
          <option value="punto_venta">Punto de venta</option>
          <option value="admin">Admin</option>
        </select>
        <label>
          Foto:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, foto: e.target.files?.[0] })}
          />
        </label>
        {error && <p className="home-error">{error}</p>}
        {success && <p style={{ color: '#4ade80' }}>Empleado creado</p>}
        <button type="submit" className="cf-btn">Crear empleado</button>
      </form>
    </div>
  );
}
