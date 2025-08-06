import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

// Validation schema
const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('Email es requerido')
});

const ForgotPasswordForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const initialValues = {
    email: ''
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await authService.requestPasswordReset(values.email);
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
      toast.success('Se ha enviado un enlace de recuperación a tu email');
    } catch (error) {
      if (error.response?.data?.error?.details) {
        error.response.data.error.details.forEach(detail => {
          setFieldError(detail.field, detail.message);
        });
      } else {
        const errorMessage = error.response?.data?.error?.message || 'Error al enviar el email de recuperación';
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Success message */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Email Enviado
            </h2>
            <p className="text-neutral-600 mb-6">
              Hemos enviado un enlace de recuperación de contraseña a:
            </p>
            <p className="text-primary-600 font-medium mb-8">
              {submittedEmail}
            </p>
            <p className="text-sm text-neutral-500 mb-8">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña. 
              Si no ves el email, revisa tu carpeta de spam.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full btn btn-primary flex items-center justify-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Link>
            
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full btn btn-secondary"
            >
              Enviar a otro email
            </button>
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
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body">
            <Formik
              initialValues={initialValues}
              validationSchema={forgotPasswordSchema}
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

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn btn-primary btn-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-sm mr-2" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Enlace de Recuperación'
                    )}
                  </button>

                  {/* Back to login */}
                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="text-sm text-neutral-600 hover:text-neutral-800 transition-colors flex items-center justify-center"
                    >
                      <FiArrowLeft className="w-4 h-4 mr-1" />
                      Volver al login
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Additional help */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-xs text-neutral-600">
              Si no tienes acceso a tu email o sigues teniendo problemas, 
              contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;