'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  BarChart3,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
  Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import './SellerNavbar.css';

export default function SellerNavbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/auth/login';
  };

  const navLinks = [
    { name: 'Overview', href: '/seller/dashboard', icon: LayoutDashboard, title: 'SELLER DASHBOARD' },
    { name: 'My Products', href: '/seller/products', icon: Package, title: 'MY PRODUCTS' },
    { name: 'Add Product', href: '/seller/add-product', icon: PlusCircle, title: 'ADD NEW PRODUCT' },
    { name: 'Performance', href: '/seller/stats', icon: BarChart3, title: 'PERFORMANCE STATS' },
  ];

  if (!mounted) return null;

  return (
    <nav className="seller-navbar sub-header">
      <div className="seller-nav-container">
        {/* Left: Enhanced Branding */}
        <div className="seller-nav-left">
          <span className="seller-panel-title">SELLER PANEL</span>
        </div>

        {/* Navigation Links - Centered */}
        <div className="seller-nav-center">
          <div className="seller-nav-links">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`seller-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
