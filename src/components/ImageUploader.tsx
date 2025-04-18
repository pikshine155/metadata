
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileIcon, Image, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ProcessedImage, createImagePreview, generateId, isValidImageType, isValidFileSize, formatFileSize } from '@/utils/imageHelpers';

interface ImageUploaderProps {
  onImagesSelected: (images: ProcessedImage[]) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  isProcessing
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(async (files: FileList) => {
    const processedImages: ProcessedImage[] = [];
    const promises: Promise<ProcessedImage>[] = [];
    const filesToProcess = Array.from(files);

    for (const file of filesToProcess) {
      const promise = (async () => {
        // Validate file is an image
        if (!isValidImageType(file)) {
          toast.error(`${file.name} is not a valid image file. Only JPEG, PNG, SVG, AI, and EPS files are supported.`);
          return null;
        }

        // Validate file size
        if (!isValidFileSize(file)) {
          toast.error(`${file.name} exceeds the 10GB size limit.`);
          return null;
        }

        try {
          const previewUrl = await createImagePreview(file);
          return {
            id: generateId(),
            file,
            previewUrl,
            status: 'pending' as const
          };
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
          return null;
        }
      })();
      
      promises.push(promise as Promise<ProcessedImage>);
    }

    const results = await Promise.all(promises);

    // Filter out any null results from failed processing
    const validResults = results.filter(Boolean) as ProcessedImage[];
    
    if (validResults.length > 0) {
      onImagesSelected(validResults);
      toast.success(`${validResults.length} image${validResults.length !== 1 ? 's' : ''} added`);
    } else if (files.length > 0) {
      toast.error('No valid images were found to process.');
    }
  }, [onImagesSelected]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFiles]);

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="bg-gray-800 border border-dashed border-gray-600 rounded-lg overflow-hidden">      
      <div 
        className={`drop-zone flex flex-col items-center justify-center p-10 transition-all duration-300 ${
          isDragging ? 'border-blue-500 bg-blue-500/10' : 'bg-gray-800/50 hover:bg-gray-800/70'
        }`} 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop}
      >
        <div className="mb-4 bg-blue-900/30 p-3 rounded-full">
          <Upload className="h-6 w-6 text-blue-400" />
        </div>
        
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-white mb-2">Drag and drop unlimited images here</p>
          <p className="text-sm text-gray-400">
            or click to upload (JPEG, PNG, SVG, AI, EPS up to 10GB each)
          </p>
        </div>
        
        <Button 
          onClick={handleBrowseClick} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md border-none flex items-center" 
          disabled={isProcessing}
        >
          <Image className="h-5 w-5 mr-2" />
          Browse Files
        </Button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          accept="image/jpeg,image/png,image/jpg,image/svg+xml,application/postscript,application/eps,image/eps,application/illustrator" 
          multiple 
          className="hidden" 
          disabled={isProcessing} 
        />
      </div>
    </div>
  );
};

export default ImageUploader;
