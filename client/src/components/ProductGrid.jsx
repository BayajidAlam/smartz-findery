import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';

const ProductGrid = ({ searchTerm, categoryFilter, sortOption }) => {
  const { products, loading } = useApp();

  // Filter and sort products based on props
  const getFilteredAndSortedProducts = () => {
    let filteredProducts = products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      let matchesCategory = true;
      if (categoryFilter === "all") {
        matchesCategory = true;
      } else if (categoryFilter === "other") {
        matchesCategory = ['electronics', 'beauty', 'toy'].includes(product.category);
      } else if (categoryFilter.startsWith("all-")) {
        const groupKey = categoryFilter.substring(4); // "men", "women", "kids"
        matchesCategory = product.category.startsWith(groupKey);
      } else {
        matchesCategory = product.category === categoryFilter;
      }

      return matchesSearch && matchesCategory;
    });

    // Sort products
    if (sortOption === "low-high") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === "high-low") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    return filteredProducts;
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
          <ProductCard key={product.id} product={product} />
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