
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomizationControlsProps {
  minTitleWords: number;
  onMinTitleWordsChange: (value: number[]) => void;
  maxTitleWords: number;
  onMaxTitleWordsChange: (value: number[]) => void;
  minKeywords: number;
  onMinKeywordsChange: (value: number[]) => void;
  maxKeywords: number;
  onMaxKeywordsChange: (value: number[]) => void;
  minDescriptionWords: number;
  onMinDescriptionWordsChange: (value: number[]) => void;
  maxDescriptionWords: number;
  onMaxDescriptionWordsChange: (value: number[]) => void;
}

interface SettingRowProps {
  label: string;
  tooltip: string;
  value: number;
  minValue: number;
  maxValue: number;
  onChange: (value: number[]) => void;
  currentValue: string;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  tooltip,
  value,
  minValue,
  maxValue,
  onChange,
  currentValue
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs text-gray-400 flex items-center">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400 ml-1 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-xs font-medium text-white bg-gray-700 px-2 py-0.5 rounded">{currentValue}</span>
      </div>
      <div className="flex items-center">
        <Slider
          value={[value]} 
          min={minValue}
          max={maxValue}
          step={1}
          className="flex-1"
          onValueChange={onChange}
        />
      </div>
    </div>
  );
};

const CustomizationControls: React.FC<CustomizationControlsProps> = ({
  minTitleWords,
  onMinTitleWordsChange,
  maxTitleWords,
  onMaxTitleWordsChange,
  minKeywords,
  onMinKeywordsChange,
  maxKeywords,
  onMaxKeywordsChange,
  minDescriptionWords,
  onMinDescriptionWordsChange,
  maxDescriptionWords,
  onMaxDescriptionWordsChange
}) => {
  return (
    <div>
      <SettingRow
        label="Min Title Words"
        tooltip="Minimum number of words for the generated title"
        value={minTitleWords}
        minValue={5}
        maxValue={25}
        onChange={onMinTitleWordsChange}
        currentValue={minTitleWords.toString()}
      />
      
      <SettingRow
        label="Max Title Words"
        tooltip="Maximum number of words for the generated title"
        value={maxTitleWords}
        minValue={10}
        maxValue={25}
        onChange={onMaxTitleWordsChange}
        currentValue={maxTitleWords.toString()}
      />
      
      <SettingRow
        label="Min Keywords"
        tooltip="Minimum number of keywords to generate"
        value={minKeywords}
        minValue={5}
        maxValue={50}
        onChange={onMinKeywordsChange}
        currentValue={minKeywords.toString()}
      />
      
      <SettingRow
        label="Max Keywords"
        tooltip="Maximum number of keywords to generate"
        value={maxKeywords}
        minValue={10}
        maxValue={50}
        onChange={onMaxKeywordsChange}
        currentValue={maxKeywords.toString()}
      />
      
      <SettingRow
        label="Min Description Words"
        tooltip="Minimum number of words for the generated description"
        value={minDescriptionWords}
        minValue={5}  // Changed from 10 to 5
        maxValue={40}
        onChange={onMinDescriptionWordsChange}
        currentValue={minDescriptionWords.toString()}
      />
      
      <SettingRow
        label="Max Description Words"
        tooltip="Maximum number of words for the generated description"
        value={maxDescriptionWords}
        minValue={20}
        maxValue={40}
        onChange={onMaxDescriptionWordsChange}
        currentValue={maxDescriptionWords.toString()}
      />
    </div>
  );
};

export default CustomizationControls;
