'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Package, MapPin, User, Settings, ShoppingBag, Truck, ChevronRight } from 'lucide-react';
import './profile.css';

export default function UserProfile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
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
    }
  }, [mounted, isAuthenticated, user, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTrackOrder = (order) => {
    alert(`Tracking status for ${order.id}: \nStatus: ${order.status}\nTracking No: ${order.trackingNumber || 'N/A'}`);
  };

  if (!mounted || !user) return null;

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
                      <div className="order-main-info">
                        <div className="order-icon-box">
                          <Package size={24} />
                        </div>
                        <div className="order-meta">
                          <span className="order-id">#{order.id.split('-')[0].toUpperCase()}</span>
                          <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="order-stats">
                          <div className="stat-item">
                            <label>STATUS</label>
                            <span className={`status-pill ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="stat-item">
                            <label>TOTAL</label>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                        <button className="track-btn" onClick={() => handleTrackOrder(order)}>
                          Track Order <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="tracking-preview">
                        <div className="tracking-id">
                          <Truck size={14} /> Tracking ID: <strong>{order.trackingNumber || 'PENDING'}</strong>
                        </div>
                        <div className="delivery-estimate">
                          {order.status === 'Delivered' ? 'Delivered on: ' : 'Estimated Delivery: '} 
                          <strong>{new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>
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
                <div className="address-card default">
                  <div className="card-header">
                    <span className="tag">DEFAULT</span>
                    <h3>Home</h3>
                  </div>
                  <p>123 High Street, Downtown</p>
                  <p>Mumbai, Maharashtra - <strong>400001</strong></p>
                  <p>India</p>
                  <div className="card-actions">
                    <button>Edit</button>
                    <button>Remove</button>
                  </div>
                </div>

                <button className="add-address-card">
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
    </div>
  );
}
