'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Package,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import axios from 'axios';
import './products.css';

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, stock-asc, name
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, outofstock
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProducts();

    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/products/seller/my-products', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setProducts(response.data.products || (Array.isArray(response.data) ? response.data : []));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const processedProducts = (products || [])
    .filter(p => {
      if (!p) return false;
      
      const searchLower = (searchTerm || '').toLowerCase();
      const productName = (p.name || '').toLowerCase();
      const categoryName = (p.Category?.name || '').toLowerCase();
      
      const matchesSearch = productName.includes(searchLower) || 
                           categoryName.includes(searchLower);
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && (p.stock || 0) > 0) ||
                           (filterStatus === 'outofstock' && (p.stock === 0 || !p.stock));
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock-asc') return (a.stock || 0) - (b.stock || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Products</h1>
            <p>Manage and track your inventory</p>
          </div>
          <div className="header-actions">
            <Link href="/seller/add-product" className="add-btn">
              <Plus size={20} /> Add New Product
            </Link>
          </div>
        </div>

        <div className="filters-bar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dropdown-container" ref={filterRef}>
            <button 
              className={`action-btn ${showFilterDropdown ? 'active' : ''}`} 
              title="Filter"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <SlidersHorizontal size={18} />
              {filterStatus !== 'all' && <span className="active-dot"></span>}
            </button>
            {showFilterDropdown && (
              <div className="action-dropdown">
                <div className="dropdown-label">Filter by Status</div>
                <button className={`dropdown-item ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => { setFilterStatus('all'); setShowFilterDropdown(false); }}>All Products</button>
                <button className={`dropdown-item ${filterStatus === 'active' ? 'active' : ''}`} onClick={() => { setFilterStatus('active'); setShowFilterDropdown(false); }}>Active</button>
                <button className={`dropdown-item ${filterStatus === 'outofstock' ? 'active' : ''}`} onClick={() => { setFilterStatus('outofstock'); setShowFilterDropdown(false); }}>Out of Stock</button>
              </div>
            )}
          </div>

          <div className="dropdown-container" ref={sortRef}>
            <button 
              className={`action-btn ${showSortDropdown ? 'active' : ''}`} 
              title="Sort"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <ArrowUpDown size={18} />
            </button>
            {showSortDropdown && (
              <div className="action-dropdown">
                <div className="dropdown-label">Sort Products</div>
                <button className={`dropdown-item ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}>Newest First</button>
                <button className={`dropdown-item ${sortBy === 'price-asc' ? 'active' : ''}`} onClick={() => { setSortBy('price-asc'); setShowSortDropdown(false); }}>Price: Low to High</button>
                <button className={`dropdown-item ${sortBy === 'price-desc' ? 'active' : ''}`} onClick={() => { setSortBy('price-desc'); setShowSortDropdown(false); }}>Price: High to Low</button>
                <button className={`dropdown-item ${sortBy === 'stock-asc' ? 'active' : ''}`} onClick={() => { setSortBy('stock-asc'); setShowSortDropdown(false); }}>Stock: Low First</button>
                <button className={`dropdown-item ${sortBy === 'name' ? 'active' : ''}`} onClick={() => { setSortBy('name'); setShowSortDropdown(false); }}>Name: A-Z</button>
              </div>
            )}
          </div>
        </div>

        <div className="products-table-container">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading your products...</p>
            </div>
          ) : processedProducts.length > 0 ? (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info-cell">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
                          alt=""
                          className="product-img-mini"
                        />
                        <div className="product-name-wrapper">
                          <span className="product-name">{product.name}</span>
                          <span className="product-sku">ID: {product.id.toString().slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.Category?.name || 'Uncategorized'}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock || 0} in stock</td>
                    <td>
                      <span className={`status-badge status-${product.stock > 0 ? 'active' : 'outofstock'}`}>
                        {product.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <Link href={`/product/${product.id}`} className="action-btn" title="View Store">
                          <ExternalLink size={16} />
                        </Link>
                        <Link href={`/seller/edit-product/${product.id}`} className="action-btn" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button className="action-btn delete" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Package size={40} />
              </div>
              <h3>No products found</h3>
              <p>Start adding your first product to see it here in your inventory.</p>
              <Link href="/seller/add-product" className="add-btn" style={{ marginTop: '20px' }}>
                Add First Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
