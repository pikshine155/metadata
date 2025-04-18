import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LogOut, Infinity, Crown, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, differenceInDays } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user || !profile) {
    return null;
  }

  const remainingCredits = profile.is_premium ? Infinity : Math.max(0, 10 - profile.credits_used);
  const creditPercentage = profile.is_premium ? 100 : Math.max(0, Math.min(100, ((10 - profile.credits_used) / 10) * 100));
  
  // Generate consistent avatar URL based on user email
  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`;

  // Calculate time remaining for premium users
  const getRemainingTime = () => {
    if (!profile.expiration_date) return null;
    const expirationDate = new Date(profile.expiration_date);
    const daysRemaining = differenceInDays(expirationDate, new Date());
    return daysRemaining > 0 ? `${daysRemaining} days` : 'Expired';
  };

  const timeRemaining = getRemainingTime();
  const formattedExpirationDate = profile.expiration_date 
    ? format(new Date(profile.expiration_date), 'MMM dd, yyyy')
    : null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-gray-700">
              <AvatarImage src={avatarUrl} alt={user.email} />
              <AvatarFallback className="bg-gray-800 text-gray-400">
                {user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-white">{user.email}</h3>
              <div className="flex flex-col">
                <div className="flex items-center text-sm">
                  {profile.is_premium ? (
                    <div className="flex items-center text-[#01fa01]">
                      <Crown className="h-4 w-4 mr-1" />
                      <span>Premium User</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Free User</span>
                  )}
                </div>
                {profile.is_premium && timeRemaining && (
                  <div className="flex flex-col text-xs text-gray-400 mt-1">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Time remaining: {timeRemaining}</span>
                    </div>
                    <span>Expires: {formattedExpirationDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-orange-500 text-xl">Credits remaining</span>
            <div className="flex items-center font-medium text-amber-400">
              {profile.is_premium ? <Infinity className="h-4 w-4 mr-1 rounded-xl" /> : remainingCredits}
            </div>
          </div>
          
          {!profile.is_premium && (
            <Progress 
              value={creditPercentage} 
              className="h-2 bg-gray-800" 
              indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500" 
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut} 
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
