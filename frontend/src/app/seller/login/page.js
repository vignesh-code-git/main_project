'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="seller-auth-container">
      <div className="auth-card">
        <h2>REDIRECTING...</h2>
        <p>Taking you to the login page.</p>
      </div>
    </div>
  );
}
