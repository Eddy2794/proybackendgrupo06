# 🧪 Pruebas de Validación - Ejemplos para Postman

## ⚠️ Casos de Error que Ahora Devuelven Mensajes Específicos

### 1. Username muy corto (400 - Validation Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "ab",
  "password": "123456"
}
```

**Respuesta Esperada (400):**
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

### 2. Password muy corta (400 - Validation Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "123"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "password",
      "message": "La password debe tener al menos 6 caracteres"
    }
  ]
}
```

### 3. Username con caracteres especiales (400 - Validation Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario@123",
  "password": "123456"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "username",
      "message": "El username solo puede contener caracteres alfanuméricos"
    }
  ]
}
```

### 4. Múltiples errores de validación (400 - Validation Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "ab",
  "password": "123"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "username",
      "message": "El username debe tener al menos 3 caracteres"
    },
    {
      "field": "password",
      "message": "La password debe tener al menos 6 caracteres"
    }
  ]
}
```

### 5. Email inválido (400 - Validation Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "123456",
  "email": "email-invalido"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### 6. Username duplicado (400 - Business Logic Error)
```json
// Primero crear un usuario
POST /api/auth/dev/register
{
  "username": "usuario123",
  "password": "123456"
}

// Luego intentar crear otro con el mismo username
POST /api/auth/dev/register
{
  "username": "usuario123",
  "password": "654321"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "El nombre de usuario ya existe",
  "code": "VALIDATION_ERROR"
}
```

### 7. Email duplicado (400 - Business Logic Error)
```json
// Después de crear un usuario con email
POST /api/auth/dev/register
{
  "username": "usuario456",
  "password": "123456",
  "email": "usuario@example.com"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "Ya existe una persona registrada con este email",
  "code": "VALIDATION_ERROR"
}
```

### 8. Usuario menor de edad (400 - Business Logic Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "123456",
  "fechaNacimiento": "2020-01-01"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "La persona debe ser mayor de 13 años para registrarse",
  "code": "VALIDATION_ERROR"
}
```

### 9. Login con credenciales incorrectas (400 - Auth Error)
```json
POST /api/auth/dev/login
Content-Type: application/json

{
  "username": "usuarioInexistente",
  "password": "123456"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": "Credenciales inválidas",
  "code": "VALIDATION_ERROR"
}
```

### 10. Campos requeridos faltantes (400 - Validation Error)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario123"
  // Falta password
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "password",
      "message": "La password es obligatoria"
    }
  ]
}
```

## ✅ Casos Exitosos

### 1. Registro exitoso mínimo (201 - Success)
```json
POST /api/auth/dev/register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "123456"
}
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "userId": "...",
    "username": "usuario123",
    "token": "eyJ..."
  }
}
```

### 2. Login exitoso (200 - Success)
```json
POST /api/auth/dev/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "123456"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJ...",
    "user": {
      "id": "...",
      "username": "usuario123",
      "rol": "USUARIO",
      "estado": "ACTIVO"
    }
  }
}
```

## 🔍 Diferencias en los Códigos de Error

- **400 + errors[]**: Errores de validación de Joi (formato, longitud, tipo de dato)
- **400 + error + code**: Errores de lógica de negocio (duplicados, reglas específicas)
- **500**: Errores internos del servidor (problemas de BD, conexión, etc.)

## 📋 Cómo Probar

1. **Copia cada ejemplo en Postman**
2. **Envía la request**
3. **Verifica que el código de estado sea correcto**
4. **Verifica que el mensaje sea específico y útil**
5. **Confirma que no se crearon registros huérfanos en la BD**

¡Ahora los errores de validación son claros y específicos! 🎯
