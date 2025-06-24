# Configuración de Autenticación Automática en Postman

Este documento explica cómo configurar Postman para que la autenticación se mantenga automáticamente en todas las pestañas y requests de tu colección.

## 1. Configuración Inicial del Entorno

### Crear un Entorno (Environment)

1. En Postman, haz clic en el ícono del engranaje (⚙️) en la esquina superior derecha
2. Selecciona "Manage Environments"
3. Haz clic en "Add" para crear un nuevo entorno
4. Nombra el entorno: **"TP Final - Desarrollo"**

### Variables del Entorno

Configura las siguientes variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000/api` | `http://localhost:3000/api` |
| `dev_token` | *(vacío)* | *(vacío)* |
| `auth_header` | `Bearer {{dev_token}}` | `Bearer {{dev_token}}` |

## 2. Configuración de la Colección

### Autenticación a Nivel de Colección

1. **Crea una nueva colección** llamada "TP Final API"
2. **Configura la autenticación de la colección:**
   - Haz clic derecho en la colección → "Edit"
   - Ve a la pestaña "Authorization"
   - Type: **Bearer Token**
   - Token: `{{dev_token}}`
3. **Guarda la configuración**

### Variables de la Colección

En la pestaña "Variables" de la colección, agrega:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `{{base_url}}` | `{{base_url}}` |

## 3. Requests de Autenticación

### Request de Login con Auto-save del Token

**POST** `{{baseUrl}}/auth/dev/login`

#### Headers:
```
Content-Type: application/json
```

#### Body (JSON):
```json
{
  "username": "testuser",
  "password": "123456"
}
```

#### Tests (Script de Post-respuesta):
```javascript
// Guardar token automáticamente después del login exitoso
if (pm.response.code === 200) {
    const response = pm.response.json();
    
    if (response.success && response.data && response.data.token) {
        // Guardar el token en las variables del entorno
        pm.environment.set("dev_token", response.data.token);
        
        // Log para confirmar
        console.log("✅ Token guardado exitosamente");
        console.log("Token:", response.data.token.substring(0, 20) + "...");
        
        // Opcional: Guardar información del usuario
        if (response.data.user) {
            pm.environment.set("current_user", JSON.stringify(response.data.user));
            console.log("👤 Usuario:", response.data.user.username);
        }
    }
} else {
    console.log("❌ Error en login:", pm.response.json().message);
}
```

### Request de Registro con Auto-save del Token

**POST** `{{baseUrl}}/auth/dev/register`

#### Headers:
```
Content-Type: application/json
```

#### Body (JSON):
```json
{
  "username": "usuario{{$timestamp}}",
  "password": "123456",
  "nombres": "Usuario",
  "apellidos": "Test",
  "email": "test{{$timestamp}}@example.com"
}
```

#### Tests (Script de Post-respuesta):
```javascript
// Usar el mismo script que en login
if (pm.response.code === 201) {
    const response = pm.response.json();
    
    if (response.success && response.data && response.data.token) {
        pm.environment.set("dev_token", response.data.token);
        console.log("✅ Token guardado después del registro");
        
        if (response.data.user) {
            pm.environment.set("current_user", JSON.stringify(response.data.user));
            console.log("👤 Nuevo usuario:", response.data.user.username);
        }
    }
}
```

### Request de Logout con Auto-clear del Token

**POST** `{{baseUrl}}/auth/dev/logout`

#### Authorization:
- Type: **Inherit auth from parent** (usará el Bearer token de la colección)

#### Tests (Script de Post-respuesta):
```javascript
// Limpiar token después del logout
if (pm.response.code === 200) {
    pm.environment.unset("dev_token");
    pm.environment.unset("current_user");
    console.log("🚪 Token eliminado - Sesión cerrada");
} else {
    console.log("❌ Error en logout");
}
```

## 4. Requests Protegidos (Automáticos)

Para cualquier request que requiera autenticación:

