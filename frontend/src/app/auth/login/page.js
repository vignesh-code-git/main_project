'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import './login.css';

export default function CustomerAuth() {
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
            router.push('/');
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
        body: JSON.stringify(payload),
        credentials: 'include' // This is the professional way to handle cookies
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      // Dispatch login with user data and token
      dispatch(login(data));

      // Redirect based on role
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
          <h2>{isLogin ? 'Log In' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your details to access your account.' : 'Join the SHOP.CO community today.'}</p>
          
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
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

            <button type="submit" className="login-btn">
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="register-link">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
