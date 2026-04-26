'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Package, DollarSign, ShoppingBag } from 'lucide-react';
import './seller-dashboard.css';
import './seller-dashboard.css';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  const fetchSellerProducts = async (sellerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products?sellerId=${sellerId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Dashboard...</div>;

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
              <h3>Total Sales</h3>
              <p>₹0.00</p>
            </div>
            <div className="stat-card">
              <h3>Active Orders</h3>
              <p>0</p>
            </div>
          </div>

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
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <img 
                              src={product.images?.[0]?.url || '/placeholder.png'} 
                              alt={product.name} 
                              className="product-img-small"
                            />
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td>{product.Category?.name || 'General'}</td>
                        <td>{product.style || 'N/A'}</td>
                        <td style={{fontWeight: '700'}}>{product.brand || 'N/A'}</td>
                        <td>₹{product.price}</td>
                        <td><span className="status-badge">Active</span></td>
                        <td>
                          <Link href={`/seller/edit-product/${product.id}`} style={{color: '#000', fontWeight: '600'}}>Edit</Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>
                        No products listed yet. Start by adding your first item!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
