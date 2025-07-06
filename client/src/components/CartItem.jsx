// components/CartItem.js
import React from 'react';
import { useApp } from '../context/AppContext';

const CartItem = ({ item }) => {
  const { updateCartQuantity, removeFromCart } = useApp();

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateCartQuantity(item.id, newQuantity);
    }
  };

  const incrementQuantity = () => {
    updateCartQuantity(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    updateCartQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const itemTotalPrice = item.price * item.quantity;
  const itemVatAmount = item.hasVat ? itemTotalPrice * 0.15 : 0;
  const finalItemPrice = itemTotalPrice + itemVatAmount;

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p>BDT {item.price.toFixed(2)} each</p>
      </div>
      <div className="cart-item-quantity">
        <button onClick={decrementQuantity} disabled={item.quantity <= 1}>
          -
        </button>
        <input 
          type="number" 
          value={item.quantity} 
          min="1" 
          onChange={handleQuantityChange}
        />
        // components/CartItem.js
import React from 'react';
import { useApp } from '../context/AppContext';

const CartItem = ({ item }) => {
  const { updateCartQuantity, removeFromCart } = useApp();

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateCartQuantity(item.id, newQuantity);
    }
  };

  const incrementQuantity = () => {
    updateCartQuantity(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    updateCartQuantity(item.id, item.quantity - 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const itemTotalPrice = item.price * item.quantity;
  const itemVatAmount = item.hasVat ? itemTotalPrice * 0.15 : 0;
  const finalItemPrice = itemTotalPrice + itemVatAmount;

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="cart-item-details">
        <h4>{item.name}</h4>
        <p>BDT {item.price.toFixed(2)} each</p>
      </div>
      <div className="cart-item-quantity">
        <button onClick={decrementQuantity} disabled={item.quantity <= 1}>
          -
        </button>
        <input 
          type="number" 
          value={item.quantity} 
          min="1" 
          onChange={handleQuantityChange}
        />
        <button onClick={incrementQuantity}>
          +
        </button>
      </div>
      <span className="cart-item-total-price">
        BDT {finalItemPrice.toFixed(2)}
      </span>
      <button className="remove-item-btn" onClick={handleRemove}>
        ×
      </button>
    </div>
  );
};

export default CartItem;