import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CartOverlay = ({ onClose }) => {
  const { cartItems, getCartTotal, getCartItemsCount } = useApp();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isAuthenticated) {
      onClose();
      navigate('/checkout');
    } else {
      onClose();
      navigate('/login');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm p-5">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Continue Shopping
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-3xl font-light"
            >
              ×
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Product Not Found</h3>
              <p className="text-gray-500">Please add some products</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center p-4 border rounded-lg bg-gray-50">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded mr-4"
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-gray-600">BDT {item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2 mr-4">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                    </div>
                    <div className="font-bold text-red-800">
                      BDT {(item.price * item.quantity + (item.hasVat ? item.price * item.quantity * 0.15 : 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{getCartItemsCount()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Order Total:</span>
                    <span className="text-red-800">BDT {getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-red-800 text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartOverlay;