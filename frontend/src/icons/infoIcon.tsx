// InfoIcon.tsx or AlertIcon.tsx
import { SVGProps } from 'react';

interface InfoIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export const InfoIcon = ({ className = "", ...props }: InfoIconProps) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);