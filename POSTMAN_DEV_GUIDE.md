# Colección de Postman para Desarrollo

Este archivo contiene ejemplos de requests para probar los endpoints de desarrollo con Postman.

## Variables de Entorno en Postman

Configura las siguientes variables en Postman:
- `base_url`: `http://localhost:3000/api`
- `dev_token`: Se actualizará automáticamente después del login

## 1. Registro de Usuario (Desarrollo)

**POST** `{{base_url}}/auth/dev/register`

### Headers:
```
Content-Type: application/json
```

### Body (JSON):
```json
{
  "username": "usuario123",
  "password": "mipassword123",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "email": "juan@example.com"
}
```

### Body Mínimo (JSON):
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### Tests (Postman):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("dev_token", response.data.token);
        console.log("Token guardado:", response.data.token);
    }
}
```

---

## 2. Login de Usuario (Desarrollo)

**POST** `{{base_url}}/auth/dev/login`

### Headers:
```
Content-Type: application/json
```

### Body (JSON):
```json
{
  "username": "usuario123",
  "password": "mipassword123"
}
```

### Tests (Postman):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("dev_token", response.data.token);
        console.log("Token guardado:", response.data.token);
    }
}
```

---

## 3. Cambiar Contraseña (Desarrollo)

**POST** `{{base_url}}/auth/dev/change-password`

### Headers:
```
Content-Type: application/json
Authorization: Bearer {{dev_token}}
```

### Body (JSON):
```json
{
  "currentPassword": "mipassword123",
  "newPassword": "nuevapassword456",
  "confirmPassword": "nuevapassword456"
}
```

---

## 4. Logout (Desarrollo)

**POST** `{{base_url}}/auth/dev/logout`

### Headers:
```
Authorization: Bearer {{dev_token}}
```

### Tests (Postman):
```javascript
if (pm.response.code === 200) {
    pm.environment.unset("dev_token");
    console.log("Token eliminado del entorno");
}
```

---

## 5. Información de la API

**GET** `{{base_url}}/`

### Headers:
```
Content-Type: application/json
```

Esta ruta mostrará información adicional cuando `NODE_ENV=development`, incluyendo los endpoints de desarrollo disponibles.

---

## Ejemplos de Respuestas

### Registro Exitoso (201):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "userId": "60f7b1b5e4b0a72a1c5d4e3f",
    "username": "usuario123",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login Exitoso (200):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60f7b1b5e4b0a72a1c5d4e3f",
      "username": "usuario123",
      "rol": "USUARIO",
      "estado": "ACTIVO"
    }
  }
}
```

### Error de Validación (400):
```json
{
  "success": false,
  "error": "El username debe tener al menos 3 caracteres",
  "code": "VALIDATION_ERROR"
}
```

### Credenciales Inválidas (401):
```json
{
  "success": false,
  "error": "Credenciales inválidas",
  "code": "INVALID_CREDENTIALS"
}
```

---

## Notas Importantes

1. **Solo Desarrollo**: Estos endpoints solo funcionan cuando `NODE_ENV=development`
2. **Contraseñas en Texto Plano**: No requieren hash, salt ni cifrado
3. **Sin Validaciones Avanzadas**: No requieren timestamp, clientToken, etc.
4. **Rate Limiting Deshabilitado**: Para facilitar el testing
5. **Logging Habilitado**: Todas las requests se loggean en consola

## Flujo de Testing Típico

1. **Registro**: Crear un nuevo usuario con username y password
2. **Login**: Autenticarse y obtener token JWT
3. **Usar Token**: Incluir en header `Authorization: Bearer <token>` para endpoints protegidos
4. **Cambiar Password**: Probar cambio de contraseña (opcional)
5. **Logout**: Cerrar sesión y limpiar token

## Variables de Entorno del Servidor

Asegúrate de que el servidor tenga configurado:
```
NODE_ENV=development
```

Si `NODE_ENV` no es `development`, los endpoints `/dev` devuelverán un error 403.
