
import { Platform } from '@/components/PlatformSelector';
import { GenerationMode } from '@/components/GenerationModeSelector';
import { getRelevantFreepikKeywords, suggestCategoriesForShutterstock, suggestCategoriesForAdobeStock, removeSymbolsFromTitle } from './imageHelpers';

interface AnalysisOptions {
  titleLength?: number;
  descriptionLength?: number;
  keywordCount?: number;
  platforms?: Platform[];
  generationMode?: GenerationMode;
  minTitleWords?: number;
  maxTitleWords?: number;
  minKeywords?: number;
  maxKeywords?: number;
  minDescriptionWords?: number;
  maxDescriptionWords?: number;
}

interface AnalysisResult {
  title: string;
  description: string;
  keywords: string[];
  prompt?: string;
  baseModel?: string;
  categories?: string[];
  error?: string;
}

export async function analyzeImageWithGemini(
  imageFile: File,
  apiKey: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const {
    platforms = ['AdobeStock'],
    generationMode = 'metadata',
    minTitleWords = 10,
    maxTitleWords = 15,
    minKeywords = 25,
    maxKeywords = 35,
    minDescriptionWords = 10,
    maxDescriptionWords = 30
  } = options;

  const isFreepikOnly = platforms.length === 1 && platforms[0] === 'Freepik';
  const isShutterstock = platforms.length === 1 && platforms[0] === 'Shutterstock';
  const isAdobeStock = platforms.length === 1 && platforms[0] === 'AdobeStock';
  
  try {
    // Convert image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Define prompt based on platform
    let prompt = `Analyze this image and generate:`;
    
    if (generationMode === 'imageToPrompt') {
      prompt = `Generate a detailed prompt description to recreate this image with an AI image generator. Include details about content, style, colors, lighting, and composition. The prompt should be at least 50 words but not more than 150 words.`;
    } else if (isFreepikOnly) {
      prompt = `Analyze this image and generate metadata for the Freepik platform:
1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words that accurately describes what's in the image. The title should be relevant for stock image platforms. Don't use any symbols.
2. Create an image generation prompt that describes this image in 1-2 sentences (30-50 words).
3. Generate a detailed list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image. Focus on content, style, emotions, and technical details of the image.`;
    } else if (isShutterstock) {
      prompt = `Analyze this image and generate metadata for the Shutterstock platform:
1. A clear, descriptive detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words.
2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
    } else if (isAdobeStock) {
      prompt = `Analyze this image and generate metadata for Adobe Stock:
1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words. Don't use any symbols.
2. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
    } else {
      prompt = `Analyze this image and generate:
1. A clear, descriptive title between ${minTitleWords}-${maxTitleWords} words. Don't use any symbols.
2. A detailed description that's between ${minDescriptionWords}-${maxDescriptionWords} words.
3. A list of ${minKeywords}-${maxKeywords} relevant, specific keywords (single words or short phrases) that someone might search for to find this image.`;
    }
    
    if (generationMode === 'imageToPrompt') {
      prompt += `\n\nReturn the prompt description only, nothing else.`;
    } else if (isFreepikOnly) {
      prompt += `\n\nFormat your response as a JSON object with the fields "title", "prompt", and "keywords" (as an array of at least ${minKeywords} terms).`;
    } else if (isShutterstock) {
      prompt += `\n\nFormat your response as a JSON object with the fields "description" and "keywords" (as an array).`;
    } else if (isAdobeStock) {
      prompt += `\n\nFormat your response as a JSON object with the fields "title" and "keywords" (as an array).`;
    } else {
      prompt += `\n\nFormat your response as a JSON object with the fields "title", "description", and "keywords" (as an array).`;
    }
    
    // Updated to use the newer Gemini 1.5 Flash model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64Image.split(',')[1],
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData?.error?.message || 'Failed to analyze image');
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    
    // For image-to-prompt mode, just return the description
    if (generationMode === 'imageToPrompt') {
      return {
        title: '',
        description: text.trim(),
        keywords: [],
      };
    }
    
    // Extract JSON from the response text
    let jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                    text.match(/```\n([\s\S]*?)\n```/) ||
                    text.match(/\{[\s\S]*\}/);
                    
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    // Clean up potential garbage around the JSON object
    jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse JSON from response:', jsonStr);
      console.error('Original response:', text);
      throw new Error('Failed to parse metadata from the API response');
    }
    
    // Ensure titles don't have symbols
    if (result.title) {
      result.title = removeSymbolsFromTitle(result.title);
    }
    
    // For Freepik, use the keywords provided directly from the API response
    if (isFreepikOnly) {
      // If keywords exist in the result, use them
      if (!result.keywords || result.keywords.length < minKeywords) {
        // Fallback: Generate keywords from the prompt if not enough keywords provided
        const freepikKeywords = getRelevantFreepikKeywords(result.prompt || '');
        result.keywords = freepikKeywords;
      }
      result.baseModel = "leonardo";
    }
    
    // For Shutterstock, suggest categories based on content
    if (isShutterstock) {
      result.categories = suggestCategoriesForShutterstock(
        result.title || '', 
        result.description || ''
      );
    }
    
    // For Adobe Stock, suggest categories based on content
    if (isAdobeStock) {
      result.categories = suggestCategoriesForAdobeStock(
        result.title || '',
        result.keywords || []
      );
    }
    
    return {
      title: result.title || '',
      description: result.description || '',
      keywords: result.keywords || [],
      prompt: result.prompt,
      baseModel: result.baseModel || "leonardo",
      categories: result.categories,
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      title: '',
      description: '',
      keywords: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
