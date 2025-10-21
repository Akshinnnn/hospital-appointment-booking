'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const TokenManager = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      localStorage.setItem('jwt_token', (session as any).accessToken);
    }
    
    if (status === 'unauthenticated') {
      localStorage.removeItem('jwt_token');
    }
  }, [session, status]);

  return null;
};