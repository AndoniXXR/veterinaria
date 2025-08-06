import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

// Validation schema
const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('Nueva contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es requerido')
});

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperación no válido');
      navigate('/forgot-password');
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        await authService.validateResetToken(token);
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        toast.error('El enlace de recuperación es inválido o ha expirado');
      }
    };

    validateToken();
  }, [token, navigate]);

  const initialValues = {
    password: '',
    confirmPassword: ''
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await authService.resetPassword(token, values.password);
      setIsSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
    } catch (error) {
      if (error.response?.data?.error?.details) {
        error.response.data.error.details.forEach(detail => {
          setFieldError(detail.field, detail.message);
        });
      } else {
        const errorMessage = error.response?.data?.error?.message || 'Error al restablecer la contraseña';
        toast.error(errorMessage);
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

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-neutral-600">Validando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Enlace Inválido
            </h2>
            <p className="text-neutral-600 mb-8">
              El enlace de recuperación es inválido o ha expirado. 
              Por favor, solicita un nuevo enlace de recuperación.
            </p>
            <Link
              to="/forgot-password"
              className="btn btn-primary"
            >
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              ¡Contraseña Restablecida!
            </h2>
            <p className="text-neutral-600 mb-8">
              Tu contraseña ha sido restablecida exitosamente. 
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link
              to="/login"
              className="w-full btn btn-primary"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body">
            <Formik
              initialValues={initialValues}
              validationSchema={resetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Password field */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        className={`input pl-10 pr-10 ${
                          errors.password && touched.password ? 'input-error' : ''
                        }`}
                        placeholder="Tu nueva contraseña"
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
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`input pl-10 pr-10 ${
                          errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''
                        }`}
                        placeholder="Confirma tu nueva contraseña"
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

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn btn-primary btn-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-sm mr-2" />
                        Restableciendo...
                      </>
                    ) : (
                      'Restablecer Contraseña'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;