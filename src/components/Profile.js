'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPhotos, getUserProfile } from '@/lib/photoUtils';
import Image from 'next/image';

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

  const generateContributionGraph = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Create a map of dates to photo counts
    const photoCountByDate = {};
    userPhotos.forEach(photo => {
      const date = getPhotoDate(photo.timestamp);
      const dateKey = date.toDateString();
      photoCountByDate[dateKey] = (photoCountByDate[dateKey] || 0) + 1;
    });

    // Generate weeks for the past year
    const weeks = [];
    let currentDate = new Date(oneYearAgo);
    
    // Start from the first day of the week containing oneYearAgo
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    while (currentDate <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateKey = currentDate.toDateString();
        const count = photoCountByDate[dateKey] || 0;
        week.push({
          date: new Date(currentDate),
          count: count,
          isToday: currentDate.toDateString() === today.toDateString()
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const getContributionColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    return 'bg-green-600';
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
            className="rounded-full object-cover border-4 border-white shadow-lg"
            sizes="128px"
          />
        </div>
      );
    }

    return (
      <div className="w-32 h-32 mx-auto bg-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const contributionWeeks = generateContributionGraph();

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="text-center">
          <ProfilePicture />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {userName || 'User'}
          </h2>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{totalPhotos}</div>
            <div className="text-gray-600">Total Photos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{streak}</div>
            <div className="text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {userPhotos.length > 0 ? 
                Math.round((userPhotos.filter(p => {
                  const date = getPhotoDate(p.timestamp);
                  const daysDiff = (new Date() - date) / (1000 * 60 * 60 * 24);
                  return daysDiff <= 365;
                }).length / 365) * 100) : 0}%
            </div>
            <div className="text-gray-600">Year Activity</div>
          </div>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Contribution Graph</h3>
        <div className="flex flex-col items-center">
          {/* Month labels */}
          <div className="flex justify-between w-full mb-2 text-xs text-gray-500">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
              <span key={month} className={index % 3 === 0 ? 'block' : 'hidden sm:block'}>
                {month}
              </span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="flex gap-1 overflow-x-auto w-full">
            {contributionWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getContributionColor(day.count)} ${
                      day.isToday ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    title={`${day.date.toDateString()}: ${day.count} photo${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Recent Photos Grid */}
      {userPhotos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Photos</h3>
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
