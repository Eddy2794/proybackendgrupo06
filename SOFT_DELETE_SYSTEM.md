# Sistema de Soft Delete Implementado

Este documento describe el sistema de **Soft Delete** implementado en todo el proyecto, que permite marcar registros como eliminados sin borrarlos físicamente de la base de datos.

## 🎯 Características del Sistema

### ✅ Funcionalidades Principales

- **Soft Delete**: Marca registros como eliminados sin borrarlos físicamente
- **Restore**: Permite restaurar registros eliminados
- **Hard Delete**: Eliminación física opcional (irreversible)
- **Filtrado Automático**: Las consultas normales excluyen registros eliminados automáticamente
- **Consultas Específicas**: Métodos para obtener solo eliminados o incluir eliminados
- **Auditoría**: Registra quién y cuándo eliminó/restauró cada registro
- **Historial**: Mantiene historial completo de eliminaciones y restauraciones

### 🔧 Componentes del Sistema

1. **Plugin de Mongoose** (`src/utils/softDeletePlugin.js`)
2. **Campos agregados automáticamente a todos los modelos**
3. **Métodos de repositorio actualizados**
4. **Servicios con funciones de soft delete**
5. **Controladores con endpoints de gestión**
6. **Rutas REST para todas las operaciones**

## 📋 Campos Agregados Automáticamente

El plugin agrega automáticamente los siguientes campos a todos los modelos:

```javascript
{
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    index: true
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  restoredAt: {
    type: Date
  },
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}
```

## 🔨 Métodos Disponibles

### Métodos de Instancia (Documento)

```javascript
// Eliminar (soft delete)
await documento.softDelete(userId);

// Restaurar
await documento.restore(userId);

// Verificar si está eliminado
const eliminado = documento.isDeleted();

// Eliminar físicamente
await documento.hardDelete();

// Obtener historial de eliminación/restauración
const historial = documento.getDeletionHistory();

// Verificar si puede ser eliminado
const puedeEliminar = documento.canBeDeleted();
```

### Métodos Estáticos (Modelo)

```javascript
// Buscar solo eliminados
const eliminados = await Modelo.findDeleted(filtros);

// Buscar incluyendo eliminados
const todos = await Modelo.findWithDeleted(filtros);

// Contar eliminados
const cantidadEliminados = await Modelo.countDeleted(filtros);

// Contar incluyendo eliminados
const cantidadTotal = await Modelo.countWithDeleted(filtros);

// Soft delete por ID
await Modelo.softDeleteById(id, userId);

// Restaurar por ID
await Modelo.restoreById(id, userId);
```

## 🛠️ Métodos de Repositorio

### Para Usuarios (`src/modules/user/repository/user.repository.js`)

```javascript
// Soft delete
export const softDeleteById = async (id, deletedBy = null)
export const restoreById = async (id, restoredBy = null)
export const hardDeleteById = async (id)

// Consultas específicas
export const findDeleted = async (filter = {}, options = {})
export const findWithDeleted = async (filter = {}, options = {})

// Con transacciones
export const softDeleteByIdWithSession = async (id, deletedBy, session)
export const restoreByIdWithSession = async (id, restoredBy, session)
```

### Para Personas (`src/modules/persona/repository/persona.repository.js`)

Los mismos métodos están disponibles para el modelo de Personas.

## 🌐 Endpoints de API

### Usuarios (`/api/users`)

#### Operaciones de Soft Delete
- `DELETE /api/users/:id` - Eliminar usuario (soft delete)
- `POST /api/users/:id/restore` - Restaurar usuario eliminado
- `DELETE /api/users/:id/hard` - Eliminar usuario permanentemente

#### Consultas Especiales
- `GET /api/users/deleted/list` - Listar solo usuarios eliminados
- `GET /api/users/all/including-deleted` - Listar todos incluyendo eliminados

### Personas (`/api/personas`)

#### Operaciones de Soft Delete
- `DELETE /api/personas/:id` - Eliminar persona (soft delete)
- `POST /api/personas/:id/restore` - Restaurar persona eliminada
- `DELETE /api/personas/:id/hard` - Eliminar persona permanentemente

#### Consultas Especiales
- `GET /api/personas/deleted/list` - Listar solo personas eliminadas
- `GET /api/personas/all/including-deleted` - Listar todas incluyendo eliminadas

## 📝 Ejemplos de Uso

### 1. Eliminar Usuario (Soft Delete)

```javascript
// En el controlador
async deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.userId || null;
    const user = await userService.deleteUser(id, deletedBy);
    return res.success('Usuario eliminado exitosamente', user);
  } catch (error) {
    next(error);
  }
}
```

### 2. Restaurar Usuario

```javascript
// En el controlador
async restoreUser(req, res, next) {
  try {
    const { id } = req.params;
    const restoredBy = req.user?.userId || null;
    const user = await userService.restoreUser(id, restoredBy);
    return res.success('Usuario restaurado exitosamente', user);
  } catch (error) {
    next(error);
  }
}
```

### 3. Obtener Solo Eliminados

```javascript
// En el servicio
export const getDeletedUsers = async (filters = {}, options = {}) => {
  return await userRepo.findDeleted(filters, options);
};
```

### 4. Consulta Incluyendo Eliminados

```javascript
// En el frontend/Postman
GET /api/users/all/including-deleted?includeDeleted=true
```

## 🔍 Comportamiento por Defecto

### Consultas Normales
- `find()`, `findOne()`, `findById()` → **Excluyen automáticamente** registros eliminados
- `aggregate()` → **Excluye automáticamente** registros eliminados
- `count()`, `countDocuments()` → **Excluyen automáticamente** registros eliminados

