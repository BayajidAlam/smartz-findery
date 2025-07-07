// hooks/useCheckoutData.js
import { useState, useEffect } from 'react';

export const useCheckoutData = () => {
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('checkoutData');
    if (storedData) {
      setCheckoutData(JSON.parse(storedData));
    }
  }, []);

  const updateCheckoutData = (data) => {
    setCheckoutData(data);
    localStorage.setItem('checkoutData', JSON.stringify(data));
  };

  const clearCheckoutData = () => {
    setCheckoutData(null);
    localStorage.removeItem('checkoutData');
  };

  return {
    checkoutData,
    updateCheckoutData,
    clearCheckoutData
  };
};

// utils/stripe.js
export const createPaymentIntent = async (amount, currency = 'bdt') => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit
        currency,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (stripe, elements, clientSecret, billingDetails) => {
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        payment_method_data: {
          billing_details: billingDetails,
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      throw error;
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// utils/validation.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateCustomerDetails = (details) => {
  const errors = {};

  if (!details.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!details.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!details.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(details.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!details.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(details.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!details.address?.trim()) {
    errors.address = 'Address is required';
  }

  if (!details.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!details.zipCode?.trim()) {
    errors.zipCode = 'ZIP code is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// types/checkout.js (if using TypeScript, convert to .ts)
export const CHECKOUT_STEPS = {
  CUSTOMER_DETAILS: 1,
  PAYMENT: 2,
  CONFIRMATION: 3
};

export const PAYMENT_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Example customer details structure
export const defaultCustomerDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Bangladesh',
  zipCode: ''
};

// contexts/CheckoutContext.js
import React, { createContext, useContext, useReducer } from 'react';

const CheckoutContext = createContext();

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CHECKOUT_DATA':
      return {
        ...state,
        checkoutData: action.payload
      };
    
    case 'SET_CUSTOMER_DETAILS':
      return {
        ...state,
        customerDetails: action.payload
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    
    case 'SET_PAYMENT_STATUS':
      return {
        ...state,
        paymentStatus: action.payload
      };
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      };
    
    case 'CLEAR_CHECKOUT':
      return {
        ...initialState
      };
    
    default:
      return state;
  }
};

const initialState = {
  checkoutData: null,
  customerDetails: defaultCustomerDetails,
  currentStep: CHECKOUT_STEPS.CUSTOMER_DETAILS,
  paymentStatus: PAYMENT_STATUS.IDLE,
  errors: {}
};

export const CheckoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const setCheckoutData = (data) => {
    dispatch({ type: 'SET_CHECKOUT_DATA', payload: data });
  };

  const setCustomerDetails = (details) => {
    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details });
  };

  const setCurrentStep = (step) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const setPaymentStatus = (status) => {
    dispatch({ type: 'SET_PAYMENT_STATUS', payload: status });
  };

  const setErrors = (errors) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  };

  const clearCheckout = () => {
    dispatch({ type: 'CLEAR_CHECKOUT' });
  };

  return (
    <CheckoutContext.Provider
      value={{
        ...state,
        setCheckoutData,
        setCustomerDetails,
        setCurrentStep,
        setPaymentStatus,
        setErrors,
        clearCheckout
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};