import { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    hasVat: false,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Predefined categories for consistency
  const categories = [
    { value: 'men-shirt', label: 'Men - Shirt' },
    { value: 'men-henley', label: 'Men - Henley' },
    { value: 'men-pant', label: 'Men - Pant' },
    { value: 'women-dress', label: 'Women - Dress' },
    { value: 'women-threepiece', label: 'Women - Three Piece' },
    { value: 'women-watch', label: 'Women - Watch' },
    { value: 'kids-tshirt', label: 'Kids - T-Shirt' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'toy', label: 'Toy' }
  ];

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Edit mode
        setFormData({
          name: product.name || '',
          price: product.price || '',
          description: product.description || '',
          category: product.category || '',
          hasVat: product.hasVat || false,
          image: product.image || ''
        });
        setImagePreview(product.image || '');
      } else {
        // Add mode
        setFormData({
          name: '',
          price: '',
          description: '',
          category: '',
          hasVat: false,
          image: ''
        });
        setImagePreview('');
      }
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, product]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Clear image error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  // Upload image to ImgBB
  const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // For new products, require either existing image URL or uploaded image
    if (!product && !formData.image && !imageFile) {
      newErrors.image = 'Product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        image: imageUrl
      };
      
      await onSave(productData);
      
      // Close modal on success
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save product. Please try again.' });
      console.error('Submit error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      hasVat: false,
      image: ''
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    onClose();
  };

  // Close modal with ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      padding: '20px',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '30px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#333',
            margin: '0',
            fontWeight: '600'
          }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              color: '#666',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.color = '#333';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#666';
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Product Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.name ? '2px solid #ff6b6b' : '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter product name"
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#800000';
                    e.target.style.boxShadow = '0 0 0 3px rgba(128,0,0,0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.name && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Price and VAT */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Price (BDT) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: errors.price ? '2px solid #ff6b6b' : '1px solid #ddd',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                  onFocus={(e) => {
                    if (!errors.price) {
                      e.target.style.borderColor = '#800000';
                      e.target.style.boxShadow = '0 0 0 3px rgba(128,0,0,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.price) {
                      e.target.style.borderColor = '#ddd';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {errors.price && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                    {errors.price}
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '12px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="hasVat"
                    checked={formData.hasVat}
                    onChange={handleChange}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#800000'
                    }}
                  />
                  <span style={{ color: '#666' }}>Includes VAT (15%)</span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.category ? '2px solid #ff6b6b' : '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  background: 'white'
                }}
                onFocus={(e) => {
                  if (!errors.category) {
                    e.target.style.borderColor = '#800000';
                    e.target.style.boxShadow = '0 0 0 3px rgba(128,0,0,0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.category) {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.description ? '2px solid #ff6b6b' : '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Enter product description"
                onFocus={(e) => {
                  if (!errors.description) {
                    e.target.style.borderColor = '#800000';
                    e.target.style.boxShadow = '0 0 0 3px rgba(128,0,0,0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.description) {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.description && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                Product Image {!product && '*'}
              </label>
              
              {/* Current/Preview Image */}
              {imagePreview && (
                <div style={{ marginBottom: '15px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.image ? '2px solid #ff6b6b' : '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                fontSize: '0.8rem',
                color: '#666',
                margin: '5px 0 0 0'
              }}>
                Upload a new image (max 5MB). Supported formats: JPG, PNG, GIF
              </p>
              {errors.image && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                  {errors.image}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                color: 'white',
                padding: '15px',
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '20px'
            }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: '1',
                  background: 'linear-gradient(135deg, #e9ecef, #f8f9fa)',
                  color: '#666',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dee2e6, #e9ecef)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #e9ecef, #f8f9fa)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                style={{
                  flex: '1',
                  background: uploading 
                    ? 'linear-gradient(135deg, #ccc, #ddd)' 
                    : 'linear-gradient(135deg, #800000, #a00000)',
                  color: 'white',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!uploading) {
                    e.target.style.background = 'linear-gradient(135deg, #a00000, #c00000)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!uploading) {
                    e.target.style.background = 'linear-gradient(135deg, #800000, #a00000)';
                  }
                }}
              >
                {uploading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;