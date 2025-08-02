import * as faceapi from '@vladmandic/face-api';

let isInitialized = false;
let modelsLoaded = false;

// Initialize face detection with proper models
export const initializeFaceDetection = async () => {
  if (isInitialized) return true;
  
  try {
    console.log('Loading face detection models...');
    
    // Load models from public/models directory
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    ]);
    
    modelsLoaded = true;
    isInitialized = true;
    console.log('Face detection models loaded successfully!');
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    console.log('Face detection will use fallback method');
    isInitialized = true; // Still set to true to avoid repeated attempts
    return false;
  }
};

// Detect faces using the loaded models
export const detectFaces = async (imageElement) => {
  if (!modelsLoaded) {
    console.log('Models not loaded, using fallback detection');
    return detectFacesFallback(imageElement);
  }
  
  try {
    // Use SSD MobileNet for better accuracy
    const detections = await faceapi.detectAllFaces(
      imageElement,
      new faceapi.SsdMobilenetv1Options({ 
        minConfidence: 0.3,
        maxResults: 10 
      })
    );
    
    console.log(`Detected ${detections.length} faces with ML model`);
    
    return detections.map(detection => ({
      x: detection.box.x - 40, // Increased padding from 20 to 40
      y: detection.box.y - 40,
      width: detection.box.width + 80, // Increased padding from 40 to 80
      height: detection.box.height + 80,
      confidence: detection.score
    }));
  } catch (error) {
    console.error('Error in ML face detection:', error);
    return detectFacesFallback(imageElement);
  }
};

// Fallback face detection for when models fail
const detectFacesFallback = (imageElement) => {
  console.log('Using fallback face detection - will not assume faces are present');
  
  // Don't assume faces are present - return empty array
  // This allows photos without faces to remain unblurred
  return [];
};

// Enhanced blur function with stronger effect
export const applyEnhancedBlur = (canvas, faceRegions) => {
  const ctx = canvas.getContext('2d');
  
  faceRegions.forEach(face => {
    // Apply multiple layers of blur for stronger effect
    applyMultiLayerBlur(ctx, face.x, face.y, face.width, face.height);
  });
};

// Multi-layer blur for stronger anonymization
const applyMultiLayerBlur = (ctx, x, y, width, height) => {
  // Ensure coordinates are within canvas bounds
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  width = Math.min(width, ctx.canvas.width - x);
  height = Math.min(height, ctx.canvas.height - y);
  
  if (width <= 0 || height <= 0) return;
  
  try {
    // Get the image data for the face region
    const imageData = ctx.getImageData(x, y, width, height);
    
    // Apply progressive blur (multiple passes for stronger effect)
    let blurredData = imageData;
    
    // First pass: Very Heavy Gaussian blur (increased from 15 to 25)
    blurredData = applyGaussianBlur(blurredData, 25);
    
    // Second pass: Stronger pixelation effect (increased from 8 to 12)
    blurredData = applyPixelation(blurredData, 12);
    
    // Third pass: Additional heavy blur (increased from 10 to 20)
    blurredData = applyGaussianBlur(blurredData, 20);
    
    // Fourth pass: Extra pixelation for complete anonymization
    blurredData = applyPixelation(blurredData, 16);
    
    // Fifth pass: Final smoothing blur
    blurredData = applyGaussianBlur(blurredData, 15);
    
    // Put the heavily blurred data back
    ctx.putImageData(blurredData, x, y);
    
    // Add stronger privacy overlay
    addPrivacyOverlay(ctx, x, y, width, height);
    
  } catch (error) {
    console.error('Error applying enhanced blur:', error);
    // Fallback to simple blur
    applySimpleBlur(ctx, x, y, width, height);
  }
};

// Gaussian blur implementation
const applyGaussianBlur = (imageData, radius) => {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  const outputData = output.data;
  
  const kernel = createGaussianKernel(radius);
  const kernelSize = kernel.length;
  const half = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let weightSum = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const weight = kernel[ky][kx];
          
          const idx = (py * width + px) * 4;
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          a += data[idx + 3] * weight;
          weightSum += weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      outputData[idx] = r / weightSum;
      outputData[idx + 1] = g / weightSum;
      outputData[idx + 2] = b / weightSum;
      outputData[idx + 3] = a / weightSum;
    }
  }
  
  return output;
};

// Create Gaussian kernel for blur
const createGaussianKernel = (radius) => {
  const size = radius * 2 + 1;
  const kernel = [];
  const sigma = radius / 3;
  const twoSigmaSquare = 2 * sigma * sigma;
  let sum = 0;
  
  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const distance = Math.pow(x - radius, 2) + Math.pow(y - radius, 2);
      const value = Math.exp(-distance / twoSigmaSquare);
      kernel[y][x] = value;
      sum += value;
    }
  }
  
  // Normalize kernel
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }
  
  return kernel;
};

// Pixelation effect for additional anonymization
const applyPixelation = (imageData, pixelSize) => {
  const { data, width, height } = imageData;
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Get average color of pixel block
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      for (let py = y; py < Math.min(y + pixelSize, height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
          const idx = (py * width + px) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count++;
        }
      }
      
      r /= count;
      g /= count;
      b /= count;
      a /= count;
      
      // Apply average color to entire block
      for (let py = y; py < Math.min(y + pixelSize, height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
          const idx = (py * width + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = a;
        }
      }
    }
  }
  
  return imageData;
};

// Add stronger privacy overlay
const addPrivacyOverlay = (ctx, x, y, width, height) => {
  // Add a stronger dark overlay to make it even harder to see (increased opacity)
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x, y, width, height);
  ctx.globalAlpha = 1.0;
};

// Simple blur fallback
const applySimpleBlur = (ctx, x, y, width, height) => {
  const imageData = ctx.getImageData(x, y, width, height);
  const { data } = imageData;
  const blurRadius = 20;
  
  // Simple box blur
  for (let i = 0; i < 3; i++) { // Multiple passes
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const nx = Math.max(0, Math.min(width - 1, px + dx));
            const ny = Math.max(0, Math.min(height - 1, py + dy));
            const idx = (ny * width + nx) * 4;
            
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
        
        const idx = (py * width + px) * 4;
        data[idx] = r / count;
        data[idx + 1] = g / count;
        data[idx + 2] = b / count;
      }
    }
  }
  
  ctx.putImageData(imageData, x, y);
};

// Main processing function
export const processImageWithFaceBlur = async (canvas) => {
  try {
    // Create temporary image element from canvas
    const tempImg = new Image();
    tempImg.src = canvas.toDataURL();
    
    await new Promise((resolve) => {
      tempImg.onload = resolve;
    });
    
    // Detect faces
    const faces = await detectFaces(tempImg);
    
    // Filter faces by confidence threshold (0.5 for ML models, 0.3 for fallback)
    const MIN_CONFIDENCE = modelsLoaded ? 0.5 : 0.3;
    const highConfidenceFaces = faces.filter(face => face.confidence >= MIN_CONFIDENCE);
    
    if (highConfidenceFaces.length > 0) {
      console.log(`Processing ${highConfidenceFaces.length} high-confidence faces (${faces.length} total detected) with enhanced blur`);
      applyEnhancedBlur(canvas, highConfidenceFaces);
      return true;
    } else {
      if (faces.length > 0) {
        console.log(`Detected ${faces.length} faces but none with sufficient confidence (min: ${MIN_CONFIDENCE}). Skipping blur.`);
      } else {
        console.log('No faces detected');
      }
      return false;
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return false;
  }
};
