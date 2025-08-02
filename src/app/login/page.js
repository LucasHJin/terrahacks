'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      
      // Add a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push('/take-photo');
      }, 100);
    } catch (error) {
      setError('Failed to log in: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-medium" style={{ color: '#071012', fontWeight: 500 }}>
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="border px-4 py-3 rounded-lg font-extralight" style={{ 
                backgroundColor: '#ffbc8a', 
                borderColor: '#ecc084', 
                color: '#071012' 
              }}>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border rounded-lg font-extralight focus:outline-none focus:ring-2 focus:z-10"
                  style={{
                    borderColor: '#ecc084',
                    color: '#071012',
                    backgroundColor: '#f8fbfc',
                    fontWeight: 200
                  }}
                  onFocus={(e) => {
                    e.target.style.ringColor = '#ffbc8a';
                    e.target.style.borderColor = '#ffbc8a';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ecc084';
                  }}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border rounded-lg font-extralight focus:outline-none focus:ring-2 focus:z-10"
                  style={{
                    borderColor: '#ecc084',
                    color: '#071012',
                    backgroundColor: '#f8fbfc',
                    fontWeight: 200
                  }}
                  onFocus={(e) => {
                    e.target.style.ringColor = '#ffbc8a';
                    e.target.style.borderColor = '#ffbc8a';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ecc084';
                  }}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                style={{
                  backgroundColor: '#ffbc8a',
                  color: '#071012',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0bc67';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffbc8a';
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <span className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Don&apos;t have an account? </span>
              <Link 
                href="/signup" 
                className="font-medium transition-colors duration-200"
                style={{ color: '#f0bc67', fontWeight: 500 }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ecc084';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#f0bc67';
                }}
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
