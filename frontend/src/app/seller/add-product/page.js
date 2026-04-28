'use client';

import { useState, useEffect } from 'react';
import './seller.css';
import CustomSelect from '@/components/CustomSelect/CustomSelect';

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    CategoryId: '',
    style: '',
    brand: '',
    colors: ['Black'],
    isNewArrival: false,
    isTopSelling: false,
  });

  const [colorFiles, setColorFiles] = useState({}); // { 'Olive': [file1, file2, file3], ... }
  const [bulkFile, setBulkFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

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
    fetch('http://localhost:5000/api/products/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorFileChange = (e, color) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length !== 3) {
      alert(`Please upload exactly 3 images for the ${color} variant.`);
      e.target.value = null;
      return;
    }
    setColorFiles(prev => ({
      ...prev,
      [color]: selectedFiles
    }));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setStatus({ type: 'loading', message: 'Uploading CSV...' });
    const data = new FormData();
    data.append('file', bulkFile);

    try {
      const response = await fetch('http://localhost:5000/api/products/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setStatus({ type: 'success', message: result.message });
        setBulkFile(null);
        e.target.reset();
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.message || 'Failed to upload CSV.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Server error. Please try again later.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Adding product...' });

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'colors') {
        submitData.append('color', formData.colors.join(','));
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    // Append files with color prefix
    Object.keys(colorFiles).forEach(color => {
      colorFiles[color].forEach(file => {
        submitData.append(`images_${color}`, file);
      });
    });

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData,
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product added successfully!' });
        setFormData({
          name: '',
          price: '',
          originalPrice: '',
          description: '',
          CategoryId: '',
          style: '',
          brand: '',
          colors: ['Black'],
          isNewArrival: false,
          isTopSelling: false,
        });
        setColorFiles({});
        e.target.reset();
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.message || 'Failed to add product.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Server error. Please try again later.' });
    }
  };

  return (
    <>
      <div className="container seller-container">
        <h1>Seller Dashboard</h1>
        <div className="form-card">
          <h2>Add New Product</h2>
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
                placeholder="e.g. Graphic T-shirt"
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
                  placeholder="2499"
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
                  placeholder="2999"
                />
              </div>
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
              <label>Color Specific Images (3 images per color)</label>
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
                        Upload 3 {color} Images
                      </label>
                    </div>
                    <input
                      id={`files-${color}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleColorFileChange(e, color)}
                      style={{ display: 'none' }}
                      required
                    />
                    
                    {colorFiles[color] && (
                      <div className="image-preview-grid">
                        {Array.from(colorFiles[color]).map((file, idx) => (
                          <div key={idx} className="preview-item">
                            <img src={URL.createObjectURL(file)} alt="preview" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {formData.colors.length === 0 && <p className="no-colors-msg">Please select colors first to upload images.</p>}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product details..."
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-row checkboxes">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleChange}
                />
                New Arrival
              </label>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="isTopSelling"
                  checked={formData.isTopSelling}
                  onChange={handleChange}
                />
                Top Selling
              </label>
            </div>

            <button type="submit" className="submit-product-btn">
              Create Product
            </button>
          </form>

          <div className="divider">OR</div>

          <div className="bulk-upload-section">
            <h2>Bulk Inventory Upload</h2>
            <p>Upload a CSV file to add multiple products at once.</p>
            <div className="custom-upload-wrapper">
              <div className="upload-btn-row">
                <label htmlFor="bulk-file" className="stylish-upload-btn">
                  Upload CSV
                </label>
                <a href="/sample_products.csv" download className="download-csv-btn">
                  Download CSV Format
                </a>
              </div>
              <small className="file-info" style={{ marginTop: '8px', display: 'block' }}>
                Only .csv files allowed
              </small>
              <input
                id="bulk-file"
                type="file"
                accept=".csv"
                onChange={(e) => setBulkFile(e.target.files[0])}
                required
                style={{ display: 'none' }}
              />
              {bulkFile && (
                <div className="file-count-badge">
                  File: {bulkFile.name}
                </div>
              )}
              {bulkFile && (
                <button
                  onClick={handleBulkSubmit}
                  className="submit-product-btn"
                  style={{ marginTop: '20px', width: 'fit-content', padding: '10px 30px' }}
                >
                  Confirm Bulk Upload
                </button>
              )}
            </div>
          </div>

          <div className="final-action-section">
            <button
              onClick={() => document.querySelector('.product-form').requestSubmit()}
              className="final-create-btn"
            >
              Create Product
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
