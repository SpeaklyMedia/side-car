import React from 'react';
import { cn } from './cn';

export interface ContentScrimProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional intensity tweak for the scrim overlay. */
  tone?: 'soft' | 'strong';
}

export function ContentScrim({ className, tone = 'soft', children, ...props }: ContentScrimProps) {
  const overlayClasses =
    tone === 'strong'
      ? 'bg-gradient-to-b from-white/95 via-white/85 to-white/75'
      : 'bg-gradient-to-b from-white/90 via-white/80 to-white/70';

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)} {...props}>
      <div className="absolute inset-0 pointer-events-none backdrop-blur-sm" />
      <div className={cn('absolute inset-0 pointer-events-none', overlayClasses)} />
      <div className="relative">{children}</div>
    </div>
  );
}
