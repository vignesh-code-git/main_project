'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Package, DollarSign, ShoppingBag, AlertCircle, Save, X, ChevronDown, Check, Star } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import { API_BASE_URL, getAuthHeaders, resolveImageUrl } from '@/config/api';
import { updateUser } from '@/lib/redux/slices/authSlice';
import './seller-dashboard.css';

export default function SellerDashboard() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statsData, setStatsData] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  
  // New States for Returns & Feedback
  const [returns, setReturns] = useState([]);
  const [feedback, setFeedback] = useState([]);
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/seller/auth');
      return;
    }

    if (user) {
      // Check if profile is complete
      const isComplete = user.phoneNumber && user.address && user.zipCode;
      const hasDismissed = sessionStorage.getItem('onboarding_dismissed');

      if (!isComplete && !hasDismissed) {
        setShowOnboarding(true);
      }
      
      fetchSellerProducts(user.id);
      fetchSellerOrders(user.id);
      fetchDashboardStats();

      if (activeTab === 'support') {
        fetchSellerReturns(user.id);
        fetchSellerFeedback(user.id);
      }
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/stats`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.stats) {
        setStatsData(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const fetchSellerProducts = async (sellerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products?sellerId=${sellerId}`);
      const data = await res.json();
      setProducts(data.products || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchSellerOrders = async (sellerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/seller/${sellerId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerReturns = async (sellerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/seller/${sellerId}/returns`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setReturns(data);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
    }
  };

  const fetchSellerFeedback = async (sellerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/seller/${sellerId}/feedback`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setSavingOnboarding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(onboardingData)
      });
      
      if (res.ok) {
        const data = await res.json();
        dispatch(updateUser(data.user));
        sessionStorage.setItem('onboarding_dismissed', 'true');
        setShowOnboarding(false);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProduct = (id) => {
    setDeleteModal({ isOpen: false, productId: id }); // Should be true, wait
    setDeleteModal({ isOpen: true, productId: id });
  };

  const executeDelete = async () => {
    const id = deleteModal.productId;
    setDeleteModal({ isOpen: false, productId: null });

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  // Custom Status Dropdown Component
  const StatusDropdown = ({ currentStatus, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];

    return (
      <div className="custom-status-dropdown">
        <button 
          className={`status-trigger-btn ${currentStatus.toLowerCase()} ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{currentStatus}</span>
          <ChevronDown size={14} className={isOpen ? 'rotate' : ''} />
        </button>

        {isOpen && (
          <>
            <div className="dropdown-overlay-fixed" onClick={() => setIsOpen(false)} />
            <div className="status-options-menu">
              {statuses.map(status => (
                <button
                  key={status}
                  className={`status-option-item ${status.toLowerCase()} ${status === currentStatus ? 'active' : ''}`}
                  onClick={() => {
                    onUpdate(status);
                    setIsOpen(false);
                  }}
                >
                  <span>{status}</span>
                  {status === currentStatus && <Check size={14} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading || !user) return <div className="loading-dashboard-overlay">Loading Dashboard...</div>;

  return (
    <>
      <div className={`seller-dashboard ${showOnboarding ? 'blur' : ''}`}>
        <div className="container">
          {/* Completion Alert */}
          {!user.phoneNumber && (
            <div className="completion-alert-banner">
              <AlertCircle size={20} />
              <span>Your store profile is incomplete. Complete it now to start listing products!</span>
              <button onClick={() => setShowOnboarding(true)}>Complete Now</button>
            </div>
          )}

          <div className="dashboard-header">
            <div>
              <h1>{user?.storeName || 'My Store'}</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
            <Link 
              href={user.phoneNumber ? "/seller/add-product" : "#"} 
              className={`add-btn ${!user.phoneNumber ? 'disabled' : ''}`}
              onClick={(e) => {
                if (!user.phoneNumber) {
                  e.preventDefault();
                  setShowOnboarding(true);
                }
              }}
            >
              <Plus size={20} /> Add New Product
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p>{statsData.products}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>₹{statsData.revenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="stat-card highlight">
              <h3>Total Orders</h3>
              <p>{statsData.orders}</p>
            </div>
          </div>

          <div className="dashboard-tabs">
            <button
              className={activeTab === 'inventory' ? 'active' : ''}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </button>
            <button
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              Recent Orders
            </button>
            <button
              className={activeTab === 'support' ? 'active' : ''}
              onClick={() => setActiveTab('support')}
            >
              Returns & Feedback
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="inventory-section">
              <h2>Inventory Management</h2>
              <div className="product-table-container">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Style</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(products) && products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <Link href={`/product/${product.id}`} className="product-cell-link">
                              <div className="product-cell">
                                  <img
                                    src={product.images?.[0] ? resolveImageUrl(product.images[0].url) : '/placeholder.png'}
                                    alt={product.name}
                                    className="product-img-small"
                                  />
                                <span>{product.name}</span>
                              </div>
                            </Link>
                          </td>
                          <td>{product.Category?.name || 'General'}</td>
                          <td>{product.style || 'N/A'}</td>
                          <td style={{ fontWeight: '700' }}>{product.brand || 'N/A'}</td>
                          <td>₹{product.price}</td>
                          <td>{product.stock || 0}</td>
                          <td>
                            <span className={`status-badge ${product.stock > 0 ? 'active' : 'out-of-stock'}`}>
                              {product.stock > 0 ? 'Active' : 'Out of Stock'}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <Link href={`/seller/edit-product/${product.id}`} className="edit-link">Edit</Link>
                              <button onClick={() => deleteProduct(product.id)} className="delete-btn">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                          No products listed yet. Start by adding your first item!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Order Fulfillment</h2>
              <div className="product-table-container">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Your Items</th>
                      <th>Order Total</th>
                      <th>Date</th>
                      <th>Current Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(orders) && orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: '800', fontFamily: 'monospace' }}>#{order.id.split('-')[0].toUpperCase()}</td>
                          <td>{order.User?.name}</td>
                          <td>
                            <div className="mini-item-list-seller">
                              {(order.OrderItems || [])
                                .filter(item => item.Product?.sellerId === user?.id)
                                .map((item, idx) => (
                                  <div key={idx} className="seller-mini-item">
                                    {item.Product?.name} (x{item.quantity})
                                  </div>
                                ))}
                            </div>
                          </td>
                          <td>₹{order.totalAmount}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-pill ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <StatusDropdown 
                              currentStatus={order.status} 
                              onUpdate={(newStatus) => handleStatusUpdate(order.id, newStatus)} 
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                          No orders received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="support-section">
              <div className="support-header-v2">
                <h2>Customer Support</h2>
                <p>Manage return requests and view delivery feedback</p>
              </div>
              <div className="support-grid">
                <div className="support-card">
                  <div className="card-header-v2">
                    <h3>Recent Return Requests</h3>
                    <span className="count-badge">{returns.length}</span>
                  </div>
                  <div className="support-list">
                    {returns.length > 0 ? returns.map((ret) => (
                      <div key={ret.id} className="support-item">
                        <div className="item-main">
                          <div className="item-user">
                            <strong>{ret.User?.name}</strong>
                            <span className={`status-pill-small ${ret.status.toLowerCase()}`}>{ret.status}</span>
                          </div>
                          <p className="item-reason">Reason: {ret.reason}</p>
                          {ret.comment && <p className="item-comment">"{ret.comment}"</p>}
                          <div className="item-order-ref">Order #{ret.orderId.toString().slice(-8).toUpperCase()}</div>
                        </div>
                        <div className="item-date">{new Date(ret.createdAt).toLocaleDateString()}</div>
                      </div>
                    )) : <p className="empty-msg">No return requests yet.</p>}
                  </div>
                </div>

                <div className="support-card">
                  <div className="card-header-v2">
                    <h3>Delivery Feedback</h3>
                    <span className="count-badge">{feedback.length}</span>
                  </div>
                  <div className="support-list">
                    {feedback.length > 0 ? feedback.map((fb) => (
                      <div key={fb.id} className="support-item">
                        <div className="item-main">
                          <div className="item-user">
                            <strong>{fb.User?.name}</strong>
                            <div className="star-rating-mini">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={12} fill={s <= fb.rating ? "#FFC107" : "transparent"} color={s <= fb.rating ? "#FFC107" : "#DDD"} />
                              ))}
                            </div>
                          </div>
                          <p className="item-behavior">Courier: {fb.courierBehavior}</p>
                          {fb.comment && <p className="item-comment">"{fb.comment}"</p>}
                          <div className="item-order-ref">Order #{fb.orderId.toString().slice(-8).toUpperCase()}</div>
                        </div>
                        <div className="item-date">{new Date(fb.createdAt).toLocaleDateString()}</div>
                      </div>
                    )) : <p className="empty-msg">No feedback received yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Modal Overlay */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            <div className="onboarding-header">
              <h2>Complete Your Store Profile</h2>
              <p>Tell us more about your business to start selling.</p>
            </div>
            
            <form onSubmit={handleOnboardingSubmit} className="onboarding-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Store Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX" 
                    required
                    value={onboardingData.phoneNumber}
                    onChange={(e) => setOnboardingData({...onboardingData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Business Address</label>
                <textarea 
                  placeholder="Street address, Office/Suite number" 
                  required
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData({...onboardingData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    placeholder="City" 
                    required
                    value={onboardingData.city}
                    onChange={(e) => setOnboardingData({...onboardingData, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    placeholder="State" 
                    required
                    value={onboardingData.state}
                    onChange={(e) => setOnboardingData({...onboardingData, state: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Zip / Pin Code</label>
                  <input 
                    type="text" 
                    placeholder="XXXXXX" 
                    required
                    value={onboardingData.zipCode}
                    onChange={(e) => setOnboardingData({...onboardingData, zipCode: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input 
                    type="text" 
                    placeholder="Country" 
                    required
                    value={onboardingData.country}
                    onChange={(e) => setOnboardingData({...onboardingData, country: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="onboarding-submit-btn" disabled={savingOnboarding}>
                {savingOnboarding ? 'Saving Profile...' : 'Save & Start Selling'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={executeDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Keep it"
      />
    </>
  );
}
