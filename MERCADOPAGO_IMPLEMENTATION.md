# Implementación de MercadoPago Argentina

## Descripción General

Esta implementación integra MercadoPago Argentina para el sistema de pagos de cuotas de la escuela de fútbol. Permite a los usuarios realizar pagos mensuales y anuales con descuentos, manteniendo un historial completo de transacciones.

## Características Implementadas

### ✅ Funcionalidades Principales

- **Pagos de Cuotas Mensuales**: Sistema para pagar cuotas mes a mes
- **Pagos Anuales con Descuento**: Opción de pago anual con descuentos configurables
- **Gestión de Categorías**: Sistema completo de categorías con precios diferenciados
- **Webhooks Seguros**: Procesamiento automático de notificaciones de MercadoPago
- **Historial de Pagos**: Seguimiento completo de todas las transacciones
- **Sistema de Descuentos**: Descuentos por hermanos y pagos anuales
- **Validación de Firmas**: Seguridad en webhooks con validación HMAC-SHA256

### 🔧 Arquitectura del Sistema

```
Backend (Node.js + Express)
├── Configuración MercadoPago
├── Modelos de Datos
│   ├── CategoriaEscuela
│   └── Pago
├── Servicios
│   └── MercadoPagoService
├── Controladores
│   ├── PagoController
│   └── CategoriaEscuelaController
├── Rutas API
├── Validadores
└── Webhooks
```

## Configuración

### Variables de Entorno Requeridas

```bash
# Credenciales de MercadoPago (TEST para desarrollo)
MP_ACCESS_TOKEN=TEST-4859313987851111-030700-f1b5e5b7e43a7-1234567890
MP_PUBLIC_KEY=TEST-a7b5b7b5b7b5b7b5b7b5b7b5b7b5b7b5-123456
MP_WEBHOOK_SECRET=your_webhook_secret_key_here

# URLs de configuración
MP_WEBHOOK_URL=http://localhost:3000/api/payments/webhooks/mercadopago
MP_SUCCESS_URL=http://localhost:4200/payments/success
MP_FAILURE_URL=http://localhost:4200/payments/failure
MP_PENDING_URL=http://localhost:4200/payments/pending
```

### Instalación de Dependencias

```bash
npm install mercadopago
```

## Modelos de Datos

### CategoriaEscuela

Modelo para definir las categorías de la escuela con sus precios:

```javascript
{
  nombre: "Infantil Sub-10",
  descripcion: "Categoría para niños de 8 a 10 años",
  tipo: "INFANTIL", // INFANTIL, JUVENIL, ADULTO, VETERANOS, etc.
  edadMinima: 8,
  edadMaxima: 10,
  precio: {
    cuotaMensual: 15000,
    descuentos: {
      hermanos: 15,    // 15% descuento por hermanos
      pagoAnual: 12    // 12% descuento por pago anual
    }
  },
  estado: "ACTIVA",
  cupoMaximo: 25,
  horarios: [
    { dia: "LUNES", horaInicio: "16:30", horaFin: "17:30" },
    { dia: "MIERCOLES", horaInicio: "16:30", horaFin: "17:30" }
  ]
}
```

### Pago

Modelo para registrar todos los pagos y su estado:

```javascript
{
  usuario: ObjectId("..."),
  categoriaEscuela: ObjectId("..."),
  tipo: "PAGO_CUOTA", // PAGO_CUOTA, PAGO_ANUAL, REEMBOLSO
  periodo: { mes: 3, anio: 2025 },
  montos: {
    original: 15000,
    descuentos: 2250,
    final: 12750,
    comision: 369.75
  },
  estado: "APROBADO", // PENDIENTE, APROBADO, RECHAZADO, etc.
  mercadoPago: {
    preferenceId: "1234567890-abcd-1234-5678-abcdef123456",
    paymentId: "12345678",
    status: "approved",
    paymentMethod: {
      id: "visa",
      type: "credit_card",
      installments: 1
    }
  }
}
```

## API Endpoints

### Autenticación
Todos los endpoints requieren autenticación JWT excepto los webhooks.

### Categorías de Escuela

```bash
# Obtener todas las categorías
GET /api/categorias

# Obtener categoría por ID
GET /api/categorias/:categoriaId

# Crear categoría (solo admin)
POST /api/categorias

# Actualizar categoría (solo admin)
PUT /api/categorias/:categoriaId

# Eliminar categoría (solo admin)
DELETE /api/categorias/:categoriaId

# Buscar por edad
GET /api/categorias/buscar/edad/:edad

# Buscar por tipo
GET /api/categorias/buscar/tipo/:tipo

# Buscar por rango de precio
GET /api/categorias/buscar/precio?precioMin=10000&precioMax=20000

# Estadísticas (solo admin)
GET /api/categorias/estadisticas
```

### Pagos

```bash
# Obtener credenciales públicas para el frontend
GET /api/payments/credentials

# Crear preferencia para cuota mensual
POST /api/payments/cuota
{
  "categoriaId": "60f7d123456789abcdef1234",
  "periodo": { "mes": 3, "anio": 2025 },
  "descuentoTipo": "hermanos" // opcional
}

# Crear preferencia para pago anual
POST /api/payments/anual
{
  "categoriaId": "60f7d123456789abcdef1234",
  "anio": 2025
}

# Obtener historial de pagos del usuario
GET /api/payments/historial?estado=APROBADO&anio=2025

# Obtener información de un pago específico
GET /api/payments/:pagoId

# Consultar estado de un pago
GET /api/payments/estado?paymentId=12345678

# Estadísticas de pagos (solo admin)
GET /api/payments/estadisticas
```

