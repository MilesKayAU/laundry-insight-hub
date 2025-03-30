
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PvaCertificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

const PvaCertificationBadge: React.FC<PvaCertificationBadgeProps> = ({ 
  size = 'md', 
  withText = true,
  className = ''
}) => {
  // Size mappings
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };
  
  const textSizeMap = {
    sm: 'text-[6px]',
    md: 'text-[8px]',
    lg: 'text-xs'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeMap[size]} relative`}>
        {/* Circle background */}
        <div className="absolute inset-0 rounded-full bg-[#1EAEDB] flex items-center justify-center">
          {/* Inner circle */}
          <div className="w-[80%] h-[80%] rounded-full bg-white flex items-center justify-center relative">
            {/* PVA with strikethrough */}
            <div className="relative text-[#1EAEDB] font-bold">
              <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'} font-extrabold`}>PVA</span>
              <div className="absolute inset-0 flex items-center">
                <div className="h-[2px] w-full bg-[#1EAEDB] transform rotate-45"></div>
              </div>
            </div>
            
            {/* Green leaves */}
            <div className="absolute top-0 left-[15%]">
              <div className="w-[0.6em] h-[0.6em] bg-[#4CAF50] rounded-full transform rotate-45 scale-75"></div>
            </div>
            <div className="absolute bottom-[15%] right-[10%]">
              <div className="w-[0.6em] h-[0.6em] bg-[#4CAF50] rounded-full transform rotate-45 scale-75"></div>
            </div>
          </div>
        </div>
        
        {/* Text around the circle */}
        {withText && (
          <>
            <div className="absolute w-full text-center -top-1 text-white font-bold tracking-wider transform translate-y-[-50%] rotate-0">
              <span className={`${textSizeMap[size]} uppercase`}>PVA FREE</span>
            </div>
            <div className="absolute w-full text-center -bottom-1 text-white font-bold tracking-wider transform translate-y-[50%] rotate-0">
              <span className={`${textSizeMap[size]} uppercase`}>CERTIFIED</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PvaCertificationBadge;
