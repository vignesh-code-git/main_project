'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import { API_BASE_URL } from '@/config/api';
import '../auth/seller-auth.css';

export default function SellerSignup() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'seller' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      dispatch(login(data));
      router.push('/seller/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="seller-auth-container">
      <div className="auth-card">
        <h2>CREATE SELLER ACCOUNT</h2>
        <p>Join and start selling today.</p>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Store Name</label>
            <input 
              type="text" 
              placeholder="Enter your brand name" 
              value={formData.storeName}
              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            CREATE ACCOUNT
          </button>
        </form>

        <div className="toggle-auth">
          Already have an account? {' '}
          <span onClick={() => router.push('/auth/login?type=seller')}>
            SELLER LOGIN
          </span>
        </div>
      </div>
    </div>
  );
}
