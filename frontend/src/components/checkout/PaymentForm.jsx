import React, { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  AddressElement 
} from '@stripe/react-stripe-js';
import { FiCreditCard, FiLoader, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PaymentForm = ({ 
  clientSecret, 
  orderData, 
  onPaymentSuccess, 
  onPaymentError,
  loading: externalLoading 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!paymentElementReady) {
      toast.error('El formulario de pago aún se está cargando');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        console.error('Stripe payment error:', stripeError);
        setError(stripeError.message);
        onPaymentError(stripeError);
        toast.error(stripeError.message || 'Error al procesar el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess(paymentIntent);
        toast.success('¡Pago procesado exitosamente!');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('Error inesperado al procesar el pago');
      onPaymentError(err);
      toast.error('Error inesperado al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    },
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
  };

  const addressElementOptions = {
    mode: 'billing',
    allowedCountries: ['GT', 'US', 'MX'],
    blockPoBox: true,
    fields: {
      phone: 'always',
    },
    validation: {
      phone: {
        required: 'always',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Información de Pago
        </h2>
        <p className="text-neutral-600">
          Completa tu información de pago para finalizar el pedido
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-600 mr-2" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error en el pago</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Address Element for billing address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">
            Dirección de Facturación
          </h3>
          <div className="p-4 border border-neutral-200 rounded-lg">
            <AddressElement 
              options={addressElementOptions}
              onChange={(event) => {
                if (event.complete) {
                  console.log('Address completed:', event.value);
                }
              }}
            />
          </div>
        </div>

        {/* Payment Element */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">
            Método de Pago
          </h3>
          <div className="p-4 border border-neutral-200 rounded-lg">
            <PaymentElement
              options={paymentElementOptions}
              onReady={() => {
                setPaymentElementReady(true);
                console.log('PaymentElement is ready');
              }}
              onChange={(event) => {
                if (event.error) {
                  setError(event.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
        </div>

        {/* Order Summary */}
        {orderData && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">
              Resumen del Pedido
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="text-neutral-900">
                  ${orderData.total?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Envío:</span>
                <span className="text-green-600">Gratis</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-900">Total:</span>
                  <span className="text-primary-600">
                    ${orderData.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || !paymentElementReady || loading || externalLoading}
          className={`w-full btn btn-lg flex items-center justify-center ${
            loading || externalLoading || !paymentElementReady
              ? 'btn-outline opacity-50 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {(loading || externalLoading) ? (
            <>
              <FiLoader className="animate-spin mr-2" size={20} />
              Procesando Pago...
            </>
          ) : (
            <>
              <FiCreditCard className="mr-2" size={20} />
              Pagar ${orderData?.total?.toFixed(2) || '0.00'}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-neutral-500">
            🔒 Tu información de pago está protegida con encriptación SSL.
            <br />
            Procesado de forma segura por Stripe.
          </p>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;