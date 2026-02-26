# Casa Fernando - Frontend

Frontend del sistema de gestión para el restaurante Casa Fernando Resto-Bar.

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000`

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env` en la raíz:

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/api
```

## Ejecutar en desarrollo

```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

## Build para producción

```bash
npm run build
```

Los archivos estarán en `build/`

## Estructura

```
src/
├── pages/
│   ├── HomePage.jsx          # Lobby: login cliente/admin, registro
│   ├── cliente/              # Área cliente: menú, comanda, llamar mesonera
│   ├── mesonera/             # Módulo mesonera: notificaciones, WebSocket
│   ├── admin/                # CRUD categorías, platos, mesas, empleados
│   └── facturacion/           # Búsqueda y detalle de comandas
├── services/api.js            # Cliente Axios con interceptores
├── context/AuthContext.jsx    # Estado de autenticación
└── hooks/useWebSocket.js      # WebSocket para mesonera (vibración)
```

## Usuarios de prueba

| Rol     | Email                      | Contraseña  |
|---------|----------------------------|-------------|
| Admin   | admin@casafernando.com     | admin123    |
| Mesonera| mesonera@casafernando.com  | mesonera123 |
| POS     | pos@casafernando.com       | pos123      |

## Diseño

Paleta basada en el logo Casa Fernando:
- Fondo: negro (#000)
- Texto: blanco
- Acentos: degradado naranja-amarillo
- Tipografía: Cinzel (títulos), Source Sans 3 (cuerpo)
