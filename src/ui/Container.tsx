import React from 'react';
import { cn } from './cn';

const containerClasses = 'max-w-screen-sm mx-auto px-4 py-4 space-y-4 text-gray-900';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps) {
  return <div className={cn(containerClasses, className)} {...props} />;
}
