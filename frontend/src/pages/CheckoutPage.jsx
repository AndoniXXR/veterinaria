import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUser, FiCheck, FiLoader, FiShoppingCart } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/checkout/PaymentForm';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

// Cargar Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

const CheckoutPage = () => {
  const { items, totalPrice, clearCart, formatPrice } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [step, setStep] = useState(1); // 1: shipping, 2: payment, 3: success
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Datos del formulario de envío
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  // Auto-rellenar con datos del usuario
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setShippingData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Validación de envío
  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    return required.every(field => shippingData[field]?.trim());
  };

  // Manejar cambios en formulario de envío
  const handleShippingChange = (field, value) => {
    if (field === 'phone') {
      // Formatear teléfono guatemalteco
      const digitsOnly = value.replace(/\D/g, '');
      const limitedDigits = digitsOnly.slice(0, 8);
      let formattedValue = limitedDigits;
      if (limitedDigits.length > 4) {
        formattedValue = `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4)}`;
      }
      setShippingData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setShippingData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Continuar al pago
  const handleContinueToPayment = async () => {
    if (!validateShipping()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      // 1. Crear la orden
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const orderResponse = await paymentService.createOrder(orderItems);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error?.message || 'Error al crear la orden');
      }

      const createdOrder = orderResponse.data;
      setOrder(createdOrder);

      // 2. Inicializar el pago y obtener client secret
      const paymentResponse = await paymentService.processPayment(createdOrder.id);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error?.message || 'Error al inicializar el pago');
      }

      setClientSecret(paymentResponse.data.clientSecret);
      setStep(2);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  // Manejar éxito del pago
  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentProcessing(true);
    try {
      // Confirmar el pago en el backend
      const confirmResponse = await paymentService.confirmOrderPayment(
        order.id, 
        paymentIntent.id
      );

      if (confirmResponse.success) {
        // Limpiar carrito y ir a éxito
        clearCart();
        setStep(3);
        toast.success('¡Pedido completado exitosamente!');
      } else {
        throw new Error('Error al confirmar el pago');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Error al confirmar el pago. Contacta soporte.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Manejar error del pago
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // El error ya se maneja en PaymentForm
  };

  // Calcular totales
  const shippingCost = 0; // Envío gratis
  const tax = totalPrice * 0.1; // 10% impuestos
  const total = totalPrice + shippingCost + tax;

  // Mostrar mensaje de carrito vacío
  if (items.length === 0 && step !== 3) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-neutral-600 mb-8">
            Agrega productos antes de proceder al checkout
          </p>
          <Link to="/productos" className="btn btn-primary">
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar solicitud de login
  if (!isAuthenticated && step !== 3) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-primary-600" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Inicia sesión para continuar
              </h2>
              <p className="text-neutral-600 mb-6">
                Necesitas estar registrado para completar tu compra.
              </p>
              <div className="space-y-3">
                <Link to="/login" className="w-full btn btn-primary">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="w-full btn btn-outline">
                  Crear Cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Indicador de pasos
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((stepNumber) => (
        <React.Fragment key={stepNumber}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            stepNumber === step
              ? 'bg-primary-600 text-white'
              : stepNumber < step
              ? 'bg-green-500 text-white'
              : 'bg-neutral-200 text-neutral-500'
          }`}>
            {stepNumber < step ? <FiCheck size={16} /> : stepNumber}
          </div>
          {stepNumber < 2 && (
            <div className={`w-16 h-1 mx-2 ${
              stepNumber < step ? 'bg-green-500' : 'bg-neutral-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Formulario de envío
  const renderShippingForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Información de Envío
        </h2>
        <p className="text-neutral-600">
          Proporciona la dirección donde quieres recibir tu pedido
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            className="input"
            value={shippingData.firstName}
            onChange={(e) => handleShippingChange('firstName', e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Apellidos *</label>
          <input
            type="text"
            className="input"
            value={shippingData.lastName}
            onChange={(e) => handleShippingChange('lastName', e.target.value)}
            placeholder="Tus apellidos"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          className="input"
          value={shippingData.email}
          onChange={(e) => handleShippingChange('email', e.target.value)}
          placeholder="tu@email.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Teléfono *</label>
        <input
          type="tel"
          className="input"
          value={shippingData.phone}
          onChange={(e) => handleShippingChange('phone', e.target.value)}
          placeholder="1234-5678"
          maxLength="9"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Dirección *</label>
        <input
          type="text"
          className="input"
          value={shippingData.address}
          onChange={(e) => handleShippingChange('address', e.target.value)}
          placeholder="Calle, número, apartamento"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">Ciudad *</label>
          <input
            type="text"
            className="input"
            value={shippingData.city}
            onChange={(e) => handleShippingChange('city', e.target.value)}
            placeholder="Ciudad"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <input
            type="text"
            className="input"
            value={shippingData.state}
            onChange={(e) => handleShippingChange('state', e.target.value)}
            placeholder="Estado"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Código Postal</label>
          <input
            type="text"
            className="input"
            value={shippingData.zipCode}
            onChange={(e) => handleShippingChange('zipCode', e.target.value)}
            placeholder="12345"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Notas del Pedido (Opcional)</label>
        <textarea
          className="input min-h-[80px] resize-none"
          value={shippingData.notes}
          onChange={(e) => handleShippingChange('notes', e.target.value)}
          placeholder="Instrucciones especiales para la entrega..."
        />
      </div>
    </div>
  );

  // Página de éxito
  const renderSuccess = () => (
    <div className="text-center py-16">
      <div className="text-8xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ¡Pedido Confirmado!
      </h1>
      <p className="text-neutral-600 mb-4">
        <strong>Número de orden:</strong> {order?.id}
      </p>
      <p className="text-neutral-600 mb-8 max-w-md mx-auto">
        Tu pedido ha sido procesado exitosamente. Recibirás un email de confirmación
        y te notificaremos cuando tu pedido esté en camino.
      </p>
      <div className="space-y-4">
        <Link to="/productos" className="btn btn-primary">
          Continuar Comprando
        </Link>
        <Link to="/pedidos" className="btn btn-outline">
          Ver Mis Pedidos
        </Link>
      </div>
    </div>
  );

  // Resumen de orden
  const renderOrderSummary = () => (
    <div className="card sticky top-8">
      <div className="card-header">
        <h3 className="font-semibold text-neutral-900 flex items-center">
          <FiShoppingCart className="mr-2" size={16} />
          Resumen del Pedido
        </h3>
      </div>
      <div className="card-body space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium text-neutral-900">{item.product.name}</div>
                <div className="text-neutral-600">Qty: {item.quantity}</div>
              </div>
              <div className="font-medium text-neutral-900">
                {formatPrice(item.product.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="text-neutral-900">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Envío</span>
            <span className="text-green-600">Gratis</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Impuestos</span>
            <span className="text-neutral-900">{formatPrice(tax)}</span>
          </div>
          <div className="border-t border-neutral-200 pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-neutral-900">Total</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <button
            onClick={handleContinueToPayment}
            className={`w-full btn ${
              validateShipping() && !loading 
                ? 'btn-primary' 
                : 'btn-outline opacity-50 cursor-not-allowed'
            }`}
            disabled={!validateShipping() || loading}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" size={16} />
                Procesando...
              </>
            ) : (
              'Continuar al Pago'
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      {step !== 3 && (
        <div className="flex items-center mb-8">
          <Link 
            to="/productos" 
            className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Volver a productos
          </Link>
        </div>
      )}

      {step !== 3 && renderStepIndicator()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && renderShippingForm()}
          
          {step === 2 && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                orderData={order}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                loading={paymentProcessing}
              />
            </Elements>
          )}
          
          {step === 3 && renderSuccess()}
        </div>

        {step !== 3 && (
          <div className="lg:col-span-1">
            {renderOrderSummary()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;