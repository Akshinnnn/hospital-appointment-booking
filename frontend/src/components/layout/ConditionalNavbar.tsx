'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from './Navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  // Hide navbar on doctor dashboard pages (they have sidebar)
  const isDoctorDashboardPage = pathname?.startsWith('/dashboard') || 
                                 pathname?.startsWith('/schedule') ||
                                 (pathname?.startsWith('/appointments') && userRole === 'DOCTOR') ||
                                 (pathname?.startsWith('/records') && userRole === 'DOCTOR') ||
                                 (pathname?.startsWith('/account') && userRole === 'DOCTOR');

  if (isDoctorDashboardPage && userRole === 'DOCTOR') {
    return null;
  }

  return <Navbar />;
}

