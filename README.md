# Proyecto Backend Grupo 06

API RESTful desarrollada con Express 5, MongoDB y autenticación JWT.

## 🚀 Características

- **Express 5** - Framework web moderno
- **MongoDB** con Mongoose - Base de datos NoSQL
- **JWT Authentication** - Autenticación segura
- **Soft Delete System** - Eliminación segura sin pérdida de datos
- **Helmet** - Seguridad HTTP headers
- **Rate Limiting** - Protección contra ataques
- **XSS Protection** - Sanitización de datos
- **MongoDB Injection Protection** - Prevención de inyecciones
- **Input Validation** - Validación con express-validator
- **Swagger Documentation** - API docs automática
- **Winston Logging** - Sistema de logs
- **Docker Support** - Containerización

## 📋 Requisitos

- Node.js >= 18
- MongoDB >= 5.0
- pnpm (recomendado) o npm

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd proybackendgrupo06
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp ejemplo.env .env
```

Editar `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/proybackendgrupo06
JWT_SECRET=tu-clave-secreta-muy-segura
```

4. **Iniciar MongoDB**
```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# O usar MongoDB local
mongod
```

## 🚦 Uso

### Desarrollo
```bash
pnpm run dev
```

### Producción
```bash
pnpm start
```

### Tests
```bash
pnpm test
```

### Linting
```bash
npx eslint src/
```

## 🐋 Docker

### Desarrollo local
```bash
docker-compose up -d
```

### Solo la app
```bash
docker build -t proyecto-backend .
docker run -p 3000:3000 proyecto-backend
```

## 📚 API Endpoints

### Authentication
- `POST /api/users` - Registrar usuario
- `POST /api/users/login` - Iniciar sesión

### Users
- `GET /api/users/:id` - Obtener perfil (requiere auth)

### Documentation
- `GET /docs` - Swagger UI
- `GET /docs.json` - OpenAPI spec

## 🔐 Autenticación

La API usa JWT tokens. Incluir en headers:
```
Authorization: Bearer <token>
```

## 📊 Estructura del Proyecto

```
src/
├── app.js              # Configuración Express
├── server.js           # Punto de entrada
├── config/             # Configuraciones
│   ├── db.js          # MongoDB connection
│   ├── index.js       # Variables de entorno
│   └── swagger.js     # Documentación API
├── middlewares/        # Middlewares custom
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── security.js
│   └── validateRequest.js
├── modules/            # Módulos de funcionalidad
│   └── user/          # Módulo de usuarios
│       ├── user.controller.js
│       ├── user.model.js
│       ├── user.repository.js
│       ├── user.routes.js
│       ├── user.service.js
│       └── user.validation.js
└── utils/              # Utilidades
    └── logger.js       # Winston logger
```

## 🔧 Scripts Disponibles

- `pnpm start` - Iniciar en producción
- `pnpm run dev` - Desarrollo con nodemon
- `pnpm test` - Ejecutar tests
- `pnpm run test:watch` - Tests en modo watch

## 🛡️ Seguridad

- **Helmet** - Headers de seguridad HTTP
- **Rate Limiting** - 100 requests por 15 minutos
- **XSS Protection** - Sanitización de entrada
- **NoSQL Injection** - Prevención MongoDB injection
- **CORS** - Control de acceso cross-origin
- **JWT** - Tokens seguros con expiración

## 🧪 Testing

Los tests usan Mocha + Chai + Supertest:

```bash
# Ejecutar todos los tests
pnpm test

# Tests en modo watch
pnpm run test:watch
```

## 📋 Requisitos

- Node.js >= 18
- MongoDB >= 5.0
- pnpm (recomendado) o npm

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd proybackendgrupo06
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp ejemplo.env .env
```

Editar `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/proybackendgrupo06
JWT_SECRET=tu-clave-secreta-muy-segura
```

## 🧪 Testing con Postman

### Configuración Rápida

1. **Importar Colección:**
   - Importa `postman-collection.json` en Postman
   - Importa `postman-environment.json` como entorno

2. **Configuración Automática:**
   - Selecciona el entorno "TP Final - Desarrollo"
   - La autenticación se manejará automáticamente

### Guías Disponibles

- **[POSTMAN_AUTH_SETUP.md](./POSTMAN_AUTH_SETUP.md)** - Configuración detallada de autenticación automática
- **[POSTMAN_DEV_GUIDE.md](./POSTMAN_DEV_GUIDE.md)** - Ejemplos de requests y respuestas

### Flujo de Trabajo

1. **Registro/Login:** Ejecuta cualquier request de autenticación
2. **Token Automático:** El token se guarda automáticamente
3. **Requests Protegidos:** Funcionan automáticamente sin configuración adicional

## � Documentación Técnica

### Guías Disponibles

- **[POSTMAN_AUTH_SETUP.md](./POSTMAN_AUTH_SETUP.md)** - Configuración detallada de autenticación automática en Postman
- **[POSTMAN_DEV_GUIDE.md](./POSTMAN_DEV_GUIDE.md)** - Ejemplos de requests y respuestas para desarrollo
- **[SOFT_DELETE_SYSTEM.md](./SOFT_DELETE_SYSTEM.md)** - Sistema completo de eliminación segura (Soft Delete)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumen de la migración de Swagger y automatizaciones
- **[MONGODB_COMPATIBILITY.md](./MONGODB_COMPATIBILITY.md)** - Compatibilidad con diferentes versiones de MongoDB

### Características Técnicas Destacadas

#### 🗑️ Sistema de Soft Delete
- **Eliminación segura** sin pérdida de datos
- **Restauración completa** de registros eliminados
- **Auditoría automática** de quién y cuándo se eliminó/restauró
- **Filtrado inteligente** que excluye eliminados en consultas normales
- **APIs específicas** para gestionar registros eliminados

#### 🔄 Automatización de Swagger
- **Documentación automática** generada desde esquemas Joi
- **Mapeo inteligente** de validadores a esquemas Swagger
- **Centralización** de middlewares de validación
- **Endpoints de desarrollo** automáticamente documentados

#### 🔐 Autenticación Robusta
- **JWT con refresh tokens** y blacklist automática
- **Middlewares centralizados** para validación y autenticación
- **Rutas de desarrollo** simplificadas para testing
- **Rate limiting** y protecciones de seguridad avanzadas

## �📝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

ISC License

## 👥 Autores

- Grupo 06

## 🐛 Problemas Conocidos

- Ninguno por el momento

## 📞 Soporte

Para soporte, crear un issue en el repositorio.