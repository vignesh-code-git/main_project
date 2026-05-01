'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { API_BASE_URL } from '@/config/api';
import './admin.css';

export default function AdminDashboard() {
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allOrders, setAllOrders] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (authUser && authUser.role !== 'admin')) {
      // Small delay to allow auth rehydration if needed
      const timer = setTimeout(() => {
        if (!isAuthenticated) router.push('/auth/login');
      }, 500);
      return () => clearTimeout(timer);
    }

    const fetchData = async () => {
      try {
        const fetchOptions = { credentials: 'include' };

        const [usersRes, sellersRes, settingsRes, productsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users`, fetchOptions),
          fetch(`${API_BASE_URL}/api/admin/sellers`, fetchOptions),
          fetch(`${API_BASE_URL}/api/admin/settings`, fetchOptions),
          fetch(`${API_BASE_URL}/api/products`, fetchOptions),
          fetch(`${API_BASE_URL}/api/orders`, fetchOptions)
        ]);
 
        const usersData = await usersRes.json();
        const sellersData = await sellersRes.json();
        const settingsData = await settingsRes.json();
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
 
        setUsers(Array.isArray(usersData) ? usersData : []);
        setSellers(Array.isArray(sellersData) ? sellersData : []);
        setSettings(Array.isArray(settingsData) ? settingsData : []);
        setProducts(Array.isArray(productsData) ? productsData : (productsData.products || []));
        setAllOrders(Array.isArray(ordersData) ? ordersData : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, authUser, router]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleUpload = async (e, key, label) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', key);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const channel = new BroadcastChannel('admin_settings_update');
        channel.postMessage('refresh');
        channel.close();

        setSettings(prev => {
          const exists = prev.find(s => s.key === key);
          if (exists) {
            return prev.map(s => s.key === key ? data.setting : s);
          } else {
            return [...prev, data.setting];
          }
        });
        showToast(`${label.toUpperCase()} UPDATED`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSettingValue = (key) => {
    const setting = settings.find(s => s.key === key);
    return setting ? `${API_BASE_URL}${setting.value}` : null;
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });

      if (res.ok) {
        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`ORDER #${orderId.split('-')[0]} UPDATED TO ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (!authUser || loading) return <div className="admin-dashboard"><div style={{ padding: '80px', textAlign: 'center', fontWeight: '900', fontSize: '24px' }}>INITIALIZING CORE...</div></div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header-nav">
        <div className="nav-brand">
          <h2>ADMIN PANEL</h2>
        </div>

        <nav className="nav-tabs">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: 'Products' },
            { id: 'sellers', label: 'Sellers' },
            { id: 'customers', label: 'Customers' },
            { id: 'settings', label: 'Web Settings' },
          ].map(item => (
            <div
              key={item.id}
              className={`nav-tab-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="user-badge">
            <div className="badge-avatar">{authUser.name.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{authUser.name}</span>
          </div>
        </div>
      </header>

      <main className="admin-main-full">
        {activeTab === 'dashboard' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>CONTROL CENTER</h1>
              <p>Platform status and growth metrics.</p>
            </header>

            <div className="stats-container-full">
              <div className="stat-box-stylish">
                <h3>Live Products</h3>
                <p className="value">{products.length}</p>
                <span className="stat-label">PLATFORM INVENTORY</span>
              </div>
              <div className="stat-box-stylish">
                <h3>Active Sellers</h3>
                <p className="value">{sellers.length}</p>
                <span className="stat-label">BUSINESS PARTNERS</span>
              </div>
              <div className="stat-box-stylish">
                <h3>Total Customers</h3>
                <p className="value">{users.length}</p>
                <span className="stat-label">REGISTERED USERS</span>
              </div>
            </div>

            <div className="admin-card-stylish">
              <h2>Recent Activity</h2>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '16px' }}>
                System-wide transaction and user logs will appear here in real-time.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>ORDER MANAGEMENT</h1>
              <p>Process and track all platform transactions.</p>
            </header>
            <div className="admin-card-stylish">
              <h2>Master Order List</h2>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Current Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '800', fontFamily: 'monospace' }}>#{order.id.split('-')[0].toUpperCase()}</td>
                      <td>{order.User?.name}</td>
                      <td>{order.OrderItems?.length} items</td>
                      <td>₹{order.totalAmount}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-pill ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="status-dropdown-admin"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {allOrders.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '64px' }}>No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>PLATFORM INVENTORY</h1>
              <p>Manage all items listed across the storefront.</p>
            </header>
            <div className="admin-card-stylish">
              <h2>Master Product List</h2>
              <table>
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Pricing</th>
                    <th>Inventory</th>
                    <th>Seller</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(products) && products.map(product => (
                    <tr key={product.id || product._id}>
                      <td style={{ fontWeight: '800' }}>{product.name}</td>
                      <td>{product.Category?.name || 'General'}</td>
                      <td>₹{product.price}</td>
                      <td>{product.stock} units</td>
                      <td>{product.User?.name || 'Platform'}</td>
                    </tr>
                  ))}
                  {(!Array.isArray(products) || products.length === 0) && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '64px' }}>Inventory is currently empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>SELLER MANAGEMENT</h1>
              <p>Overview of all marketplace vendors.</p>
            </header>
            <div className="admin-card-stylish">
              <h2>Business Directory</h2>
              <table>
                <thead>
                  <tr>
                    <th>Store Identity</th>
                    <th>Representative</th>
                    <th>Contact Email</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(sellers) && sellers.map(seller => (
                    <tr key={seller.id || seller._id}>
                      <td style={{ fontWeight: '800' }}>{seller.storeName || 'N/A'}</td>
                      <td>{seller.name}</td>
                      <td>{seller.email}</td>
                      <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!Array.isArray(sellers) || sellers.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '64px' }}>No sellers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>USER DIRECTORY</h1>
              <p>Management of individual platform customers.</p>
            </header>
            <div className="admin-card-stylish">
              <h2>Customer List</h2>
              <table>
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Email Address</th>
                    <th>Account Type</th>
                    <th>Member Since</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.map(user => (
                    <tr key={user.id || user._id}>
                      <td style={{ fontWeight: '800' }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>Standard User</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!Array.isArray(users) || users.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '64px' }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>STOREFRONT CONFIGURATION</h1>
              <p>Manage high-resolution assets and visual parameters across the platform.</p>
            </header>
            <div className="settings-list-professional">
              {[
                {
                  key: 'style_casual',
                  label: 'Casual Category Banner',
                  desc: 'Featured promotional graphic for the casual style collections.',
                  location: 'HOMEPAGE / COLLECTIONS / CASUAL'
                },
                {
                  key: 'style_formal',
                  label: 'Formal Category Banner',
                  desc: 'Featured promotional graphic for the formal attire collections.',
                  location: 'HOMEPAGE / COLLECTIONS / FORMAL'
                },
                {
                  key: 'style_party',
                  label: 'Party Category Banner',
                  desc: 'Featured promotional graphic for the party wear collections.',
                  location: 'HOMEPAGE / COLLECTIONS / PARTY'
                },
                {
                  key: 'style_gym',
                  label: 'Gym Category Banner',
                  desc: 'Featured promotional graphic for the athletic and gym collections.',
                  location: 'HOMEPAGE / COLLECTIONS / GYM'
                }
              ].map(item => (
                <div key={item.key} className="setting-row-professional">
                  <div className="setting-info-left">
                    <span className="setting-location-tag">{item.location}</span>
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <div className="setting-actions-right">
                    <div className="setting-preview-box">
                      {getSettingValue(item.key) ? (
                        <img src={getSettingValue(item.key)} alt={item.label} />
                      ) : (
                        <div className="no-asset-placeholder">NULL ASSET</div>
                      )}
                    </div>
                    <div className="upload-wrapper-professional">
                      <button className="btn-upload-premium">
                        <span>UPDATE ASSET</span>
                      </button>
                      <input
                        type="file"
                        className="upload-input-hidden"
                        onChange={(e) => handleUpload(e, item.key, item.label)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {toast.show && (
        <div className="admin-toast-container">
          {toast.message}
        </div>
      )}
    </div>
  );
}
