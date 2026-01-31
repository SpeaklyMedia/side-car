import React from 'react';
import { cn } from './cn';

export const cardClasses = 'rounded-xl bg-white/90 backdrop-blur shadow ring-1 ring-black/5';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return <div className={cn(cardClasses, className)} {...props} />;
}
