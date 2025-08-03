import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { imageData } = await request.json();
    
    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' }, 
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert base64 image data to the format Gemini expects
    const imageParts = [
      {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: "image/jpeg"
        }
      }
    ];

    const prompt = `Analyze this image and determine if it is appropriate for a fitness and bodybuilding community platform. 

The image should be APPROVED if it shows:
- Fitness progress photos (including shirtless posing for bodybuilding)
- Workout activities
- Gym environments
- Athletic/fitness clothing
- Before/after transformation photos
- Bodybuilding competition poses
- Flexing or muscle showcasing for fitness purposes

The image should be REJECTED if it contains:
- Sexual content or suggestive poses
- Nudity beyond what's normal for fitness progress photos
- Inappropriate or sexualized content
- Non-fitness related content

Respond with only one word: either "APPROVED" or "REJECTED"`;

    // Generate content with image and prompt
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();

    if (text === 'APPROVED') {
      return NextResponse.json({ 
        isValid: true, 
        message: 'Photo approved for posting' 
      });
    } else {
      return NextResponse.json({ 
        isValid: false, 
        message: 'Photo does not meet community guidelines. Please ensure your photo is fitness-related and appropriate for our community.' 
      });
    }

  } catch (error) {
    console.error('Error validating photo with Gemini:', error);
    
    // If API fails, allow the photo (fail-safe approach)
    return NextResponse.json({ 
      isValid: true, 
      message: 'Photo validation service temporarily unavailable - photo approved' 
    });
  }
}
