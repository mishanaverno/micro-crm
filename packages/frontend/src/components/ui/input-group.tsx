import * as React from 'react';
import { cn } from '@/lib/utils';

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-10 items-stretch overflow-hidden rounded-sm border border-input bg-background',
      className,
    )}
    {...props}
  />
));
InputGroup.displayName = 'InputGroup';

const InputGroupSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-stretch', className)}
    {...props}
  />
));
InputGroupSection.displayName = 'InputGroupSection';

export { InputGroup, InputGroupSection };
