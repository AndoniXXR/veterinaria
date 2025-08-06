import React from 'react';
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, formatPrice } = useCart();
  const navigate = useNavigate();

  // formatPrice is already provided by useCart context

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <FiShoppingCart className="text-neutral-600" size={20} />
            <h2 className="text-lg font-semibold text-neutral-900">
              Carrito ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length > 0 ? (
            <div className="p-6 space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🐶</span>
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-900 mb-1 line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-neutral-500 mb-2">
                      Producto veterinario
                    </p>
                    <div className="text-sm font-semibold text-primary-600">
                      {formatPrice(item.product.price)}
                    </div>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Eliminar del carrito"
                    >
                      <FiTrash2 size={14} />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <FiMinus size={12} />
                      </button>
                      
                      <span className="w-8 text-center text-sm font-medium text-neutral-900">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    
                    <div className="text-sm font-medium text-neutral-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Cart */
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-neutral-600 mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <button
                onClick={onClose}
                className="btn btn-primary"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 p-6 bg-neutral-50">
            {/* Subtotal */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="border-t border-neutral-200 pt-2">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full btn btn-primary btn-lg"
            >
              Proceder al Pago
            </button>
            
            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full mt-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;