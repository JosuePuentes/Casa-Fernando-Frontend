import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerAdmin } from '../../services/api';
import './AdminCRUD.css';
import './AdminEmpleados.css';

const DEPARTAMENTOS = [
  { value: 'mesonera', label: 'Mesonero/a', desc: 'Atención en mesas, tomar pedidos, notificaciones' },
  { value: 'punto_venta', label: 'Cajero', desc: 'Punto de venta, cobros, comandas' },
  { value: 'cocinero', label: 'Cocinero', desc: 'Preparación de platos, cocina' },
  { value: 'admin', label: 'Administrador', desc: 'Acceso total al sistema' },
];

const MODULOS = [
  { id: 'mesas', label: 'Mesas', desc: 'Ver y gestionar mesas' },
  { id: 'comandas', label: 'Comandas', desc: 'Crear y ver comandas' },
  { id: 'facturacion', label: 'Facturación', desc: 'Cobrar y facturar' },
  { id: 'platos', label: 'Platos', desc: 'Gestionar platos del menú' },
  { id: 'categorias', label: 'Categorías', desc: 'Gestionar categorías' },
  { id: 'empleados', label: 'Empleados', desc: 'Crear y gestionar usuarios' },
];

const PERMISOS_POR_ROL = {
  mesonera: ['mesas', 'comandas'],
  punto_venta: ['mesas', 'comandas', 'facturacion'],
  cocinero: ['comandas'],
  admin: ['mesas', 'comandas', 'facturacion', 'platos', 'categorias', 'empleados'],
};

export default function AdminEmpleados() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    cedula: '',
    direccion: '',
    telefono: '',
    rol: 'mesonera',
    permisos: ['mesas', 'comandas'],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const actualizarPermisosPorRol = (rol) => {
    setForm((prev) => ({
      ...prev,
      rol,
      permisos: PERMISOS_POR_ROL[rol] || [],
    }));
  };

  const togglePermiso = (moduloId) => {
    setForm((prev) => {
      const permisos = prev.permisos.includes(moduloId)
        ? prev.permisos.filter((p) => p !== moduloId)
        : [...prev.permisos, moduloId];
      return { ...prev, permisos };
    });
  };

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
      setForm({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        cedula: '',
        direccion: '',
        telefono: '',
        rol: 'mesonera',
        permisos: ['mesas', 'comandas'],
      });
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(Array.isArray(d) ? d.map((x) => x.msg).join(', ') : d || 'Error al crear empleado');
    }
  };

  return (
    <div className="admin-crud admin-empleados">
      <Link to="/admin/dashboard" className="cf-btn-outline cf-btn">← Volver</Link>
      <h1>Crear usuario administrativo</h1>
      <p className="admin-empleados-desc">
        Crea usuarios del personal con su departamento y permisos. Solo administradores pueden crear usuarios.
      </p>

      <form className="crud-form admin-empleados-form" onSubmit={handleSubmit}>
        <section className="empleados-section">
          <h3>Datos personales</h3>
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
            placeholder="Correo electrónico"
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
        </section>

        <section className="empleados-section">
          <h3>Departamento</h3>
          <p className="section-desc">Selecciona el departamento o cargo del empleado:</p>
          <div className="departamentos-grid">
            {DEPARTAMENTOS.map((d) => (
              <label
                key={d.value}
                className={`departamento-card ${form.rol === d.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={d.value}
                  checked={form.rol === d.value}
                  onChange={() => actualizarPermisosPorRol(d.value)}
                />
                <span className="departamento-label">{d.label}</span>
                <span className="departamento-desc">{d.desc}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="empleados-section">
          <h3>Permisos por módulo</h3>
          <p className="section-desc">Módulos a los que tendrá acceso (según su departamento):</p>
          <div className="permisos-grid">
            {MODULOS.map((m) => {
              const permitido = form.permisos.includes(m.id);
              const esAdmin = form.rol === 'admin';
              return (
                <label
                  key={m.id}
                  className={`permiso-card ${permitido ? 'checked' : ''} ${esAdmin ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={permitido}
                    onChange={() => !esAdmin && togglePermiso(m.id)}
                    disabled={esAdmin}
                  />
                  <div>
                    <span className="permiso-label">{m.label}</span>
                    <span className="permiso-desc">{m.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {error && <p className="home-error">{error}</p>}
        {success && <p className="empleados-success">Usuario creado correctamente</p>}
        <button type="submit" className="cf-btn">Crear usuario</button>
      </form>
    </div>
  );
}
