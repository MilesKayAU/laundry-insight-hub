
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-spin', className)} 
      {...props}
    >
      <Loader2 className="h-4 w-4" />
    </div>
  )
);

Spinner.displayName = 'Spinner';
