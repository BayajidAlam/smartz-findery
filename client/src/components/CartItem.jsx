import React from 'react';
import { useApp } from '../context/AppContext';

const CartItem = ({ item }) => {
  const { updateCartItemQuantity, removeFromCart } = useApp();

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateCartItemQuantity(item.id, newQuantity);
    } else {
      removeFromCart(item.id);
    }
  };

  const incrementQuantity = () => {
    updateCartItemQuantity(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      updateCartItemQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  // Calculate item pricing
  const itemTotalPrice = item.price * item.quantity;
  const itemVatAmount = (item.hasVat || item.vat > 0) ? itemTotalPrice * 0.15 : 0;
  const finalItemPrice = itemTotalPrice + itemVatAmount;

  return (
    <div className="cart-item">
      <img 
        src={item.image} 
        alt={item.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/80x80/E0E0E0/333333?text=Image+Missing';
        }}
      />
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p>
          BDT {item.price.toFixed(2)} each
          {(item.hasVat || item.vat > 0) && <span style={{ fontSize: '0.8em', color: '#666' }}> (+VAT)</span>}
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
          onChange={handleQuantityChange}
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
        onClick={handleRemove}
        title="Remove item from cart"
      >
        ×
      </button>
    </div>
  );
};

export default CartItem;