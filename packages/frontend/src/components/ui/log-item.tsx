import * as React from 'react';
import { cn } from '@/lib/utils';

export function LogItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <article className={cn('relative pl-8', className)} {...props} />;
}

export function LogItemMarker({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'absolute left-0 top-5 z-10 h-3.5 w-3.5 rounded-full border-2 bg-card/80  shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function LogItemContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border/70 bg-card/80 px-4 py-4 shadow-sm backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}

export function LogItemHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-start justify-between gap-3', className)}
      {...props}
    />
  );
}

export function LogItemHeaderMain({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-1.5', className)} {...props} />;
}

export function LogItemHeaderActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shrink-0', className)} {...props} />;
}

export function LogItemBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-3', className)} {...props} />;
}

export function LogItemFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    />
  );
}

export function LogItemTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm font-medium text-foreground', className)} {...props} />;
}

export function LogItemDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs font-medium text-muted-foreground', className)} {...props} />;
}

export function LogItemMeta({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs uppercase tracking-[0.24em] text-muted-foreground', className)}
      {...props}
    />
  );
}

export function LogItemTimestamp({
  className,
  ...props
}: React.TimeHTMLAttributes<HTMLTimeElement>) {
  return (
    <time
      className={cn('text-xs text-muted-foreground sm:text-right', className)}
      {...props}
    />
  );
}
