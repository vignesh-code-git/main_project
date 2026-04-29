'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import '../../add-product/seller.css';
import CustomSelect from '@/components/CustomSelect/CustomSelect';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    CategoryId: '',
    style: '',
    brand: '',
    colors: ['Black'],
  });

  const [colorFiles, setColorFiles] = useState({}); // { 'Olive': [file1, file2, file3], ... }
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  const colorPresets = [
    { name: 'Olive', value: '#4F4F31' },
    { name: 'Navy', value: '#1A237E' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gray', value: '#808080' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('http://localhost:5000/api/products/categories'),
          fetch(`http://localhost:5000/api/products/${id}`)
        ]);

        const categoriesData = await catRes.json();
        const productData = await prodRes.json();

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        setFormData({
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice || '',
          description: productData.description,
          CategoryId: productData.CategoryId,
          style: productData.style || '',
          brand: productData.brand || '',
          colors: productData.color ? productData.color.split(',') : ['Black'],
        });
        
        if (productData.images) {
          setExistingImages(productData.images);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setStatus({ type: 'error', message: 'Failed to load product data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorFileChange = (e, color) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    if (selectedFiles.length > 3) {
      alert(`Maximum 3 images allowed for the ${color} variant.`);
      e.target.value = null;
      return;
    }
    setColorFiles(prev => ({
      ...prev,
      [color]: selectedFiles
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Updating product...' });

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'colors') {
        submitData.append('color', formData.colors.join(','));
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    // Append new files with color prefix
    Object.keys(colorFiles).forEach(color => {
      colorFiles[color].forEach(file => {
        submitData.append(`images_${color}`, file);
      });
    });

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData,
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product updated successfully!' });
        setTimeout(() => router.push('/seller/dashboard'), 1500);
      } else {
        let errorMsg = 'Failed to update product.';
        try {
          const errorData = await response.json();
          if (Array.isArray(errorData)) {
            errorMsg = errorData.map(e => e.message).join(', ');
          } else {
            errorMsg = errorData.message || errorMsg;
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMsg = errorData.errors.map(e => e.message).join(', ');
            }
          }
        } catch (parseErr) {
          errorMsg = `Server error: ${response.status} ${response.statusText}`;
        }
        setStatus({ type: 'error', message: errorMsg });
      }
    } catch (err) {
      console.error('Update error:', err);
      setStatus({ type: 'error', message: 'Server error. Please try again later.' });
    }
  };

  if (loading) return <div className="loading">Loading Product Details...</div>;

  return (
    <div className="container seller-container">
      <h1>Edit Product</h1>
      <div className="form-card">
        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Original Price (₹) - Optional</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <CustomSelect 
              options={categories}
              value={formData.CategoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, CategoryId: e.target.value }))}
              placeholder="Select Category"
            />
          </div>

          <div className="form-group">
            <label>Dress Style</label>
            <CustomSelect 
              options={['Casual', 'Formal', 'Party', 'Gym']}
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
              placeholder="Select Style"
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <CustomSelect 
              options={['ZARA', 'GUCCI', 'PRADA', 'VERSACE', 'Calvin Klein']}
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Select Brand"
            />
          </div>

          <div className="form-group color-chooser-group">
            <label>Product Colors</label>
            <div className="color-presets">
              {colorPresets.map(color => (
                <div 
                  key={color.name}
                  className={`color-preset-item ${formData.colors.includes(color.name) ? 'selected' : ''}`}
                  onClick={() => {
                    setFormData(prev => {
                      const isSelected = prev.colors.includes(color.name);
                      if (isSelected) {
                        return { ...prev, colors: prev.colors.filter(c => c !== color.name) };
                      } else {
                        return { ...prev, colors: [...prev.colors, color.name] };
                      }
                    });
                  }}
                  title={color.name}
                >
                  <div className="color-swatch-circle" style={{ backgroundColor: color.value }}></div>
                  <span>{color.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group color-assets-section">
            <label>Add New Color Images (Optional)</label>
            {formData.colors.map(color => (
              <div key={color} className="color-upload-box">
                <div className="color-upload-header">
                  <div 
                    className="color-indicator" 
                    style={{ 
                      backgroundColor: colorPresets.find(p => p.name === color)?.value || '#808080' 
                    }}
                  ></div>
                  <span>{color} Gallery</span>
                </div>
                
                <div className="custom-upload-wrapper">
                  <div className="upload-btn-row">
                    <label htmlFor={`files-${color}`} className="stylish-upload-btn">
                      Upload New {color} Images
                    </label>
                  </div>
                  <input
                    id={`files-${color}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleColorFileChange(e, color)}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Preview new files */}
                  {colorFiles[color] && (
                    <div className="image-preview-grid">
                      {Array.from(colorFiles[color] || []).map((file, idx) => (
                        <div key={idx} className="preview-item new-file">
                          <img src={URL.createObjectURL(file)} alt="preview" />
                          <span className="new-tag">NEW</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show existing images for this color */}
                  <div className="existing-images-grid">
                    {existingImages
                      .filter(img => img.color === color || (!img.color && color === 'Black' && existingImages.length === 1))
                      .map((img, idx) => (
                        <div key={idx} className="preview-item existing-file">
                          <img src={img.url} alt="existing" />
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="edit-actions">
            <button type="submit" className="submit-product-btn">Update Product</button>
            <button type="button" onClick={() => router.back()} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
