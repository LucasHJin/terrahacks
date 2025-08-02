// Fallback face detection using browser's native capabilities
// This is a simpler approach that doesn't require heavy ML models

// Apply a simple blur effect to the entire image as a privacy measure
export const applyPrivacyBlur = (canvas, regions = []) => {
  const ctx = canvas.getContext('2d');
  
  // If no specific regions provided, apply mild blur to upper portion (likely where faces are)
  if (regions.length === 0) {
    const upperPortion = canvas.height * 0.4; // Top 40% of image
    const imageData = ctx.getImageData(0, 0, canvas.width, upperPortion);
    const blurredData = simpleBlur(imageData, 3);
    ctx.putImageData(blurredData, 0, 0);
    return;
  }
  
  // Apply blur to specific regions
  regions.forEach(region => {
    const imageData = ctx.getImageData(region.x, region.y, region.width, region.height);
    const blurredData = simpleBlur(imageData, 8);
    ctx.putImageData(blurredData, region.x, region.y);
  });
};

// Simple box blur implementation
const simpleBlur = (imageData, radius) => {
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

// Apply pixelation effect instead of blur
export const pixelateFaces = (canvas, regions, pixelSize = 10) => {
  const ctx = canvas.getContext('2d');
  
  regions.forEach(region => {
    const imageData = ctx.getImageData(region.x, region.y, region.width, region.height);
    const pixelatedData = pixelate(imageData, pixelSize);
    ctx.putImageData(pixelatedData, region.x, region.y);
  });
};

const pixelate = (imageData, pixelSize) => {
  const { data, width, height } = imageData;
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Get the color of the top-left pixel in this block
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      
      // Apply this color to the entire block
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const blockIdx = ((y + dy) * width + (x + dx)) * 4;
          data[blockIdx] = r;
          data[blockIdx + 1] = g;
          data[blockIdx + 2] = b;
          data[blockIdx + 3] = a;
        }
      }
    }
  }
  
  return imageData;
};

// Simple face detection using color detection (very basic)
export const detectSkinToneRegions = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  const regions = [];
  const blockSize = 50;
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let skinPixels = 0;
      let totalPixels = 0;
      
      // Check pixels in this block
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // Simple skin tone detection
          if (isSkinTone(r, g, b)) {
            skinPixels++;
          }
          totalPixels++;
        }
      }
      
      // If more than 30% of pixels are skin tone, consider it a face region
      if (skinPixels / totalPixels > 0.3) {
        regions.push({
          x: x,
          y: y,
          width: Math.min(blockSize, width - x),
          height: Math.min(blockSize, height - y)
        });
      }
    }
  }
  
  return regions;
};

// Very basic skin tone detection
const isSkinTone = (r, g, b) => {
  // Simple heuristic for skin tone detection
  return (
    r > 60 && g > 40 && b > 20 &&
    r > b && r > g &&
    Math.abs(r - g) > 15 &&
    r - b > 15
  );
};

export const processImageWithSimpleBlur = async (canvas) => {
  try {
    // Try to detect skin tone regions first
    const regions = detectSkinToneRegions(canvas);
    
    if (regions.length > 0) {
      console.log(`Detected ${regions.length} potential face region(s), applying blur...`);
      applyPrivacyBlur(canvas, regions);
      return true;
    } else {
      // Fallback: blur upper portion of image
      console.log('No face regions detected, applying privacy blur to upper portion');
      applyPrivacyBlur(canvas);
      return true;
    }
  } catch (error) {
    console.error('Error processing image with simple blur:', error);
    return false;
  }
};
