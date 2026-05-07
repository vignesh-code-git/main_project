'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Phone, Mail, Globe, Store, Edit2, Save, X, Building, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { updateUser } from '@/lib/redux/slices/authSlice';
import './store.css';

export default function StoreProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [hasChanges, setHasChanges] = useState(false);
  
  const initialData = useMemo(() => ({
    storeName: user?.storeName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || 'India',
    description: user?.description || 'Quality products delivered with care.'
  }), [user]);

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const isDifferent = Object.keys(formData).some(key => {
      const currentVal = (formData[key] || '').toString().trim();
      const initialVal = (initialData[key] || '').toString().trim();
      return currentVal !== initialVal;
    });
    setHasChanges(isDifferent);
  }, [formData, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(updateUser(data.user));
        setMessage({ type: 'success', text: 'Store profile updated successfully!' });
        setIsEditing(false);
        // Vanish message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-profile-container">
      <div className="store-header-hero">
        <div className="hero-content">
          <div className="store-logo-large">
            <Store size={48} />
          </div>
          <div className="store-title-meta">
            <h1>{user?.storeName || 'My Store'}</h1>
            <div className="verified-badge">
              <CheckCircle size={14} />
              <span>Verified Seller</span>
            </div>
          </div>
        </div>
        <button
          className={`edit-toggle-btn ${isEditing ? 'cancel' : ''}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
        </button>
      </div>

      <div className="store-details-grid">
        <div className="details-card main-info">
          <div className="card-header">
            <Building size={20} />
            <h2>Business Information</h2>
          </div>

          <form onSubmit={handleSubmit} className={`store-form ${isEditing ? 'editing' : ''}`}>
            <div className="form-group-v3">
              <label>Store Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              ) : (
                <p>{formData.storeName || 'N/A'}</p>
              )}
            </div>

            <div className="form-group-v3">
              <label>About Store</label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="description-text">{formData.description}</p>
              )}
            </div>

            <div className="contact-info-grid">
              <div className="form-group-v3">
                <label><Phone size={14} /> Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                ) : (
                  <p>{formData.phoneNumber || 'N/A'}</p>
                )}
              </div>
              <div className="form-group-v3">
                <label><Mail size={14} /> Email Address</label>
                <p className="readonly">{user?.email}</p>
              </div>
            </div>

            {isEditing && (
              <button type="submit" className={`save-store-btn ${!hasChanges ? 'disabled' : ''}`} disabled={loading || !hasChanges}>
                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            )}
          </form>
        </div>

        <div className="details-card address-info">
          <div className="card-header">
            <MapPin size={20} />
            <h2>Store Location</h2>
          </div>

          <div className={`store-form ${isEditing ? 'editing' : ''}`}>
            <div className="form-group-v3">
              <label>Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <p>{formData.address || 'N/A'}</p>
              )}
            </div>

            <div className="form-grid-v3">
              <div className="form-group-v3">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                ) : (
                  <p>{formData.city || 'N/A'}</p>
                )}
              </div>
              <div className="form-group-v3">
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                ) : (
                  <p>{formData.state || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className="form-grid-v3">
              <div className="form-group-v3">
                <label>Zip Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                ) : (
                  <p>{formData.zipCode || 'N/A'}</p>
                )}
              </div>
              <div className="form-group-v3">
                <label>Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                ) : (
                  <p>{formData.country || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="location-map-preview">
            {formData.address ? (
              <iframe
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            ) : (
              <div className="map-placeholder">
                <Globe size={32} />
                <span>Add your business address to see the map</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message-toast ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}
    </div>
  );
}

function AlertCircle({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  )
}
