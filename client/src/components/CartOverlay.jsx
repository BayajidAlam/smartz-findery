import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const CartOverlay = ({ onClose }) => {
  const { cartItems, updateCartItemQuantity, removeFromCart } = useApp();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('cart-container')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let vatTotal = 0;

    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      if (item.hasVat || item.vat > 0 || (item.priceText && item.priceText.includes('+VAT'))) {
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

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItemQuantity(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
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
    console.log('Proceeding to checkout with:', {
      items: cartItems.length,
      total: finalTotal.toFixed(2),
      discount: appliedDiscount.toFixed(2)
    });
    
    alert(`Proceeding to checkout with ${cartItems.length} items. Total: BDT ${finalTotal.toFixed(2)}`);
  };

  const finalTotal = total - appliedDiscount;

  return (
    <div className="cart-container" style={{ display: 'flex' }}>
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
              <CartItem 
                key={item.id} 
                item={item} 
                onQuantityChange={handleQuantityChange}
                onRemove={() => removeFromCart(item.id)}
              />
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

// CartItem component for the overlay
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const handleQuantityInputChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    onQuantityChange(item.id, newQuantity);
  };

  const incrementQuantity = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    } else {
      onRemove();
    }
  };

  // Calculate item pricing
  const itemTotalPrice = item.price * item.quantity;
  const hasVat = item.hasVat || item.vat > 0 || (item.priceText && item.priceText.includes('+VAT'));
  const itemVatAmount = hasVat ? itemTotalPrice * 0.15 : 0;
  const finalItemPrice = itemTotalPrice + itemVatAmount;

  return (
    <div className="cart-item">
      <img 
        src={item.image || item.imageUrl} 
        alt={item.name || item.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/80x80/E0E0E0/333333?text=Image+Missing';
        }}
      />
      <div className="cart-item-details">
        <h4>{item.name || item.title}</h4>
        <p>
          BDT {item.price.toFixed(2)} each
          {hasVat && <span style={{ fontSize: '0.8em', color: '#666' }}> (+VAT)</span>}
        </p>
      </div>
      <div className="cart-item-quantity">
        <button 
          onClick={decrementQuantity}
          disabled={item.quantity <= 1}
          title={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
        >
          -
        </button>
        <input 
          type="number" 
          value={item.quantity} 
          min="1"
          max="99"
          onChange={handleQuantityInputChange}
        />
        <button 
          onClick={incrementQuantity}
          title="Increase quantity"
        >
          +
        </button>
      </div>
      <span className="cart-item-total-price">
        BDT {finalItemPrice.toFixed(2)}
      </span>
      <button 
        className="remove-item-btn" 
        onClick={onRemove}
        title="Remove item from cart"
      >
        ×
      </button>
    </div>
  );
};

export default CartOverlay;