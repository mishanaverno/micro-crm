import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type SidebarIconProps = {
  src: string;
  fallback: string;
  label: string;
  className?: string;
};

export function SidebarIcon({
  src,
  fallback,
  label,
  className,
}: SidebarIconProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={cn('inline-flex items-center justify-center text-base leading-none', className)}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      alt=""
      aria-label={label}
      className={cn('block object-contain', className)}
      src={src}
      onError={() => setFailed(true)}
    />
  );
}
