import { useState } from 'react';
import Layout from '../components/Layout';
import Toolbar from '../components/Toolbar';
import SubcategoryCards from '../components/SubcategoryCards';
import ProductGrid from '../components/ProductGrid';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [activeSubcategory, setActiveSubcategory] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleSort = (sort) => {
    setSortOption(sort);
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(`all-${category}`);
  };

  return (
    <Layout>
      <Toolbar 
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        onSort={handleSort}
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
      />
      <SubcategoryCards 
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
        setCategoryFilter={setCategoryFilter}
        onCategorySelect={handleCategorySelect} 
      />
      <ProductGrid 
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        sortOption={sortOption}
      />
    </Layout>
  );
};

export default HomePage;