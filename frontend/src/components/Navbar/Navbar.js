'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import { fetchCart } from '@/lib/redux/slices/cartSlice';
import { Search, ShoppingCart, UserCircle, ChevronDown, LogOut, LayoutDashboard, Menu, X, User, Package, Settings, Loader2, Bell, Info } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders, resolveImageUrl } from '@/config/api';
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
  const [totalNotifs, setTotalNotifs] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const pollingRef = useRef(null);

  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);

  const cartItemsCount = useSelector((state) => state.cart.totalQuantity);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);

    // --- AUTOMATIC CONNECTIVITY TEST ---
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    })
      .then(res => {
        if (res.ok) console.log("%c✅ BACKEND & AUTH CONNECTED!", "color: #00ff00; font-weight: bold; font-size: 16px;");
        else if (res.status === 401) console.log("%cℹ️ BACKEND CONNECTED (Please Log In)", "color: #00aaff; font-weight: bold; font-size: 16px;");
        else console.log("%c⚠️ BACKEND LINK WRONG (Status " + res.status + ")", "color: #ffaa00; font-weight: bold; font-size: 16px;");
      })
      .catch(err => {
        console.log("%c❌ BACKEND CONNECTION FAILED!", "color: #ff0000; font-weight: bold; font-size: 16px;");
        console.error("Technical Error:", err.message);
      });

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

  // Fetch Cart when logged in
  useEffect(() => {
    if (mounted && isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [mounted, isAuthenticated, dispatch]);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);

      const res = await fetch(`${API_BASE_URL}/api/notifications?page=${pageNum}&limit=10`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        const newNotifs = Array.isArray(data.notifications) ? data.notifications : [];

        if (append) {
          setNotifications(prev => [...prev, ...newNotifs]);
        } else {
          setNotifications(newNotifs);
        }

        setTotalNotifs(data.total || 0);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (append) setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      // Initial fetch
      fetchNotifications(1, false);

      // Listen for custom "newOrder" event for instant update
      const handleNewOrder = () => fetchNotifications(1, false);
      window.addEventListener('newOrder', handleNewOrder);

      // Poll for new notifications every 30 seconds
      pollingRef.current = setInterval(() => {
        // Only poll for the first page to keep it light
        fetchNotifications(1, false);
      }, 30000);

      return () => {
        window.removeEventListener('newOrder', handleNewOrder);
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [mounted, isAuthenticated, user]);

  const handleMarkAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        // Optimistically clear the unread indicators
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    // 1. Mark as read in backend if not already read
    if (!notif.isRead) {
      try {
        await fetch(`${API_BASE_URL}/api/notifications/mark-read/${notif.id}`, {
          method: 'PUT',
          headers: getAuthHeaders()
        });
        // Update local state
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Error marking individual notification as read:', err);
      }
    }

    // 2. Route based on type
    setNotificationOpen(false);
    
    if (notif.type === 'order') {
      router.push('/orders');
    } else if (notif.type === 'inventory') {
      router.push('/seller/dashboard');
    } else if (notif.type === 'system' || notif.title.includes('Cart')) {
      router.push('/cart');
    } else if (notif.metadata?.productId) {
      router.push(`/product/${notif.metadata.productId}`);
    }
  };

  // Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
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
        headers: getAuthHeaders()
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
      return <Link href="/seller/auth?signup=true" className="become-seller-link">Become a Seller</Link>;
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

            {/* Mobile-only: Dashboard links */}
            {mounted && (
              <li className="mobile-link-item mobile-only">
                {user && user.role === 'admin' ? (
                  <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                ) : user && user.role === 'seller' ? (
                  <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Seller Panel
                  </Link>
                ) : (
                  <Link href="/seller/auth?signup=true" className="mobile-only" onClick={() => setMobileMenuOpen(false)}>
                    Become a Seller
                  </Link>
                )}
              </li>
            )}

            <li className="mobile-link-item">
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
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
              onFocus={() => searchQuery.length >= 1 && setShowResults(true)}
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
                          src={product.images && product.images[0] ? resolveImageUrl(product.images[0].url) : '/placeholder.png'}
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
            {showResults && searchQuery.length >= 1 && searchResults.length === 0 && !isSearching && (
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
                    onClick={() => setNotificationOpen(!notificationOpen)}
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
                    <div className="notification-panel professional-panel">
                      <div className="notification-header">
                        <div className="header-info">
                          <h3>Notifications</h3>
                        </div>
                        <span className="mark-all-read-link" onClick={handleMarkAsRead}>
                          Mark all as read
                        </span>
                      </div>

                      <div className="notification-list">
                        {notifications.length === 0 ? (
                          <div className="no-notifications">
                            <div className="empty-notif-icon">
                              <Bell size={32} />
                            </div>
                            <p>No new notifications</p>
                            <span>We'll notify you when something happens</span>
                          </div>
                        ) : (
                          Object.entries(
                            notifications.reduce((groups, notif) => {
                              const date = new Date(notif.createdAt);
                              const today = new Date();
                              const yesterday = new Date();
                              yesterday.setDate(today.getDate() - 1);

                              let dateLabel = "";
                              if (date.toDateString() === today.toDateString()) {
                                dateLabel = "Today";
                              } else if (date.toDateString() === yesterday.toDateString()) {
                                dateLabel = "Yesterday";
                              } else {
                                dateLabel = date.toLocaleDateString(undefined, {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                });
                              }

                              if (!groups[dateLabel]) groups[dateLabel] = [];
                              groups[dateLabel].push(notif);
                              return groups;
                            }, {})
                          ).map(([dateLabel, groupNotifs]) => (
                            <div key={dateLabel} className="notif-date-group">
                              <div className="notif-date-header">{dateLabel}</div>
                              {groupNotifs.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                  onClick={() => handleNotifClick(notif)}
                                >
                                  <div className="notif-avatar-wrapper">
                                    {notif.metadata?.imageUrl ? (
                                      <img
                                        src={resolveImageUrl(notif.metadata.imageUrl)}
                                        alt="Notification"
                                        className="notif-image"
                                      />
                                    ) : (
                                      <div className={`notif-icon-circle ${notif.type}`}>
                                        <Bell size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="notif-content">
                                    <div className="notif-top">
                                      <h4 className="notif-title">{notif.title}</h4>
                                      {!notif.isRead && <div className="unread-indicator"></div>}
                                    </div>
                                    <p className="notif-message">{notif.message}</p>
                                    <div className="notif-bottom">
                                      <span className="notif-time">
                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="notification-footer professional-footer">
                          <span className="total-notif-text">
                            Showing {notifications.length} results of {totalNotifs} notifications
                          </span>
                          {notifications.length < totalNotifs ? (
                            <button
                              className="view-more-link"
                              onClick={() => fetchNotifications(page + 1, true)}
                              disabled={loadingMore}
                            >
                              {loadingMore ? 'Loading...' : 'View more'}
                            </button>
                          ) : (
                            <span className="all-caught-up-text">
                              All caught up
                            </span>
                          )}
                        </div>
                      )}
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
                      <img src={resolveImageUrl(user.avatar)} alt="Avatar" className="nav-avatar-img" />
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
                      <Link href="/about" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <Info size={16} /> About
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
            <div className="desktop-only">{renderAuthLinks()}</div>
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

            {showResults && searchQuery.length >= 1 && (
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
                            src={product.images && product.images[0] ? resolveImageUrl(product.images[0].url) : '/placeholder.png'}
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

