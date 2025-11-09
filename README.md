# 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Comunicación Cliente-Servidor](#comunicación-cliente-servidor)
- [Base de Datos](#base-de-datos)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [API Endpoints](#api-endpoints)

## 📖 Descripción General
Este proyecto es una aplicación web de tienda de ropa que implementa un sistema completo de e-commerce con funcionalidades de chat en tiempo real. La aplicación está dividida en dos partes principales: un backend desarrollado con Node.js y Express, y un frontend desarrollado con Vue.js 3.

## 🏗️ Arquitectura del Proyecto
El proyecto sigue una arquitectura Cliente-Servidor con las siguientes características:

- **Backend (API REST)**: Servidor Node.js con Express que gestiona la lógica de negocio
- **Frontend (SPA)**: Aplicación de página única con Vue.js 3
- **Comunicación en Tiempo Real**: WebSockets mediante Socket.IO para el sistema de chat
- **Base de Datos**: MongoDB para almacenamiento persistente

```
┌─────────────┐         HTTP/WebSocket        ┌─────────────┐
│   Frontend  │ ◄──────────────────────────► │   Backend   │
│  (Vue.js)   │         REST API              │ (Express.js)│
└─────────────┘                               └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │   MongoDB   │
                                              └─────────────┘
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express.js**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **Socket.IO**: Biblioteca para comunicación en tiempo real
- **JWT (JSON Web Tokens)**: Para autenticación y autorización
- **bcrypt**: Para el hash de contraseñas
- **dotenv**: Para manejo de variables de entorno

### Frontend
- **Vue.js 3**: Framework progresivo de JavaScript
- **Vite**: Herramienta de construcción y desarrollo
- **Vue Router**: Enrutamiento oficial para Vue.js
- **Pinia**: Gestión de estado (store)
- **Tailwind CSS**: Framework de CSS utility-first
- **Axios**: Cliente HTTP para peticiones al backend
- **ESLint**: Linter para código JavaScript
- **Prettier**: Formateador de código

## 📁 Estructura del Proyecto

### Raíz del Proyecto
```
tienda-ropa-PW1/
├── .env                    # Variables de entorno del backend
├── .gitignore             # Archivos ignorados por Git
├── package.json           # Dependencias del backend
├── README.md              # Documentación principal
├── server.js              # Punto de entrada del servidor
├── frontend/              # Aplicación Vue.js
└── src/                   # Código fuente del backend
```

### Backend (src)
```
src/
├── config/
│   ├── database.js        # Configuración de conexión a MongoDB
│   └── socket.js          # Configuración de Socket.IO
├── controllers/
│   ├── authController.js      # Lógica de autenticación (login, register)
│   ├── chatController.js      # Lógica del chat
│   ├── newChatController.js   # Controlador adicional de chat
│   └── productController.js   # Lógica de productos (CRUD)
├── middleware/
│   ├── auth.js            # Middleware de autenticación JWT
│   └── errorHandler.js    # Manejo centralizado de errores
├── models/
│   ├── Chat.js            # Modelo de conversaciones
│   ├── Message.js         # Modelo de mensajes
│   ├── Product.js         # Modelo de productos
│   └── User.js            # Modelo de usuarios
└── routes/
    ├── authRoutes.js      # Rutas de autenticación
    └── ...                # Otras rutas (productos, chat, etc.)
```

**Descripción de componentes del Backend:**

- **config/**: Contiene archivos de configuración
  - `database.js`: Establece la conexión con MongoDB usando Mongoose
  - `socket.js`: Configura Socket.IO para comunicación en tiempo real

- **controllers/**: Lógica de negocio de la aplicación
  - `authController.js`: Maneja registro, login y validación de usuarios
  - `productController.js`: Gestiona CRUD de productos (crear, leer, actualizar, eliminar)
  - `chatController.js` y `newChatController.js`: Gestionan mensajes y conversaciones

- **middleware/**: Funciones intermedias que procesan las peticiones
  - `auth.js`: Verifica tokens JWT y protege rutas
  - `errorHandler.js`: Captura y formatea errores

- **models/**: Esquemas de datos de MongoDB
  - `User.js`: Define estructura de usuarios (email, password, rol, etc.)
  - `Product.js`: Define productos (nombre, precio, imagen, stock, etc.)
  - `Chat.js`: Define conversaciones entre usuarios
  - `Message.js`: Define mensajes individuales

- **routes/**: Definición de endpoints de la API
  - `authRoutes.js`: Rutas de autenticación (/login, /register)

### Frontend (frontend)
```
frontend/
├── .env                   # Variables de entorno del frontend
├── index.html             # Punto de entrada HTML
├── package.json           # Dependencias del frontend
├── vite.config.js         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind CSS
├── eslint.config.js       # Configuración de ESLint
├── .prettierrc.json       # Configuración de Prettier
├── postcss.config.js      # Configuración de PostCSS
├── jsconfig.json          # Configuración de JavaScript
├── public/
│   └── favicon.ico        # Icono de la aplicación
└── src/
    ├── App.vue            # Componente raíz de Vue
    ├── main.js            # Punto de entrada de la aplicación
    ├── assets/            # Recursos estáticos (imágenes, estilos)
    ├── components/        # Componentes reutilizables de Vue
    ├── composables/       # Funciones composables de Vue 3
    ├── router/            # Configuración de rutas (Vue Router)
    ├── services/          # Servicios para llamadas a la API
    ├── stores/            # Stores de Pinia (gestión de estado)
    └── views/             # Vistas/páginas de la aplicación
```

**Descripción de componentes del Frontend:**

- `src/main.js`: Inicializa la aplicación Vue, configura Pinia, Router y monta la app
- `src/App.vue`: Componente principal que contiene el layout general
- `src/router/`: Define las rutas de navegación de la SPA
- `src/stores/`: Almacenes de estado global (usuario, carrito, productos)
- `src/services/`: Módulos que encapsulan llamadas HTTP a la API del backend
- `src/views/`: Componentes de página completa (Home, Login, ProductDetail, etc.)
- `src/components/`: Componentes reutilizables (Header, ProductCard, ChatBox, etc.)
- `src/composables/`: Lógica reutilizable con Composition API

## ⚙️ Funcionalidades

### 1. Gestión de Usuarios
- **Registro de usuarios**: Crear cuenta con email y contraseña
- **Inicio de sesión**: Autenticación mediante JWT
- **Perfil de usuario**: Visualizar y editar información personal
- **Roles**: Sistema de roles (cliente, administrador)

### 2. Catálogo de Productos
- **Listado de productos**: Visualizar todos los productos disponibles
- **Búsqueda y filtrado**: Buscar productos por categoría, precio, nombre
- **Detalle de producto**: Ver información completa del producto
- **Gestión de inventario**: (Admin) Crear, editar y eliminar productos

### 3. Sistema de Chat en Tiempo Real
- **Chat entre usuarios**: Comunicación en tiempo real usando Socket.IO
- **Historial de mensajes**: Persistencia de conversaciones en MongoDB
- **Notificaciones**: Alertas de nuevos mensajes
- **Múltiples conversaciones**: Gestión de varios chats simultáneos

## 🔄 Comunicación Cliente-Servidor

### Peticiones HTTP (REST API)
El frontend se comunica con el backend mediante peticiones HTTP usando Axios.

### WebSocket (Socket.IO)
Para comunicación en tiempo real en el chat.

## 🗄️ Base de Datos

### MongoDB - Colecciones
- **Users** (Usuarios)
- **Products** (Productos)
- **Chats** (Conversaciones)
- **Messages** (Mensajes)

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación
1. Usuario envía credenciales (email/password) a `/api/auth/login`
2. El `authController.js` valida las credenciales
3. Si son correctas, genera un JWT con el payload del usuario
4. El token se devuelve al cliente
5. El cliente almacena el token (localStorage/sessionStorage)
6. En cada petición protegida, se envía el token en el header `Authorization: Bearer <token>`
7. El middleware `auth.js` verifica el token antes de permitir acceso

### Seguridad Implementada
- **Bcrypt**: Hash de contraseñas antes de guardar en BD
- **JWT**: Tokens firmados con clave secreta
- **Middleware de autenticación**: Protección de rutas sensibles
- **CORS**: Configuración para peticiones de origen cruzado
- **Validación de datos**: Sanitización de inputs

## 🛣️ API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (protegida)

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `DELETE /api/products/:id` - Eliminar producto (Admin)

### Chat
- `GET /api/chats` - Obtener chats del usuario (protegida)
- `GET /api/chats/:id/messages` - Obtener mensajes de un chat (protegida)
- `POST /api/chats` - Crear nueva conversación (protegida)

## 📝 Notas Adicionales
- El proyecto usa ES Modules en el backend
- El frontend está configurado con Hot Module Replacement (HMR) para desarrollo rápido
- Se incluyen configuraciones de ESLint y Prettier para mantener código consistente
- El archivo `.gitignore` excluye `node_modules`, `.env` y archivos de build

## Usuario Administrador para realizar pruebas
Usuario: admin@example.com
Contrasena: admin123