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

The image should be REJECTED if it contains:
- Sexual content or suggestive poses
- Nudity beyond what's normal for fitness progress photos (i.e. near the groinal area or breasts for women)
- Inappropriate or sexualized content
- Images where non-human related content is the main focus (i.e. a pet, landscape, etc.)
- Thirsttrap like behavior or nude poses that are not fitness related (if the pose is not fitness related but they are just wearing clothes and standing there, it is fine and should be approved)

Otherwise, the image should be APPROVED:
- For example, fitness progress photos (including shirtless posing for bodybuilding) should be approved
- Any type of normal selfie or physique check (provided once again it is not sexualized) should be approved
- Flexing or showing off muscles

Respond with exactly two lines:
Line 1: Either "APPROVED" or "REJECTED"
Line 2: A brief explanation of why it was approved or rejected`;

    // Generate content with image and prompt
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the response - expect two lines
    const lines = text.split('\n');
    const decision = lines[0]?.trim().toUpperCase() || 'REJECTED';
    const reason = lines[1]?.trim() || 'No explanation provided';
    
    console.log(`Gemini validation decision: ${decision}`);
    console.log(`Gemini validation reason: ${reason}`);

    if (decision === 'APPROVED') {
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
