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
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
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
