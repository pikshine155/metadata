
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toggle } from '@/components/ui/toggle';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Toggle
      aria-label="Toggle theme"
      pressed={theme === 'dark'}
      onPressedChange={toggleTheme}
      className="p-2.5 group relative overflow-hidden transition-colors duration-500 hover:bg-gray-800 rounded-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
      <div className="relative">
        {theme === 'dark' ? (
          <Moon className="h-5 w-5 text-orange-400 transition-all duration-500 hover:scale-110" />
        ) : (
          <Sun className="h-5 w-5 text-orange-500 transition-all duration-500 hover:scale-110" />
        )}
      </div>
    </Toggle>
  );
};

export default ThemeToggle;
