'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
              BeProud
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-8">
            {currentUser ? (
              // Authenticated user navigation
              <>
                <Link 
                  href="/take-photo" 
                  className="px-3 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    color: pathname === '/take-photo' ? '#f0bc67' : '#071012', 
                    fontWeight: 500, 
                    fontFamily: 'Inter, sans-serif' 
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== '/take-photo') e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== '/take-photo') e.target.style.color = '#071012';
                  }}
                >
                  Take Photo
                </Link>
                <Link 
                  href="/feed" 
                  className="px-3 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    color: pathname === '/feed' ? '#f0bc67' : '#071012', 
                    fontWeight: 500, 
                    fontFamily: 'Inter, sans-serif' 
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== '/feed') e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== '/feed') e.target.style.color = '#071012';
                  }}
                >
                  Feed
                </Link>
                <Link 
                  href="/profile" 
                  className="px-3 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    color: pathname === '/profile' ? '#f0bc67' : '#071012', 
                    fontWeight: 500, 
                    fontFamily: 'Inter, sans-serif' 
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== '/profile') e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== '/profile') e.target.style.color = '#071012';
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md font-medium"
                  style={{
                    color: '#071012',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
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
                  className="px-3 py-2 rounded-md transition-colors duration-200"
                  style={{ 
                    color: pathname === '/login' ? '#f0bc67' : '#071012', 
                    fontWeight: 500, 
                    fontFamily: 'Inter, sans-serif' 
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== '/login') e.target.style.color = '#f0bc67';
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== '/login') e.target.style.color = '#071012';
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-md font-medium"
                  style={{
                    color: '#071012',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md transition-colors duration-200"
              style={{ color: '#071012' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t py-6 px-2" style={{ borderColor: '#ecc084' }}>
            <div className="flex flex-col space-y-4">
              {currentUser ? (
                <>
                  <Link 
                    href="/take-photo" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-md transition-colors duration-200"
                    style={{ 
                      color: pathname === '/take-photo' ? '#f0bc67' : '#071012', 
                      fontWeight: 500, 
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    Take Photo
                  </Link>
                  <Link 
                    href="/feed" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-md transition-colors duration-200"
                    style={{ 
                      color: pathname === '/feed' ? '#f0bc67' : '#071012', 
                      fontWeight: 500, 
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    Feed
                  </Link>
                  <Link 
                    href="/profile" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-md transition-colors duration-200"
                    style={{ 
                      color: pathname === '/profile' ? '#f0bc67' : '#071012', 
                      fontWeight: 500, 
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-3 rounded-md font-medium w-full"
                    style={{
                      color: '#071012',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-md transition-colors duration-200"
                    style={{ 
                      color: pathname === '/login' ? '#f0bc67' : '#071012', 
                      fontWeight: 500, 
                      fontFamily: 'Inter, sans-serif' 
                    }}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-md font-medium"
                    style={{
                      color: '#071012',
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
