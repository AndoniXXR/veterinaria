import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Auth components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import VetDashboardPage from './pages/VetDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProductsPage from './pages/ProductsPage';
import PetsPage from './pages/PetsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CheckoutPage from './pages/CheckoutPage';
import VetCalendarPage from './pages/VetCalendarPage';
import DiagnosisPage from './pages/DiagnosisPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminVeterinariansPage from './pages/AdminVeterinariansPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminConfigPage from './pages/AdminConfigPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ServiciosPage from './pages/ServiciosPage';
import OrdersPage from './pages/OrdersPage';
import VetPatientsPage from './pages/VetPatientsPage';
import ContactPage from './pages/ContactPage';

// Layout wrapper component
const Layout = ({ children, showFooter = true }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      {children}
    </main>
    {showFooter && <Footer />}
  </div>
);

// Auth layout (no header/footer)
const AuthLayout = ({ children }) => (
  <div className="min-h-screen">
    {children}
  </div>
);

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <Layout>
                  <HomePage />
                </Layout>
              } />
              
              <Route path="/productos" element={
                <Layout>
                  <ProductsPage />
                </Layout>
              } />
              
              <Route path="/servicios" element={
                <Layout>
                  <ServiciosPage />
                </Layout>
              } />
              
              <Route path="/contacto" element={
                <Layout>
                  <ContactPage />
                </Layout>
              } />

              {/* Auth routes */}
              <Route path="/login" element={
                <AuthLayout>
                  <LoginForm />
                </AuthLayout>
              } />
              
              <Route path="/register" element={
                <AuthLayout>
                  <RegisterForm />
                </AuthLayout>
              } />
              
              <Route path="/forgot-password" element={
                <AuthLayout>
                  <ForgotPasswordForm />
                </AuthLayout>
              } />
              
              <Route path="/reset-password" element={
                <AuthLayout>
                  <ResetPasswordForm />
                </AuthLayout>
              } />

              {/* Protected routes for USER role */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/mascotas" element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <Layout>
                    <PetsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/citas" element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <Layout>
                    <AppointmentsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/checkout" element={
                <Layout>
                  <CheckoutPage />
                </Layout>
              } />
              
              <Route path="/ordenes" element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <Layout>
                    <OrdersPage />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Protected routes for VETERINARIAN role */}
              <Route path="/vet" element={
                <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                  <Layout>
                    <VetDashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/vet/calendario" element={
                <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                  <Layout>
                    <VetCalendarPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/vet/diagnosticos" element={
                <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                  <Layout>
                    <DiagnosisPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/vet/pacientes" element={
                <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                  <Layout>
                    <VetPatientsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/vet/*" element={
                <ProtectedRoute allowedRoles={['VETERINARIAN']}>
                  <Layout>
                    <div className="container py-8">
                      <h1 className="text-2xl font-bold mb-4">Panel Veterinario</h1>
                      <p className="text-neutral-600">Funcionalidades de veterinario en desarrollo...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Protected routes for ADMIN role */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminDashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/usuarios" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminUsersPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/veterinarios" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminVeterinariansPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/productos" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminProductsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/ordenes" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminOrdersPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/configuracion" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminConfigPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/reportes" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminReportsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <div className="container py-8">
                      <h1 className="text-2xl font-bold mb-4">Panel Administrativo</h1>
                      <p className="text-neutral-600">Funcionalidades de administrador en desarrollo...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Redirect legacy routes */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              
              {/* 404 page */}
              <Route path="*" element={
                <Layout showFooter={false}>
                  <NotFoundPage />
                </Layout>
              } />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;