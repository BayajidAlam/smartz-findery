import React from 'react';
import { useApp } from '../context/AppContext';

const SubcategoryCards = ({ activeSubcategory, setActiveSubcategory, setCategoryFilter }) => {
  const { handleCategoryFilter } = useApp();
  
  const handleSubcategoryClick = (subcategory) => {
    setActiveSubcategory(subcategory);
    const filterValue = `all-${subcategory}`;
    handleCategoryFilter(filterValue);
    if (setCategoryFilter) setCategoryFilter(filterValue);
  };

  return (
    <section id="subcategoryCardsContainer">
      <div 
        className={`subcategory-card ${activeSubcategory === 'men' ? 'active' : ''}`}
        data-filter="men"
        onClick={() => handleSubcategoryClick('men')}
      >
        Men
      </div>
      <div 
        className={`subcategory-card ${activeSubcategory === 'women' ? 'active' : ''}`}
        data-filter="women"
        onClick={() => handleSubcategoryClick('women')}
      >
        Women
      </div>
      <div 
        className={`subcategory-card ${activeSubcategory === 'kids' ? 'active' : ''}`}
        data-filter="kids"
        onClick={() => handleSubcategoryClick('kids')}
      >
        Kids
      </div>
    </section>
  );
};

export default SubcategoryCards;