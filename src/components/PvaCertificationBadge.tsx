
import React from 'react';

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
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeMap[size]} relative`}>
        <img 
          src="/lovable-uploads/aced3aca-ecdf-4457-8c76-a378d8b54fec.png" 
          alt="PVA Free Certified" 
          className="w-full h-full" 
        />
      </div>
    </div>
  );
};

export default PvaCertificationBadge;
