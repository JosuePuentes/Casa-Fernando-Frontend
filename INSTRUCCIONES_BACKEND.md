# Instrucciones para el Backend - Casa Fernando

Este documento describe lo que el backend debe soportar para que el frontend funcione correctamente.

## URL del Backend

- **Producción:** `https://casa-fernando-backend.onrender.com`
- **Desarrollo:** `http://localhost:8000`

---

## 1. Autenticación

### POST `/api/auth/login`
- **Body:** `{ "email": string, "password": string }`
- **Respuesta:** `{ "user": {...}, "access_token": string }`
- **user** debe incluir: `id`, `email`, `nombre`, `apellido`, `rol`, `cedula`, `direccion`, `telefono`

### POST `/api/auth/register`
Registro de **clientes** (público).
- **Body:** `{ "email", "password", "nombre", "apellido", "cedula", "direccion", "telefono", "rol": "cliente" }`
- **Respuesta:** usuario creado o mensaje de éxito

### POST `/api/auth/register/admin`
Crear usuarios del **personal** (requiere token admin).
- **Body:** `{ "email", "password", "nombre", "apellido", "rol", "cedula", "direccion", "telefono" }`
- **rol** aceptados: `admin`, `mesonera`, `punto_venta`, `cocinero` (si se implementa)
- **Respuesta:** usuario creado

### GET `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Respuesta:** objeto `user` con los datos del usuario autenticado

---

## 2. Acceso del personal

El personal (mesonera, cajero, admin, cocinero) inicia sesión en:
- **URL:** `/acceso-personal`

Los clientes inician sesión desde el modal en la página principal.

## 3. Roles y redirección

| Rol           | Portal al que va |
|---------------|------------------|
| `cliente`     | `/cliente` (portal de clientes) |
| `mesonera`    | `/admin/dashboard` |
| `punto_venta` | `/admin/dashboard` |
| `admin`       | `/admin/dashboard` |
| `cocinero`    | `/admin/dashboard` (si se implementa) |

**Importante:** Los usuarios con rol `cliente` **nunca** deben acceder al panel administrativo. Solo el portal de clientes (menú, pedidos, llamar mesonera).

---

## 4. Cliente (área pública / con login cliente)

### GET `/api/cliente/menu`
- Lista de platos por categoría
- Opcional: campo `es_plato_del_dia` o `plato_del_dia` para destacar platos del día

### GET `/api/cliente/mesas-disponibles` (o `/api/mesas` sin auth)
- Lista de mesas disponibles para selección presencial

### POST `/api/cliente/comanda`
- **Body:** `{ "cliente": {...}, "mesa_id", "platos": [...], "forma_pago", "origen": "area_cliente" }`

### POST `/api/cliente/notificar-mesonera?mesa_id=X&mensaje=...`
- Notifica a las mesoneras (WebSocket envía vibración)

---

## 5. Mesas

### GET `/api/mesas`
- Requiere auth (mesonera/admin/pos)
- Lista de mesas con `id`, `numero`, `capacidad`, `ubicacion`

### CRUD `/api/admin/mesas`
- GET, POST, PUT, DELETE para gestión de mesas

---

## 6. Mesonera / POS / Facturación

### GET `/api/mesonera/comandas`
### POST `/api/mesonera/comanda` (mesa_id obligatorio)
### GET `/api/mesonera/notificaciones`
### POST `/api/mesonera/notificaciones/{id}/atender`

### POST `/api/pos/comanda` (origen: "punto_venta")

### GET `/api/facturacion/comandas?nombre=&cedula=&fecha_desde=&fecha_hasta=`
### GET `/api/facturacion/comandas/{id}`
### PATCH `/api/comandas/{id}` (estado, forma_pago)

---

## 7. WebSocket

### `ws://host/api/ws/mesonera` (o `wss://` en producción)
- Requiere token (query o header según implementación)
- Al recibir llamada de cliente, enviar: `{ "type": "notificacion_cliente", "vibrar": true }`

---

## 8. CORS

El backend debe permitir peticiones desde:
- `http://localhost:3000` (desarrollo)
- `https://casa-fernando-frontend.vercel.app` (producción)
- O el dominio donde esté desplegado el frontend

---

## 9. Rol `cocinero` (opcional)

El frontend permite crear usuarios con departamento "Cocinero". Si el backend no soporta este rol:
- Añadir `cocinero` a los roles válidos en `POST /api/auth/register/admin`
- O mapear en el frontend `cocinero` → `punto_venta` u otro rol existente

---

## Usuarios de prueba

| Rol      | Email                     | Contraseña  |
|----------|---------------------------|-------------|
| Admin    | admin@casafernando.com    | admin123    |
| Mesonera | mesonera@casafernando.com | mesonera123 |
| POS      | pos@casafernando.com      | pos123      |