### Configuración de Authorization:
- Type: **Inherit auth from parent**
- *(Esto usará automáticamente el token de la colección)*

### Ejemplo: Obtener Perfil de Usuario

**GET** `{{baseUrl}}/auth/profile`

#### Authorization:
- Type: **Inherit auth from parent**

#### Tests (Opcional - Verificar autenticación):
```javascript
// Verificar que el request está autenticado
if (pm.response.code === 401) {
    console.log("🔒 Token expirado o inválido - Necesitas hacer login");
} else if (pm.response.code === 200) {
    const response = pm.response.json();
    console.log("✅ Perfil obtenido:", response.data.username);
}
```

## 5. Pre-request Scripts Avanzados

### Script a Nivel de Colección (Pre-request)

Para verificar automáticamente si hay token antes de cada request:

```javascript
// Pre-request script de la colección
const token = pm.environment.get("dev_token");

// Solo verificar token en rutas protegidas
const protectedRoutes = ['/auth/profile', '/auth/logout', '/auth/change-password', '/users', '/personas'];
const currentPath = pm.request.url.getPath();

const isProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));

if (isProtectedRoute && !token) {
    console.log("⚠️  ADVERTENCIA: Request a ruta protegida sin token");
    console.log("🔑 Ejecuta primero el request de Login");
}
```

## 6. Flujo de Trabajo Recomendado

### Primera Vez:
1. **Crear usuario**: Ejecuta `POST /auth/dev/register`
2. **El token se guarda automáticamente**
3. **Usar otras rutas**: Todas las rutas protegidas funcionarán automáticamente

### Sesiones Posteriores:
1. **Login**: Ejecuta `POST /auth/dev/login`
2. **El token se actualiza automáticamente**
3. **Continuar trabajando**: Todas las rutas funcionan sin configuración adicional

### Al Terminar (Opcional):
1. **Logout**: Ejecuta `POST /auth/dev/logout`
2. **El token se elimina automáticamente**

## 7. Verificación del Setup

### Test de Funcionamiento:

1. **Ejecuta Login** → Debería guardarse el token automáticamente
2. **Ejecuta una ruta protegida** (ej: GET /auth/profile) → Debería funcionar sin configurar nada
3. **Ejecuta Logout** → El token debería eliminarse
4. **Intenta la ruta protegida nuevamente** → Debería fallar con 401

## 8. Troubleshooting

### Problemas Comunes:

**❌ "Token expirado o inválido":**
- Ejecuta el request de Login nuevamente
- Verifica que el entorno correcto esté seleccionado

**❌ "Authorization header missing":**
- Verifica que la colección tenga configurada la autenticación Bearer
- Verifica que el request use "Inherit auth from parent"

**❌ El token no se guarda:**
- Revisa el script de Tests en el request de Login
- Verifica que el entorno correcto esté activo

### Verificar Variables:

En cualquier momento puedes verificar las variables:
- Haz clic en el ícono del ojo (👁️) junto al selector de entorno
- Deberías ver `dev_token` con un valor si estás autenticado

## 9. Beneficios de Esta Configuración

✅ **Una sola autenticación:** Haces login una vez y funciona en todas las pestañas
✅ **Automático:** No necesitas copiar/pegar tokens manualmente
✅ **Persistente:** El token se mantiene mientras Postman esté abierto
✅ **Limpio:** Al hacer logout, todo se limpia automáticamente
✅ **Escalable:** Funciona para cualquier cantidad de requests nuevos

---

## 🎯 Resumen Rápido

1. **Crea el entorno** con las variables `base_url` y `dev_token`
2. **Configura la colección** con Bearer Token: `{{dev_token}}`
3. **Agrega los scripts** de Tests a Login/Register/Logout
4. **Configura requests protegidos** como "Inherit auth from parent"
5. **¡Listo!** Una autenticación, todas las rutas funcionan automáticamente
