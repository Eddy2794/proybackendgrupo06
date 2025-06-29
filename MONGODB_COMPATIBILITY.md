# 📋 Guía: MongoDB Standalone vs ReplicaSet - Manejo de Transacciones

## 🔄 Detección Automática Implementada

El sistema ahora **detecta automáticamente** el tipo de MongoDB y ajusta su comportamiento:

### ✅ **MongoDB con Transacciones** (ReplicaSet/Atlas)
- Usa `mongoose.startSession()` y `session.withTransaction()`
- Rollback automático si falla cualquier operación
- Máxima integridad de datos

### ✅ **MongoDB Standalone** (Desarrollo local)
- Usa operaciones secuenciales con cleanup manual
- Si falla el usuario → limpia la persona automáticamente
- Mantiene consistencia sin transacciones

## 🛠️ Configuración para Desarrollo Local

### Opción 1: MongoDB Standalone (Recomendado para desarrollo)
```bash
# Iniciar MongoDB normalmente
mongod --dbpath /ruta/a/tu/db

# Tu API funcionará automáticamente con cleanup manual
```

### Opción 2: MongoDB ReplicaSet (Opcional)
```bash
# 1. Crear directorio para replica set
mkdir -p /ruta/a/replicaset

# 2. Iniciar MongoDB como replica set
mongod --replSet myReplicaSet --dbpath /ruta/a/replicaset --port 27017

# 3. Conectar y configurar replica set
mongo
> rs.initiate()

# Tu API usará transacciones reales
```

## 🧪 Prueba con tu Ejemplo

### Request que estabas enviando:
```json
POST /api/auth/dev/register
Content-Type: application/json

{
    "nombres": "prueba",
    "apellidos": "prueba2", 
    "numeroDocumento": "12345678",
    "fechaNacimiento": "2000-03-20",
    "genero": "MASCULINO",
    "email": "yo@yo2.com",
    "username": "mio2",
    "password": "123-mio"
}
```

### Respuesta Esperada (201):
```json
{
    "success": true,
    "message": "Usuario registrado exitosamente",
    "data": {
        "userId": "...",
        "username": "mio2",
        "token": "eyJ..."
    }
}
```

## 🔍 Log Messages para Debugging

### MongoDB Standalone:
```
🔄 MongoDB standalone detectado - usando operaciones secuenciales
🚧 [DEV SERVICE] Registro con contraseña en texto plano
```

### MongoDB ReplicaSet:
```
🚧 [DEV SERVICE] Registro con contraseña en texto plano
(Sin mensaje adicional - usa transacciones)
```

### Si hay error y cleanup:
```
🧹 Persona limpiada debido a error en creación de usuario
```

## ⚠️ Validaciones que se Mantienen

- ✅ Username: mínimo 3 caracteres, alfanumérico
- ✅ Password: mínimo 6 caracteres  
- ✅ Email: formato válido, único
- ✅ Rol: automáticamente 'USER' (del enum del modelo)
- ✅ Persona: mayor de 13 años, documento único

## 🎯 Beneficios de esta Implementación

1. **Funciona en cualquier MongoDB**: Standalone o ReplicaSet
2. **Sin errores de transacción**: Detecta capacidades automáticamente
3. **Mantiene integridad**: Cleanup manual si no hay transacciones
4. **Transparente**: El frontend no necesita cambios
5. **Preparado para producción**: Si usas Atlas, las transacciones se activan automáticamente

## 🚀 Próximos Pasos

1. **Reinicia tu servidor**: `npm run dev:simple`
2. **Prueba tu request**: Debería funcionar sin errores de transacción
3. **Verifica logs**: Deberías ver el tipo de MongoDB detectado
4. **Confirma rol**: El usuario se crea con `rol: 'USER'` automáticamente

¡Ahora funciona tanto en MongoDB standalone como en ReplicaSet! 🎉