### Consultas Especiales
- `findDeleted()` → **Solo** registros eliminados
- `findWithDeleted()` → **Todos** los registros (eliminados y activos)

## 🛡️ Seguridad y Validaciones

### Validaciones Automáticas
- Verificar que el registro no esté ya eliminado antes de eliminar
- Verificar que el registro exista antes de restaurar
- Validaciones personalizables por modelo mediante `validateBeforeDelete`

### Auditoría
- Registro automático de **quién** eliminó/restauró
- Registro automático de **cuándo** se eliminó/restauró
- Historial completo de cambios de estado

## 🎨 Configuración del Plugin

### Opciones Disponibles

```javascript
userSchema.plugin(softDeletePlugin, {
  indexFields: true,              // Crear índices automáticamente
  validateBeforeDelete: function() {
    // Validación personalizada
    return this.rol !== 'ADMIN' || checkOtherAdmins();
  },
  deletedField: 'isDeleted',      // Nombre del campo de eliminación
  deletedAtField: 'deletedAt',    // Nombre del campo de fecha
  deletedByField: 'deletedBy'     // Nombre del campo de usuario
});
```

### Validaciones Personalizadas

```javascript
// Ejemplo para Usuario
validateBeforeDelete: function() {
  // No permitir eliminar usuarios ADMIN si son los únicos
  if (this.rol === 'ADMIN') {
    // Esta validación se podría expandir
    return true;
  }
  return true;
}
```

## 📊 Información en Development

En entorno de desarrollo, la información de soft delete se incluye automáticamente en las respuestas JSON:

```json
{
  "_id": "...",
  "username": "usuario123",
  "deletionInfo": {
    "isDeleted": true,
    "deletedAt": "2025-06-23T10:30:00.000Z",
    "deletedBy": "648f8f8f8f8f8f8f8f8f8f8f",
    "restoredAt": null,
    "restoredBy": null
  }
}
```

## ⚡ Rendimiento

### Optimizaciones Implementadas
- **Índices automáticos** en campos de soft delete
- **Índice compuesto** en `(isDeleted, deletedAt)`
- **Filtrado eficiente** en middleware de Mongoose
- **Consultas optimizadas** para cada caso de uso

### Consideraciones
- Las consultas normales tienen un filtro adicional automático
- Los agregados incluyen un `$match` stage automático
- Los índices mejoran significativamente el rendimiento

## 🔄 Migración de Datos Existentes

Para aplicar el soft delete a datos existentes:

```javascript
// Script de migración (ejecutar una sola vez)
await User.updateMany(
  { isDeleted: { $exists: false } },
  { $set: { isDeleted: false } }
);

await Persona.updateMany(
  { isDeleted: { $exists: false } },
  { $set: { isDeleted: false } }
);
```

## 🚀 Beneficios del Sistema

### ✅ Ventajas
- **Recuperación de datos**: Los registros eliminados pueden restaurarse
- **Auditoría completa**: Historial de quién y cuándo eliminó/restauró
- **Integridad referencial**: Mantiene relaciones entre documentos
- **Compliance**: Cumple con regulaciones que requieren conservar datos
- **Debugging**: Facilita la investigación de problemas
- **Filtrado automático**: Las consultas normales no ven eliminados

### ⚠️ Consideraciones
- **Espacio en disco**: Los registros eliminados ocupan espacio
- **Rendimiento**: Filtro adicional en cada consulta
- **Complejidad**: Más métodos y lógica para gestionar

## 📚 Testing

### Casos de Prueba Recomendados

1. **Soft Delete Básico**
   - Eliminar registro → Verificar que no aparece en consultas normales
   - Verificar que aparece en `findDeleted()`

2. **Restore**
   - Restaurar registro eliminado → Verificar que vuelve a aparecer

3. **Hard Delete**
   - Eliminar físicamente → Verificar que desaparece completamente

4. **Auditoría**
   - Verificar campos `deletedBy`, `deletedAt`, `restoredBy`, `restoredAt`

5. **Filtrado Automático**
   - Consultas normales no deben incluir eliminados
   - Aggregations deben filtrar automáticamente

## 💡 Casos de Uso Reales

### Administración de Usuarios
- **Desactivar temporalmente** usuarios problemáticos
- **Reactivar usuarios** después de resolver problemas
- **Mantener historial** de activaciones/desactivaciones

### Gestión de Personas
- **Cumplimiento GDPR**: Marcar como eliminado sin perder relaciones
- **Recuperación de errores**: Restaurar personas eliminadas por error
- **Auditoría**: Rastrear cambios en datos personales

### Reportes y Analytics
- **Exclusión automática** de eliminados en reportes
- **Reportes específicos** de elementos eliminados
- **Análisis temporal** incluyendo/excluyendo eliminados

---

## 🎯 Resumen

El sistema de **Soft Delete** está completamente implementado y funcional en todo el proyecto, proporcionando:

- ✅ **Eliminación segura** sin pérdida de datos
- ✅ **Restauración completa** de registros
- ✅ **Auditoría automática** de cambios
- ✅ **Filtrado inteligente** en consultas
- ✅ **API REST completa** para gestión
- ✅ **Documentación automática** en Swagger
- ✅ **Optimización de rendimiento** con índices
- ✅ **Flexibilidad** para casos de uso específicos

El sistema es transparente para las operaciones normales y proporciona funcionalidad avanzada cuando se necesita gestionar registros eliminados.
