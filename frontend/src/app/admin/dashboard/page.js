'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './admin.css';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [toast, setToast] = useState({ show: false, message: '' });
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const savedTab = localStorage.getItem('adminActiveTab');

    if (!user || user.role !== 'admin') {
      router.push('/auth/login');
      return;
    } 
    
    setAdmin(user);
    if (savedTab) setActiveTab(savedTab);

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [usersRes, sellersRes, settingsRes, productsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/users', { headers }),
          fetch('http://localhost:5000/api/admin/sellers', { headers }),
          fetch('http://localhost:5000/api/admin/settings'),
          fetch('http://localhost:5000/api/products')
        ]);

        const usersData = await usersRes.json();
        const sellersData = await sellersRes.json();
        const settingsData = await settingsRes.json();
        const productsData = await productsRes.json();

        setUsers(Array.isArray(usersData) ? usersData : []);
        setSellers(Array.isArray(sellersData) ? sellersData : []);
        setSettings(Array.isArray(settingsData) ? settingsData : []);
        setProducts(Array.isArray(productsData) ? productsData : (productsData.products || []));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleUpload = async (e, key, label) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optimistic UI update / Preview local
    const localPreviewUrl = URL.createObjectURL(file);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', key);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/settings/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        
        // Broadcast the update to other tabs (Homepage, etc.)
        const channel = new BroadcastChannel('admin_settings_update');
        channel.postMessage('refresh');
        channel.close();

        // Instant UI update by updating the settings state locally
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
    return setting ? `http://localhost:5000${setting.value}` : null;
  };

  if (!admin || loading) return <div className="admin-dashboard"><div style={{ padding: '80px', textAlign: 'center', fontWeight: '900', fontSize: '24px' }}>INITIALIZING CORE...</div></div>;

  return (
    <div className="admin-dashboard">
      {/* Top Navigation */}
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
            <div className="badge-avatar">{admin.name.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{admin.name}</span>
          </div>
          <button className="logout-btn-nav" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      {/* Main Content Area */}
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
              <h1>ORDER LOGS</h1>
              <p>Review and process all platform sales.</p>
            </header>
            <div className="admin-card-stylish">
              <h2>Recent Orders</h2>
              <p style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '18px', fontWeight: '600' }}>
                No active orders recorded at this time.
              </p>
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
                      <td>{product.category || 'General'}</td>
                      <td>${product.price}</td>
                      <td>{product.stock} units</td>
                      <td>{product.sellerName || 'Platform'}</td>
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
                  key: 'hero_bg', 
                  label: 'Primary Hero Background', 
                  desc: 'The flagship visual asset for the homepage. Defines the first impression for all visitors.',
                  location: 'HOMEPAGE / HERO SECTION' 
                },
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

      {/* Center Toast Notification */}
      {toast.show && (
        <div className="admin-toast-container">
          {toast.message}
        </div>
      )}
    </div>
  );
}






