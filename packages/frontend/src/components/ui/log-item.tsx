import * as React from 'react';
import { cn } from '@/lib/utils';

export function LogItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <article className={cn('relative', className)} {...props} />;
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
        'overflow-hidden rounded-[8px] border border-border/70 bg-card/80 px-4 shadow-sm backdrop-blur-sm',
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
  return <div className={cn('flex items-start align-center', className)} {...props} />;
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
        'mt-3 flex flex-col gap-1.5 border-t border-border/60 py-1 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    />
  );
}

export function LogItemNote({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'mt-3 rounded-2xl border border-border/60 bg-muted/50 px-3 py-2 text-xs text-foreground/80',
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
  return <p className={cn('text-sm font-medium', className)} {...props} />;
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
      className={cn('text-[11px] text-muted-foreground sm:text-right', className)}
      {...props}
    />
  );
}
