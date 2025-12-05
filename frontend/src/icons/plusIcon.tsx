import { SVGProps } from 'react';

interface PlusIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export const PlusIcon = ({ className = "", ...props }: PlusIconProps) => (
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
      d="M12 4v16m8-8H4" 
    />
  </svg>
);