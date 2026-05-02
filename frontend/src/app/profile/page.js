'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Package, MapPin, User, Settings, ShoppingBag, Truck, ChevronRight, X, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import './profile.css';

export default function UserProfile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
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
        setIsModalOpen(false);
        resetAddressForm();
      }
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchAddresses();
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
      country: addr.country,
      isDefault: addr.isDefault
    });
    setCurrentAddressId(addr.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      title: 'Home',
      addressLine: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
    setIsEditing(false);
    setCurrentAddressId(null);
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
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={20} /> My Orders
            </button>
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

          {activeTab === 'orders' && (
            <div className="orders-view">
              <header className="view-header">
                <h2>Order History</h2>
                <p>Track and manage your recent purchases.</p>
              </header>

              <div className="orders-list">
                {loadingOrders ? (
                  <div className="loading-small">Fetching orders...</div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="order-card-premium">
                      <div className="order-header-lite">
                        <div className="header-meta">
                          <span className="order-id">#{order.id.toString().slice(-8).toUpperCase()}</span>
                          <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="header-status">
                          <span className={`status-pill ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="order-body-lite">
                        <div className="items-preview-mini">
                          {order.OrderItems?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="mini-thumb">
                              <img
                                src={item.Product?.images?.[0]?.url?.startsWith('http')
                                  ? item.Product.images[0].url
                                  : `${API_BASE_URL}${item.Product?.images?.[0]?.url || '/placeholder.png'}`}
                                alt=""
                              />
                            </div>
                          ))}
                          {order.OrderItems?.length > 3 && (
                            <div className="more-count">+{order.OrderItems.length - 3}</div>
                          )}
                        </div>

                        <div className="order-summary-lite">
                          <div className="summary-item">
                            <label>METHOD</label>
                            <span className="payment-method-text">
                              {order.Payments?.[0]?.method === 'cod' ? 'Cash on Delivery' : (order.Payments?.[0]?.method || 'Card')}
                            </span>
                          </div>
                          <div className="summary-item">
                            <label>TOTAL</label>
                            <strong>₹{order.totalAmount}</strong>
                          </div>
                          <button className="track-btn-lite" onClick={() => handleTrackOrder(order)}>
                            Track <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-orders">
                    <p>You haven't placed any orders yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                    <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                    <p>{addr.country}</p>
                    <div className="card-actions">
                      <button onClick={() => openEditModal(addr)}>Edit</button>
                      <button onClick={() => handleDeleteAddress(addr.id)}>Remove</button>
                    </div>
                  </div>
                ))}

                <button className="add-address-card" onClick={() => { resetAddressForm(); setIsModalOpen(true); }}>
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

              <form className="settings-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user.name} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" placeholder="+91 00000 00000" />
                  </div>
                  <div className="form-group">
                    <label>Zipcode / Location</label>
                    <input type="text" placeholder="400001" />
                  </div>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsModalOpen(false);
        }}>
          <div className="address-modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={24} strokeWidth={2} /></button>
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
                <label className="checkbox-label" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    style={{ margin: '0 10px 0 0', width: '20px', height: '20px' }}
                  />
                  Set as default address
                </label>
              </div>
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
