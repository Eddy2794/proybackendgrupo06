# Sistema de Documentación Automática de Swagger

Este proyecto implementa un sistema simplificado para documentar automáticamente la API usando Swagger.

## 🚀 Características

- ✅ Documentación automática de endpoints
- ✅ Sintaxis simple y clara
- ✅ Integración transparente con Swagger UI
- ✅ Mantiene todos los middlewares existentes
- ✅ Compatible con tu estructura actual

## 📁 Estructura

```
src/
├── utils/
│   └── swagger/
│       └── api-docs.js           # Sistema de documentación
├── modules/
│   ├── auth/
│   │   ├── controller/
│   │   │   └── auth.fluent.controller.js
│   │   └── route/
│   │       └── auth.fluent.routes.js
│   ├── user/
│   │   ├── controller/
│   │   │   └── user.fluent.controller.js
│   │   └── route/
│   │       └── user.fluent.routes.js
│   └── persona/
│       ├── controller/
│       │   └── persona.fluent.controller.js
│       └── route/
│           └── persona.fluent.routes.js
└── config/
    └── swagger.js               # Configuración principal
```

## 💡 Uso Básico

### 1. Crear Controlador

```javascript
// src/modules/auth/controller/auth.fluent.controller.js
export class AuthController {
  async login(req, res, next) {
    try {
      const result = await service.login(req.body);
      return res.success('Login exitoso', result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

### 2. Definir Rutas con Documentación

```javascript
// src/modules/auth/route/auth.fluent.routes.js
import { POST, GET, generateSwaggerPaths } from '../../../utils/swagger/api-docs.js';

// Rutas normales
router.post('/login', middlewares, authController.login);

// Documentación
const authEndpoints = [
  POST('/login', {
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario y devuelve tokens',
    tags: ['Auth'],
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'johndoe' },
        password: { type: 'string', example: 'Password123!' }
      }
    },
    response: 'Login exitoso'
  })
];

export const authSwaggerDocs = generateSwaggerPaths(authEndpoints, '/api/auth');
```

## 🔧 Funciones Disponibles

### Métodos HTTP
- `GET(path, options)` - Endpoints GET
- `POST(path, options)` - Endpoints POST
- `PUT(path, options)` - Endpoints PUT
- `DELETE(path, options)` - Endpoints DELETE
- `PATCH(path, options)` - Endpoints PATCH

### Opciones de Documentación

```javascript
{
  summary: 'Título corto',           // Aparece en Swagger UI
  description: 'Descripción detallada',
  tags: ['Auth'],                    // Agrupa endpoints
  auth: true,                        // Requiere autenticación
  body: { /* esquema del body */ },  // Request body
  params: { id: { type: 'string' }}, // Parámetros de ruta
  query: { page: { type: 'integer' }}, // Query parameters
  response: 'Mensaje de éxito'       // Descripción de respuesta
}
```

## 📋 Endpoints Implementados

### Auth (`/api/auth`)
- `POST /register` - Registrar usuario
- `POST /login` - Iniciar sesión
- `POST /change-password` - Cambiar contraseña (auth)
- `POST /logout` - Cerrar sesión (auth)
- `GET /profile` - Obtener perfil (auth)

### Users (`/api/users`)
- `GET /me` - Perfil actual (auth)
- `GET /stats` - Estadísticas (auth)
- `GET /` - Listar usuarios (auth)
- `GET /:id` - Usuario por ID (auth)
- `POST /` - Crear usuario (auth)
- `PUT /:id` - Actualizar usuario (auth)
- `DELETE /:id` - Eliminar usuario (auth)
- `PATCH /:id/activate` - Activar usuario (auth)

### Personas (`/api/personas`)
- `GET /search` - Buscar personas (auth)
- `GET /stats` - Estadísticas (auth)
- `GET /` - Listar personas (auth)
- `GET /:id` - Persona por ID (auth)
- `POST /` - Crear persona (auth)
- `PUT /:id` - Actualizar persona (auth)
- `DELETE /:id` - Desactivar persona (auth)
- `PATCH /:id/activate` - Activar persona (auth)

## 🌐 Acceso a la Documentación

1. **Swagger UI**: `http://localhost:3000/docs`
2. **JSON Spec**: `http://localhost:3000/docs.json`
3. **API Info**: `http://localhost:3000/api`

## ✅ Ventajas del Sistema

1. **Simple**: Solo defines la documentación junto a las rutas
2. **Limpio**: No duplicas información
3. **Mantenible**: Cambios automáticos en la documentación
4. **Compatible**: Funciona con tu estructura actual
5. **Flexible**: Fácil de extender y personalizar

## 🔨 Cómo Extender

### Agregar Nuevo Módulo

1. **Crear controlador**:
```javascript
// src/modules/ejemplo/controller/ejemplo.fluent.controller.js
export const ejemploController = new EjemploController();
```

2. **Crear rutas con documentación**:
```javascript
// src/modules/ejemplo/route/ejemplo.fluent.routes.js
const ejemploEndpoints = [
  GET('/test', {
    summary: 'Endpoint de prueba',
    tags: ['Ejemplo'],
    response: 'Prueba exitosa'
  })
];

export const ejemploSwaggerDocs = generateSwaggerPaths(ejemploEndpoints, '/api/ejemplo');
```

3. **Integrar en la configuración**:
```javascript
// src/config/swagger.js
import { ejemploSwaggerDocs } from '../modules/ejemplo/route/ejemplo.fluent.routes.js';

const combinedSpecs = {
  ...specs,
  paths: {
    ...specs.paths,
    ...ejemploSwaggerDocs  // Agregar aquí
  }
};
```

## 🚀 Próximos Pasos

1. Prueba los endpoints en `/docs`
2. Verifica que toda la documentación se genere correctamente
3. Personaliza los esquemas según tus necesidades
4. Extiende el sistema para nuevos módulos

¡El sistema está listo y funcionando! 🎉
