// components/Toolbar.js
import React from 'react';

// Category mappings for filtering
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
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter, 
  sortOption, 
  setSortOption, 
  activeSubcategory,
  setActiveSubcategory
}) => {
  
  // Get current category options based on active subcategory
  const getCurrentCategoryOptions = () => {
    if (activeSubcategory && categoryMappings[activeSubcategory]) {
      return categoryMappings[activeSubcategory];
    }
    return categoryMappings.initial;
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    // Clear active subcategory when dropdown changes
    if (setActiveSubcategory) {
      setActiveSubcategory('');
    }
  };

  return (
    <section className="toolbar">
      <input
        type="text"
        id="searchInput"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <select
        id="categoryFilter"
        value={categoryFilter}
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
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="default">Sort By</option>
        <option value="low-high">Price: Low to High</option>
        <option value="high-low">Price: High to Low</option>
      </select>
    </section>
  );
};

export default Toolbar;