'use client';

import { usePathname } from 'next/navigation';
import SellerNavbar from '@/components/Navbar/SellerNavbar';

export default function SellerLayout({ children }) {
  const pathname = usePathname();
  
  // Don't show the seller header on the authentication page
  const isAuthPage = pathname.includes('/seller/auth');

  return (
    <div className="seller-panel-root">
      {!isAuthPage && <SellerNavbar />}
      <main className="seller-content">
        {children}
      </main>
    </div>
  );
}
