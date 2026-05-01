'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import { Search, ShoppingCart, UserCircle, ChevronDown, LogOut, LayoutDashboard, Menu, X, User, Package, Settings, Loader2, Bell } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [notifications, setNotifications] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);

  const cartItemsCount = useSelector((state) => state.cart.totalQuantity);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Notifications based on role (Real Database values)
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/notifications`, {
            credentials: 'include', // Use cookies
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      };

      fetchNotifications();
      // Optional: Poll every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, isAuthenticated, user]);

  const handleMarkAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        // Optimistically clear the unread indicators
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setSelectedIndex(-1);
        try {
          const res = await fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`, { cache: 'no-store' });
          const data = await res.json();
          setSearchResults(data.products || []);
          setTotalResults(data.total || 0);
          setShowResults(true);
        } catch (err) {
          console.error("Live search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setShowResults(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        e.preventDefault();
        router.push(`/product/${searchResults[selectedIndex].id}`);
        setShowResults(false);
        setSearchQuery('');
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setShowResults(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include' 
      });
      dispatch(logout());
      window.location.href = '/'; 
    } catch (err) {
      console.error('Logout failed:', err);
      dispatch(logout());
      window.location.href = '/';
    }
  };

  // Prevent hydration mismatch by returning null for auth-dependent parts during SSR
  const renderAuthLinks = () => {
    if (!mounted) return <Link href="/seller/auth" className="become-seller-link">Become a Seller</Link>;

    if (user && user.role === 'admin') {
      return (
        <Link href="/admin/dashboard" className="become-seller-link dashboard-link admin-link">
          <LayoutDashboard size={14} /> <span className="nav-link-text">Admin Panel</span>
        </Link>
      );
    }

    if (user && user.role === 'seller') {
      return (
        <Link href="/seller/dashboard" className="become-seller-link dashboard-link">
          <LayoutDashboard size={14} /> <span className="nav-link-text">Seller Panel</span>
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
      {!mobileSearchOpen ? (
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
            <div className="mobile-menu-header mobile-only">
              <Link href="/" className="logo-mobile" onClick={() => setMobileMenuOpen(false)}>SHOP.CO</Link>
              <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <li className="mobile-link-item">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            </li>
            <li className="mobile-link-item">
              <Link href="/category/on-sale" onClick={() => setMobileMenuOpen(false)}>On Sale</Link>
            </li>
            <li className="mobile-link-item">
              <Link href="/category/new-arrivals" onClick={() => setMobileMenuOpen(false)}>New Arrivals</Link>
            </li>
            <li className="mobile-link-item">
              <Link href="/brands" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
            </li>
          </ul>

          <div className="search-bar desktop-only" ref={searchRef}>
            <Search 
              size={20} 
              className="nav-search-icon-fixed" 
              onClick={handleSearch}
              style={{ cursor: 'pointer' }}
            />
            <input 
              type="text" 
              placeholder="Search for products, brands, styles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              onKeyDown={handleKeyDown}
            />
            {isSearching && (
              <div className="search-loader">
                <Loader2 className="animate-spin" size={16} />
              </div>
            )}
            
            {showResults && searchResults.length > 0 && (
              <div className="search-dropdown">
                <div className="search-header-meta">
                  <span>Found {totalResults} results</span>
                  {totalResults > 8 && <span className="view-hint">Showing top 8</span>}
                </div>
                <div className="search-results-list">
                  {searchResults.map((product, index) => (
                    <Link 
                      href={`/product/${product.id}`} 
                      key={product.id} 
                      className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => {
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="result-img">
                        <img 
                          src={product.images && product.images[0] ? product.images[0].url : '/placeholder.png'} 
                          alt={product.name} 
                        />
                      </div>
                      <div className="result-info">
                        <div className="result-top">
                          <p className="result-name">{product.name}</p>
                          <div className="result-meta">
                            {product.brand && <span className="result-brand">{product.brand}</span>}
                            {product.style && <span className="result-style">{product.style}</span>}
                          </div>
                        </div>
                        <p className="result-price">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <button className="view-all-results" onClick={handleSearch}>
                  View all {totalResults} results for "{searchQuery}"
                </button>
              </div>
            )}
            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="search-dropdown no-results">
                No products found for "{searchQuery}"
              </div>
            )}
          </div>

          <div className="nav-right">
            <div className="nav-icons">
              <button 
                className="mobile-search-trigger" 
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={24} />
              </button>

              <Link href="/cart" className="cart-icon" title="View Cart">
                <ShoppingCart size={24} />
                {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
              </Link>

              {mounted && isAuthenticated && (
                <div className="notification-container" ref={notificationRef}>
                  <button 
                    className="notification-trigger" 
                    onClick={() => {
                      setNotificationOpen(!notificationOpen);
                      if (!notificationOpen) handleMarkAsRead();
                    }}
                    title="Notifications"
                  >
                    <Bell size={24} />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="notification-badge">
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="notification-panel">
                      <div className="notification-header">
                        <h3>Notifications</h3>
                        <span className="notif-count">
                          {notifications.filter(n => !n.isRead).length} New
                        </span>
                      </div>
                      <div className="notification-list">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div key={notif.id} className={`notification-item ${notif.type} ${!notif.isRead ? 'unread' : ''}`}>
                              <div className="notif-content">
                                <p className="notif-title">{notif.title}</p>
                                <p className="notif-message">{notif.message}</p>
                                <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-notifications">
                            <p>No new notifications</p>
                          </div>
                        )}
                      </div>
                      <div className="notification-footer">
                        <button onClick={handleMarkAsRead}>Clear all as read</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mounted && isAuthenticated ? (
                <div className="user-dropdown-container" ref={userDropdownRef}>
                  <button
                    className="user-trigger"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    {mounted && user?.avatar ? (
                      <img src={`${API_BASE_URL}${user.avatar}`} alt="Avatar" className="nav-avatar-img" />
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
      ) : (
        <div className="mobile-search-full-width">
          <form className="mobile-search-container" onSubmit={handleSearch}>
            <Search 
              size={20} 
              className="mobile-search-icon" 
              onClick={handleSearch}
            />
            <input
              type="text"
              placeholder="Search for products..."
              autoFocus
              className="mobile-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="mobile-search-close"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X size={24} />
            </button>
            
            {showResults && searchQuery.length >= 2 && (
              <div className="mobile-search-results search-dropdown">
                {searchResults.length > 0 ? (
                  <div className="search-results-list">
                    {searchResults.map(product => (
                      <Link 
                        href={`/product/${product.id}`} 
                        key={product.id} 
                        className="search-result-item"
                        onClick={() => {
                          setMobileSearchOpen(false);
                          setShowResults(false);
                        }}
                      >
                        <div className="result-img">
                          <img 
                            src={product.images && product.images[0] ? product.images[0].url : '/placeholder.png'} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="result-info">
                          <p className="result-name">{product.name}</p>
                          <p className="result-price">₹{product.price}</p>
                        </div>
                      </Link>
                    ))}
                    <button className="view-all-results" onClick={handleSearch}>
                      View all results
                    </button>
                  </div>
                ) : !isSearching && (
                  <div className="no-results-msg">No products found</div>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </nav>
  );
}

