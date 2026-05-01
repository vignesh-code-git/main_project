'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Lock, Bell, Shield, CreditCard, Save, Camera } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { updateUser } from '@/lib/redux/slices/authSlice';
import { useToast } from '@/context/ToastContext';
import axios from 'axios';
import './settings-page.css';

export default function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        name: formData.name
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      dispatch(updateUser(response.data.user));
      showToast('Settings updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/auth/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      dispatch(updateUser({ avatar: response.data.avatar }));
      showToast('Profile picture updated!', 'success');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast('Failed to upload profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={20} /> },
    { id: 'security', label: 'Security', icon: <Lock size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="container settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Update your personal information and account preferences</p>
      </div>

      <div className="settings-container">
        <aside className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="settings-content">
          {activeTab === 'account' && (
            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      disabled
                    />
                    <span className="input-hint">Email cannot be changed</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Profile Picture</h3>
                <div className="profile-upload">
                  <div className="current-avatar">
                    {mounted && user?.avatar ? (
                      <img src={`${API_BASE_URL}${user.avatar}`} alt="Avatar" />
                    ) : (
                      mounted && user?.name?.charAt(0).toUpperCase()
                    )}
                    {uploading && <div className="upload-overlay">...</div>}
                  </div>
                  <div className="upload-actions">
                    <input 
                      type="file" 
                      id="avatar-input" 
                      hidden 
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <label htmlFor="avatar-input" className="upload-btn">
                      {uploading ? 'Uploading...' : <><Camera size={16} /> Change Photo</>}
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" name="currentPassword" placeholder="••••••••" />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" name="newPassword" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" name="confirmPassword" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Two-Factor Authentication</h3>
                <div className="toggle-group">
                  <div className="toggle-info">
                    <h4>Enable 2FA</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <div className="toggle-switch">
                    <input type="checkbox" id="tfa" />
                    <label htmlFor="tfa"></label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Update Security</button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-form">
              <div className="form-section">
                <h3>Notification Preferences</h3>
                <div className="notification-list">
                  {[
                    { title: 'Order Updates', desc: 'Get notified when your order status changes' },
                    { title: 'Promotions', desc: 'Receive emails about sales and new arrivals' },
                    { title: 'Security Alerts', desc: 'Get notified of unusual account activity' }
                  ].map((item, idx) => (
                    <div key={idx} className="toggle-group">
                      <div className="toggle-info">
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                      </div>
                      <div className="toggle-switch">
                        <input type="checkbox" id={`notif-${idx}`} defaultChecked />
                        <label htmlFor={`notif-${idx}`}></label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-form">
              <div className="form-section">
                <h3>Payment Methods</h3>
                <div className="payment-card-placeholder">
                  <CreditCard size={48} />
                  <p>No payment methods saved</p>
                  <button className="add-card-btn">Add New Card</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
