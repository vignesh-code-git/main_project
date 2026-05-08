'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL, getAuthHeaders, resolveImageUrl } from '@/config/api';
import '../../add-product/seller.css';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import { X } from 'lucide-react';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    categoryId: '',
    style: '',
    brand: '',
    colors: ['Black'],
    sizes: [],
  });

  const [colorFiles, setColorFiles] = useState({}); // { 'Olive': [file1, file2, file3], ... }
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [brands, setBrands] = useState([]);
  const [styles, setStyles] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, brandRes, styleRes, sizeRes, colorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products/categories`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/${id}`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/brands`),
          fetch(`${API_BASE_URL}/api/products/styles`),
          fetch(`${API_BASE_URL}/api/products/sizes`),
          fetch(`${API_BASE_URL}/api/products/colors`)
        ]);

        const categoriesData = await catRes.json();
        const productData = await prodRes.json();
        const brandData = await brandRes.json();
        const styleData = await styleRes.json();
        const sizeData = await sizeRes.json();
        const colorData = await colorRes.json();

        if (catRes.ok) setCategories(categoriesData);
        if (brandRes.ok) setBrands(brandData);
        if (styleRes.ok) setStyles(styleData);
        if (sizeRes.ok) setSizes(sizeData);
        if (colorRes.ok) setColorsList(colorData);

        setFormData({
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice || '',
          description: productData.description,
          categoryId: productData.categoryId,
          style: productData.style || '',
          brand: productData.brand || '',
          colors: productData.color ? productData.color.split(',') : ['Black'],
          sizes: productData.size ? productData.size.split(',').map(s => s.trim()) : [],
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

  const handleRemoveExistingImage = (imageId) => {
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleRemoveNewImage = (color, index) => {
    setColorFiles(prev => {
      const files = [...prev[color]];
      files.splice(index, 1);
      return {
        ...prev,
        [color]: files
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Updating product...' });

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'colors') {
        submitData.append('color', formData.colors.join(','));
      } else if (key === 'sizes') {
        submitData.append('size', formData.sizes.join(','));
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

    // Append deleted image IDs
    if (deletedImageIds.length > 0) {
      submitData.append('deletedImageIds', deletedImageIds.join(','));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
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
      <div className="page-header">
        <h1>Edit Product</h1>
      </div>
      <div className="form-card">
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
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              placeholder="Select Category"
            />
          </div>

          <div className="form-group">
            <label>Dress Style</label>
            <CustomSelect 
              options={styles}
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
              placeholder="Select Style"
              labelKey="name"
              valueKey="name"
            />
          </div>

          <div className="form-group">
            <label>Brand</label>
            <CustomSelect 
              options={brands}
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="Select Brand"
              labelKey="name"
              valueKey="name"
            />
          </div>

          <div className="form-group">
            <label>Available Sizes</label>
            <div className="size-selector-chips">
              {sizes.map(size => (
                <div
                  key={size.id}
                  className={`size-chip ${formData.sizes.includes(size.name) ? 'active' : ''}`}
                  onClick={() => {
                    setFormData(prev => {
                      const isSelected = prev.sizes.includes(size.name);
                      const newSizes = isSelected
                        ? prev.sizes.filter(s => s !== size.name)
                        : [...prev.sizes, size.name];
                      return { ...prev, sizes: newSizes };
                    });
                  }}
                >
                  {size.name}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group color-chooser-group">
            <label>Product Colors</label>
            <div className="color-presets">
              {colorsList.map(color => (
                <div 
                  key={color.id}
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
                  <div className="color-swatch-circle" style={{ backgroundColor: color.hexCode }}></div>
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
                      backgroundColor: colorsList.find(p => p.name === color)?.hexCode || '#808080' 
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
                          <button 
                            type="button" 
                            className="remove-img-btn"
                            onClick={() => handleRemoveNewImage(color, idx)}
                          >
                            <X size={14} />
                          </button>
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
                          <img src={resolveImageUrl(img.url)} alt="existing" />
                          <button 
                            type="button" 
                            className="remove-img-btn"
                            onClick={() => handleRemoveExistingImage(img.id)}
                          >
                            <X size={14} />
                          </button>
                          <span className="existing-tag">EXISTING</span>
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

          {status.message && (
            <div className={`status-message-below ${status.type}`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
