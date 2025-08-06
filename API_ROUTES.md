# API REST - Rutas por Roles

## Autenticación (Públicas)
```
POST /api/auth/register    - Registro de usuario
POST /api/auth/login       - Inicio de sesión
POST /api/auth/logout      - Cerrar sesión
POST /api/auth/refresh     - Renovar token JWT
POST /api/auth/forgot      - Recuperar contraseña
POST /api/auth/reset       - Resetear contraseña
```

## Rutas para USUARIOS (Role: USER)

### Perfil
```
GET    /api/users/profile     - Obtener perfil actual
PUT    /api/users/profile     - Actualizar perfil
POST   /api/users/upload      - Subir foto de perfil
```

### Mascotas
```
GET    /api/pets              - Listar mascotas del usuario
POST   /api/pets              - Crear nueva mascota
GET    /api/pets/:id          - Obtener mascota específica
PUT    /api/pets/:id          - Actualizar mascota
DELETE /api/pets/:id          - Eliminar mascota
POST   /api/pets/:id/photo    - Subir foto de mascota
```

### Citas
```
GET    /api/appointments               - Listar citas del usuario
POST   /api/appointments               - Crear nueva cita
GET    /api/appointments/:id           - Obtener cita específica
PUT    /api/appointments/:id           - Actualizar cita (solo si PENDING)
DELETE /api/appointments/:id           - Cancelar cita
```

### Historial Médico
```
GET    /api/pets/:petId/diagnoses      - Historial médico de la mascota
GET    /api/diagnoses/:id              - Obtener diagnóstico específico
GET    /api/diagnoses/:id/files        - Descargar archivos del diagnóstico
```

### Tienda
```
GET    /api/products                   - Listar productos activos
GET    /api/products/:id               - Obtener producto específico
GET    /api/products/search            - Buscar productos
```

### Carrito y Órdenes
```
GET    /api/orders                     - Historial de órdenes
POST   /api/orders                     - Crear nueva orden
GET    /api/orders/:id                 - Obtener orden específica
POST   /api/orders/:id/payment         - Procesar pago
```

## Rutas para VETERINARIOS (Role: VETERINARIAN)

### Agenda
```
GET    /api/vet/appointments           - Calendario de citas asignadas
GET    /api/vet/appointments/today     - Citas de hoy
PUT    /api/vet/appointments/:id       - Actualizar estado de cita
```

### Diagnósticos
```
POST   /api/vet/diagnoses              - Crear nuevo diagnóstico
PUT    /api/vet/diagnoses/:id          - Actualizar diagnóstico
POST   /api/vet/diagnoses/:id/files    - Subir archivos al diagnóstico
```

### Pacientes
```
GET    /api/vet/patients               - Listar mascotas asignadas
GET    /api/vet/patients/:petId        - Historial completo de mascota
GET    /api/vet/patients/:petId/owner  - Información del dueño
```

### Estadísticas
```
GET    /api/vet/stats/appointments     - Estadísticas de citas
GET    /api/vet/stats/diagnoses        - Estadísticas de diagnósticos
```

## Rutas para ADMINISTRADORES (Role: ADMIN)

### Gestión de Usuarios
```
GET    /api/admin/users                - Listar todos los usuarios
POST   /api/admin/users                - Crear nuevo usuario
GET    /api/admin/users/:id            - Obtener usuario específico
PUT    /api/admin/users/:id            - Actualizar usuario
DELETE /api/admin/users/:id            - Eliminar usuario
PUT    /api/admin/users/:id/role       - Cambiar rol de usuario
```

### Gestión de Veterinarios
```
GET    /api/admin/veterinarians        - Listar veterinarios
POST   /api/admin/veterinarians        - Asignar rol veterinario
PUT    /api/admin/veterinarians/:id    - Actualizar veterinario
```

### Gestión de Productos
```
GET    /api/admin/products             - Listar todos los productos
POST   /api/admin/products             - Crear nuevo producto
PUT    /api/admin/products/:id         - Actualizar producto
DELETE /api/admin/products/:id         - Eliminar producto
POST   /api/admin/products/:id/image   - Subir imagen de producto
```

### Gestión de Órdenes
```
GET    /api/admin/orders               - Listar todas las órdenes
GET    /api/admin/orders/:id           - Obtener orden específica
PUT    /api/admin/orders/:id/status    - Actualizar estado de orden
```

### Citas y Asignaciones
```
GET    /api/admin/appointments         - Listar todas las citas
PUT    /api/admin/appointments/:id/vet - Asignar veterinario a cita
```

### Reportes y Estadísticas
```
GET    /api/admin/stats/users          - Estadísticas de usuarios
GET    /api/admin/stats/sales          - Estadísticas de ventas
GET    /api/admin/stats/appointments   - Estadísticas de citas
GET    /api/admin/reports/monthly      - Reporte mensual
```

## Middlewares de Autorización

### Middleware de Autenticación
```javascript
// middleware/auth.js
const requireAuth = (req, res, next) => {
  // Verificar JWT token
}
```

### Middleware de Roles
```javascript
// middleware/roleCheck.js
const requireRole = (roles) => (req, res, next) => {
  // Verificar si el usuario tiene el rol requerido
}
```

### Ejemplo de Uso
```javascript
// Ruta solo para veterinarios
router.get('/vet/appointments', 
  requireAuth, 
  requireRole(['VETERINARIAN']), 
  appointmentController.getVetAppointments
);

// Ruta solo para admin
router.delete('/admin/users/:id', 
  requireAuth, 
  requireRole(['ADMIN']), 
  userController.deleteUser
);

// Ruta para usuario o admin
router.get('/orders', 
  requireAuth, 
  requireRole(['USER', 'ADMIN']), 
  orderController.getUserOrders
);
```

## Códigos de Respuesta HTTP

```
200 - OK (GET, PUT exitosos)
201 - Created (POST exitoso)
204 - No Content (DELETE exitoso)
400 - Bad Request (datos inválidos)
401 - Unauthorized (no autenticado)
403 - Forbidden (sin permisos)
404 - Not Found (recurso no existe)
409 - Conflict (duplicado, ej: email ya existe)
422 - Unprocessable Entity (validación falló)
500 - Internal Server Error
```

## Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada exitosamente"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email es requerido"
      }
    ]
  }
}
```