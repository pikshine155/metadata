export interface ProcessedImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: {
    title: string;
    description: string;
    keywords: string[];
    prompt?: string;
    baseModel?: string;
    categories?: string[]; // Added categories field for Shutterstock and AdobeStock
  };
  error?: string;
}

// Generate a unique ID for each image
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create preview URLs for images
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Format for CSV export
export function formatImagesAsCSV(images: ProcessedImage[], isFreepikOnly: boolean = false, isShutterstock: boolean = false, isAdobeStock: boolean = false): string {
  // Determine headers based on platform selection
  let headers;
  
  if (isFreepikOnly) {
    headers = ['"File name"', '"Title"', '"Keywords"', '"Prompt"', '"Base-Model"'];
  } else if (isShutterstock) {
    headers = ['"Filename"', '"Description"', '"Keywords"', '"Categories"'];
  } else if (isAdobeStock) {
    headers = ['"Filename"', '"Title"', '"Keywords"', '"Category"'];
  } else {
    headers = ['"Filename"', '"Title"', '"Description"', '"Keywords"'];
  }
    
  // Add headers
  const csvContent = [
    // Use semicolons for Freepik, commas for other platforms
    headers.join(isFreepikOnly ? ';' : ','),
    // Add data rows
    ...images
      .filter(img => img.status === 'complete' && img.result)
      .map(img => {
        // Ensure title has no symbols before writing to CSV
        const cleanTitle = img.result?.title ? removeSymbolsFromTitle(img.result.title) : '';
        
        if (isFreepikOnly) {
          return [
            `"${img.file.name}"`,
            `"${cleanTitle}"`,
            `"${img.result?.keywords?.join(', ') || ''}"`,
            `"${img.result?.prompt || ''}"`,
            `"leonardo"`,
          ].join(';');
        } else if (isShutterstock) {
          return [
            `"${img.file.name}"`,
            `"${img.result?.description || ''}"`,
            `"${img.result?.keywords?.join(',') || ''}"`,
            `"${img.result?.categories?.join(',') || ''}"`,
          ].join(',');
        } else if (isAdobeStock) {
          return [
            `"${img.file.name}"`,
            `"${cleanTitle}"`,
            `"${img.result?.keywords?.join(', ') || ''}"`,
            `"${img.result?.categories?.join(',') || ''}"`,
          ].join(',');
        } else {
          return [
            `"${img.file.name}"`,
            `"${cleanTitle}"`,
            `"${img.result?.description || ''}"`,
            `"${img.result?.keywords?.join(', ') || ''}"`,
          ].join(',');
        }
      })
  ].join('\n');

  return csvContent;
}

// Function to remove symbols from title
export function removeSymbolsFromTitle(title: string): string {
  // Remove symbols but keep alphanumeric, spaces, and basic punctuation like commas and periods
  return title.replace(/[^\w\s.,()-]/g, '');
}

