import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Validation schema
const loginSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Contraseña es requerida')
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state
  const from = location.state?.from || '/dashboard';
  const loginMessage = location.state?.message;

  const initialValues = {
    email: '',
    password: ''
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoginError(''); // Clear previous errors
      const result = await login(values);
      
      // Redirect based on user role
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (result.user.role === 'VETERINARIAN') {
        navigate('/vet');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Handle specific validation errors
      if (error.response?.data?.error?.details) {
        error.response.data.error.details.forEach(detail => {
          setFieldError(detail.field, detail.message);
        });
      } else {
        // Handle general authentication errors
        let errorMessage = 'Los datos ingresados no son correctos';
        
        if (error.response?.status === 401) {
          errorMessage = 'Email o contraseña incorrectos. Por favor, verifica que hayas escrito correctamente tu información.';
        } else if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        }
        
        setLoginError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">🐶</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">
            Iniciar Sesión
          </h2>
          {loginMessage ? (
            <p className="mt-2 text-sm text-primary-600 font-medium">
              {loginMessage}
            </p>
          ) : (
            <p className="mt-2 text-sm text-neutral-600">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          )}
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body">
            {/* Error message */}
            {loginError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      {loginError}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Email field */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`input pl-10 ${
                          errors.email && touched.email ? 'input-error' : ''
                        }`}
                        placeholder="tu@email.com"
                      />
                    </div>
                    <ErrorMessage 
                      name="email" 
                      component="div" 
                      className="form-error" 
                    />
                  </div>

                  {/* Password field */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`input pl-10 pr-10 ${
                          errors.password && touched.password ? 'input-error' : ''
                        }`}
                        placeholder="Tu contraseña"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                        ) : (
                          <FiEye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage 
                      name="password" 
                      component="div" 
                      className="form-error" 
                    />
                  </div>

                  {/* Forgot password link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                        Recordarme
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link 
                        to="/forgot-password" 
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full btn btn-primary btn-lg flex items-center justify-center"
                  >
                    {(isSubmitting || isLoading) ? (
                      <>
                        <div className="spinner-sm mr-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>

                  {/* Register link */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-neutral-600">
                      ¿No tienes una cuenta?{' '}
                      <Link 
                        to="/register" 
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>

                  {/* Back to products link */}
                  <div className="text-center mt-4">
                    <Link 
                      to="/productos" 
                      className="text-sm text-neutral-500 hover:text-neutral-600 transition-colors"
                    >
                      ← Volver a productos
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;