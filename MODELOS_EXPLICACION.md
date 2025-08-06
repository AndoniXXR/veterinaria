# Explicación de los Modelos de Datos

## Modelos Principales

### 1. **User** (Usuario)
- **Propósito**: Gestiona todos los usuarios del sistema
- **Roles**: USER (cliente), VETERINARIAN (veterinario), ADMIN (administrador)
- **Campos clave**:
  - `email`: Único, para autenticación
  - `password`: Hasheado con bcrypt
  - `role`: Determina permisos y acceso
  - `photo`: URL de Cloudinary

**Relaciones**:
- 1:N con Pet (un usuario puede tener varias mascotas)
- 1:N con Appointment (como cliente)
- 1:N con Appointment (como veterinario asignado)
- 1:N con Order (historial de compras)
- 1:N con Diagnosis (diagnósticos realizados por veterinarios)

### 2. **Pet** (Mascota)
- **Propósito**: Información de las mascotas de los usuarios
- **Campos clave**:
  - `species`: Perro, Gato, etc.
  - `breed`: Raza específica
  - `gender`: Enum con MALE, FEMALE, UNKNOWN
  - `photo`: URL de Cloudinary

**Relaciones**:
- N:1 con User (dueño)
- 1:N con Appointment (citas médicas)
- 1:N con Diagnosis (historial médico)

### 3. **Appointment** (Cita)
- **Propósito**: Sistema de agendamiento de citas
- **Estados**: PENDING, CONFIRMED, COMPLETED, CANCELLED
- **Campos clave**:
  - `date`: Fecha y hora de la cita
  - `reason`: Motivo de consulta
  - `veterinarianId`: Opcional, se asigna después

**Relaciones**:
- N:1 con Pet (mascota que será atendida)
- N:1 con User (cliente que agenda)
- N:1 con User (veterinario asignado)
- 1:1 con Diagnosis (opcional, después de la cita)

### 4. **Diagnosis** (Diagnóstico)
- **Propósito**: Historial médico y diagnósticos
- **Campos clave**:
  - `description`: Diagnóstico del veterinario
  - `prescription`: Receta médica
  - `files`: Array de URLs (PDF, imágenes desde Cloudinary)

**Relaciones**:
- N:1 con Pet (historial médico)
- N:1 con User (veterinario que realiza el diagnóstico)
- 1:1 con Appointment (opcional, diagnóstico post-cita)

### 5. **Product** (Producto)
- **Propósito**: Catálogo de productos de la tienda
- **Campos clave**:
  - `price`: Precio del producto
  - `stock`: Inventario disponible
  - `isActive`: Para activar/desactivar productos

**Relaciones**:
- 1:N con OrderItem (productos en órdenes)

### 6. **Order** (Orden de Compra)
- **Propósito**: Gestión de compras
- **Estados**: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
- **Campos clave**:
  - `total`: Total calculado de la orden

**Relaciones**:
- N:1 con User (cliente que compra)
- 1:N con OrderItem (productos de la orden)
- 1:1 con Payment (información de pago)

### 7. **OrderItem** (Artículo de Orden)
- **Propósito**: Detalle de productos en cada orden
- **Campos clave**:
  - `quantity`: Cantidad comprada
  - `price`: Precio al momento de compra (snapshot)

### 8. **Payment** (Pago)
- **Propósito**: Información de transacciones
- **Campos clave**:
  - `transactionId`: ID de Stripe/MercadoPago
  - `paymentMethod`: Tarjeta, transferencia, etc.
  - `status`: Estado del pago

## Características del Diseño

### ✅ Buenas Prácticas Implementadas:
1. **IDs con CUID**: Más seguros que autoincrement
2. **Timestamps automáticos**: createdAt y updatedAt
3. **Enums tipados**: Para estados y roles
4. **Cascade deletes**: Limpieza automática de datos relacionados
5. **Campos opcionales**: Flexibilidad en el modelo
6. **Índices únicos**: email para usuarios
7. **Separación de concerns**: OrderItem separa productos de órdenes

### 🔄 Relaciones Clave:
- **User como cliente y veterinario**: Un user puede ser ambos roles
- **Appointment conecta todo**: Pet, User cliente, User veterinario
- **Diagnosis independiente**: Puede existir sin appointment
- **OrderItem como snapshot**: Preserva precio al momento de compra

### 📁 Archivos de Cloudinary:
- User.photo (foto de perfil)
- Pet.photo (foto de mascota)
- Product.image (imagen de producto)
- Diagnosis.files (array de archivos médicos)

Este diseño permite escalabilidad y mantiene la integridad referencial mientras proporciona flexibilidad para futuras funcionalidades.