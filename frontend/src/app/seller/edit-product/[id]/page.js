'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import '../../add-product/seller.css';

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

  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('http://localhost:5000/api/products/categories'),
          fetch(`http://localhost:5000/api/products/${id}`)
        ]);

        const categoriesData = await catRes.json();
        const productData = await prodRes.json();

        setCategories(categoriesData);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Updating product...' });

    try {
      const submitData = {
        ...formData,
        color: formData.colors.join(',')
      };
      delete submitData.colors;

      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product updated successfully!' });
        setTimeout(() => router.push('/seller/dashboard'), 1500);
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.message || 'Failed to update product.' });
      }
    } catch (err) {
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
            <label>Dress Style</label>
            <select name="style" value={formData.style} onChange={handleChange} required>
              <option value="">Select Style</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Party">Party</option>
              <option value="Gym">Gym</option>
            </select>
          </div>

          <div className="form-group color-chooser-group">
            <label>Product Colors</label>
            <div className="color-presets">
              {[
                { name: 'Olive', value: '#4F4F31' },
                { name: 'Navy', value: '#1A237E' },
                { name: 'Black', value: '#000000' },
                { name: 'White', value: '#FFFFFF' },
                { name: 'Gray', value: '#808080' },
                { name: 'Red', value: '#FF0000' },
                { name: 'Blue', value: '#0000FF' }
              ].map(color => (
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
