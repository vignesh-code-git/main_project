'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import { X } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import Pagination from '@/components/Pagination/Pagination';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import './admin.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [sellers, setSellers] = useState([]);
  const [sellerPagination, setSellerPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assetTab, setAssetTab] = useState('categories');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    fetchData(tab, 1);
  };

  const [allOrders, setAllOrders] = useState([]);
  const [orderPagination, setOrderPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [assetPagination, setAssetPagination] = useState({ total: 0, currentPage: 1, totalPages: 1 });

  // Missing State Restored
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [styles, setStyles] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  const [newSizeName, setNewSizeName] = useState('');
  const [newColor, setNewColor] = useState({ name: '', hexCode: '' });
  
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ 
    id: null, 
    type: '', 
    listSetter: null, 
    title: '', 
    message: '' 
  });

  const fetchData = async (tab = activeTab, page = 1) => {
    try {
      setLoading(true);
      let endpoint = '';
      if (tab === 'customers') endpoint = `${API_BASE_URL}/api/admin/users?page=${page}&limit=9`;
      else if (tab === 'sellers') endpoint = `${API_BASE_URL}/api/admin/sellers?page=${page}&limit=9`;
      else if (tab === 'products') endpoint = `${API_BASE_URL}/api/products?page=${page}&limit=9`;
      else if (tab === 'orders') endpoint = `${API_BASE_URL}/api/orders?page=${page}&limit=9`;
      else if (['categories', 'brands', 'styles', 'sizes', 'colors'].includes(tab)) endpoint = `${API_BASE_URL}/api/admin/${tab}?page=${page}&limit=9`;
      else if (tab === 'assets') {
        // Default assets load (categories)
        endpoint = `${API_BASE_URL}/api/admin/categories?page=${page}&limit=9`;
      }
      else if (tab === 'dashboard') {
        // Initial load for overview stats
        const [u, s, p, o] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/users?limit=9`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/admin/sellers?limit=9`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products?limit=9`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/orders?limit=9`, { headers: getAuthHeaders() })
        ]);
        const ud = await u.json();
        const sd = await s.json();
        const pd = await p.json();
        const od = await o.json();
        setProducts(pd.products || []);
        setProductPagination({ total: pd.total, currentPage: pd.currentPage, totalPages: pd.totalPages });
        
        const sTotal = sd.total || (Array.isArray(sd) ? sd.length : 0);
        setSellerPagination({ total: sTotal, currentPage: sd.currentPage || 1, totalPages: sd.totalPages || Math.ceil(sTotal / 9) || 1 });
        
        const uTotal = ud.total || (Array.isArray(ud) ? ud.length : 0);
        setUserPagination({ total: uTotal, currentPage: ud.currentPage || 1, totalPages: ud.totalPages || Math.ceil(uTotal / 9) || 1 });

        setAllOrders(od.orders || (Array.isArray(od) ? od : []));
        const oTotal = od.total || (Array.isArray(od) ? od.length : 0);
        const oLimit = 9;
        setOrderPagination({ 
          total: oTotal, 
          currentPage: od.currentPage || 1, 
          totalPages: od.totalPages || Math.ceil(oTotal / oLimit) || 1
        });
        setLoading(false);
        return;
      }

      if (endpoint) {
        const res = await fetch(endpoint, { headers: getAuthHeaders() });
        const data = await res.json();
        if (tab === 'customers') {
          const userArr = data.users || (Array.isArray(data) ? data : []);
          setUsers(userArr);
          const uTotal = data.total || userArr.length;
          setUserPagination({ total: uTotal, currentPage: data.currentPage || 1, totalPages: data.totalPages || Math.ceil(uTotal / 9) || 1 });
        } else if (tab === 'sellers') {
          const sellerArr = data.sellers || (Array.isArray(data) ? data : []);
          setSellers(sellerArr);
          const sTotal = data.total || sellerArr.length;
          setSellerPagination({ total: sTotal, currentPage: data.currentPage || 1, totalPages: data.totalPages || Math.ceil(sTotal / 9) || 1 });
        } else if (tab === 'products') {
          setProducts(data.products || []);
          setProductPagination({ total: data.total, currentPage: data.currentPage, totalPages: data.totalPages });
        } else if (tab === 'orders') {
          const ordersArr = Array.isArray(data) ? data : (data.orders || []);
          setAllOrders(ordersArr);
          const oTotal = data.total || ordersArr.length;
          const oLimit = 9;
          setOrderPagination({ 
            total: oTotal, 
            currentPage: data.currentPage || 1, 
            totalPages: data.totalPages || Math.ceil(oTotal / oLimit) || 1
          });
        } else if (['categories', 'brands', 'styles', 'sizes', 'colors'].includes(tab)) {
          if (tab === 'categories') setCategories(data.categories || []);
          else if (tab === 'brands') setBrands(data.brands || []);
          else if (tab === 'styles') setStyles(data.styles || []);
          else if (tab === 'sizes') setSizes(data.sizes || []);
          else if (tab === 'colors') setColors(data.colors || []);
          setAssetPagination({ total: data.total, currentPage: data.currentPage, totalPages: data.totalPages });
        }
      }

      // Always fetch assets/settings if needed or once
      if (categories.length === 0) {
        const [settingsRes, catRes, brandRes, styleRes, sizeRes, colorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/settings`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/categories`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/brands`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/styles`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/sizes`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/products/colors`, { headers: getAuthHeaders() })
        ]);

        const settingsData = await settingsRes.json();
        const categoriesData = await catRes.json();
        const brandsData = await brandRes.json();
        const stylesData = await styleRes.json();
        const sizesData = await sizeRes.json();
        const colorsData = await colorRes.json();

        setSettings(Array.isArray(settingsData) ? settingsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setStyles(Array.isArray(stylesData) ? stylesData : []);
        setSizes(Array.isArray(sizesData) ? sizesData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (!isAuthenticated || (authUser && authUser.role !== 'admin')) {
      const timer = setTimeout(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) {
          router.push('/auth/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    fetchData();
  }, [isAuthenticated, authUser, router]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const detectColorName = (hex) => {
    const colorMap = {
      '#000000': 'Black',
      '#ffffff': 'White',
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ffa500': 'Orange',
      '#800080': 'Purple',
      '#ffc0cb': 'Pink',
      '#a52a2a': 'Brown',
      '#808080': 'Gray',
      '#008080': 'Teal',
      '#00ffff': 'Cyan',
      '#ff00ff': 'Magenta',
      '#4b0082': 'Indigo',
      '#ee82ee': 'Violet',
      '#ffd700': 'Gold',
      '#c0c0c0': 'Silver',
      '#f5f5dc': 'Beige',
      '#808000': 'Olive',
      '#000080': 'Navy',
      '#87ceeb': 'Sky Blue',
      '#32cd32': 'Lime',
      '#dc143c': 'Crimson',
      '#ff4500': 'Orange Red',
      '#2f4f4f': 'Dark Slate Gray',
      '#00ced1': 'Dark Turquoise',
      '#9400d3': 'Dark Violet',
      '#ff1493': 'Deep Pink',
      '#b22222': 'Fire Brick',
      '#228b22': 'Forest Green',
      '#f08080': 'Light Coral',
      '#20b2aa': 'Light Sea Green',
      '#778899': 'Light Slate Gray',
      '#ba55d3': 'Medium Orchid',
      '#4169e1': 'Royal Blue',
      '#6b8e23': 'Olive Drab',
      '#8b4513': 'Saddle Brown',
      '#4682b4': 'Steel Blue',
      '#d2b48c': 'Tan'
    };
    return colorMap[hex.toLowerCase()] || '';
  };

  const presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#008080', '#00ffff', '#ff00ff', '#4b0082', '#ee82ee',
    '#ffd700', '#c0c0c0', '#f5f5dc', '#808000', '#000080', '#87ceeb', '#32cd32', '#dc143c',
    '#ff4500', '#2f4f4f', '#00ced1', '#9400d3', '#ff1493', '#b22222', '#228b22', '#f08080'
  ];

  const handleUpload = async (e, key, label) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', key);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`ORDER #${orderId.split('-')[0]} UPDATED TO ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCategoryName })
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(prev => [...prev, data]);
        setNewCategoryName('');
        showToast('CATEGORY ADDED SUCCESSFULLY');
      } else {
        const err = await res.json();
        showToast(err.message || 'FAILED TO ADD CATEGORY');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      showToast('CONNECTION ERROR');
    }
  };

  const handleDeleteCategory = (id) => {
    setDeleteConfig({
      id,
      type: 'categories',
      listSetter: setCategories,
      title: 'Delete Category?',
      message: 'Are you sure you want to remove this category? This will affect all products currently linked to it.'
    });
    setIsDeleteModalOpen(true);
  };

  const handleAddAsset = async (type, payload, setList, setInput) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/${type}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setList(prev => [...prev, data]);
        if (typeof setInput === 'function') setInput('');
        else setInput(''); // Fallback
        showToast(`${type.toUpperCase()} ADDED`);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteAsset = (type, id, setList) => {
    setDeleteConfig({
      id,
      type,
      listSetter: setList,
      title: `Delete ${type.slice(0, -1).toUpperCase()}?`,
      message: `Are you sure you want to permanently remove this ${type.slice(0, -1)}? This action cannot be undone.`
    });
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    const { id, type, listSetter } = deleteConfig;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        listSetter(prev => prev.filter(item => item.id !== id));
        showToast('DELETED SUCCESSFULLY');
        setIsDeleteModalOpen(false);
      } else {
        const err = await res.json();
        showToast(err.message || 'FAILED TO DELETE');
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting asset:', err);
      showToast('CONNECTION ERROR');
      setIsDeleteModalOpen(false);
    }
  };

  if (!authUser || loading) return <div className="admin-dashboard"><div style={{ padding: '80px', textAlign: 'center', fontWeight: '900', fontSize: '24px' }}>INITIALIZING CORE...</div></div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header-nav">
        <div className="admin-header-top">
          <div className="nav-brand">
            <h2>ADMIN PANEL</h2>
          </div>

          <div className="nav-actions">
            <div className="user-badge">
              <div className="badge-avatar">{authUser.name.charAt(0).toUpperCase()}</div>
              <div className="user-details-mini">
                <span className="user-name-small">{authUser.name}</span>
              </div>
            </div>
          </div>

        </div>

        <nav className="nav-tabs">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: 'Products' },
            { id: 'assets', label: 'Store Assets' },
            { id: 'sellers', label: 'Sellers' },
            { id: 'customers', label: 'Customers' },
            { id: 'settings', label: 'Web Settings' },
          ].map(item => (
            <div
              key={item.id}
              className={`nav-tab-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Master Order List</h2>
                {orderPagination.total > 0 && (
                  <div style={{ minWidth: '300px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination 
                      currentPage={orderPagination.currentPage}
                      totalPages={orderPagination.totalPages}
                      onPageChange={(page) => fetchData('orders', page)}
                    />
                  </div>
                )}
              </div>
              <div className="admin-table-wrapper">
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
                          <div style={{ width: '150px' }}>
                            <CustomSelect
                              options={['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']}
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            />
                          </div>
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
          </div>
        )}

        {activeTab === 'products' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>PLATFORM INVENTORY</h1>
              <p>Manage all items listed across the storefront.</p>
            </header>
            <div className="admin-card-stylish">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Master Product List</h2>
                {productPagination.totalPages > 1 && (
                  <Pagination 
                    currentPage={productPagination.currentPage}
                    totalPages={productPagination.totalPages}
                    onPageChange={(page) => fetchData('products', page)}
                  />
                )}
              </div>
              <div className="admin-table-wrapper">
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
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>STORE ASSET MANAGEMENT</h1>
              <p>Configure dynamic product attributes like Categories, Brands, and Sizes.</p>
            </header>

            <nav className="asset-sub-tabs">
              {['categories', 'brands', 'styles', 'sizes', 'colors'].map(t => (
                <div key={t} className={`asset-tab ${assetTab === t ? 'active' : ''}`} onClick={() => {
                  setAssetTab(t);
                  fetchData(t, 1);
                }}>
                  {t.toUpperCase()}
                </div>
              ))}
            </nav>

            <div className="admin-card-stylish">
              <div className="asset-header-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>{assetTab.toUpperCase()} LIST</h2>
                  {assetPagination.totalPages > 1 && (
                    <Pagination 
                      currentPage={assetPagination.currentPage}
                      totalPages={assetPagination.totalPages}
                      onPageChange={(page) => fetchData(assetTab, page)}
                    />
                  )}
                </div>
                
                <div className="admin-inline-form">
                  {assetTab === 'colors' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                      <div className="color-presets-grid-admin">
                        {presetColors.map(hex => (
                          <div
                            key={hex}
                            className={`preset-box-admin ${newColor.hexCode.toLowerCase() === hex.toLowerCase() ? 'active' : ''}`}
                            style={{ backgroundColor: hex }}
                            onClick={() => {
                              const name = detectColorName(hex);
                              setNewColor({ hexCode: hex, name: name || newColor.name });
                            }}
                            title={detectColorName(hex)}
                          />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
                        <div className="color-preview-wrapper-admin">
                          {newColor.hexCode ? (
                            <div className="color-preview-box-active" style={{ backgroundColor: newColor.hexCode }} />
                          ) : (
                            <div className="color-preview-box-empty" />
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Color Name"
                          value={newColor.name}
                          onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                          className="admin-input-stylish"
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={() => {
                            if (!newColor.hexCode || !newColor.name) return showToast('PICK A COLOR FROM THE GRID');
                            handleAddAsset('colors', newColor, setColors, () => setNewColor({ name: '', hexCode: '' }));
                          }}
                          className="btn-upload-premium"
                        >ADD COLOR</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder={`New ${assetTab === 'categories' ? 'category' : assetTab.slice(0, -1)} name`}
                        value={assetTab === 'categories' ? newCategoryName : assetTab === 'brands' ? newBrandName : assetTab === 'styles' ? newStyleName : newSizeName}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (assetTab === 'categories') setNewCategoryName(val);
                          else if (assetTab === 'brands') setNewBrandName(val);
                          else if (assetTab === 'styles') setNewStyleName(val);
                          else setNewSizeName(val);
                        }}
                        className="admin-input-stylish"
                        style={{ maxWidth: '400px' }}
                      />
                      <button
                        onClick={() => {
                          if (assetTab === 'categories') handleAddAsset('categories', { name: newCategoryName }, setCategories, setNewCategoryName);
                          else if (assetTab === 'brands') handleAddAsset('brands', { name: newBrandName }, setBrands, setNewBrandName);
                          else if (assetTab === 'styles') handleAddAsset('styles', { name: newStyleName }, setStyles, setNewStyleName);
                          else handleAddAsset('sizes', { name: newSizeName }, setSizes, setNewSizeName);
                        }}
                        className="btn-upload-premium"
                      >ADD {assetTab.slice(0, -1).toUpperCase()}</button>
                    </>
                  )}
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      {assetTab === 'colors' && <th>Preview</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(assetTab === 'categories' ? categories : assetTab === 'brands' ? brands : assetTab === 'styles' ? styles : assetTab === 'sizes' ? sizes : colors).map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '800' }}>{item.name}</td>
                        {assetTab === 'colors' && (
                          <td>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: item.hexCode, border: '1px solid #ddd' }}></div>
                          </td>
                        )}
                        <td>
                          <button className="btn-delete-admin" onClick={() => handleDeleteAsset(assetTab, item.id, assetTab === 'categories' ? setCategories : assetTab === 'brands' ? setBrands : assetTab === 'styles' ? setStyles : assetTab === 'sizes' ? setSizes : setColors)}>DELETE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Business Directory</h2>
                {sellerPagination.total > 0 && (
                  <div style={{ minWidth: '300px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination 
                      currentPage={sellerPagination.currentPage}
                      totalPages={sellerPagination.totalPages}
                      onPageChange={(page) => fetchData('sellers', page)}
                    />
                  </div>
                )}
              </div>
              <div className="admin-table-wrapper">
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
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="view-container-stylish">
            <header className="admin-page-header">
              <h1>USER DIRECTORY</h1>
              <p>Management of individual platform customers.</p>
            </header>
            <div className="admin-card-stylish">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Customer List</h2>
                {userPagination.totalPages > 1 && (
                  <Pagination 
                    currentPage={userPagination.currentPage}
                    totalPages={userPagination.totalPages}
                    onPageChange={(page) => fetchData('customers', page)}
                  />
                )}
              </div>
              <div className="admin-table-wrapper">
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title={deleteConfig.title}
        message={deleteConfig.message}
        confirmText="Yes, Delete"
        cancelText="No, Keep it"
      />
    </div>
  );
}
