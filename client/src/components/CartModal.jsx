import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import CartItem from './CartItem';

const CartModal = ({ isOpen, onClose }) => {
  const { cartItems } = useApp();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

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
    // Reset discount when user changes the code
    if (appliedDiscount > 0) {
      setAppliedDiscount(0);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Please add items to your cart before proceeding to checkout.');
      return;
    }
    
    // Close cart modal
    onClose();
    
    // Navigate to checkout (implement your navigation logic here)
    alert(`Proceeding to checkout with ${cartItems.length} items. Total: BDT ${finalTotal.toFixed(2)}`);
  };

  const finalTotal = total - appliedDiscount;

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div 
      className="cart-container" 
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="cart-content">
        <span className="close-btn" onClick={onClose}>×</span>
        <div className="breadcrumb">Home / Cart</div>
        
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="continue-btn" onClick={onClose}>
            ← Continue Shopping
          </button>
        </div>

        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <h3>Product Not Found</h3>
              <p>Please add some products</p>
            </div>
          ) : (
            cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="order-summary">
            <h4>Order Summary</h4>
            <div className="discount-row">
              <input 
                type="text" 
                placeholder="Discount Code (SAVE10, SAVE50, WELCOME20)" 
                value={discountCode}
                onChange={handleDiscountCodeChange}
              />
              <button onClick={handleApplyDiscount}>Apply</button>
            </div>
            <div className="summary-item">
              <span>Subtotal</span>
              <span>BDT {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>VAT Included (15%)</span>
              <span>BDT {vatTotal.toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="summary-item">
                <span>Discount Applied ({discountCode})</span>
                <span style={{ color: '#28a745' }}>-BDT {appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-item total">
              <strong>Order Total</strong>
              <strong>BDT {finalTotal.toFixed(2)}</strong>
            </div>
            <button className="checkout-btn" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;