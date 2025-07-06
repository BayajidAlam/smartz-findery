// components/FloatingCartIcon.js
import React from 'react';
import { useApp } from '../context/AppContext';

const FloatingCartIcon = ({ onClick }) => {
  const { getCartItemsCount } = useApp();
  const totalItems = getCartItemsCount();

  return (
    <div id="floatingCart" onClick={onClick}>
      🛒
      <span className="cart-count">{totalItems}</span>
    </div>
  );
};

export default FloatingCartIcon;