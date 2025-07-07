import React, { useState, useEffect } from 'react';

// Mock useApp hook - replace with your actual context
const useApp = () => ({
  cartItems: [
    {
      id: 'prod-001',
      name: 'FILA Casual Shirt',
      price: 2000,
      quantity: 1,
      image: 'https://via.placeholder.com/80x80',
      hasVat: false
    },
    {
      id: 'prod-004',
      name: 'beyerdynamic-300 Wireless Headphones',
      price: 1500,
      quantity: 2,
      image: 'https://via.placeholder.com/80x80',
      hasVat: true
    }
  ]
});

// Mock CartItem component - replace with your actual component
const CartItem = ({ item }) => (
  <div className="cart-item">
    <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
    <div className="cart-item-details">
      <h4>{item.name}</h4>
      <p>BDT {item.price.toFixed(2)} each</p>
    </div>
    <div className="cart-item-quantity">
      <button>-</button>
      <input type="number" value={item.quantity} min="1" readOnly />
      <button>+</button>
    </div>
    <span className="cart-item-total-price">BDT {(item.price * item.quantity).toFixed(2)}</span>
    <button className="remove-item-btn">×</button>
  </div>
);

const CartModal = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { cartItems } = useApp();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDiscountCode('');
      setAppliedDiscount(0);
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && event.target.classList.contains('cart-container')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let vatTotal = 0;

    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      if (item.hasVat || item.vat > 0) {
        vatTotal += itemTotal * 0.15; // 15% VAT
      }
    });

    return { subtotal, vatTotal, total: subtotal + vatTotal };
  };

  const { subtotal, vatTotal, total } = calculateTotals();
  const finalTotal = total - appliedDiscount;

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    let discountAmount = 0;

    switch (code) {
      case 'SAVE10':
        discountAmount = subtotal * 0.10;
        break;
      case 'SAVE50':
        discountAmount = subtotal * 0.50;
        break;
      case 'WELCOME20':
        discountAmount = subtotal * 0.20;
        break;
      default:
        discountAmount = 0;
        alert('Invalid discount code. Try: SAVE10, SAVE50, or WELCOME20');
        return;
    }

    setAppliedDiscount(discountAmount);
  };

  const handleDiscountCodeChange = (e) => {
    setDiscountCode(e.target.value);
    if (appliedDiscount > 0) {
      setAppliedDiscount(0);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Please add items to your cart before proceeding to checkout.');
      return;
    }
    
    // Prepare checkout data
    const checkoutData = {
      items: cartItems,
      subtotal,
      vatTotal,
      appliedDiscount,
      discountCode,
      finalTotal
    };
    
    // Pass data to parent component and close modal
    onProceedToCheckout(checkoutData);
    onClose();
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div 
      className="cart-container" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: isOpen ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1500,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="cart-content"
        style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '95%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <span 
          className="close-btn" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            fontSize: '28px',
            color: '#666',
            cursor: 'pointer'
          }}
        >×</span>
        
        <div className="breadcrumb" style={{ fontSize: '0.9em', color: '#777', marginBottom: '15px' }}>
          Home / Cart
        </div>
        
        <div 
          className="cart-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '15px',
            borderBottom: '1px solid #eee'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '2em', color: '#333' }}>Shopping Cart</h2>
          <button 
            className="continue-btn" 
            onClick={onClose}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            ← Continue Shopping
          </button>
        </div>

        <div 
          className="cart-items-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minHeight: '100px'
          }}
        >
          {cartItems.length === 0 ? (
            <div className="cart-empty" style={{ textAlign: 'center', padding: '50px 0', color: '#777' }}>
              <h3>Your cart is empty</h3>
              <p>Please add some products to continue</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div 
                key={item.id}
                className="cart-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  backgroundColor: '#fcfcfc',
                  gap: '15px'
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    borderRadius: '5px'
                  }} 
                />
                <div className="cart-item-details" style={{ flexGrow: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1em', color: '#333' }}>{item.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>BDT {item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-quantity" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button style={{ 
                    backgroundColor: '#800000',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>-</button>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    min="1" 
                    readOnly
                    style={{
                      width: '50px',
                      padding: '5px',
                      textAlign: 'center',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <button style={{ 
                    backgroundColor: '#800000',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>+</button>
                </div>
                <span 
                  className="cart-item-total-price"
                  style={{
                    fontWeight: 'bold',
                    fontSize: '1.1em',
                    color: '#800000',
                    minWidth: '80px',
                    textAlign: 'right'
                  }}
                >
                  BDT {(item.price * item.quantity).toFixed(2)}
                </span>
                <button 
                  className="remove-item-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5em',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >×</button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div 
            className="order-summary"
            style={{
              background: '#f8f8f8',
              border: '1px solid #eee',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1.3em', color: '#333' }}>Order Summary</h4>
            
            <div className="discount-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Discount Code (SAVE10, SAVE50, WELCOME20)" 
                value={discountCode}
                onChange={handleDiscountCodeChange}
                style={{
                  flexGrow: 1,
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              <button 
                onClick={handleApplyDiscount}
                style={{
                  background: '#800000',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >Apply</button>
            </div>
            
            <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>Subtotal</span>
              <span>BDT {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>VAT Included (15%)</span>
              <span>BDT {vatTotal.toFixed(2)}</span>
            </div>
            
            {appliedDiscount > 0 && (
              <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span>Discount Applied ({discountCode})</span>
                <span style={{ color: '#28a745' }}>-BDT {appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div 
              className="summary-item total"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '15px 0 5px 0',
                borderTop: '1px solid #eee',
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              <strong>Order Total</strong>
              <strong>BDT {finalTotal.toFixed(2)}</strong>
            </div>
            
            <button 
              className="checkout-btn" 
              onClick={handleProceedToCheckout}
              style={{
                background: '#800000',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1.1em',
                fontWeight: 'bold',
                marginTop: '15px'
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;