### Webhooks (Uso Interno)

```bash
# Webhook para notificaciones de MercadoPago
POST /api/payments/webhooks/mercadopago

# URLs de retorno desde MercadoPago
GET /api/payments/return/success
GET /api/payments/return/failure
GET /api/payments/return/pending
```

## Flujo de Pago

### 1. Creación de Preferencia

```javascript
// Frontend solicita crear una preferencia de pago
const response = await fetch('/api/payments/cuota', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoriaId: "60f7d123456789abcdef1234",
    periodo: { mes: 3, anio: 2025 },
    descuentoTipo: "hermanos"
  })
});

const { data } = await response.json();
// data.initPoint contiene la URL para redirigir al usuario
```

### 2. Procesamiento del Pago

1. Usuario es redirigido a MercadoPago
2. Completa el pago
3. MercadoPago envía webhook a nuestro servidor
4. Sistema actualiza el estado del pago
5. Usuario es redirigido de vuelta al frontend

### 3. Verificación y Seguimiento

```javascript
// Consultar estado de un pago
const response = await fetch(`/api/payments/${pagoId}`, {
  headers: { 'Authorization': 'Bearer ' + token }
});

const { data } = await response.json();
console.log('Estado del pago:', data.estado);
```

## Seguridad

### Validación de Webhooks

El sistema valida automáticamente la autenticidad de los webhooks usando HMAC-SHA256:

```javascript
// Validación automática en el servicio
const isValid = this.validarFirmaWebhook(headers, body, query);
if (!isValid) {
  throw new Error('Firma de webhook inválida');
}
```

### Protección de Endpoints

- **Autenticación JWT**: Todos los endpoints requieren token válido
- **Autorización por Roles**: Funciones administrativas requieren rol ADMIN
- **Validación de Datos**: Validación exhaustiva con express-validator
- **Rate Limiting**: Limitación de requests por IP
- **Sanitización**: Limpieza automática de datos de entrada

## Datos de Prueba

### Categorías Predefinidas

El sistema incluye una migración que crea 9 categorías por defecto:

- **Infantil Sub-8**: $12,000/mes (6-8 años)
- **Infantil Sub-10**: $15,000/mes (8-10 años)
- **Infantil Sub-12**: $18,000/mes (10-12 años)
- **Juvenil Sub-15**: $22,000/mes (12-15 años)
- **Juvenil Sub-18**: $25,000/mes (15-18 años)
- **Adultos Recreativo**: $20,000/mes (18-45 años)
- **Veteranos +45**: $18,000/mes (45-70 años)
- **Competitivo Elite**: $35,000/mes (16-22 años)
- **Entrenamiento Personalizado**: $45,000/mes (6-60 años)

### Ejecutar Migración

```bash
# Ejecutar migración de categorías
node migration/categorias-escuela-migration.js

# O desde el script de migración principal
npm run migrate
```

### Tarjetas de Prueba para MercadoPago

```bash
# Visa aprobada
4509953566233704

# Mastercard aprobada  
5031755734530604

# Visa rechazada
4000000000000002

# American Express aprobada
371180303257522
```

## Testing

### Ejemplos con cURL

```bash
# Crear preferencia de cuota
curl -X POST http://localhost:3000/api/payments/cuota \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoriaId": "60f7d123456789abcdef1234",
    "periodo": {"mes": 3, "anio": 2025}
  }'

# Obtener categorías
curl -X GET http://localhost:3000/api/categorias \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Obtener historial de pagos
curl -X GET "http://localhost:3000/api/payments/historial?estado=APROBADO" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Postman Collection

El proyecto incluye una colección de Postman en `postman-collection.json` con ejemplos de todos los endpoints.

## Monitoreo y Logs

### Logs del Sistema

```javascript
// Los logs incluyen información detallada
logger.info('Preferencia creada exitosamente', {
  preferenceId: preference.id,
  pagoId: nuevoPago._id,
  usuario: usuarioId,
  monto: montoFinal
});
```

### Métricas Disponibles

- Total de pagos por estado
- Ingresos por categoría
- Análisis de descuentos aplicados
- Estadísticas de métodos de pago
- Tiempos de procesamiento

## Próximos Pasos

### Funcionalidades Preparadas para Expansión

1. **Sistema de Reembolsos**: Infraestructura lista para implementar reembolsos
2. **Pagos Recurrentes**: Base para suscripciones automáticas
3. **Múltiples Medios de Pago**: Soporte para efectivo, transferencias, etc.
4. **Reportes Avanzados**: Sistema de reportes financieros
5. **Notificaciones**: Integración con email/SMS para notificar estados de pago

### Configuración para Producción

1. Cambiar credenciales TEST por credenciales de producción
2. Configurar webhook público con HTTPS
3. Implementar certificados SSL
4. Configurar monitoreo de pagos
5. Establecer políticas de retry para webhooks

## Soporte y Documentación

- **Documentación Swagger**: Disponible en `/docs`
- **Logs del Sistema**: Configurados con Winston
- **MercadoPago Docs**: https://www.mercadopago.com.ar/developers/
- **Estado del Servicio**: https://status.mercadopago.com/

---

Esta implementación proporciona una base sólida y escalable para el sistema de pagos de la escuela de fútbol, siguiendo las mejores prácticas de seguridad y desarrollo con MercadoPago Argentina.
