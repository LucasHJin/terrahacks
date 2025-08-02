// Alternative face detection using face-api.js
import * as faceapi from 'face-api.js';

let isModelLoaded = false;

// Initialize face-api.js models
export const initializeFaceAPI = async () => {
  if (isModelLoaded) return true;
  
  try {
    // Load only the tiny face detector for better performance
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    isModelLoaded = true;
    console.log('Face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    return false;
  }
};

// Detect faces using face-api.js
export const detectFacesWithFaceAPI = async (imageElement) => {
  try {
    if (!isModelLoaded) {
      const loaded = await initializeFaceAPI();
      if (!loaded) return [];
    }
    
    const detections = await faceapi.detectAllFaces(
      imageElement, 
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
    );
    
    return detections.map(detection => ({
      x: detection.box.x,
      y: detection.box.y,
      width: detection.box.width,
      height: detection.box.height,
      score: detection.score
    }));
  } catch (error) {
    console.error('Error detecting faces with face-api.js:', error);
    return [];
  }
};

// Simplified face detection that works without external models
export const initializeSimpleFaceDetection = async () => {
  // This always returns true since it doesn't need external models
  return true;
};

// Combined approach - try multiple methods
export const detectFacesWithFallback = async (imageElement) => {
  // First try face-api.js if available
  try {
    const faces = await detectFacesWithFaceAPI(imageElement);
    if (faces.length > 0) {
      console.log(`Face-api.js detected ${faces.length} faces`);
      return faces;
    }
  } catch (error) {
    console.log('Face-api.js detection failed, using fallback');
  }
  
  // Fallback to simple detection
  return detectFacesSimple(imageElement);
};

// Simple face detection using canvas analysis
const detectFacesSimple = (imageElement) => {
  // Create a temporary canvas to analyze the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = imageElement.width || imageElement.videoWidth;
  canvas.height = imageElement.height || imageElement.videoHeight;
  
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  
  // Simple heuristic: assume faces are in the upper portion of the image
  const faceRegions = [];
  
  // Divide image into potential face regions
  const regionWidth = canvas.width / 3;
  const regionHeight = canvas.height / 3;
  
  // Check top row for potential faces
  for (let i = 0; i < 3; i++) {
    const x = i * regionWidth;
    const y = 0;
    
    // Simple skin tone detection in this region
    if (hasPotentialFace(ctx, x, y, regionWidth, regionHeight)) {
      faceRegions.push({
        x: x,
        y: y,
        width: regionWidth,
        height: regionHeight,
        score: 0.7
      });
    }
  }
  
  return faceRegions;
};

// Check if a region might contain a face based on color analysis
const hasPotentialFace = (ctx, x, y, width, height) => {
  try {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    
    let skinPixels = 0;
    let totalPixels = 0;
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) { // 40 = 4 channels * 10 pixels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (isSkinColor(r, g, b)) {
        skinPixels++;
      }
      totalPixels++;
    }
    
    // If more than 15% of sampled pixels are skin-colored, might be a face
    return totalPixels > 0 && (skinPixels / totalPixels) > 0.15;
  } catch (error) {
    console.error('Error analyzing potential face region:', error);
    return false;
  }
};

// Simple skin color detection
const isSkinColor = (r, g, b) => {
  // Basic skin tone detection using RGB values
  return (
    r > 95 && g > 40 && b > 20 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
    Math.abs(r - g) > 15 &&
    r > g && r > b
  );
};

// Process image with face blurring using the fallback detection
export const processImageWithFallbackDetection = async (canvas) => {
  try {
    // Create a temporary image element from canvas
    const tempImg = new Image();
    tempImg.src = canvas.toDataURL();
    
    await new Promise((resolve) => {
      tempImg.onload = resolve;
    });
    
    // Detect faces using fallback method
    const faces = await detectFacesWithFallback(tempImg);
    
    if (faces.length > 0) {
      console.log(`Detected ${faces.length} face(s), applying blur...`);
      
      // Apply blur to detected faces
      const ctx = canvas.getContext('2d');
      faces.forEach(face => {
        applyBlurToRegion(ctx, face.x, face.y, face.width, face.height);
      });
      
      return true;
    } else {
      console.log('No faces detected, applying general privacy blur');
      // Apply general privacy blur to upper portion
      const ctx = canvas.getContext('2d');
      const upperHeight = canvas.height * 0.4;
      applyBlurToRegion(ctx, 0, 0, canvas.width, upperHeight);
      return true;
    }
  } catch (error) {
    console.error('Error processing image with fallback detection:', error);
    return false;
  }
};

// Apply blur to a specific region of the canvas
const applyBlurToRegion = (ctx, x, y, width, height) => {
  const imageData = ctx.getImageData(x, y, width, height);
  const blurredData = applySimpleBlur(imageData, 8);
  ctx.putImageData(blurredData, x, y);
};

// Simple blur implementation
const applySimpleBlur = (imageData, radius = 5) => {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const outputData = output.data;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      // Sample pixels in a box around current pixel
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
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
