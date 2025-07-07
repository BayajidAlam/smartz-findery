import React from 'react';
import { useApp } from '../context/AppContext';

// Category mappings for filtering (keeping your original structure)
const categoryMappings = {
  "initial": [
    { value: "all", text: "All Products" },
    { value: "other", text: "Other (Electronics, Beauty, Toy)" }
  ],
  "men": [
    { value: "all-men", text: "All Men's Fashion" },
    { value: "men-shirt", text: "Shirts" },
    { value: "men-pant", text: "Pants" },
    { value: "men-shoe", text: "Shoes" },
    { value: "men-polo-tshirt", text: "Polo T-Shirts" }
  ],
  "women": [
    { value: "all-women", text: "All Women's Fashion" },
    { value: "women-dress", text: "Dresses" },
    { value: "women-threepiece", text: "Three Pieces" },
    { value: "women-watch", text: "Watches" }
  ],
  "kids": [
    { value: "all-kids", text: "All Kids' Fashion" },
    { value: "kids-tshirt", text: "T-Shirts" }
  ]
};

const Toolbar = ({ 
  onSearch, 
  onCategoryFilter, 
  onSort,
  activeSubcategory,
  setActiveSubcategory
}) => {
  const { filters, handleSearch, handleCategoryFilter, handleSort } = useApp();
  
  // Get current category options based on active subcategory
  const getCurrentCategoryOptions = () => {
    if (activeSubcategory && categoryMappings[activeSubcategory]) {
      return categoryMappings[activeSubcategory];
    }
    return categoryMappings.initial;
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    handleSearch(searchValue);
    if (onSearch) onSearch(searchValue);
  };

  const handleCategoryChange = (e) => {
    const categoryValue = e.target.value;
    handleCategoryFilter(categoryValue);
    if (onCategoryFilter) onCategoryFilter(categoryValue);
    
    // Clear active subcategory when dropdown changes
    if (setActiveSubcategory) {
      setActiveSubcategory('');
    }
  };

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    // Convert your old sort values to new ones
    let apiSortValue = sortValue;
    if (sortValue === 'low-high') apiSortValue = 'price-low';
    if (sortValue === 'high-low') apiSortValue = 'price-high';
    if (sortValue === 'default') apiSortValue = 'newest';
    
    handleSort(apiSortValue);
    if (onSort) onSort(sortValue);
  };

  return (
    <section className="toolbar">
      <input
        type="text"
        id="searchInput"
        placeholder="Search products..."
        value={filters.search || ''}
        onChange={handleSearchChange}
      />
      
      <select
        id="categoryFilter"
        value={filters.category || 'all'}
        onChange={handleCategoryChange}
      >
        {getCurrentCategoryOptions().map(option => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
      
      <select
        id="sortSelect"
        value={filters.sort === 'price-low' ? 'low-high' : 
               filters.sort === 'price-high' ? 'high-low' : 'default'}
        onChange={handleSortChange}
      >
        <option value="default">Sort By</option>
        <option value="low-high">Price: Low to High</option>
        <option value="high-low">Price: High to Low</option>
      </select>
    </section>
  );
};

export default Toolbar;