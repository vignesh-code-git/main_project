'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Package, DollarSign, ShoppingBag } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import './seller-dashboard.css';
import './seller-dashboard.css';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/seller/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'seller') {
      router.push('/');
      return;
    }

    setUser(userData);
    fetchSellerProducts(userData.id);
    fetchSellerOrders(userData.id);
  }, []);

  const fetchSellerProducts = async (sellerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products?sellerId=${sellerId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchSellerOrders = async (sellerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/seller/${sellerId}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    setDeleteModal({ isOpen: true, productId: id });
  };

  const executeDelete = async () => {
    const id = deleteModal.productId;
    setDeleteModal({ isOpen: false, productId: null });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <>
      <div className="seller-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1>{user?.storeName || 'My Store'}</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
            <Link href="/seller/add-product" className="add-btn">
              <Plus size={20} /> Add New Product
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p>{products.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>₹{(orders || []).reduce((acc, order) => {
                // Sum items that belong to this seller
                const sellerTotal = (order.OrderItems || [])
                  .filter(item => item.Product?.sellerId === user?.id)
                  .reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return acc + (sellerTotal || 0);
              }, 0).toFixed(2)}</p>
            </div>
            <div className="stat-card highlight">
              <h3>Active Orders</h3>
              <p>{orders.filter(o => o.status !== 'Delivered').length}</p>
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
                                  src={product.images?.[0]?.url || '/placeholder.png'}
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
                          <td><span className="status-badge">Active</span></td>
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
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
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
                            <select
                              className="status-dropdown-seller"
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              disabled={isUpdating}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
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
        </div>
      </div>
      
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