// Export data to CSV file
export function downloadCSV(csvContent: string, filename = 'image-metadata.csv', platform?: string): void {
  // Create custom folder name based on platform
  let folderName = 'metadata';
  
  if (platform === 'AdobeStock') {
    folderName = 'AdobeStock-MetaData By FreepikScipts ✨';
  } else if (platform === 'Freepik') {
    folderName = 'Freepik-MetaData By Freepikscipts';
  } else if (platform) {
    folderName = `${platform}-MetaData`;
  }
  
  const customFilename = `${folderName}/${filename}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', customFilename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Get file size in human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if file is a valid image type
export function isValidImageType(file: File): boolean {
  const acceptedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'image/webp',
    'image/svg+xml',  // SVG support
    'application/postscript', // AI files
    'application/eps', // EPS files
    'application/x-eps',
    'image/eps',
    'application/illustrator' // Adobe Illustrator
  ];
  return acceptedTypes.includes(file.type);
}

// Check if file size is within limits (10GB max)
export function isValidFileSize(file: File, maxSizeGB = 10): boolean {
  const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Shutterstock Categories
export const shutterstockCategories = [
  'Abstract', 'Animals/Wildlife', 'Arts', 'Backgrounds/Textures', 
  'Beauty/Fashion', 'Buildings/Landmarks', 'Business/Finance', 
  'Celebrities', 'Education', 'Food and drink', 'Healthcare/Medical', 
  'Holidays', 'Industrial', 'Interiors', 'Miscellaneous', 'Nature', 
  'Objects', 'Parks/Outdoor', 'People', 'Religion', 'Science', 
  'Signs/Symbols', 'Sports/Recreation', 'Technology', 'Transportation', 'Vintage'
];

// Adobe Stock Categories
export const adobeStockCategories = [
  'Animals', 
  'Buildings and Architecture', 
  'Business', 
  'Drinks', 
  'The Environment', 
  'States of Mind', 
  'Food', 
  'Graphic Resources', 
  'Hobbies and Leisure', 
  'Industry', 
  'Landscapes', 
  'Lifestyle', 
  'People', 
  'Plants and Flowers', 
  'Culture and Religion', 
  'Science', 
  'Social Issues', 
  'Sports', 
  'Technology', 
  'Transport', 
  'Travel'
];

// Helper to determine the best categories for an image based on title/description and keywords
export function suggestCategoriesForAdobeStock(title: string, keywords: string[]): string[] {
  // Combine the title and keywords for analysis
  const combinedText = (title + " " + keywords.join(" ")).toLowerCase();
  
  // Map of common words/phrases to categories
  const categoryMatches: Record<string, string[]> = {
    // Animals
    'animal': ['Animals'],
    'wildlife': ['Animals'],
    'pet': ['Animals'],
    'dog': ['Animals'],
    'cat': ['Animals'],
    'bird': ['Animals'],
    'fish': ['Animals'],
    'horse': ['Animals'],
    'mammal': ['Animals'],
    'reptile': ['Animals'],
    
    // Buildings and Architecture
    'building': ['Buildings and Architecture'],
    'architecture': ['Buildings and Architecture'],
    'house': ['Buildings and Architecture'],
    'skyscraper': ['Buildings and Architecture'],
    'tower': ['Buildings and Architecture'],
    'monument': ['Buildings and Architecture'],
    'bridge': ['Buildings and Architecture'],
    'construction': ['Buildings and Architecture'],
    'apartment': ['Buildings and Architecture'],
    
    // Business
    'business': ['Business'],
    'office': ['Business'],
    'meeting': ['Business'],
    'professional': ['Business'],
    'corporate': ['Business'],
    'finance': ['Business'],
    'economy': ['Business'],
    'management': ['Business'],
    'entrepreneur': ['Business'],
    'startup': ['Business'],
    
    // Drinks
    'drink': ['Drinks'],
    'beverage': ['Drinks'],
    'coffee': ['Drinks'],
    'tea': ['Drinks'],
    'wine': ['Drinks'],
    'beer': ['Drinks'],
    'cocktail': ['Drinks'],
    'juice': ['Drinks'],
    'alcohol': ['Drinks'],
    'water': ['Drinks'],
    
    // The Environment
    'environment': ['The Environment'],
    'nature': ['The Environment'],
    'ecology': ['The Environment'],
    'ecosystem': ['The Environment'],
    'sustainable': ['The Environment'],
    'green': ['The Environment'],
    'climate': ['The Environment'],
    'pollution': ['The Environment'],
    'conservation': ['The Environment'],
    'renewable': ['The Environment'],
    
    // States of Mind
    'emotion': ['States of Mind'],
    'feeling': ['States of Mind'],
    'happiness': ['States of Mind'],
    'sadness': ['States of Mind'],
    'depression': ['States of Mind'],
    'anxiety': ['States of Mind'],
    'stress': ['States of Mind'],
    'joy': ['States of Mind'],
    'fear': ['States of Mind'],
    'love': ['States of Mind'],
    
    // Food
    'food': ['Food'],
    'meal': ['Food'],
    'cuisine': ['Food'],
    'restaurant': ['Food'],
    'dinner': ['Food'],
    'lunch': ['Food'],
    'breakfast': ['Food'],
    'cooking': ['Food'],
    'fruit': ['Food'],
    'vegetable': ['Food'],
    
    // Graphic Resources
    'graphic': ['Graphic Resources'],
    'design': ['Graphic Resources'],
    'illustration': ['Graphic Resources'],
    'vector': ['Graphic Resources'],
    'font': ['Graphic Resources'],
    'typography': ['Graphic Resources'],
    'icon': ['Graphic Resources'],
    'logo': ['Graphic Resources'],
    'pattern': ['Graphic Resources'],
    'template': ['Graphic Resources'],
    
    // Hobbies and Leisure
    'hobby': ['Hobbies and Leisure'],
    'leisure': ['Hobbies and Leisure'],
    'recreation': ['Hobbies and Leisure'],
    'game': ['Hobbies and Leisure'],
    'craft': ['Hobbies and Leisure'],
    'diy': ['Hobbies and Leisure'],
    'gardening': ['Hobbies and Leisure'],
    'reading': ['Hobbies and Leisure'],
    'music': ['Hobbies and Leisure'],
    'entertainment': ['Hobbies and Leisure'],
    
    // Industry
    'industry': ['Industry'],
    'factory': ['Industry'],
    'manufacturing': ['Industry'],
    'production': ['Industry'],
    'warehouse': ['Industry'],
    'machinery': ['Industry'],
    'industrial': ['Industry'],
    'engineering': ['Industry'],
    'mining': ['Industry'],
    'automation': ['Industry'],
    
    // Landscapes
    'landscape': ['Landscapes'],
    'mountain': ['Landscapes'],
    'valley': ['Landscapes'],
    'hill': ['Landscapes'],
    'desert': ['Landscapes'],
    'forest': ['Landscapes'],
    'beach': ['Landscapes'],
    'ocean': ['Landscapes'],
    'sea': ['Landscapes'],
    'river': ['Landscapes'],
    
    // Lifestyle
    'lifestyle': ['Lifestyle'],
    'fashion': ['Lifestyle'],
    'beauty': ['Lifestyle'],
    'trend': ['Lifestyle'],
    'style': ['Lifestyle'],
    'luxury': ['Lifestyle'],
    'wellness': ['Lifestyle'],
    'health': ['Lifestyle'],
    'exercise': ['Lifestyle'], // Changed 'fitness' to 'exercise' to avoid duplicate
    'home': ['Lifestyle'],
    
    // People
    'people': ['People'],
    'person': ['People'],
    'man': ['People'],
    'woman': ['People'],
    'child': ['People'],
    'family': ['People'],
    'portrait': ['People'],
    'crowd': ['People'],
    'human': ['People'],
    'adult': ['People'],
    
    // Plants and Flowers
    'plant': ['Plants and Flowers'],
    'flower': ['Plants and Flowers'],
    'tree': ['Plants and Flowers'],
    'garden': ['Plants and Flowers'],
    'botanical': ['Plants and Flowers'],
    'floral': ['Plants and Flowers'],
    'herb': ['Plants and Flowers'],
    'leaf': ['Plants and Flowers'],
    'bush': ['Plants and Flowers'],
    'grass': ['Plants and Flowers'],
    
    // Culture and Religion
    'culture': ['Culture and Religion'],
    'religion': ['Culture and Religion'],
    'faith': ['Culture and Religion'],
    'tradition': ['Culture and Religion'],
    'heritage': ['Culture and Religion'],
    'ritual': ['Culture and Religion'],
    'ceremony': ['Culture and Religion'],
    'worship': ['Culture and Religion'],
    'festival': ['Culture and Religion'],
    'celebration': ['Culture and Religion'],
    
    // Science
    'science': ['Science'],
    'research': ['Science'],
    'laboratory': ['Science'],
    'experiment': ['Science'],
    'chemistry': ['Science'],
    'physics': ['Science'],
    'biology': ['Science'],
    'medicine': ['Science'],
    'innovation': ['Science'],
    
    // Social Issues
    'social': ['Social Issues'],
    'issue': ['Social Issues'],
    'poverty': ['Social Issues'],
    'inequality': ['Social Issues'],
    'discrimination': ['Social Issues'],
    'protest': ['Social Issues'],
    'activism': ['Social Issues'],
    'community': ['Social Issues'],
    'diversity': ['Social Issues'],
    'inclusion': ['Social Issues'],
    
    // Sports
    'sport': ['Sports'],
    'athlete': ['Sports'],
    'competition': ['Sports'],
    'football': ['Sports'],
    'soccer': ['Sports'],
    'basketball': ['Sports'],
    'tennis': ['Sports'],
    'swimming': ['Sports'],
    'running': ['Sports'],
    'fitness': ['Sports'],
    
    // Technology
    'technology': ['Technology'],
    'digital': ['Technology'],
    'computer': ['Technology'],
    'electronic': ['Technology'],
    'device': ['Technology'],
    'software': ['Technology'],
    'hardware': ['Technology'],
    'internet': ['Technology'],
    'mobile': ['Technology'],
    'tech': ['Technology'],
    
    // Transport
    'transport': ['Transport'],
    'vehicle': ['Transport'],
    'car': ['Transport'],
    'bus': ['Transport'],
    'train': ['Transport'],
    'aircraft': ['Transport'],
    'airplane': ['Transport'],
    'ship': ['Transport'],
    'bicycle': ['Transport'],
    'motorcycle': ['Transport'],
    
    // Travel
    'travel': ['Travel'],
    'tourism': ['Travel'],
    'vacation': ['Travel'],
    'holiday': ['Travel'],
    'adventure': ['Travel'],
    'exploration': ['Travel'],
    'destination': ['Travel'],
    'tourist': ['Travel'],
    'journey': ['Travel'],
    'trip': ['Travel']
  };
  
  // Count category matches based on the text content
  const categoryCount: Record<string, number> = {};
  
  // Check each word against our category mapping
  const words = combinedText.split(/\s+/);
  for (const word of words) {
    if (categoryMatches[word]) {
      for (const category of categoryMatches[word]) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    }
  }
  
  // Sort categories by number of matches
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top 1 category, or default to "Animals" if none found
  return sortedCategories.length >= 1 
    ? sortedCategories.slice(0, 1) 
    : ["Animals"];
}

// Helper to determine the best categories for a Shutterstock image
export function suggestCategoriesForShutterstock(title: string, description: string): string[] {
  // Combine the title and description for analysis
  const combinedText = (title + " " + description).toLowerCase();
  
  // Map of common words/phrases to categories
  const categoryMatches: Record<string, string[]> = {
    // Abstract
    'abstract': ['Abstract'],
    'geometric': ['Abstract'],
    'pattern': ['Abstract', 'Backgrounds/Textures'],
    
    // Animals
    'animal': ['Animals/Wildlife'],
    'wildlife': ['Animals/Wildlife'],
    'pet': ['Animals/Wildlife'],
    'dog': ['Animals/Wildlife'],
    'cat': ['Animals/Wildlife'],
    'bird': ['Animals/Wildlife'],
    'fish': ['Animals/Wildlife'],
    
    // Arts
    'art': ['Arts'],
    'painting': ['Arts'],
    'sculpture': ['Arts'],
    'drawing': ['Arts'],
    'creative': ['Arts'],
    
    // Backgrounds/Textures
    'background': ['Backgrounds/Textures'],
    'texture': ['Backgrounds/Textures'],
    'wallpaper': ['Backgrounds/Textures'],
    
    // Beauty/Fashion
    'beauty': ['Beauty/Fashion'],
    'fashion': ['Beauty/Fashion'],
    'makeup': ['Beauty/Fashion'],
    'model': ['Beauty/Fashion', 'People'],
    'style': ['Beauty/Fashion'],
    'clothing': ['Beauty/Fashion'],
    
    // Buildings/Landmarks
    'building': ['Buildings/Landmarks'],
    'architecture': ['Buildings/Landmarks'],
    'landmark': ['Buildings/Landmarks'],
    'monument': ['Buildings/Landmarks'],
    'skyscraper': ['Buildings/Landmarks'],
    'house': ['Buildings/Landmarks'],
    
    // Business/Finance
    'business': ['Business/Finance'],
    'finance': ['Business/Finance'],
    'office': ['Business/Finance'],
    'meeting': ['Business/Finance'],
    'corporate': ['Business/Finance'],
    'professional': ['Business/Finance'],
    
    // Celebrities - hard to match without specific names
    'celebrity': ['Celebrities'],
    'famous': ['Celebrities'],
    'star': ['Celebrities'],
    
    // Education
    'education': ['Education'],
    'school': ['Education'],
    'learning': ['Education'],
    'student': ['Education'],
    'book': ['Education'],
    'classroom': ['Education'],
    
    // Food and drink
    'food': ['Food and drink'],
    'drink': ['Food and drink'],
    'meal': ['Food and drink'],
    'restaurant': ['Food and drink'],
    'cooking': ['Food and drink'],
    'kitchen': ['Food and drink'],
    
    // Healthcare/Medical
    'health': ['Healthcare/Medical'],
    'medical': ['Healthcare/Medical'],
    'doctor': ['Healthcare/Medical'],
    'hospital': ['Healthcare/Medical'],
    'nurse': ['Healthcare/Medical'],
    'medicine': ['Healthcare/Medical'],
    
    // Holidays
    'holiday': ['Holidays'],
    'christmas': ['Holidays'],
    'halloween': ['Holidays'],
    'easter': ['Holidays'],
    'celebration': ['Holidays'],
    'festival': ['Holidays'],
    
    // Industrial
    'industrial': ['Industrial'],
    'factory': ['Industrial'],
    'manufacturing': ['Industrial'],
    'machinery': ['Industrial'],
    'construction': ['Industrial'],
    
    // Interiors
    'interior': ['Interiors'],
    'room': ['Interiors'],
    'furniture': ['Interiors'],
    'home': ['Interiors'],
    'decoration': ['Interiors'],
    'indoor': ['Interiors'],
    
    // Miscellaneous
    'misc': ['Miscellaneous'],
    'various': ['Miscellaneous'],
    'assorted': ['Miscellaneous'],
    
    // Nature
    'nature': ['Nature'],
    'landscape': ['Nature', 'Parks/Outdoor'],
    'mountain': ['Nature', 'Parks/Outdoor'],
    'forest': ['Nature'],
    'plant': ['Nature'],
    'flower': ['Nature'],
    'tree': ['Nature'],
    'river': ['Nature'],
    'lake': ['Nature'],
    'ocean': ['Nature'],
    'sea': ['Nature'],
    
    // Objects
    'object': ['Objects'],
    'item': ['Objects'],
    'tool': ['Objects'],
    'product': ['Objects'],
    
    // Parks/Outdoor
    'park': ['Parks/Outdoor'],
    'outdoor': ['Parks/Outdoor'],
    'garden': ['Parks/Outdoor'],
    'yard': ['Parks/Outdoor'],
    'camping': ['Parks/Outdoor'],
    
    // People
    'people': ['People'],
    'person': ['People'],
    'man': ['People'],
    'woman': ['People'],
    'child': ['People'],
    'family': ['People'],
    'group': ['People'],
    
    // Religion
    'religion': ['Religion'],
    'church': ['Religion'],
    'temple': ['Religion'],
    'mosque': ['Religion'],
    'prayer': ['Religion'],
    'spiritual': ['Religion'],
    
    // Science
    'science': ['Science'],
    'research': ['Science'],
    'lab': ['Science'],
    'chemistry': ['Science'],
    'biology': ['Science'],
    'physics': ['Science'],
    
    // Signs/Symbols
    'sign': ['Signs/Symbols'],
    'symbol': ['Signs/Symbols'],
    'icon': ['Signs/Symbols'],
    'logo': ['Signs/Symbols'],
    
    // Sports/Recreation
    'sport': ['Sports/Recreation'],
    'game': ['Sports/Recreation'],
    'play': ['Sports/Recreation'],
    'athlete': ['Sports/Recreation'],
    'fitness': ['Sports/Recreation'],
    'exercise': ['Sports/Recreation'],
    'recreation': ['Sports/Recreation'],
    
    // Technology
    'technology': ['Technology'],
    'computer': ['Technology'],
    'digital': ['Technology'],
    'electronic': ['Technology'],
    'device': ['Technology'],
    'smartphone': ['Technology'],
    'internet': ['Technology'],
    
    // Transportation
    'transportation': ['Transportation'],
    'vehicle': ['Transportation'],
    'car': ['Transportation'],
    'bus': ['Transportation'],
    'train': ['Transportation'],
    'plane': ['Transportation'],
    'airplane': ['Transportation'],
    'ship': ['Transportation'],
    'boat': ['Transportation'],
    
    // Vintage
    'vintage': ['Vintage'],
    'retro': ['Vintage'],
    'antique': ['Vintage'],
    'old': ['Vintage'],
    'classic': ['Vintage']
  };
  
  // Count category matches based on the text content
  const categoryCount: Record<string, number> = {};
  
  // Check each word against our category mapping
  const words = combinedText.split(/\s+/);
  for (const word of words) {
    if (categoryMatches[word]) {
      for (const category of categoryMatches[word]) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    }
  }
  
  // Sort categories by number of matches
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top 2 categories, or default to "Miscellaneous" and "Objects" if none found
  return sortedCategories.length >= 2 
    ? sortedCategories.slice(0, 2) 
    : sortedCategories.concat(["Miscellaneous", "Objects"]).slice(0, 2);
}

// Get relevant keywords for Freepik based on image content
export function getRelevantFreepikKeywords(imageDescription: string): string[] {
  // Create a more comprehensive set of keywords based on the image description
  const description = imageDescription.toLowerCase();
  
  // Extract all meaningful words from the description (words longer than 3 letters)
  const words = description.split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 0);
  
  // Get unique words to prevent duplicates
  const uniqueWords = Array.from(new Set(words));
  
  // Common categories to help structure the keywords
  const categories = {
    objects: ['table', 'chair', 'desk', 'lamp', 'computer', 'phone', 'book', 'pen', 'pencil', 'notebook', 'cup', 'mug', 'bottle', 'glass', 'plate', 'bowl', 'fork', 'knife', 'spoon', 'watch', 'clock', 'bag', 'box', 'container', 'bin', 'trash', 'recycle'],
    nature: ['tree', 'plant', 'flower', 'grass', 'leaf', 'mountain', 'river', 'lake', 'ocean', 'sea', 'beach', 'forest', 'garden', 'park', 'sky', 'cloud', 'rain', 'snow', 'sun', 'moon', 'star'],
    animals: ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'sheep', 'goat', 'chicken', 'pig', 'duck', 'rabbit', 'mouse', 'rat', 'hamster', 'guinea', 'turtle', 'snake', 'lizard', 'frog'],
    colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'gold', 'silver', 'bronze', 'copper', 'turquoise', 'teal', 'navy', 'maroon', 'olive'],
    materials: ['wood', 'metal', 'plastic', 'glass', 'ceramic', 'cotton', 'wool', 'silk', 'leather', 'paper', 'cardboard', 'stone', 'marble', 'granite', 'concrete', 'brick', 'rubber'],
    concepts: ['happy', 'sad', 'angry', 'calm', 'quiet', 'loud', 'fast', 'slow', 'big', 'small', 'tall', 'short', 'long', 'wide', 'narrow', 'thick', 'thin', 'heavy', 'light', 'old', 'new', 'young', 'ancient', 'modern', 'futuristic', 'vintage', 'retro', 'classic', 'traditional', 'contemporary']
  };
  
  // Final keywords array
  let keywords: string[] = [];
  
  // Add words from the description
  keywords = [...uniqueWords];
  
  // Add related words from categories if they appear in the description
  Object.entries(categories).forEach(([category, words]) => {
    words.forEach(word => {
      if (description.includes(word) && !keywords.includes(word)) {
        keywords.push(word);
      }
    });
  });
  
  // Add some adjectives that might be relevant
  const styleAdjectives = ['elegant', 'beautiful', 'stylish', 'modern', 'rustic', 'minimalist', 'luxurious', 'colorful', 'vintage', 'artistic'];
  styleAdjectives.forEach(adj => {
    if (description.includes(adj) && !keywords.includes(adj)) {
      keywords.push(adj);
    }
  });
  
  // Ensure we have a reasonable number of keywords (between 10-30)
  if (keywords.length < 15) {
    // If we have too few keywords, add some general ones based on likely content
    if (description.includes('indoor') || description.includes('room') || description.includes('interior')) {
      keywords.push('interior', 'indoor', 'home', 'decor');
    }
    
    if (description.includes('outdoor') || description.includes('outside') || description.includes('garden')) {
      keywords.push('outdoor', 'exterior', 'garden', 'nature');
    }
    
    if (description.includes('person') || description.includes('people') || description.includes('man') || description.includes('woman')) {
      keywords.push('person', 'people', 'lifestyle', 'portrait');
    }
  }
  
  // Deduplicate again and limit to 30 keywords
  return Array.from(new Set(keywords)).slice(0, 30);
}
