import { useApp } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useApp();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/200x180/E0E0E0/333333?text=Image+Missing';
  };

  // Support both _id (MongoDB) and id (legacy)
  const productId = product._id || product.id;

  return (
    <div className="product-card" data-product-id={productId} data-category={product.category} data-price={product.price}>
      <img 
        src={product.image} 
        alt={product.name}
        onError={handleImageError}
      />
      <h3>{product.name}</h3>
      <p>BDT {product.price}{product.hasVat ? '+VAT' : ''}</p>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
