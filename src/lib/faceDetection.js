import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let faceDetector = null;

// Initialize the face detection model
export const initializeFaceDetection = async () => {
  if (faceDetector) return faceDetector;
  
  try {
    // Set TensorFlow backend
    await tf.ready();
    
    // Use the BlazeFace model instead of MediaPipe (more reliable)
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: 'tfjs',
      refineLandmarks: false,
      maxFaces: 10,
    };
    
    faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    return faceDetector;
  } catch (error) {
    console.error('Error initializing face detection:', error);
    
    // Try alternative model if first fails
    try {
      console.log('Trying alternative face detection model...');
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: false,
        maxFaces: 5,
      };
      
      faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      return faceDetector;
    } catch (altError) {
      console.error('Alternative face detection also failed:', altError);
      return null;
    }
  }
};

// Detect faces in an image and return bounding boxes
export const detectFaces = async (imageElement) => {
  try {
    if (!faceDetector) {
      await initializeFaceDetection();
    }
    
    if (!faceDetector) {
      throw new Error('Face detector not initialized');
    }
    
    const faces = await faceDetector.estimateFaces(imageElement);
    
    // Convert face landmarks to bounding boxes
    const faceBoxes = faces.map(face => {
      const keypoints = face.keypoints;
      
      // Find min/max coordinates from all keypoints
      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;
      
      keypoints.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
      
      // Add padding around face
      const padding = 20;
      return {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        width: maxX - minX + (padding * 2),
        height: maxY - minY + (padding * 2)
      };
    });
    
    return faceBoxes;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};

// Apply blur to specific regions of a canvas
export const blurFaces = (canvas, faceBoxes, blurAmount = 20) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  faceBoxes.forEach(box => {
    // Create a temporary canvas for the face region
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = box.width;
    tempCanvas.height = box.height;
    
    // Extract face region
    const faceImageData = ctx.getImageData(box.x, box.y, box.width, box.height);
    tempCtx.putImageData(faceImageData, 0, 0);
    
    // Apply blur using CSS filter (simple approach)
    tempCtx.filter = `blur(${blurAmount}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);
    
    // Put blurred region back
    const blurredImageData = tempCtx.getImageData(0, 0, box.width, box.height);
    ctx.putImageData(blurredImageData, box.x, box.y);
  });
};

// Alternative: Apply Gaussian blur to face regions
export const applyGaussianBlur = (canvas, faceBoxes, radius = 10) => {
  const ctx = canvas.getContext('2d');
  
  faceBoxes.forEach(box => {
    // Get the image data for the face region
    const imageData = ctx.getImageData(box.x, box.y, box.width, box.height);
    const blurredData = gaussianBlur(imageData, radius);
    ctx.putImageData(blurredData, box.x, box.y);
  });
};

// Simple Gaussian blur implementation
const gaussianBlur = (imageData, radius) => {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const outputData = output.data;
  
  // Simple box blur approximation of Gaussian blur
  const boxSize = Math.floor(radius / 3);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      // Sample pixels in a box around current pixel
      for (let dy = -boxSize; dy <= boxSize; dy++) {
        for (let dx = -boxSize; dx <= boxSize; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const idx = (ny * width + nx) * 4;
          
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count++;
        }
      }
      
      const idx = (y * width + x) * 4;
      outputData[idx] = r / count;
      outputData[idx + 1] = g / count;
      outputData[idx + 2] = b / count;
      outputData[idx + 3] = a / count;
    }
  }
  
  return output;
};

// Process image with face blurring
export const processImageWithFaceBlur = async (canvas, blurAmount = 15) => {
  try {
    // Create a temporary image element from canvas
    const tempImg = new Image();
    tempImg.src = canvas.toDataURL();
    
    await new Promise((resolve) => {
      tempImg.onload = resolve;
    });
    
    // Detect faces
    const faces = await detectFaces(tempImg);
    
    if (faces.length > 0) {
      console.log(`Detected ${faces.length} face(s), applying blur...`);
      // Apply blur to detected faces
      applyGaussianBlur(canvas, faces, blurAmount);
    } else {
      console.log('No faces detected in image');
    }
    
    return faces.length > 0;
  } catch (error) {
    console.error('Error processing image with face blur:', error);
    return false;
  }
};
