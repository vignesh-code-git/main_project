'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import './TopBanner.css';

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="top-banner">
      <div className="container banner-content">
        <p>
          Sign up and get 20% off to your first order. 
          <Link href="/auth/login"> Sign Up Now</Link>
        </p>
      </div>
      <button className="banner-close-btn" onClick={() => setIsVisible(false)}>
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
