'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import { Search, ShoppingCart, UserCircle, ChevronDown, LogOut, LayoutDashboard, Menu, X, User, Package, Settings, Loader2 } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const cartItemsCount = useSelector((state) => state.cart.totalQuantity);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`, { cache: 'no-store' });
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
          setShowResults(true);
        } catch (err) {
          console.error("Live search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setShowResults(false);
    }
  };

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
              placeholder="Search for products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            {isSearching && (
              <div className="search-loader">
                <Loader2 className="animate-spin" size={16} />
              </div>
            )}
            
            {showResults && searchResults.length > 0 && (
              <div className="search-dropdown">
                <div className="search-results-list">
                  {searchResults.map(product => (
                    <Link 
                      href={`/product/${product.id}`} 
                      key={product.id} 
                      className="search-result-item"
                      onClick={() => setShowResults(false)}
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
                </div>
                <button className="view-all-results" onClick={handleSearch}>
                  View all results for "{searchQuery}"
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

