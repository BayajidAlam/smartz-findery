import { useState, useEffect } from 'react';

const Toolbar = ({ onSearch, onCategoryFilter, onSort }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');

  // Category mappings from your HTML
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

  const [currentCategories, setCurrentCategories] = useState(categoryMappings.initial);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onCategoryFilter(value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    onSort(value);
  };

  return (
    <section className="toolbar">
      <input 
        type="text" 
        id="searchInput" 
        placeholder="Search products..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      <select 
        id="categoryFilter"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        {currentCategories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.text}
          </option>
        ))}
      </select>
      
      <select 
        id="sortSelect"
        value={sortOption}
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