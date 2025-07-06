import { useState } from 'react';
import Layout from '../components/Layout';
import Toolbar from '../components/Toolbar';
import SubcategoryCards from '../components/SubcategoryCards';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');

  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Search:', term);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    console.log('Category:', category);
  };

  const handleSort = (sort) => {
    setSortOption(sort);
    console.log('Sort:', sort);
  };

  const handleCategorySelect = (category) => {
    console.log('Subcategory selected:', category);
    // This will update the category filter dropdown
    setCategoryFilter(`all-${category}`);
  };

  return (
    <Layout>
      {/* Toolbar - search, filter, sort */}
      <Toolbar 
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        onSort={handleSort}
      />

      {/* Subcategory Cards */}
      <SubcategoryCards onCategorySelect={handleCategorySelect} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome to Smart'Z Findery</h1>
        <p className="text-center text-gray-600">Product grid will be here</p>
        
        {/* Debug info */}
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Search: "{searchTerm}"</p>
          <p>Category: {categoryFilter}</p>
          <p>Sort: {sortOption}</p>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;

