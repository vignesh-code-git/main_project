'use client';

import { useState, useEffect } from 'react';
import './seller.css';

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    CategoryId: '',
    isNewArrival: false,
    isTopSelling: false,
  });

  const [files, setFiles] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

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

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
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

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    files.forEach(file => data.append('files', file));

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data,
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product added successfully!' });
        setFormData({
          name: '',
          price: '',
          originalPrice: '',
          description: '',
          CategoryId: '',
          isNewArrival: false,
          isTopSelling: false,
        });
        setFiles([]);
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
              <label>Main Category</label>
              <select name="CategoryId" value={formData.CategoryId} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dress Style</label>
              <select name="style" value={formData.style} onChange={handleChange} required>
                <option value="">Select Style</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Party">Party</option>
                <option value="Gym">Gym</option>
              </select>
            </div>

            <div className="form-group">
              <label>Brand</label>
              <select name="brand" value={formData.brand} onChange={handleChange} required>
                <option value="">Select Brand</option>
                <option value="ZARA">ZARA</option>
                <option value="GUCCI">GUCCI</option>
                <option value="PRADA">PRADA</option>
                <option value="VERSACE">VERSACE</option>
                <option value="Calvin Klein">Calvin Klein</option>
              </select>
            </div>

            <div className="form-group">
              <label>Product Assets</label>
              <div className="custom-upload-wrapper">
                <div className="upload-btn-row">
                  <label htmlFor="product-files" className="stylish-upload-btn">
                    Upload Assets
                  </label>
                  <span className="upload-description">Images, Videos, GIFs</span>
                </div>
                <input
                  id="product-files"
                  type="file"
                  name="files"
                  onChange={handleFileChange}
                  accept="image/*,video/*,.gif"
                  multiple
                  required
                  style={{ display: 'none' }}
                />
                {files.length > 0 && (
                  <div className="file-count-badge">
                    {files.length} file(s) selected
                  </div>
                )}
              </div>
              <small className="file-info">Maximum total size: 100MB</small>
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
