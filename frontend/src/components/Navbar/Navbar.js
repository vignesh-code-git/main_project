'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import { Search, ShoppingCart, UserCircle, ChevronDown, LogOut, LayoutDashboard, Menu, X, User, Package, Settings } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
        <div className="nav-left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="logo">SHOP.CO</Link>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li className="mobile-only logo-mobile"><Link href="/" onClick={() => setMobileMenuOpen(false)}>SHOP.CO</Link></li>
          <li className="has-dropdown">
            <Link href="/shop" className="dropdown-trigger">Shop <ChevronDown size={16} /></Link>
            <ul className="dropdown-menu">
              <li><Link href="/category/1">Casual</Link></li>
              <li><Link href="/category/2">Formal</Link></li>
              <li><Link href="/category/3">Party</Link></li>
              <li><Link href="/category/4">Gym</Link></li>
            </ul>
          </li>
          <li><Link href="/category/on-sale">On Sale</Link></li>
          <li><Link href="/category/new-arrivals">New Arrivals</Link></li>
          <li><Link href="/brands" onClick={() => setMobileMenuOpen(false)}>Brands</Link></li>
        </ul>

        <div className="search-bar desktop-only">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search for products..." />
        </div>

        <div className="nav-right">
          <div className="nav-icons">
            <button className="search-btn-mobile mobile-only">
              <Search size={24} />
            </button>
            <Link href="/cart" className="cart-icon" title="View Cart">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            </Link>
            
            {mounted && isAuthenticated ? (
              <div className="user-dropdown-container">
                <button 
                  className="user-trigger" 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  {mounted && user?.avatar ? (
                    <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="nav-avatar-img" />
                  ) : (
                    <UserCircle size={24} />
                  )}
                  <span className="user-name-text">Hi, {user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={userDropdownOpen ? 'rotate' : ''} />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <p className="user-full-name">{user.name}</p>
                      <p className="user-email-text">{user.email}</p>
                      <span className="user-role-badge">{user.role}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link href="/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <User size={16} /> My Profile
                    </Link>
                    <Link href="/orders" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <Package size={16} /> My Orders
                    </Link>
                    <Link href="/settings" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="nav-login-link" title="Login">
                <UserCircle size={24} />
              </Link>
            )}
          </div>
          {renderAuthLinks()}
        </div>
      </div>
    </nav>
  );
}
