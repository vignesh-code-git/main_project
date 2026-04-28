'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import TopBanner from "@/components/TopBanner/TopBanner";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Routes where we don't want the global Navbar and Footer
  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller');
  const isPanelRoute = isAdminRoute || isSellerRoute;
  return (
    <div className={isPanelRoute ? "panel-layout" : ""}>
      <header className={isPanelRoute ? "panel-fixed-header" : "main-sticky-header"}>
        <TopBanner />
        <Navbar />
      </header>
      <div className="main-content-wrapper">
        {children}
      </div>
      {!isPanelRoute && <Footer />}
    </div>
  );
}
