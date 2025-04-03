
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-6 w-6'
    };
    
    const colorClasses = {
      default: 'text-primary',
      primary: 'text-blue-600',
      secondary: 'text-purple-600',
      success: 'text-green-600',
      warning: 'text-amber-600',
      danger: 'text-red-600'
    };
    
    return (
      <div
        ref={ref}
        className={cn('animate-spin flex items-center justify-center', className)} 
        {...props}
      >
        <Loader2 className={cn(sizeClasses[size], colorClasses[color])} />
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
