'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import './seller.css';
import CustomSelect from '@/components/CustomSelect/CustomSelect';

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    description: '',
    style: '',
    brand: '',
    colors: [],
    sizes: [],
    isNewArrival: false,
    isTopSelling: false,
    isFreeDelivery: false,
    stock: '',
    sku: '',
    deliveryDays: '',
    videoUrl: '',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [colorFiles, setColorFiles] = useState({}); // { 'Olive': [file1, file2, file3], ... }
  const [productDetails, setProductDetails] = useState([
    { label: 'Material', value: '100% Premium Cotton' },
    { label: 'Origin', value: 'Sustainably sourced and manufactured' },
    { label: 'Fit', value: 'Contemporary classic fit' },
    { label: 'Care', value: 'Machine wash cold, tumble dry low' }
  ]);
  const [bulkFile, setBulkFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [styles, setStyles] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [singleStatus, setSingleStatus] = useState({ type: '', message: '' });
  const [bulkStatus, setBulkStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        console.log('--- FETCHING PRODUCT ATTRIBUTES ---');
        
        const [catRes, brandRes, styleRes, sizeRes, colorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products/categories`),
          fetch(`${API_BASE_URL}/api/products/brands`),
          fetch(`${API_BASE_URL}/api/products/styles`),
          fetch(`${API_BASE_URL}/api/products/sizes`),
          fetch(`${API_BASE_URL}/api/products/colors`)
        ]);

        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const styleData = await styleRes.json();
        const sizeData = await sizeRes.json();
        const colorData = await colorRes.json();

        console.log('Categories fetched:', catData.length, catData);
        console.log('Brands fetched:', brandData.length, brandData);
        console.log('Styles fetched:', styleData.length, styleData);
        console.log('Sizes fetched:', sizeData.length, sizeData);
        console.log('Colors fetched:', colorData.length, colorData);
        console.log('------------------------------------');

        if (catRes.ok) setCategories(catData);
        if (brandRes.ok) setBrands(brandData);
        if (styleRes.ok) setStyles(styleData);
        if (sizeRes.ok) setSizes(sizeData);
        if (colorRes.ok) setColorsList(colorData);

      } catch (error) {
        console.error('Error fetching attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
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

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.categoryId) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (formData.sizes.length === 0) newErrors.sizes = 'Select at least one size';
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.colors.length === 0) {
      newErrors.colors = 'Select at least one color';
    } else {
      formData.colors.forEach(color => {
        if (!colorFiles[color] || colorFiles[color].length === 0) {
          newErrors[`images_${color}`] = `Images for ${color} are required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBulkSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!bulkFile) {
      setBulkStatus({ type: 'error', message: 'Please select a CSV file first' });
      return;
    }

    setBulkStatus({ type: 'loading', message: 'Uploading CSV...' });
    const data = new FormData();
    data.append('file', bulkFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setBulkStatus({ type: 'success', message: result.message || 'Bulk upload successful!' });
        setBulkFile(null);
      } else {
        setBulkStatus({ type: 'error', message: result.message || 'Failed to upload CSV.' });
      }
    } catch (err) {
      console.error('Bulk upload error:', err);
      setBulkStatus({ type: 'error', message: 'Connection error. Please check if the server is running.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started. Data:', formData);

    if (!validate()) {
      console.error('Validation failed', errors);
      setSingleStatus({ type: 'error', message: 'Please fill the required fields' });
      return;
    }

    setSingleStatus({ type: 'loading', message: 'Adding product...' });

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('categoryId', Number(formData.categoryId));
    submitData.append('price', formData.price);
    submitData.append('originalPrice', formData.originalPrice);
    submitData.append('description', formData.description);
    submitData.append('style', formData.style);
    submitData.append('brand', formData.brand);
    submitData.append('stock', formData.stock);
    submitData.append('sku', formData.sku);
    submitData.append('deliveryDays', formData.deliveryDays);
    submitData.append('color', formData.colors.join(','));
    submitData.append('size', formData.sizes.join(','));
    submitData.append('isNewArrival', formData.isNewArrival);
    submitData.append('isTopSelling', formData.isTopSelling);
    submitData.append('isFreeDelivery', formData.isFreeDelivery);

    const detailsObj = {};
    productDetails.forEach(row => {
      if (row.label.trim()) {
        detailsObj[row.label] = row.value;
      }
    });
    submitData.append('details', JSON.stringify(detailsObj));

    Object.keys(colorFiles).forEach(color => {
      colorFiles[color].forEach(file => {
        submitData.append(`images_${color}`, file);
      });
    });

    if (videoFile) {
      submitData.append('video', videoFile);
    } else if (formData.videoUrl) {
      submitData.append('videoUrl', formData.videoUrl);
    }

    try {
      console.log('Sending data to API...');
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData,
      });

      if (response.ok) {
        console.log('Product added successfully');
        setSingleStatus({ type: 'success', message: 'Product added successfully!' });
        setFormData({
          name: '',
          price: '',
          originalPrice: '',
          description: '',
          categoryId: '',
          style: '',
          brand: '',
          colors: [],
          sizes: [],
          isNewArrival: false,
          isTopSelling: false,
          isFreeDelivery: false,
          stock: '',
          sku: '',
          deliveryDays: '',
          videoUrl: '',
        });
        setVideoFile(null);
        setProductDetails([
          { label: 'Material', value: '100% Premium Cotton' },
          { label: 'Origin', value: 'Sustainably sourced and manufactured' },
          { label: 'Fit', value: 'Contemporary classic fit' },
          { label: 'Care', value: 'Machine wash cold, tumble dry low' }
        ]);
        setColorFiles({});
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setSingleStatus({ type: 'error', message: errorData.message || 'Failed to add product.' });
      }
    } catch (err) {
      console.error('Product creation error:', err);
      setSingleStatus({ type: 'error', message: 'Connection error. Please check if the server is running.' });
    }
  };

  return (
    <>
      <div className="container seller-container">
        <div className="page-header">
          <h1>Add New Product</h1>
          <p>Create a new product listing with variants and details</p>
        </div>
        <div className="form-card">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit} className="product-form" noValidate>
            <div className="form-row">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Cotton T-Shirt"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. TSH-BLU-001"
                />
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                <label>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label>Original Price (₹) - Optional</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.stock ? 'has-error' : ''}`}>
                <label>Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Enter available stock"
                  min="0"
                />
                {errors.stock && <span className="error-text">{errors.stock}</span>}
              </div>
              <div className="form-group">
                <label>Estimated Delivery</label>
                <CustomSelect
                  options={[
                    'Same Day Delivery',
                    '1-2 Business Days',
                    '3-5 Business Days',
                    '5-7 Business Days',
                    '7-10 Business Days',
                    'Within 24 Hours'
                  ]}
                  value={formData.deliveryDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: e.target.value }))}
                  placeholder="Select delivery time"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Video</label>
              <div className="video-upload-container">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <input
                      type="text"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      placeholder="YouTube or Vimeo link"
                      disabled={!!videoFile}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="local-video" className="stylish-upload-btn" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                      {videoFile ? 'Change Video' : 'Upload Video'}
                    </label>
                    <input
                      id="local-video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        setVideoFile(e.target.files[0]);
                        setFormData(prev => ({ ...prev, videoUrl: '' })); // Clear URL if file is picked
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {videoFile && (
                  <div className="file-count-badge" style={{ marginTop: '8px' }}>
                    Selected: {videoFile.name} 
                    <span 
                      style={{ marginLeft: '10px', cursor: 'pointer', color: '#FF3333' }}
                      onClick={() => setVideoFile(null)}
                    >
                      Remove
                    </span>
                  </div>
                )}
                <p className="upload-description">Enter a link OR upload a local video file (MP4/MOV).</p>
              </div>
            </div>

            <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
              <label>Category</label>
              <CustomSelect
                options={categories}
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, categoryId: e.target.value }));
                  if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                }}
                placeholder="Select Category"
                labelKey="name"
                valueKey="id"
              />
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className={`form-group ${errors.style ? 'has-error' : ''}`}>
              <label>Dress Style</label>
              <CustomSelect
                options={styles}
                value={formData.style}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, style: e.target.value }));
                  if (errors.style) setErrors(prev => ({ ...prev, style: null }));
                }}
                placeholder="Select Style"
                labelKey="name"
                valueKey="name"
              />
              {errors.style && <span className="error-text">{errors.style}</span>}
            </div>

            <div className={`form-group ${errors.brand ? 'has-error' : ''}`}>
              <label>Brand</label>
              <CustomSelect
                options={brands}
                value={formData.brand}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, brand: e.target.value }));
                  if (errors.brand) setErrors(prev => ({ ...prev, brand: null }));
                }}
                placeholder="Select Brand"
                labelKey="name"
                valueKey="name"
              />
              {errors.brand && <span className="error-text">{errors.brand}</span>}
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
                        const newColors = isSelected
                          ? prev.colors.filter(c => c !== color.name)
                          : [...prev.colors, color.name];
                        if (newColors.length > 0 && errors.colors) setErrors(prevErr => ({ ...prevErr, colors: null }));
                        return { ...prev, colors: newColors };
                      });
                    }}
                    title={color.name}
                  >
                    <div className="color-swatch-circle" style={{ backgroundColor: color.hexCode }}></div>
                    <span>{color.name}</span>
                  </div>
                ))}
              </div>
              {errors.colors && <span className="error-text">{errors.colors}</span>}
            </div>

            <div className={`form-group ${errors.sizes ? 'has-error' : ''}`}>
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
                        if (newSizes.length > 0 && errors.sizes) setErrors(prevErr => ({ ...prevErr, sizes: null }));
                        return { ...prev, sizes: newSizes };
                      });
                    }}
                  >
                    {size.name}
                  </div>
                ))}
              </div>
              {errors.sizes && <span className="error-text">{errors.sizes}</span>}
            </div>

            <div className="form-group color-assets-section">
              <label>Color Specific Images (At least 1 image per color)</label>
              {formData.colors.map(color => (
                <div key={color} className={`color-upload-box ${errors[`images_${color}`] ? 'has-error' : ''}`}>
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
                        Upload {color} Images
                      </label>
                    </div>
                    <input
                      id={`files-${color}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleColorFileChange(e, color);
                        if (errors[`images_${color}`]) setErrors(prev => ({ ...prev, [`images_${color}`]: null }));
                      }}
                      style={{ display: 'none' }}
                    />

                    {errors[`images_${color}`] && <span className="error-text">{errors[`images_${color}`]}</span>}

                    {colorFiles[color] && (
                      <div className="image-preview-grid">
                        {Array.from(colorFiles[color] || []).map((file, idx) => (
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

            <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
              <label>Product Overview</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.description && e.target.value.length >= 10) setErrors(prev => ({ ...prev, description: null }));
                }}
                placeholder="Briefly summarize the product..."
                rows="4"
              ></textarea>
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group dynamic-details-section">
              <label>Specific Product Information (Attributes)</label>
              <div className="details-rows-container">
                {productDetails.map((detail, index) => (
                  <div key={index} className="detail-row">
                    <input
                      type="text"
                      placeholder="Label (e.g. Material)"
                      value={detail.label}
                      onChange={(e) => {
                        const newDetails = [...productDetails];
                        newDetails[index].label = e.target.value;
                        setProductDetails(newDetails);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 100% Cotton)"
                      value={detail.value}
                      onChange={(e) => {
                        const newDetails = [...productDetails];
                        newDetails[index].value = e.target.value;
                        setProductDetails(newDetails);
                      }}
                    />
                    <button
                      type="button"
                      className="remove-detail-btn"
                      onClick={() => setProductDetails(productDetails.filter((_, i) => i !== index))}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-detail-btn"
                onClick={() => setProductDetails([...productDetails, { label: '', value: '' }])}
              >
                + Add Detail
              </button>
            </div>

            <div className="form-row status-toggles">
              <div className="status-toggle-group">
                <label className="switch-container">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">New Arrival</span>
              </div>

              <div className="status-toggle-group">
                <label className="switch-container">
                  <input
                    type="checkbox"
                    name="isTopSelling"
                    checked={formData.isTopSelling}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">Top Selling</span>
              </div>

              <div className="status-toggle-group">
                <label className="switch-container">
                  <input
                    type="checkbox"
                    name="isFreeDelivery"
                    checked={formData.isFreeDelivery}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">Free Delivery</span>
              </div>
            </div>

            <div className="action-buttons-row">
              <button
                type="button"
                className="preview-btn"
                onClick={() => setShowPreview(true)}
              >
                Preview Listing
              </button>
              <button type="submit" className="final-create-btn">
                Create Product
              </button>
            </div>

            {singleStatus.message && (
              <div className={`status-message ${singleStatus.type}`} style={{ marginTop: '20px', textAlign: 'center' }}>
                {singleStatus.message}
              </div>
            )}
          </form>

          <div className="divider">OR</div>

          <div className="bulk-upload-section">
            <h2>Bulk Inventory Upload</h2>
            <p>Upload a CSV file to add multiple products at once.</p>
            <div className="custom-upload-wrapper">
              <div className="upload-btn-row">
                <label htmlFor="bulk-file" className="stylish-upload-btn csv-action-btn">
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
                onChange={(e) => {
                  setBulkFile(e.target.files[0]);
                  setBulkStatus({ type: '', message: '' });
                }}
                required
                style={{ display: 'none' }}
              />
              {bulkFile && (
                <div className="file-count-badge">
                  File: {bulkFile.name}
                </div>
              )}
              <button
                onClick={handleBulkSubmit}
                className="final-create-btn"
                style={{ marginTop: '20px', width: '100%', display: 'block' }}
              >
                Create Bulk Products
              </button>
            </div>

            {bulkStatus.message && (
              <div className={`status-message ${bulkStatus.type}`} style={{ marginTop: '20px', textAlign: 'center' }}>
                {bulkStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-modal-header">
              <h3>Product Listing Preview</h3>
              <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="preview-content">
              <div className="preview-main">
                <div className="preview-info">
                  <h1>{formData.name || 'Untitled Product'}</h1>
                  <p className="preview-sku">SKU: {formData.sku || 'N/A'}</p>
                  
                  <div className="preview-price">
                    <span className="current">₹{formData.price || '0'}</span>
                    {formData.originalPrice && <span className="original">₹{formData.originalPrice}</span>}
                  </div>

                  <div className="preview-meta-grid">
                    <div className="meta-item">
                      <span className="label">Category</span>
                      <span className="value">
                        {categories.find(c => c.id.toString() === formData.categoryId.toString())?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Brand</span>
                      <span className="value">{formData.brand || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Style</span>
                      <span className="value">{formData.style || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Stock</span>
                      <span className="value">{formData.stock || '0'} Units</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Delivery</span>
                      <span className="value">{formData.deliveryDays || 'Standard'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Colors</span>
                      <span className="value">
                        {formData.colors.length > 0 ? formData.colors.join(', ') : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="preview-section">
                    <h4>Product Images</h4>
                    <div className="preview-image-grid-inline">
                      {Object.keys(colorFiles).map(color => (
                        colorFiles[color].map((file, idx) => (
                          <div key={`${color}-${idx}`} className="preview-thumb-box">
                            <img src={URL.createObjectURL(file)} alt="preview" />
                            <span className="color-tag">{color}</span>
                          </div>
                        ))
                      ))}
                      {Object.keys(colorFiles).length === 0 && (
                        <div className="no-preview-img-inline">No images selected</div>
                      )}
                    </div>
                  </div>

                  <div className="preview-section">
                    <h4>Specific Product Details</h4>
                    <div className="preview-details-list">
                      {productDetails.length > 0 ? (
                        productDetails.map((detail, idx) => (
                          detail.label && detail.value && (
                            <div key={idx} className="preview-detail-item">
                              <span className="detail-label">{detail.label}:</span>
                              <span className="detail-value">{detail.value}</span>
                            </div>
                          )
                        ))
                      ) : (
                        <p className="no-data">No specific details added.</p>
                      )}
                    </div>
                  </div>

                  <div className="preview-section">
                    <h4>Available Sizes</h4>
                    <div className="preview-size-chips">
                      {formData.sizes.length > 0 ? (
                        formData.sizes.map(size => (
                          <span key={size} className="preview-size-chip">{size}</span>
                        ))
                      ) : (
                        <span className="no-data">No sizes selected</span>
                      )}
                    </div>
                  </div>

                  <div className="preview-divider"></div>
                  
                  <div className="preview-section">
                    <h4>Description</h4>
                    <p>{formData.description || 'No description provided.'}</p>
                  </div>

                  { (formData.videoUrl || videoFile) && (
                    <div className="preview-section">
                      <h4>Product Video</h4>
                      {videoFile ? (
                        <video 
                          src={URL.createObjectURL(videoFile)} 
                          controls 
                          className="preview-video-player"
                        />
                      ) : (
                        <div className="video-placeholder">
                          External Link: {formData.videoUrl}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="preview-section">
                    <h4>Status Tags</h4>
                    <div className="preview-tags">
                      {formData.isNewArrival && <span className="tag-pill new">New Arrival</span>}
                      {formData.isTopSelling && <span className="tag-pill top">Top Selling</span>}
                      {formData.isFreeDelivery && <span className="tag-pill free">Free Delivery</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-modal-footer">
              <button className="final-create-btn" onClick={() => setShowPreview(false)}>Back to Editor</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
