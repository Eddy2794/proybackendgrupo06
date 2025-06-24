# 🚧 Configuración para Desarrollo - Autenticación Simplificada

Este proyecto incluye endpoints simplificados para desarrollo que permiten probar la autenticación con contraseñas en texto plano, sin las validaciones de seguridad avanzada necesarias para producción.

## ⚡ Control de Transacciones

**IMPORTANTE**: El sistema implementa **transacciones MongoDB** para garantizar la integridad de los datos durante el registro.

### ¿Qué significa esto?

- ✅ Si **todos** los datos son válidos → Se crean tanto la Persona como el Usuario
- ❌ Si **alguna validación falla** → Se cancelan **ambas** operaciones (rollback automático)
- 🔒 **No se crearán registros huérfanos** → La base de datos siempre mantiene consistencia

### Ejemplo de Validación con Transacciones

```json
// ✅ CASO EXITOSO: Todo válido
POST /api/auth/dev/register
{
  "username": "usuario123",
  "password": "123456",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "email": "juan@example.com"
}
// Resultado: Se crean PERSONA y USUARIO
// Respuesta: 201 con token y datos del usuario

// ❌ CASO DE ERROR: Username inválido (Joi validation)
POST /api/auth/dev/register
{
  "username": "ab", // ¡MUY CORTO! (mínimo 3 caracteres)
  "password": "123456",
  "nombres": "Juan Carlos"
}
// Resultado: NO se crea ni PERSONA ni USUARIO
// Respuesta: 400 con errores específicos de validación

// ❌ CASO DE ERROR: Email duplicado (Business logic)
POST /api/auth/dev/register
{
  "username": "usuario456",
  "password": "123456", 
  "email": "juan@example.com" // ¡YA EXISTE!
}
// Resultado: NO se crea ni PERSONA ni USUARIO (rollback automático)
// Respuesta: 400 con mensaje "Ya existe una persona registrada con este email"
```

### 🔍 Tipos de Errores y Respuestas

#### Errores de Validación Joi (400):
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "username",
      "message": "El username debe tener al menos 3 caracteres"
    }
  ]
}
```

#### Errores de Lógica de Negocio (400):
```json
{
  "success": false,
  "error": "Ya existe una persona registrada con este email",
  "code": "VALIDATION_ERROR"
}
```

## 🔧 Configuración Rápida

### 1. Variables de Entorno
Asegúrate de tener un archivo `.env` con las variables básicas:

```bash
NODE_ENV=development
PORT=3000
DB_URI=mongodb://localhost:27017/proyecto_db
JWT_SECRET=tu-secreto-jwt-super-seguro
JWT_EXPIRES=24h
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar en Modo Desarrollo
```bash
# Opción 1: Con NODE_ENV automático
npm run dev:simple

# Opción 2: Manual
NODE_ENV=development npm run dev
```

## 🚀 Endpoints de Desarrollo

Cuando `NODE_ENV=development`, se habilitan automáticamente los siguientes endpoints:

### Base URL: `http://localhost:3000/api/auth/dev`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registro con username/password en texto plano |
| POST | `/login` | Login con username/password en texto plano |
| POST | `/logout` | Logout (requiere token) |
| POST | `/change-password` | Cambio de contraseña (requiere token) |

## 📝 Ejemplos de Uso con Postman

### 1. Registro Mínimo
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

### 2. Registro Completo
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "mipassword123",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "email": "juan@example.com"
}
```

### 3. Login
```json
POST /api/auth/dev/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "mipassword123"
}
```

### 4. Cambiar Contraseña
```json
POST /api/auth/dev/change-password
Content-Type: application/json
Authorization: Bearer <tu-jwt-token>

{
  "currentPassword": "mipassword123",
  "newPassword": "nuevapassword456",
  "confirmPassword": "nuevapassword456"
}
```

### 5. Logout
```json
POST /api/auth/dev/logout
Authorization: Bearer <tu-jwt-token>
```

## 🔍 Verificación de Estado

### Información de la API
```
GET /api/
```

Si el entorno de desarrollo está configurado correctamente, verás información adicional incluyendo los endpoints de desarrollo disponibles.

## ⚡ Diferencias con Producción

### En Desarrollo (`/api/auth/dev/*`):
- ✅ Contraseñas en texto plano
- ✅ Sin validaciones de hash, salt, cifrado
- ✅ Sin timestamp requerido
- ✅ Sin clientToken requerido
- ✅ Rate limiting deshabilitado
- ✅ Logging detallado en consola
- ✅ Registro automático como ACTIVO
- ✅ Sin verificación de email

### En Producción (`/api/auth/*`):
- 🔒 Requiere hash SHA-256 de contraseña
- 🔒 Requiere salt aleatorio
- 🔒 Requiere contraseña cifrada AES
- 🔒 Validación de timestamp (previene replay attacks)
- 🔒 Requiere clientToken único
- 🔒 Rate limiting estricto
- 🔒 Logging de seguridad
- 🔒 Registro como PENDIENTE_VERIFICACION
- 🔒 Verificación de email requerida

## 🛡️ Seguridad

**IMPORTANTE**: Los endpoints de desarrollo (`/api/auth/dev/*`) están **DESHABILITADOS automáticamente** en producción.

Si intentas usar estos endpoints con `NODE_ENV=production`, recibirás un error 403:
```json
{
  "success": false,
  "error": "Este endpoint solo está disponible en entorno de desarrollo",
  "code": "DEV_ONLY_ENDPOINT"
}
```

## 🔧 Troubleshooting

### Problema: Endpoints /dev no aparecen
**Solución**: Verifica que `NODE_ENV=development` esté configurado

### Problema: Error 403 en endpoints /dev
**Solución**: Verifica que no estés en producción (`NODE_ENV=production`)

### Problema: Token inválido
**Solución**: Asegúrate de incluir el header `Authorization: Bearer <token>`

### Problema: Base de datos no conecta
**Solución**: Verifica que MongoDB esté ejecutándose y `DB_URI` sea correcto

## 📚 Guía Detallada

Para ejemplos completos de Postman y más detalles, consulta: `POSTMAN_DEV_GUIDE.md`

## 🚀 Scripts Disponibles

```bash
# Desarrollo con configuración automática
npm run dev:simple

# Desarrollo estándar
npm run dev

# Producción
npm start

# Tests
npm test
```

---

**Nota**: Recuerda cambiar a los endpoints de producción (`/api/auth/*`) y configurar las validaciones de seguridad correspondientes antes de desplegar a producción.
