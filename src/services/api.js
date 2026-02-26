import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerCliente = (data) =>
  api.post('/auth/register', {
    email: data.email,
    password: data.password,
    nombre: data.nombre,
    apellido: data.apellido,
    rol: 'cliente',
    cedula: data.cedula,
    direccion: data.direccion,
    telefono: data.telefono,
  });

export const registerAdmin = (data) =>
  api.post('/auth/register/admin', {
    email: data.email,
    password: data.password,
    nombre: data.nombre,
    apellido: data.apellido,
    rol: data.rol,
    cedula: data.cedula,
    direccion: data.direccion,
    telefono: data.telefono,
  });

export const getMe = () => api.get('/auth/me');

// Cliente
export const getMenu = () => api.get('/cliente/menu');
export const getMesasDisponibles = () => api.get('/cliente/mesas-disponibles');
export const crearComandaCliente = (data) =>
  api.post('/cliente/comanda', { ...data, origen: 'area_cliente' });
export const notificarMesonera = (mesaId, mensaje = 'El cliente solicita atención') => {
  const params = new URLSearchParams();
  if (mesaId) params.set('mesa_id', mesaId);
  params.set('mensaje', mensaje);
  return api.post(`/cliente/notificar-mesonera?${params}`, null);
};

// Mesas (requiere auth)
export const getMesas = () => api.get('/mesas');

// Mesonera
export const getComandasMesonera = (estado) =>
  api.get('/mesonera/comandas', estado ? { params: { estado } } : {});
export const getNotificaciones = () => api.get('/mesonera/notificaciones');
export const atenderNotificacion = (id) =>
  api.post(`/mesonera/notificaciones/${id}/atender`);
export const crearComandaMesonera = (data) =>
  api.post('/mesonera/comanda', { ...data, origen: 'mesonera' });

// POS
export const crearComandaPOS = (data) =>
  api.post('/pos/comanda', { ...data, origen: 'punto_venta' });

// Facturación
export const buscarComandas = (params) =>
  api.get('/facturacion/comandas', { params });
export const getComandaDetalle = (id) =>
  api.get(`/facturacion/comandas/${id}`);
export const actualizarComanda = (id, data) =>
  api.patch(`/comandas/${id}`, data);

// Admin
export const getCategorias = () => api.get('/admin/categorias');
export const crearCategoria = (data) => api.post('/admin/categorias', data);
export const getPlatos = () => api.get('/admin/platos');
export const crearPlato = (data) => api.post('/admin/platos', data);
export const actualizarPlato = (id, data) =>
  api.put(`/admin/platos/${id}`, data);
export const eliminarPlato = (id) => api.delete(`/admin/platos/${id}`);
export const getMesasAdmin = () => api.get('/admin/mesas');
export const crearMesa = (data) => api.post('/admin/mesas', data);
export const actualizarMesa = (id, data) =>
  api.put(`/admin/mesas/${id}`, data);
export const eliminarMesa = (id) => api.delete(`/admin/mesas/${id}`);
