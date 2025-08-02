'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPhotos, getUserPhotos } from '@/lib/photoUtils';
import Image from 'next/image';

export default function Feed() {
  const [activeTab, setActiveTab] = useState('my-posts'); // 'my-posts' or 'today-posts'
  const [myPosts, setMyPosts] = useState([]);
  const [todayPosts, setTodayPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadPosts = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError('');

      try {
        // Load user's own posts
        const userResult = await getUserPhotos(currentUser.uid);
        if (userResult.success) {
          setMyPosts(userResult.photos);
        }

        // Load all posts and filter for today
        const allResult = await getAllPhotos();
        if (allResult.success) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayPhotos = allResult.photos.filter(photo => {
            let photoDate;
            if (photo.timestamp && photo.timestamp.seconds) {
              // Firestore Timestamp object
              photoDate = new Date(photo.timestamp.seconds * 1000);
            } else if (photo.timestamp && photo.timestamp.toDate) {
              // Firestore Timestamp with toDate method
              photoDate = photo.timestamp.toDate();
            } else if (photo.timestamp) {
              // Regular Date or date string
              photoDate = new Date(photo.timestamp);
            } else {
              return false; // Skip photos without valid timestamps
            }
            return photoDate >= today && photoDate < tomorrow && photo.userId !== currentUser.uid;
          });
          setTodayPosts(todayPhotos);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentUser]);

  const refreshPosts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');

    try {
      // Load user's own posts
      const userResult = await getUserPhotos(currentUser.uid);
      if (userResult.success) {
        setMyPosts(userResult.photos);
      }

      // Load all posts and filter for today
      const allResult = await getAllPhotos();
      if (allResult.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayPhotos = allResult.photos.filter(photo => {
          let photoDate;
          if (photo.timestamp && photo.timestamp.seconds) {
            // Firestore Timestamp object
            photoDate = new Date(photo.timestamp.seconds * 1000);
          } else if (photo.timestamp && photo.timestamp.toDate) {
            // Firestore Timestamp with toDate method
            photoDate = photo.timestamp.toDate();
          } else if (photo.timestamp) {
            // Regular Date or date string
            photoDate = new Date(photo.timestamp);
          } else {
            return false; // Skip photos without valid timestamps
          }
          return photoDate >= today && photoDate < tomorrow && photo.userId !== currentUser.uid;
        });
        setTodayPosts(todayPhotos);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    let date;
    if (timestamp && timestamp.seconds) {
      // Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp && timestamp.toDate) {
      // Firestore Timestamp with toDate method
      date = timestamp.toDate();
    } else if (timestamp) {
      // Regular Date or date string
      date = new Date(timestamp);
    } else {
      return 'Unknown date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (timestamp) => {
    let photoTime;
    if (timestamp && timestamp.seconds) {
      // Firestore Timestamp object
      photoTime = new Date(timestamp.seconds * 1000);
    } else if (timestamp && timestamp.toDate) {
      // Firestore Timestamp with toDate method
      photoTime = timestamp.toDate();
    } else if (timestamp) {
      // Regular Date or date string
      photoTime = new Date(timestamp);
    } else {
      return 'Unknown time';
    }

    const now = new Date();
    const diffInMinutes = Math.floor((now - photoTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return formatDate(timestamp);
  };

  const PostCard = ({ post, showDate = false }) => (
    <div className="rounded-xl shadow-sm overflow-hidden mb-6" style={{ 
      backgroundColor: '#f8fbfc', 
      border: '1px solid #ecc084',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="relative aspect-[4/3]">
        <Image
          src={post.imageUrl}
          alt="User post"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <p className="font-extralight text-sm" style={{ color: '#071012', fontWeight: 200 }}>
          {showDate ? formatDate(post.timestamp) : formatTimeAgo(post.timestamp)}
        </p>
      </div>
    </div>
  );

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

      {/* Tab Navigation */}
      <div className="flex mb-6 p-1 rounded-xl" style={{ backgroundColor: '#ecc084' }}>
        <button
          onClick={() => setActiveTab('my-posts')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'my-posts'
              ? 'shadow-sm'
              : ''
          }`}
          style={activeTab === 'my-posts' ? {
            backgroundColor: '#f8fbfc',
            color: '#071012',
            fontWeight: 500
          } : {
            color: '#071012',
            fontWeight: 200
          }}
        >
          My Posts ({myPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('today-posts')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'today-posts'
              ? 'shadow-sm'
              : ''
          }`}
          style={activeTab === 'today-posts' ? {
            backgroundColor: '#f8fbfc',
            color: '#071012',
            fontWeight: 500
          } : {
            color: '#071012',
            fontWeight: 200
          }}
        >
          Today&apos;s Posts ({todayPosts.length})
        </button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={refreshPosts}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-all duration-200"
          style={{
            backgroundColor: '#ffbc8a',
            color: '#071012',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = '#f0bc67';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ffbc8a';
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'my-posts' ? (
          myPosts.length > 0 ? (
            myPosts.map((post) => (
              <PostCard key={post.id} post={post} showDate={true} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mb-4" style={{ color: '#ecc084' }}>
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#071012', fontWeight: 500 }}>No posts yet</h3>
              <p className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>Start by taking your first photo!</p>
            </div>
          )
        ) : (
          todayPosts.length > 0 ? (
            todayPosts.map((post) => (
              <PostCard key={post.id} post={post} showDate={false} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mb-4" style={{ color: '#ecc084' }}>
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#071012', fontWeight: 500 }}>No posts today</h3>
              <p className="font-extralight" style={{ color: '#071012', fontWeight: 200 }}>No one has shared any photos today yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
