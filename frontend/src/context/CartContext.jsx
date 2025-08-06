import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity: Math.min(quantity, product.stock) }];
      }
      
      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      const newItems = state.items.filter(item => item.product.id !== productId);
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      }
      
      const newItems = state.items.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(quantity, item.product.stock) };
        }
        return item;
      });
      
      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case CART_ACTIONS.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen
      };
    
    case CART_ACTIONS.LOAD_CART:
      const totals = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        ...totals
      };
    
    default:
      return state;
  }
};

// Helper function to calculate totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  return { totalItems, totalPrice };
};

// Create context
const CartContext = createContext();

// Context provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('veterinaria_cart');
      if (savedCart && savedCart !== 'undefined') {
        const cartItems = JSON.parse(savedCart);
        if (Array.isArray(cartItems) && cartItems.length > 0) {
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartItems });
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('veterinaria_cart');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('veterinaria_cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Add item to cart
  const addItem = (product, quantity = 1) => {
    if (!product || !product.id) {
      toast.error('Producto inválido');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Producto agotado');
      return;
    }

    const existingItem = state.items.find(item => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });
    
    toast.success(`${product.name} agregado al carrito`);
  };

  // Remove item from cart
  const removeItem = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: productId
    });
    
    toast.success('Producto eliminado del carrito');
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    const item = state.items.find(item => item.product.id === productId);
    
    if (!item) return;
    
    if (quantity > item.product.stock) {
      toast.error(`Solo hay ${item.product.stock} unidades disponibles`);
      return;
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Carrito vaciado');
  };

  // Toggle cart sidebar
  const toggleCart = () => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART });
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product.id === productId);
  };

  // Get cart summary for checkout
  const getCartSummary = () => {
    return {
      items: state.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name
      })),
      totalItems: state.totalItems,
      totalPrice: state.totalPrice
    };
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  // Context value
  const value = {
    // State
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    isOpen: state.isOpen,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    
    // Helper functions
    getItemQuantity,
    isInCart,
    getCartSummary,
    formatPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default CartContext;