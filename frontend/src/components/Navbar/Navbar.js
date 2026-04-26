'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import { Search, ShoppingCart, UserCircle, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useSelector((state) => state.cart.totalQuantity);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/'; // Refresh to clear states
  };

  // Prevent hydration mismatch by returning null for auth-dependent parts during SSR
  const renderAuthLinks = () => {
    if (!mounted) return <Link href="/seller/auth" className="become-seller-link">Become a Seller</Link>;

    if (user && user.role === 'admin') {
      return (
        <Link href="/admin/dashboard" className="become-seller-link dashboard-link admin-link">
          <LayoutDashboard size={16} /> Admin Panel
        </Link>
      );
    }

    if (user && user.role === 'seller') {
      return (
        <Link href="/seller/dashboard" className="become-seller-link dashboard-link">
          <LayoutDashboard size={16} /> Seller Panel
        </Link>
      );
    }
    
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      return <Link href="/seller/auth" className="become-seller-link">Become a Seller</Link>;
    }

    return null;
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="logo">SHOP.CO</Link>

        <ul className="nav-links">
          <li className="has-dropdown">
            <Link href="/category/casual">Shop <ChevronDown size={16} /></Link>
          </li>
          <li><Link href="/category/on-sale">On Sale</Link></li>
          <li><Link href="/category/new-arrivals">New Arrivals</Link></li>
          <li><Link href="/brands">Brands</Link></li>
        </ul>

        {renderAuthLinks()}

        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search for products..." />
        </div>

        <div className="nav-icons">
          <Link href="/cart" className="cart-icon" title="View Cart">
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </Link>
          
          {mounted && isAuthenticated ? (
            <div className="user-nav-group">
              <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="logout-icon-btn" title="Logout">
                <LogOut size={24} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="nav-login-link" title="Login">
              <UserCircle size={24} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
