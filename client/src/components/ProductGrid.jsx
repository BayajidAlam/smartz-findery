import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';

const ProductGrid = ({ searchTerm, categoryFilter, sortOption }) => {
  const { products, loading } = useApp();

  // Keep your original filtering logic for backward compatibility
  // but now products come from API with filtering already applied
  const getFilteredAndSortedProducts = () => {
    // Since filtering is now done on backend, just return products
    // But keep this function for any additional frontend-only filtering if needed
    return products;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  if (loading) {
    return (
      <section className="product-grid">
        <div className="text-center py-8">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-grid" id="productGrid">
      {filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <ProductCard key={product._id || product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-600">No products found matching your criteria.</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;