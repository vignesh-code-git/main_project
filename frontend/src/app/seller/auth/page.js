'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import { API_BASE_URL } from '@/config/api';
import './seller-auth.css';

export default function SellerAuth() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup') === 'true') {
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    if (isLogin) {
      router.push('/auth/login');
    }
  }, [isLogin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      router.push('/auth/login');
      return;
    }
    setError('');
    
    const payload = { ...formData, role: 'seller' };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    <>
      <div className="seller-auth-container">
        <div className="auth-card">
          <h2>{isLogin ? 'Seller Login' : 'Seller Signup'}</h2>
          <p>{isLogin ? 'Welcome back! Manage your store.' : 'Join SHOP.CO and start selling today.'}</p>
          
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
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
              </>
            )}

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
              {isLogin ? 'Log In' : 'Create Seller Account'}
            </button>
          </form>

          <div className="toggle-auth">
            {isLogin ? "Don't have a seller account?" : "Already a seller?"} {' '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
