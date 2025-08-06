import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiShoppingCart, FiCheck, FiArrowLeft, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart, formatPrice } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneBackup: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Payment info
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Order notes
    notes: ''
  });

  // Auto-fill form data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        cardName: user.name || ''
      }));
    }
  }, [isAuthenticated, user]);

  // formatPrice is already provided by useCart context

  const handleInputChange = (field, value) => {
    // Format phone numbers for Guatemala (8 digits)
    if (field === 'phone' || field === 'phoneBackup') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 8 digits
      const limitedDigits = digitsOnly.slice(0, 8);
      // Format as XXXX-XXXX
      let formattedValue = limitedDigits;
      if (limitedDigits.length > 4) {
        formattedValue = `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4)}`;
      }
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validatePhoneNumber = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 8;
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        const basicFieldsValid = formData.firstName && formData.lastName && formData.email && 
                                 formData.phone && formData.address && formData.city;
        const phoneValid = validatePhoneNumber(formData.phone);
        const phoneBackupValid = !formData.phoneBackup || validatePhoneNumber(formData.phoneBackup);
        return basicFieldsValid && phoneValid && phoneBackupValid;
      case 2:
        return formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardName;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Processing order:', formData);
    // Aquí procesarías el pago y crearías la orden
    clearCart();
    setStep(4); // Success step
  };

  const shippingCost = 0; // Free shipping
  const tax = totalPrice * 0.1; // 10% tax
  const total = totalPrice + shippingCost + tax;

  // Show empty cart message
  if (items.length === 0 && step !== 4) {
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

  // Show login prompt for non-authenticated users
  if (!isAuthenticated && step !== 4) {
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
                Necesitas estar registrado para completar tu compra y gestionar tus pedidos.
              </p>
              <div className="space-y-3">
                <Link to="/login" className="w-full btn btn-primary">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="w-full btn btn-outline">
                  Crear Cuenta
                </Link>
                <Link to="/productos" className="text-sm text-neutral-500 hover:text-neutral-700">
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="mt-6 card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-neutral-900">
                Resumen del pedido ({items.length} productos)
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between font-semibold text-neutral-900">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNumber) => (
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
          {stepNumber < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              stepNumber < step ? 'bg-green-500' : 'bg-neutral-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Apellidos *</label>
          <input
            type="text"
            className="input"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Tus apellidos"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          className="input"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="tu@email.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Teléfono Principal *</label>
          <input
            type="tel"
            className={`input ${!validatePhoneNumber(formData.phone) && formData.phone ? 'border-red-300 focus:border-red-500' : ''}`}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="1234-5678"
            maxLength="9"
          />
          {!validatePhoneNumber(formData.phone) && formData.phone && (
            <p className="text-sm text-red-600 mt-1">El teléfono debe tener 8 dígitos</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Teléfono de Respaldo (Opcional)</label>
          <input
            type="tel"
            className={`input ${formData.phoneBackup && !validatePhoneNumber(formData.phoneBackup) ? 'border-red-300 focus:border-red-500' : ''}`}
            value={formData.phoneBackup}
            onChange={(e) => handleInputChange('phoneBackup', e.target.value)}
            placeholder="1234-5678"
            maxLength="9"
          />
          {formData.phoneBackup && !validatePhoneNumber(formData.phoneBackup) && (
            <p className="text-sm text-red-600 mt-1">El teléfono debe tener 8 dígitos</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Dirección *</label>
        <input
          type="text"
          className="input"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Calle, número, apartamento"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">Ciudad *</label>
          <input
            type="text"
            className="input"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Ciudad"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <input
            type="text"
            className="input"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Estado"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Código Postal</label>
          <input
            type="text"
            className="input"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="12345"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Información de Pago
        </h2>
        <p className="text-neutral-600">
          Ingresa los datos de tu tarjeta de crédito o débito
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Número de Tarjeta *</label>
        <input
          type="text"
          className="input"
          value={formData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Fecha de Vencimiento *</label>
          <input
            type="text"
            className="input"
            value={formData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            placeholder="MM/AA"
            maxLength="5"
          />
        </div>
        <div className="form-group">
          <label className="form-label">CVV *</label>
          <input
            type="text"
            className="input"
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            placeholder="123"
            maxLength="4"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Nombre en la Tarjeta *</label>
        <input
          type="text"
          className="input"
          value={formData.cardName}
          onChange={(e) => handleInputChange('cardName', e.target.value)}
          placeholder="Nombre como aparece en la tarjeta"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Notas del Pedido (Opcional)</label>
        <textarea
          className="input min-h-[100px] resize-none"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Instrucciones especiales para la entrega..."
        />
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Revisar Pedido
        </h2>
        <p className="text-neutral-600">
          Verifica que toda la información sea correcta antes de finalizar
        </p>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Productos</h3>
        </div>
        <div className="card-body space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🐶</span>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{item.product.name}</h4>
                  <p className="text-sm text-neutral-600">Cantidad: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-neutral-900">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Dirección de Envío</h3>
        </div>
        <div className="card-body">
          <div className="text-sm text-neutral-900">
            <div>{formData.firstName} {formData.lastName}</div>
            <div>{formData.address}</div>
            <div>{formData.city}, {formData.state} {formData.zipCode}</div>
            <div>Teléfono: {formData.phone}</div>
            {formData.phoneBackup && (
              <div>Teléfono de respaldo: {formData.phoneBackup}</div>
            )}
            <div>{formData.email}</div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Método de Pago</h3>
        </div>
        <div className="card-body">
          <div className="text-sm text-neutral-900">
            <div>Tarjeta terminada en ****{formData.cardNumber.slice(-4)}</div>
            <div>{formData.cardName}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-16">
      <div className="text-8xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ¡Pedido Confirmado!
      </h1>
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

  return (
    <div className="container py-8">
      {step !== 4 && (
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

      {step !== 4 && renderStepIndicator()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && renderShippingForm()}
          {step === 2 && renderPaymentForm()}
          {step === 3 && renderReview()}
          {step === 4 && renderSuccess()}
        </div>

        {/* Order Summary - Only show if not success step */}
        {step !== 4 && (
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="card-header">
                <h3 className="font-semibold text-neutral-900 flex items-center">
                  <FiShoppingCart className="mr-2" size={16} />
                  Resumen del Pedido
                </h3>
              </div>
              <div className="card-body space-y-4">
                {/* Items */}
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

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      className={`w-full btn ${
                        validateStep(step) ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!validateStep(step)}
                    >
                      {step === 1 ? 'Continuar al Pago' : 'Revisar Pedido'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="w-full btn btn-primary btn-lg"
                    >
                      <FiCreditCard className="mr-2" size={16} />
                      Finalizar Pedido
                    </button>
                  )}

                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="w-full btn btn-outline"
                    >
                      Volver
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;