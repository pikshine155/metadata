
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const { apiKey: authApiKey } = useAuth();

  // Initialize from localStorage or authContext when component mounts
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key') || authApiKey;
    if (savedKey) {
      setInputKey(savedKey);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange, authApiKey]);

  // Update when apiKey prop changes
  useEffect(() => {
    if (apiKey) {
      setInputKey(apiKey);
    }
  }, [apiKey]);

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleSaveKey = () => {
    if (inputKey) {
      localStorage.setItem('gemini-api-key', inputKey);
      onApiKeyChange(inputKey);
      toast.success('API key saved successfully');
    } else {
      toast.error('Please enter an API key');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini-api-key');
    setInputKey('');
    onApiKeyChange('');
    toast.success('API key cleared');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">API Key</h2>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">API Key Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-gray-800 text-gray-200 border-gray-700">
                  <p>Your API key is stored only in your browser and never sent to our servers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Gemini API key"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-200 focus:ring-amber-500/30 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white"
              onClick={toggleShowApiKey}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showApiKey ? "Hide API Key" : "Show API Key"}
              </span>
            </Button>
          </div>
          <Button 
            onClick={handleSaveKey}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none"
          >
            Save
          </Button>
          {apiKey && (
            <Button 
              variant="outline" 
              onClick={handleClearKey}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>Generate your</span>
          <span className="font-semibold text-amber-400">FREE API key</span>
          <span>from</span>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Google Gemini AI
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
