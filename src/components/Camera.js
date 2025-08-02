'use client';

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { savePhoto, hasUserTakenPhotoToday } from '@/lib/photoUtils';
import { initializeFaceDetection, processImageWithFaceBlur } from '@/lib/robustFaceDetection';
import { processImageWithSimpleBlur } from '@/lib/simpleBlur';

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera, 'environment' for back camera
  const [hasTakenPhotoToday, setHasTakenPhotoToday] = useState(false);
  const [checkingDailyLimit, setCheckingDailyLimit] = useState(true);
  const [processingImage, setProcessingImage] = useState(false);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const { currentUser } = useAuth();

  // Initialize face detection models
  useEffect(() => {
    const initFaceDetection = async () => {
      console.log('Initializing face detection models...');
      const ready = await initializeFaceDetection();
      setFaceDetectionReady(ready);
      if (ready) {
        console.log('Face detection models ready!');
      } else {
        console.log('Face detection will use fallback methods');
      }
    };

    initFaceDetection();
  }, []);

  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        setError('');
        // Stop any existing stream first
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        currentStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please ensure you have granted camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]); // Only depend on facingMode

  // Check daily photo limit
  useEffect(() => {
    const checkDailyLimit = async () => {
      if (!currentUser) return;
      
      setCheckingDailyLimit(true);
      try {
        const result = await hasUserTakenPhotoToday(currentUser.uid);
        if (result.success) {
          setHasTakenPhotoToday(result.hasTakenPhoto);
        }
      } catch (err) {
        console.error('Error checking daily limit:', err);
      } finally {
        setCheckingDailyLimit(false);
      }
    };

    checkDailyLimit();
  }, [currentUser]);

  const getTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    // Stop current stream
    stopCamera();
    // Switch facing mode (this will trigger useEffect to restart camera)
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !currentUser) return;

    setIsLoading(true);
    setProcessingImage(true);
    setError('');
    setSuccess('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply enhanced face blurring with ML model
      console.log('Processing image with enhanced face blur...');
      const blurApplied = await processImageWithFaceBlur(canvas);
      
      if (!blurApplied) {
        // Ultimate fallback
        console.log('Applying simple privacy blur as final fallback...');
        await processImageWithSimpleBlur(canvas);
      }

      setProcessingImage(false);

      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (!blob) {
        throw new Error('Failed to capture image');
      }

      // Save photo using utility function
      const result = await savePhoto(currentUser.uid, blob);
      
      if (result.success) {
        setSuccess('Photo saved successfully!');
        setHasTakenPhotoToday(true); // Update daily limit status
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('Error saving photo:', err);
      setError('Failed to save photo. Please try again.');
      setProcessingImage(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {hasTakenPhotoToday && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Daily photo limit reached!</p>
          <p className="text-sm">You can take another photo in {getTimeUntilTomorrow()}.</p>
        </div>
      )}

      {checkingDailyLimit && (
        <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">Checking daily photo limit...</p>
        </div>
      )}

      {!faceDetectionReady && (
        <div className="mb-4 bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
          <p className="text-sm">🤖 Loading AI face detection models for enhanced privacy...</p>
        </div>
      )}

      {processingImage && (
        <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">🔒 Processing image with enhanced face blur for maximum privacy...</p>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] max-w-2xl mx-auto">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            // Ensure video starts playing when metadata is loaded
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
        />
        
        {/* Camera controls overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
          {/* Switch camera button */}
          <button
            onClick={switchCamera}
            disabled={isLoading}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50"
            title="Switch Camera"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={capturePhoto}
            disabled={isLoading || !currentUser || hasTakenPhotoToday || checkingDailyLimit || processingImage}
            className={`p-4 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasTakenPhotoToday 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
            title={
              hasTakenPhotoToday 
                ? "Daily photo limit reached" 
                : processingImage 
                  ? "Processing image..." 
                  : "Take Photo"
            }
          >
            {isLoading || processingImage ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      <div className="mt-4 text-center text-gray-600">
        {hasTakenPhotoToday ? (
          <div>
            <p className="text-gray-500">You&apos;ve already taken your photo for today.</p>
            <p className="text-sm mt-1">Come back tomorrow to capture another moment!</p>
          </div>
        ) : (
          <div>
            <p>Point your camera at what you want to photograph and tap the capture button.</p>
            <p className="text-sm mt-2">Make sure to allow camera permissions when prompted.</p>
            <p className="text-sm mt-1 font-medium text-indigo-600">Remember: You can only take one photo per day!</p>
            <p className="text-sm mt-1 text-green-600">✓ Privacy protection is active - faces will be automatically blurred</p>
          </div>
        )}
      </div>
    </div>
  );
}
