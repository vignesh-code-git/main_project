'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Package, MapPin, User, Settings, ShoppingBag, Truck, ChevronRight, X, Plus, Trash2, Edit3, Loader2, FileText } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import './profile.css';

export default function UserProfile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('address');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  // Address Delete Modal State
  const [isAddressDeleteModalOpen, setIsAddressDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    country: 'India',
    isDefault: false
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    zipCode: ''
  });

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (mounted && user) {
      fetchOrders();
      fetchAddresses();
      setProfileForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        zipCode: user.zipCode || ''
      });
    }
  }, [mounted, isAuthenticated, user, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/addresses`, {
        credentials: 'include'
      });
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `${API_BASE_URL}/api/addresses/${currentAddressId}`
      : `${API_BASE_URL}/api/addresses`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
        credentials: 'include'
      });

      if (res.ok) {
        fetchAddresses();
        setIsAddressModalOpen(false);
        resetAddressForm();
      }
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
        credentials: 'include'
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteAddress = (id) => {
    setAddressToDelete(id);
    setIsAddressDeleteModalOpen(true);
  };

  const confirmDeleteAddress = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/addresses/${addressToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchAddresses();
        setIsAddressDeleteModalOpen(false);
        setAddressToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const openEditModal = (addr) => {
    setAddressForm({
      title: addr.title,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      phoneNumber: addr.phoneNumber || '',
      country: addr.country,
      isDefault: addr.isDefault
    });
    setCurrentAddressId(addr.id);
    setIsEditing(true);
    setIsAddressModalOpen(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      title: 'Home',
      addressLine: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: user?.phoneNumber || '',
      country: 'India',
      isDefault: false
    });
    setIsEditing(false);
    setCurrentAddressId(null);
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsSuccessModal(false);
    setIsCancelModalOpen(true);
  };

  const executeCancel = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${selectedOrderId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.ok) {
        setIsSuccessModal(true);
        fetchOrders(); // Refresh order list
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel order');
        setIsCancelModalOpen(false);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('An error occurred while cancelling the order');
      setIsCancelModalOpen(false);
    }
  };

  const handleTrackOrder = (order) => {
    router.push(`/track-order/${order.id}`);
  };

  if (!mounted || !user) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-page-container">
      <div className="container profile-layout">

        {/* Sidebar Navigation */}
        <aside className="profile-sidebar">
          <div className="user-info-brief">
            <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>

          <nav className="profile-nav">
            <button
              className={activeTab === 'address' ? 'active' : ''}
              onClick={() => setActiveTab('address')}
            >
              <MapPin size={20} /> Addresses
            </button>
            <button
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} /> Profile Settings
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="profile-main-content">


          {activeTab === 'address' && (
            <div className="address-view">
              <header className="view-header">
                <h2>Saved Addresses</h2>
                <p>Manage your shipping and billing locations.</p>
              </header>

              <div className="address-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="card-header">
                      <h3>{addr.title}</h3>
                      {addr.isDefault && <span className="tag">DEFAULT</span>}
                    </div>
                    <p>{addr.addressLine}</p>
                    {addr.phoneNumber && <p style={{ fontWeight: '500', color: '#000', margin: '4px 0' }}>Phone: {addr.phoneNumber}</p>}
                    <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                    <p>{addr.country}</p>
                    <div className="card-actions">
                      <button onClick={() => openEditModal(addr)}>Edit</button>
                      <button onClick={() => handleDeleteAddress(addr.id)}>Remove</button>
                    </div>
                  </div>
                ))}

                <button className="add-address-card" onClick={() => { resetAddressForm(); setIsAddressModalOpen(true); }}>
                  <div className="add-circle">+</div>
                  <span>Add New Address</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view">
              <header className="view-header">
                <h2>Profile Settings</h2>
                <p>Update your personal information and preferences.</p>
              </header>

              <form className="settings-form" onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" maxLength="10" pattern="\d{10}" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value.replace(/\D/g, '')})} placeholder="10-digit mobile number" />
                  </div>
                  <div className="form-group">
                    <label>Zipcode / Location</label>
                    <input type="text" value={profileForm.zipCode} onChange={(e) => setProfileForm({...profileForm, zipCode: e.target.value})} placeholder="400001" />
                  </div>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsAddressModalOpen(false);
        }}>
          <div className="address-modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="modal-close-btn" onClick={() => setIsAddressModalOpen(false)}><X size={24} strokeWidth={2} /></button>
            </div>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Title (e.g. Home, Office)</label>
                  <input
                    type="text"
                    value={addressForm.title}
                    onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address Line</label>
                <input
                  type="text"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  maxLength="10"
                  pattern="\d{10}"
                  placeholder="10-digit mobile number"
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>
              <div className="form-row three-col">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', opacity: addresses.some(a => a.isDefault && a.id !== currentAddressId) ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    disabled={addresses.some(a => a.isDefault && a.id !== currentAddressId)}
                    style={{ margin: '0 10px 0 0', width: '20px', height: '20px' }}
                  />
                  Set as default address
                  {addresses.some(a => a.isDefault && a.id !== currentAddressId) && (
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(Another address is already default)</span>
                  )}
                </label>
              </div>
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Professional Cancellation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={isSuccessModal ? () => setIsCancelModalOpen(false) : executeCancel}
        title={isSuccessModal ? "Order Cancelled" : "Cancel Order?"}
        message={isSuccessModal
          ? "Your order has been successfully cancelled. The stock has been restored to the inventory."
          : "Are you sure you want to cancel this order? This action will restore the product stock and cannot be undone."}
        confirmText={isSuccessModal ? "Close" : "Yes, Cancel Order"}
        cancelText={isSuccessModal ? "" : "No, Keep Order"}
      />

      {/* Professional Address Deletion Modal */}
      <ConfirmModal
        isOpen={isAddressDeleteModalOpen}
        onClose={() => setIsAddressDeleteModalOpen(false)}
        onConfirm={confirmDeleteAddress}
        title="Remove Address"
        message="Are you sure you want to remove this address? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Cancel"
      />
    </div>
  );
}
