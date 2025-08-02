'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give the auth context a moment to initialize
    const timer = setTimeout(() => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    }, 500);

    // If user is already loaded, don't wait
    if (currentUser) {
      setIsChecking(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [currentUser, router]);

  if (isChecking || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#ffbc8a' }}></div>
          <p className="mt-4 font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}
