import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Validation schema
const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('Nombre es requerido'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required('Contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirmación de contraseña es requerida'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido')
    .optional(),
  address: Yup.string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional(),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
    .required('Debes aceptar los términos y condiciones')
});

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    acceptTerms: false
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Remove confirmPassword and acceptTerms before sending to API
      const { confirmPassword, acceptTerms, ...userData } = values;
      
      await register(userData);
      
      // Redirect to dashboard after successful registration
      navigate('/dashboard');
    } catch (error) {
      // Handle specific validation errors
      if (error.response?.data?.error?.details) {
        error.response.data.error.details.forEach(detail => {
          setFieldError(detail.field, detail.message);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body">
            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Name field */}
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className={`input pl-10 ${
                          errors.name && touched.name ? 'input-error' : ''
                        }`}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <ErrorMessage 
                      name="name" 
                      component="div" 
                      className="form-error" 
                    />
                  </div>

                  {/* Email field */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email *
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

                  {/* Phone field */}
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Teléfono
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        className={`input pl-10 ${
                          errors.phone && touched.phone ? 'input-error' : ''
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <ErrorMessage 
                      name="phone" 
                      component="div" 
                      className="form-error" 
                    />
                  </div>

                  {/* Address field */}
                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      Dirección
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="address"
                        name="address"
                        type="text"
                        autoComplete="address-line1"
                        className={`input pl-10 ${
                          errors.address && touched.address ? 'input-error' : ''
                        }`}
                        placeholder="Tu dirección"
                      />
                    </div>
                    <ErrorMessage 
                      name="address" 
                      component="div" 
                      className="form-error" 
                    />
                  </div>

                  {/* Password field */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
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

                  {/* Confirm Password field */}
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirmar contraseña *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={`input pl-10 pr-10 ${
                          errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''
                        }`}
                        placeholder="Confirma tu contraseña"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                        ) : (
                          <FiEye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage 
                      name="confirmPassword" 
                      component="div" 
                      className="form-error" 
                    />
                  </div>

                  {/* Terms acceptance */}
                  <div className="form-group">
                    <div className="flex items-start">
                      <Field
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        className={`mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded ${
                          errors.acceptTerms && touched.acceptTerms ? 'border-red-300' : ''
                        }`}
                      />
                      <label htmlFor="acceptTerms" className="ml-2 block text-sm text-neutral-700">
                        Acepto los{' '}
                        <Link 
                          to="/terminos" 
                          className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                          target="_blank"
                        >
                          términos y condiciones
                        </Link>
                        {' '}y la{' '}
                        <Link 
                          to="/privacidad" 
                          className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                          target="_blank"
                        >
                          política de privacidad
                        </Link>
                      </label>
                    </div>
                    <ErrorMessage 
                      name="acceptTerms" 
                      component="div" 
                      className="form-error mt-1" 
                    />
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
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </button>

                  {/* Login link */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-neutral-600">
                      ¿Ya tienes una cuenta?{' '}
                      <Link 
                        to="/login" 
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        Inicia sesión aquí
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

export default RegisterForm;