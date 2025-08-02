import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Save photo to both global and user collections
export const savePhoto = async (userId, imageBlob) => {
  try {
    // Generate unique photo ID
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Timestamp.now();

    // Upload image to Firebase Storage
    const imageRef = ref(storage, `photos/${userId}/${photoId}.jpg`);
    const uploadResult = await uploadBytes(imageRef, imageBlob);
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // Prepare photo document
    const photoData = {
      userId: userId,
      imageUrl: imageUrl,
      timestamp: timestamp,
      createdAt: timestamp.toDate().toISOString(),
      photoId: photoId
    };

    // Save to global photos collection
    await setDoc(doc(db, 'photos', photoId), photoData);

    // Save to user's personal photos collection
    await setDoc(doc(db, 'users', userId, 'photos', photoId), photoData);

    return { success: true, photoId, photoData };
  } catch (error) {
    console.error('Error saving photo:', error);
    return { success: false, error: error.message };
  }
};

// Get all photos from global feed
export const getAllPhotos = async () => {
  try {
    const photosRef = collection(db, 'photos');
    const q = query(photosRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, photos };
  } catch (error) {
    console.error('Error getting photos:', error);
    return { success: false, error: error.message, photos: [] };
  }
};

// Get photos for a specific user
export const getUserPhotos = async (userId) => {
  try {
    const userPhotosRef = collection(db, 'users', userId, 'photos');
    const q = query(userPhotosRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, photos };
  } catch (error) {
    console.error('Error getting user photos:', error);
    return { success: false, error: error.message, photos: [] };
  }
};

// Check if user has already taken a photo today
export const hasUserTakenPhotoToday = async (userId) => {
  try {
    const userPhotosRef = collection(db, 'users', userId, 'photos');
    const querySnapshot = await getDocs(userPhotosRef);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let hasTakenPhotoToday = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let photoDate;
      
      if (data.timestamp && data.timestamp.seconds) {
        // Firestore Timestamp object
        photoDate = new Date(data.timestamp.seconds * 1000);
      } else if (data.timestamp && data.timestamp.toDate) {
        // Firestore Timestamp with toDate method
        photoDate = data.timestamp.toDate();
      } else if (data.timestamp) {
        // Regular Date or date string
        photoDate = new Date(data.timestamp);
      } else {
        return; // Skip photos without valid timestamps
      }
      
      if (photoDate >= today && photoDate < tomorrow) {
        hasTakenPhotoToday = true;
      }
    });
    
    return { success: true, hasTakenPhoto: hasTakenPhotoToday };
  } catch (error) {
    console.error('Error checking daily photo:', error);
    return { success: false, error: error.message, hasTakenPhoto: false };
  }
};
