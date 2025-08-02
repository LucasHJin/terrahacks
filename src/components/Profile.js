'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPhotos, getUserProfile } from '@/lib/photoUtils';
import Image from 'next/image';
import ActivityCalendar from 'react-activity-calendar';

export default function Profile() {
  const [userPhotos, setUserPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [userName, setUserName] = useState('');
  const { currentUser } = useAuth();

  const calculateStreak = (photos) => {
    if (photos.length === 0) {
      setStreak(0);
      return;
    }

    // Sort photos by date (most recent first)
    const sortedPhotos = photos.sort((a, b) => {
      const dateA = getPhotoDate(a.timestamp);
      const dateB = getPhotoDate(b.timestamp);
      return dateB - dateA;
    });

    // Group photos by date
    const photosByDate = {};
    sortedPhotos.forEach(photo => {
      const date = getPhotoDate(photo.timestamp);
      const dateKey = date.toDateString();
      if (!photosByDate[dateKey]) {
        photosByDate[dateKey] = [];
      }
      photosByDate[dateKey].push(photo);
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    
    // Check if there's a photo today, if not start from yesterday
    const todayKey = today.toDateString();
    if (!photosByDate[todayKey]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = checkDate.toDateString();
      if (photosByDate[dateKey]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const getPhotoDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    } else if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    } else if (timestamp) {
      return new Date(timestamp);
    }
    return new Date();
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');

      try {
        // Load user profile data
        const profileResult = await getUserProfile(currentUser.uid);
        if (profileResult.success && profileResult.userData) {
          setUserName(
            profileResult.userData.name || 
            currentUser.displayName || 
            currentUser.email?.split('@')[0] || 
            'User'
          );
        } else {
          // Fallback to display name or email username
          setUserName(
            currentUser.displayName || 
            currentUser.email?.split('@')[0] || 
            'User'
          );
        }

        const result = await getUserPhotos(currentUser.uid);
        if (result.success) {
          setUserPhotos(result.photos);
          setTotalPhotos(result.photos.length);
          
          // Calculate streak inline to avoid dependency issues
          if (result.photos.length === 0) {
            setStreak(0);
          } else {
            // Sort photos by date (most recent first)
            const sortedPhotos = result.photos.sort((a, b) => {
              const dateA = getPhotoDate(a.timestamp);
              const dateB = getPhotoDate(b.timestamp);
              return dateB - dateA;
            });

            // Group photos by date
            const photosByDate = {};
            sortedPhotos.forEach(photo => {
              const date = getPhotoDate(photo.timestamp);
              const dateKey = date.toDateString();
              if (!photosByDate[dateKey]) {
                photosByDate[dateKey] = [];
              }
              photosByDate[dateKey].push(photo);
            });

            // Calculate current streak
            let currentStreak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let checkDate = new Date(today);
            
            // Check if there's a photo today, if not start from yesterday
            const todayKey = today.toDateString();
            if (!photosByDate[todayKey]) {
              checkDate.setDate(checkDate.getDate() - 1);
            }

            while (true) {
              const dateKey = checkDate.toDateString();
              if (photosByDate[dateKey]) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }

            setStreak(currentStreak);
          }
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser]);

  const generateActivityData = () => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from exactly one year ago
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    startDate.setDate(today.getDate() + 1); // Start day after one year ago
    startDate.setHours(0, 0, 0, 0);

    // Create photo count map by date
    const photosByDate = {};
    userPhotos.forEach(photo => {
      const date = getPhotoDate(photo.timestamp);
      // Normalize to local date to avoid timezone issues
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateKey = localDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      photosByDate[dateKey] = (photosByDate[dateKey] || 0) + 1;
    });

    // Generate data for each day in the past year
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const count = photosByDate[dateKey] || 0;
      
      data.push({
        date: dateKey,
        count: count,
        level: count === 0 ? 0 : count === 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 3 : 4
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Activity data generated:', data.length, 'days');
    console.log('Date range:', startDate.toISOString().split('T')[0], 'to', today.toISOString().split('T')[0]);
    console.log('Sample recent data:', data.slice(-7)); // Show last 7 days

    return data;
  };

  const ProfilePicture = () => {
    const mostRecentPhoto = userPhotos[0]; // Photos are sorted by most recent first

    if (mostRecentPhoto) {
      return (
        <div className="relative w-32 h-32 mx-auto">
          <Image
            src={mostRecentPhoto.imageUrl}
            alt="Profile"
            fill
            className="rounded-full object-cover shadow-lg"
            style={{ border: '4px solid #f8fbfc' }}
            sizes="128px"
          />
        </div>
      );
    }

    return (
      <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg" style={{ 
        backgroundColor: '#ecc084',
        border: '4px solid #f8fbfc'
      }}>
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#071012' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ffbc8a' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      {error && (
        <div className="mb-6 border px-4 py-3 rounded-lg font-extralight" style={{ 
          backgroundColor: '#ffbc8a', 
          borderColor: '#ecc084', 
          color: '#071012' 
        }}>
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="rounded-xl shadow-sm p-8 mb-6" style={{ backgroundColor: '#f8fbfc', border: '1px solid #ecc084' }}>
        <div className="text-center">
          <ProfilePicture />
          <h2 className="mt-4 text-2xl font-medium" style={{ color: '#071012', fontWeight: 500 }}>
            {userName || 'User'}
          </h2>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-medium" style={{ color: '#ffbc8a', fontWeight: 500 }}>{totalPhotos}</div>
            <div className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Total Photos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-medium" style={{ color: '#f0bc67', fontWeight: 500 }}>{streak}</div>
            <div className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-medium" style={{ color: '#ecc084', fontWeight: 500 }}>
              {userPhotos.length > 0 ? 
                Math.round((userPhotos.filter(p => {
                  const date = getPhotoDate(p.timestamp);
                  const daysDiff = (new Date() - date) / (1000 * 60 * 60 * 24);
                  return daysDiff <= 365;
                }).length / 365) * 100) : 0}%
            </div>
            <div className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Year Activity</div>
          </div>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: '#f8fbfc', border: '1px solid #ecc084' }}>
        <h3 className="text-lg font-medium mb-6" style={{ color: '#071012', fontWeight: 500 }}>Photo Contribution Graph</h3>
        <div className="flex justify-center">
          <ActivityCalendar
            data={generateActivityData()}
            theme={{
              light: ['#f5f1ec', '#ecc084', '#f0bc67', '#ffbc8a', '#071012']
            }}
            blockSize={12}
            blockMargin={4}
            fontSize={12}
            colorScheme="light"
            maxLevel={4}
            style={{ 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 200
            }}
          />
        </div>
      </div>

      {/* Recent Photos Grid */}
      {userPhotos.length > 0 && (
        <div className="rounded-xl shadow-sm p-6 mt-6" style={{ backgroundColor: '#f8fbfc', border: '1px solid #ecc084' }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: '#071012', fontWeight: 500 }}>Recent Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userPhotos.slice(0, 12).map((photo) => (
              <div key={photo.id} className="relative aspect-square">
                <Image
                  src={photo.imageUrl}
                  alt="User photo"
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
