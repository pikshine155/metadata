
import React from 'react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Camera, Crown, Diamond, Box, CircleIcon } from 'lucide-react';

export type Platform = 'Freepik' | 'AdobeStock' | 'Shutterstock' | 'Vecteezy' | 'Canva' | '123RF' | 'Dreamstime';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformChange: (platforms: Platform[]) => void;
}

const platforms: {
  id: Platform;
  icon: React.ReactNode;
  name: string;
}[] = [
  {
    id: 'Freepik',
    icon: <Crown className="h-5 w-5 text-yellow-400" />,
    name: 'Freepik'
  },
  {
    id: 'AdobeStock',
    icon: <span className="text-sm font-bold">St</span>,
    name: 'AdobeStock'
  },
  {
    id: 'Shutterstock',
    icon: <Camera className="h-5 w-5 text-blue-400" />,
    name: 'Shutterstock'
  },
  {
    id: 'Vecteezy',
    icon: <Diamond className="h-5 w-5 text-orange-500" />,
    name: 'Vecteezy'
  },
  {
    id: 'Canva',
    icon: <Diamond className="h-5 w-5 text-blue-500" />,
    name: 'Canva'
  },
  {
    id: '123RF',
    icon: <Box className="h-5 w-5 text-purple-400" />,
    name: '123RF'
  },
  {
    id: 'Dreamstime',
    icon: <CircleIcon className="h-5 w-5 text-indigo-400" />,
    name: 'Dreamstime'
  }
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformChange
}) => {
  const togglePlatform = (platform: Platform) => {
    // Changed to only allow single platform selection
    onPlatformChange([platform]);
  };

  return (
    <div className="flex space-x-2 overflow-x-auto px-[6px] mx-0 my-0 py-[8px]">
      {platforms.map(platform => (
        <TooltipProvider key={platform.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={cn(
                  "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm transition-all relative overflow-hidden",
                  selectedPlatforms.includes(platform.id)
                    ? "ring-2 ring-blue-500 bg-blue-500/10"
                    : "bg-gray-800 hover:bg-gray-700"
                )}
              >
                {/* Glow Effect Overlay */}
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300 rounded-lg pointer-events-none",
                  selectedPlatforms.includes(platform.id)
                    ? "bg-gradient-to-r from-purple-600/30 via-blue-500/30 to-cyan-400/30 opacity-100"
                    : "bg-gradient-to-r from-purple-600/30 via-blue-500/30 to-cyan-400/30 group-hover:opacity-100"
                )}
                  style={{
                    boxShadow: "0 0 15px 2px rgba(123, 97, 255, 0.3)",
                  }}
                />
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-700 relative z-10">
                  {platform.icon}
                </div>
                <span className="text-sm text-gray-300 relative z-10">{platform.name}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
              <p>{platform.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default PlatformSelector;
