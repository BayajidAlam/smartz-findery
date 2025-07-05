export const mockProducts = [
  {
    id: 'prod-001',
    name: 'FILA Casual Shirt',
    price: 2000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1yTO7esNg3Id3pA5WhpfYRA1KSxOx075-EQ&s',
    category: 'men-shirt',
    hasVat: false,
    description: 'Comfortable casual shirt for daily wear'
  },
  {
    id: 'prod-002',
    name: 'Kaleidoscopeb Summer Dress',
    price: 85,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxJr3yZWQC8GIFgcaCMPoT2-Ri1xbiUlul8g&s',
    category: 'women-dress',
    hasVat: false,
    description: 'Light and airy summer dress'
  },
  {
    id: 'prod-003',
    name: 'Kangaroos Cotton Kids T-shirt',
    price: 800,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9Sr26dic8RsvoaALCC5-NrnZH3k6rrRlUJA&s',
    category: 'kids-tshirt',
    hasVat: false,
    description: 'Soft cotton t-shirt for kids'
  },
  {
    id: 'prod-004',
    name: 'Beyerdynamic-300 Wireless Headphones',
    price: 1500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzgDKpwA9wLf4fE_5opmsUudpsc4l3FNWM6w&s',
    category: 'electronics',
    hasVat: true,
    description: 'High-quality wireless headphones'
  },
  {
    id: 'prod-005',
    name: 'FTTMWTAG Smart-Watch',
    price: 10000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST6ULRevmuTNy3ji3BO2vGHmyUgtnC2yp3tw&s',
    category: 'electronics',
    hasVat: false,
    description: 'Feature-rich smartwatch'
  },
  {
    id: 'prod-006',
    name: 'MAC POWDER KISS MINI LIPSTICK',
    price: 1500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRY6x2_hiJPr-g33u3Jk5oi7oL4vSJ1APjoA&s',
    category: 'beauty',
    hasVat: true,
    description: 'Premium quality lipstick'
  },
  {
    id: 'prod-007',
    name: 'Teddy Toy',
    price: 500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSARcCQnHlM04aBHNP6RFqdVwIGlLg-TuT-gw&s',
    category: 'toy',
    hasVat: false,
    description: 'Cute and cuddly teddy bear'
  },
  {
    id: 'prod-008',
    name: 'Vinoy Three Piece',
    price: 3000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPUSUGjoP9K2i0w1OZ3uKwSWs4xoFZF-_JZQ&s',
    category: 'women-threepiece',
    hasVat: true,
    description: 'Elegant three-piece set'
  },
  {
    id: 'prod-009',
    name: 'Arrow Formal Pant',
    price: 2000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyD3mLBqygbVLnKCoMQgzBFOUhnywEWGKKhg&s',
    category: 'men-pant',
    hasVat: true,
    description: 'Professional formal pants'
  },
  {
    id: 'prod-010',
    name: "Girl's Chain Watch",
    price: 1200,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbPgNCps0U59-9ul7cbFVypicnMFOFVhJHGA&s',
    category: 'women-watch',
    hasVat: true,
    description: 'Stylish chain watch for women'
  },
  {
    id: 'prod-011',
    name: 'Nike Mens Air Force 1 07 Shoes',
    price: 6000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqFSu2jfN80rjhtAKPo2nYU3q2q3PBVxEsuw&s',
    category: 'men-shoe',
    hasVat: true,
    description: 'Classic Nike Air Force sneakers'
  },
  {
    id: 'prod-012',
    name: 'Half Sleeve Cotton Polo T-Shirt',
    price: 1000,
    image: 'https://www.siatex.com/wp-content/uploads/2023/05/Anti-wrinkle-Men-Polo-T-shirts-Manufacturer-in-Bangladesh.webp',
    category: 'men-polo-tshirt',
    hasVat: true,
    description: 'Premium polo t-shirt'
  }
];

// Mock API functions
export const fetchProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 500); // Simulate network delay
  });
};

export const fetchProductById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === id);
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 300);
  });
};