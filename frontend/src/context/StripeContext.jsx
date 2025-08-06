import React, { createContext, useContext } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Cargar Stripe con la clave pública
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef'); // Reemplazar con la clave real

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0f172a',
      colorBackground: '#ffffff',
      colorText: '#262626',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    appearance,
    locale: 'es',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeContext.Provider value={{}}>
        {children}
      </StripeContext.Provider>
    </Elements>
  );
};

export default StripeProvider;