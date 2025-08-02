'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!name.trim()) {
      return setError('Please enter your name');
    }

    try {
      setError('');
      setLoading(true);
      
      // Create user account
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: name.trim()
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email,
        createdAt: new Date().toISOString(),
        photoCount: 0
      });
      
      // Add a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push('/take-photo');
      }, 100);
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mobile-auth-container" style={{ backgroundColor: '#f8fbfc', fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-medium" style={{ color: '#071012', fontWeight: 500 }}>
              Create your account
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
                <label htmlFor="name" className="sr-only">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
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
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                  autoComplete="new-password"
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
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
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
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <div className="text-center">
              <span className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Already have an account? </span>
              <Link 
                href="/login" 
                className="font-medium transition-colors duration-200"
                style={{ color: '#f0bc67', fontWeight: 500 }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ecc084';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#f0bc67';
                }}
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
