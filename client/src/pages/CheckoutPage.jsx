import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';
import { 
  FaShoppingCart, 
  FaLock, 
  FaUser, 
  FaCreditCard, 
  FaCheck, 
  FaArrowLeft,
  FaSpinner,
  FaHome
} from 'react-icons/fa';

// Simple Stripe Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'Arial, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useApp();
  const { user } = useAuth();
  
  const [customerDetails, setCustomerDetails] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'BD',
    zipCode: ''
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  const calculateTotals = () => {
    let subtotal = 0;
    let vatTotal = 0;

    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      if (item.hasVat || item.vat > 0 || (item.priceText && item.priceText.includes('+VAT'))) {
        vatTotal += itemTotal * 0.15;
      }
    });

    return { subtotal, vatTotal, total: subtotal + vatTotal };
  };

  const { subtotal, vatTotal, total } = calculateTotals();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (field, value) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateCustomerDetails = () => {
    const newErrors = {};

    if (!customerDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!customerDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(customerDetails.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!customerDetails.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!customerDetails.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!customerDetails.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (validateCustomerDetails()) {
      try {
        const orderData = {
          userId: user?._id || user?.id,
          customerDetails,
          items: cartItems.map(item => ({
            productId: item._id || item.id,
            name: item.name || item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image || item.imageUrl
          })),
          subtotal,
          vatTotal,
          total,
          paymentMethod: 'stripe',
          status: 'pending'
        };

        const order = await apiClient.createOrder(orderData);
        setCurrentOrder(order);

        const paymentIntent = await apiClient.createPaymentIntent(total, 'usd', order._id);
        
        if (!paymentIntent.clientSecret) {
          throw new Error('Failed to create payment intent');
        }

        setClientSecret(paymentIntent.clientSecret);
        setCurrentStep(2);
      } catch (error) {
        setErrors({ general: 'Failed to create order. Please try again.' });
        console.error('Order creation error:', error);
      }
    }
  };

  const handleBackToDetails = () => {
    setCurrentStep(1);
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      setErrors({ payment: 'Payment system not ready. Please try again.' });
      return;
    }

    setIsProcessing(true);
    setErrors({});

    const cardElement = elements.getElement(CardElement);

    try {
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
              country: customerDetails.country,
            },
          },
        },
      });

      if (error) {
        setErrors({ payment: error.message });
        console.error('Payment failed:', error);
      } else if (paymentIntent.status === 'succeeded') {
        try {
          await apiClient.confirmPayment(paymentIntent.id, currentOrder._id);
          clearCart();
          alert('Payment successful! Your order has been placed.');
          navigate('/');
        } catch (confirmError) {
          console.error('Payment confirmation error:', confirmError);
          setErrors({ payment: 'Payment succeeded but order confirmation failed. Please contact support.' });
        }
      } else {
        setErrors({ payment: 'Payment was not completed. Please try again.' });
      }
    } catch (error) {
      setErrors({ payment: 'An unexpected error occurred. Please try again.' });
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#666',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            <FaHome style={{ marginRight: '8px' }} />
            Back to Store
          </button>
          
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Checkout</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', color: '#28a745' }}>
            <FaLock style={{ marginRight: '8px' }} />
            <span style={{ fontSize: '14px' }}>Secure</span>
          </div>
        </div>
        
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: currentStep >= 1 ? '#dc2626' : '#999'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 1 ? '#dc2626' : '#ddd',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>Details</span>
          </div>
          
          <div style={{ 
            width: '60px', 
            height: '2px', 
            backgroundColor: currentStep >= 2 ? '#dc2626' : '#ddd',
            margin: '0 20px'
          }}></div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: currentStep >= 2 ? '#dc2626' : '#999'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 2 ? '#dc2626' : '#ddd',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>Payment</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
          
          {/* Main Content */}
          <div>
            {currentStep === 1 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <FaUser style={{ marginRight: '12px', color: '#dc2626' }} />
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Customer Information</h2>
                </div>
                
                {errors.general && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fee', 
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    color: '#c33'
                  }}>
                    {errors.general}
                  </div>
                )}
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: errors.firstName ? '2px solid #dc2626' : '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: errors.firstName ? '#fee' : 'white'
                        }}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: errors.lastName ? '2px solid #dc2626' : '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: errors.lastName ? '#fee' : 'white'
                        }}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.email ? '2px solid #dc2626' : '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: errors.email ? '#fee' : 'white'
                      }}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.phone ? '2px solid #dc2626' : '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: errors.phone ? '#fee' : 'white'
                      }}
                      placeholder="+8801XXXXXXXXX"
                    />
                    {errors.phone && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      value={customerDetails.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.address ? '2px solid #dc2626' : '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: errors.address ? '#fee' : 'white'
                      }}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: errors.city ? '2px solid #dc2626' : '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: errors.city ? '#fee' : 'white'
                        }}
                        placeholder="Dhaka"
                      />
                      {errors.city && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                        Country
                      </label>
                      <select
                        value={customerDetails.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="India">India</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: errors.zipCode ? '2px solid #dc2626' : '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '16px',
                          backgroundColor: errors.zipCode ? '#fee' : 'white'
                        }}
                        placeholder="12345"
                      />
                      {errors.zipCode && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Continue to Payment
                    <FaCreditCard style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FaCreditCard style={{ marginRight: '12px', color: '#dc2626' }} />
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Payment Information</h2>
                  </div>
                  <button
                    onClick={handleBackToDetails}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}
                  >
                    <FaArrowLeft style={{ marginRight: '6px' }} />
                    Edit Details
                  </button>
                </div>

                {/* Customer Summary */}
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    Shipping Address:
                  </h3>
                  <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: '500' }}>{customerDetails.firstName} {customerDetails.lastName}</div>
                    <div>{customerDetails.address}</div>
                    <div>{customerDetails.city}, {customerDetails.zipCode}, {customerDetails.country}</div>
                    <div>{customerDetails.phone}</div>
                  </div>
                </div>

                {/* Stripe Payment Form */}
                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#333' }}>
                    <FaLock style={{ marginRight: '8px', color: '#28a745' }} />
                    Card Information
                  </label>
                  <div style={{ 
                    padding: '16px', 
                    border: '1px solid #ddd', 
                    borderRadius: '6px',
                    backgroundColor: 'white'
                  }}>
                    <CardElement options={cardElementOptions} />
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                    <FaLock style={{ marginRight: '4px', color: '#28a745' }} />
                    Your payment is secured with SSL encryption
                  </p>

                  {errors.payment && (
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#fee', 
                      border: '1px solid #fcc',
                      borderRadius: '4px',
                      marginTop: '16px',
                      color: '#c33'
                    }}>
                      {errors.payment}
                    </div>
                  )}

                  <button
                    onClick={handleStripePayment}
                    disabled={isProcessing || !stripe}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: isProcessing ? '#ccc' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FaCheck style={{ marginRight: '8px' }} />
                        Pay ${total.toFixed(2)} USD
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333', display: 'flex', alignItems: 'center' }}>
              <FaShoppingCart style={{ marginRight: '8px', color: '#dc2626' }} />
              Order Summary
            </h3>
            
            {/* Items */}
            <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id || item._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.name || item.title}
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '6px',
                      objectFit: 'cover',
                      marginRight: '12px'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/50x50/E0E0E0/333333?text=No+Image';
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                      {item.name || item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>Subtotal ({cartItems.length} items)</span>
                <span style={{ color: '#333', fontWeight: '500' }}>${subtotal.toFixed(2)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>VAT (15%)</span>
                <span style={{ color: '#333', fontWeight: '500' }}>${vatTotal.toFixed(2)}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #eee',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                <span style={{ color: '#333' }}>Total</span>
                <span style={{ color: '#dc2626' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Security Notice */}
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              backgroundColor: '#f0f8f0', 
              borderRadius: '6px',
              border: '1px solid #d4edda'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#28a745' }}>
                <FaLock style={{ marginRight: '6px' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Secure Checkout</div>
                  <div>SSL encrypted & PCI compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage