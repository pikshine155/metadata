import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileImage, MessageSquareText } from "lucide-react";
export type GenerationMode = 'metadata' | 'imageToPrompt';
interface GenerationModeSelectorProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}
const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  return <div className="space-y-2">
      <h3 className="text-sm font-medium text-[#f68003]">Mode Selection</h3>
      <RadioGroup value={selectedMode} onValueChange={value => onModeChange(value as GenerationMode)} className="grid grid-cols-2 gap-2">
        <div className={`flex items-center p-2 rounded cursor-pointer transition-colors ${selectedMode === 'metadata' ? 'bg-blue-900/20 border border-blue-800' : 'bg-gray-800 border border-gray-700 hover:bg-gray-800/70'}`}>
          <RadioGroupItem value="metadata" id="metadata" className="sr-only" />
          <Label htmlFor="metadata" className="flex items-center cursor-pointer">
            <div className="p-1 rounded-full bg-blue-900/30 text-blue-400 mr-1.5">
              <FileImage className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-medium text-white">Metadata</span>
            </div>
          </Label>
        </div>
        
        <div className={`flex items-center p-2 rounded cursor-pointer transition-colors ${selectedMode === 'imageToPrompt' ? 'bg-blue-900/20 border border-blue-800' : 'bg-gray-800 border border-gray-700 hover:bg-gray-800/70'}`}>
          <RadioGroupItem value="imageToPrompt" id="imageToPrompt" className="sr-only" />
          <Label htmlFor="imageToPrompt" className="flex items-center cursor-pointer">
            <div className="p-1 rounded-full bg-blue-900/30 text-blue-400 mr-1.5">
              <MessageSquareText className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-medium text-white">Image to Prompt</span>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>;
};
export default GenerationModeSelector;