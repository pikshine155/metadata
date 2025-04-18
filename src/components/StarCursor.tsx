
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Define the Star type
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speedY: number;
  rotation: number;
  speedRotation: number;
  pulse: boolean;
  trail: boolean;
}

const StarCursor: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();
  
  // Enhanced color palette with more vibrant options
  const starColors = [
    '#8B5CF6', // Vivid Purple
    '#D946EF', // Magenta Pink
    '#F97316', // Bright Orange
    '#0EA5E9', // Ocean Blue
    '#FCD34D', // Yellow
    '#10B981', // Green
    '#F87171', // Red
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#EC4899', // Pink
  ];

  useEffect(() => {
    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Create new stars with enhanced properties - reduce the number for better performance
      for (let i = 0; i < 2; i++) { // Reduced from 4 to 2 for performance
        // Add randomization to make the effect more dynamic
        const randomSpeed = Math.random() * 2 + 0.3;
        const randomSize = Math.random() * 4 + 1; // Slightly smaller stars (1-5px)
        const isTrail = Math.random() > 0.7; // Some stars have trails
        
        const newStar: Star = {
          id: Date.now() + i,
          x: e.clientX + (Math.random() - 0.5) * 20, // Slightly less spread
          y: e.clientY + (Math.random() - 0.5) * 20,
          size: randomSize,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          opacity: 0.9,
          speedY: randomSpeed, 
          rotation: Math.random() * 360,
          speedRotation: (Math.random() - 0.5) * 8, // Reduced rotation speed
          pulse: Math.random() > 0.8, // 20% chance of pulsing
          trail: isTrail,
        };
        
        setStars(prevStars => [...prevStars, newStar]);
      }
    };
    
    // Track when cursor leaves window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    // Track when cursor enters window
    const handleMouseEnter = () => {
      setIsVisible(true);
    };
    
    // Add mouse event listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    // Optimize performance by limiting stars
    const cleanupStarsInterval = setInterval(() => {
      setStars(prevStars => {
        // If there are too many stars, remove the oldest ones
        if (prevStars.length > 100) {
          return prevStars.slice(-100);
        }
        return prevStars;
      });
    }, 1000);
    
    // Set an interval to animate the stars
    const animationInterval = setInterval(() => {
      setStars(prevStars => 
        prevStars
          .map(star => {
            // Enhanced movement patterns
            const horizontalMovement = star.trail 
              ? Math.sin(Date.now() / 1000 + star.id) * 0.8 // Simplified sinusoidal movement
              : (Math.random() - 0.5) * 0.5; // Reduced random drift
            
            return {
              ...star,
              y: star.y + star.speedY,
              x: star.x + horizontalMovement,
              // Faster fade for better performance
              opacity: star.opacity - (star.trail ? 0.01 : 0.02),
              rotation: star.rotation + star.speedRotation,
            };
          })
          .filter(star => star.opacity > 0) // Remove stars when they fade out
      );
    }, 16); // ~60fps
    
    // Add custom cursor style
    document.body.style.cursor = 'none';
    
    // Clean up event listeners and intervals
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearInterval(animationInterval);
      clearInterval(cleanupStarsInterval);
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Custom cursor */}
      {isVisible && (
        <div 
          className="fixed w-8 h-8 pointer-events-none z-[60] transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transition: 'transform 0.05s linear', // Faster transition for more responsive cursor
          }}
        >
          <div className="w-full h-full relative">
            <div className="absolute inset-0 rounded-full border-2 border-white animate-pulse-subtle"></div>
            <div className="absolute w-2 h-2 bg-white rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      )}
      
      {stars.map(star => (
        <div 
          key={star.id}
          className={`absolute ${star.pulse ? 'star-pulse' : ''}`}
          style={{
            left: `${star.x}px`,
            top: `${star.y}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            transform: `rotate(${star.rotation}deg)`,
            willChange: 'transform, opacity', // Optimize rendering performance
            pointerEvents: 'none',
          }}
        >
          {/* Enhanced bubble appearance with improved glow */}
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 1.2}px ${star.color}`, // Reduced glow for performance
              filter: `blur(${star.size/10}px)`, // Less blur for performance
              border: theme === 'dark' 
                ? '0.5px solid rgba(255,255,255,0.4)' 
                : '0.5px solid rgba(255,255,255,0.6)'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default StarCursor;
