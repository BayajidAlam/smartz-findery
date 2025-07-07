import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  PaymentElement
} from '@stripe/react-stripe-js';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

const StripePaymentForm = ({ 
  amount, 
  customerDetails, 
  onPaymentSuccess, 
  onPaymentError,
  isProcessing,
  setIsProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'bdt',
            metadata: {
              customerEmail: customerDetails.email,
              customerName: `${customerDetails.firstName} ${customerDetails.lastName}`
            }
          }),
        });

        const { clientSecret, error } = await response.json();
        
        if (error) {
          setPaymentError(error.message);
        } else {
          setClientSecret(clientSecret);
        }
      } catch (error) {
        setPaymentError('Failed to initialize payment. Please try again.');
      }
    };

    if (amount && customerDetails.email) {
      createPaymentIntent();
    }
  }, [amount, customerDetails.email]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerDetails.firstName} ${customerDetails.lastName}`,
            email: customerDetails.email,
            phone: customerDetails.phone,
            address: {
              line1: customerDetails.address,
              city: customerDetails.city,
              postal_code: customerDetails.zipCode,
              country: customerDetails.country === 'Bangladesh' ? 'BD' : 'US',
            },
          },
        },
      });

      if (error) {
        setPaymentError(error.message);
        onPaymentError(error);
      } else if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      setPaymentError('An unexpected error occurred. Please try again.');
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="p-3 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{paymentError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay BDT ${amount.toFixed(2)}`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted
      </div>
    </form>
  );
};

export default StripePaymentForm;
