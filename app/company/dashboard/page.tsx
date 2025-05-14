"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CompanyDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to main dashboard...</p>
    </div>
  );
}