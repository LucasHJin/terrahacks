'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header style={{ backgroundColor: '#f8fbfc', boxShadow: '0 1px 3px rgba(113, 113, 113, 0.1)' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-medium transition-colors duration-200"
              style={{ color: '#071012', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => {
                e.target.style.color = '#f0bc67';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#071012';
              }}
            >
              BeJacked
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {currentUser ? (
              // Authenticated user navigation
              <>
                <Link 
                  href="/take-photo" 
                  className="px-3 py-2 rounded-md font-extralight transition-colors duration-200"
                  style={{ color: '#071012', fontWeight: 200, fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#071012';
                  }}
                >
                  Take Photo
                </Link>
                <Link 
                  href="/feed" 
                  className="px-3 py-2 rounded-md font-extralight transition-colors duration-200"
                  style={{ color: '#071012', fontWeight: 200, fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#071012';
                  }}
                >
                  Feed
                </Link>
                <Link 
                  href="/profile" 
                  className="px-3 py-2 rounded-md font-extralight transition-colors duration-200"
                  style={{ color: '#071012', fontWeight: 200, fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#071012';
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md font-medium transition-all duration-200"
                  style={{
                    backgroundColor: '#ecc084',
                    color: '#071012',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ecc084';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              // Unauthenticated user navigation
              <>
                <Link 
                  href="/login" 
                  className="px-3 py-2 rounded-md font-extralight transition-colors duration-200"
                  style={{ color: '#071012', fontWeight: 200, fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#071012';
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-md font-medium transition-all duration-200"
                  style={{
                    backgroundColor: '#ffbc8a',
                    color: '#071012',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffbc8a';
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
