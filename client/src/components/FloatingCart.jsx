import { useApp } from '../context/AppContext';

const FloatingCart = ({ onClick }) => {
  const { getCartItemsCount } = useApp();

  return (
    <div id="floatingCart" onClick={onClick}>
      🛒
      <span className="cart-count">{getCartItemsCount()}</span>
    </div>
  );
};

export default FloatingCart;