'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Search, ShoppingCart, UserCircle, ChevronDown } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const cartItemsCount = useSelector((state) => state.cart.items.length);

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

        <Link href="/seller/auth" className="become-seller-link">Become a Seller</Link>

        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Search for products..." />
        </div>

        <div className="nav-icons">
          <Link href="/cart" className="cart-icon" title="View Cart">
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </Link>
          <Link href="/auth/login" className="nav-login-link" title="Account">
            <UserCircle size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
