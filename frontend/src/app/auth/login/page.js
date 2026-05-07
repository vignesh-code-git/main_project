'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import './login.css';

export default function UnifiedAuth() {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle Token from URL (For Google Auth)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('token', token);
        const { checkAuth } = require('@/lib/redux/slices/authSlice');
        dispatch(checkAuth()).then((res) => {
          if (res.meta.requestStatus === 'fulfilled') {
            const user = res.payload.user;
            if (user.role === 'admin') router.push('/admin/dashboard');
            else if (user.role === 'seller') router.push('/seller/dashboard');
            else router.push('/');
          }
        });
      }
    }
  }, [dispatch, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { ...formData, role: 'customer' };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      dispatch(login(data));

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <h2>
            {isLogin 
              ? (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('type') === 'seller' ? 'SELLER LOGIN' : 'LOG IN') 
              : 'CREATE ACCOUNT'
            }
          </h2>
          <p>{isLogin ? 'Log in to access your dashboard and orders.' : 'Join our premium marketplace today.'}</p>
          
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn">
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="register-link">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up Free' : 'Log In Now'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
