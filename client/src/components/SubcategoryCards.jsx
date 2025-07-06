import { useState } from 'react';

const SubcategoryCards = ({ onCategorySelect }) => {
  const [activeCard, setActiveCard] = useState('');

  const handleCardClick = (category) => {
    setActiveCard(category);
    onCategorySelect(category);
  };

  return (
    <section id="subcategoryCardsContainer">
      <div 
        className={`subcategory-card ${activeCard === 'men' ? 'active' : ''}`}
        data-filter="men"
        onClick={() => handleCardClick('men')}
      >
        Men
      </div>
      <div 
        className={`subcategory-card ${activeCard === 'women' ? 'active' : ''}`}
        data-filter="women"
        onClick={() => handleCardClick('women')}
      >
        Women
      </div>
      <div 
        className={`subcategory-card ${activeCard === 'kids' ? 'active' : ''}`}
        data-filter="kids"
        onClick={() => handleCardClick('kids')}
      >
        Kids
      </div>
    </section>
  );
};

export default SubcategoryCards;