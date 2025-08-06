# Estructura del Proyecto - Veterinaria

## Estructura General
```
veterinaria/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── cloudinary.js
│   │   │   └── stripe.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── petController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── diagnosisController.js
│   │   │   ├── productController.js
│   │   │   └── orderController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleCheck.js
│   │   │   ├── upload.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── pets.js
│   │   │   ├── appointments.js
│   │   │   ├── diagnosis.js
│   │   │   ├── products.js
│   │   │   └── orders.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── emailService.js
│   │   │   ├── paymentService.js
│   │   │   └── uploadService.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── bcrypt.js
│   │   │   └── validators.js
│   │   └── app.js
│   ├── package.json
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── user/
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── PetCard.jsx
│   │   │   │   └── AppointmentCard.jsx
│   │   │   ├── vet/
│   │   │   │   ├── Calendar.jsx
│   │   │   │   ├── DiagnosisForm.jsx
│   │   │   │   └── PatientHistory.jsx
│   │   │   ├── admin/
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── ProductManagement.jsx
│   │   │   │   └── OrderManagement.jsx
│   │   │   └── shop/
│   │   │       ├── ProductCard.jsx
│   │   │       ├── Cart.jsx
│   │   │       └── Checkout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Pets.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── VetDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── PetContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   └── useLocalStorage.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── petService.js
│   │   │   ├── appointmentService.js
│   │   │   └── shopService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Descripción de Carpetas

### Backend
- **prisma/**: Configuración de la base de datos y migraciones
- **config/**: Configuraciones de servicios externos (DB, Cloudinary, Stripe)
- **controllers/**: Lógica de controladores para cada entidad
- **middleware/**: Middlewares de autenticación, autorización y validación
- **routes/**: Definición de rutas del API
- **services/**: Servicios para lógica de negocio compleja
- **utils/**: Utilidades y helpers

### Frontend
- **components/**: Componentes React organizados por funcionalidad
  - **common/**: Componentes reutilizables
  - **auth/**: Componentes de autenticación
  - **user/**: Componentes específicos del usuario
  - **vet/**: Componentes específicos del veterinario
  - **admin/**: Componentes de administración
  - **shop/**: Componentes de la tienda
- **pages/**: Páginas principales de la aplicación
- **context/**: Context providers para estado global
- **hooks/**: Custom hooks
- **services/**: Servicios para comunicación con API
- **utils/**: Utilidades y constantes

## Tecnologías por Carpeta

### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT para autenticación
- Cloudinary para imágenes
- Stripe/MercadoPago para pagos

### Frontend
- React.js
- Tailwind CSS
- Formik para formularios
- FullCalendar para calendario
- Axios para HTTP requests