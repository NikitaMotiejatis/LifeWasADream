import React from 'react';

interface VatItemIconProps {
  className?: string;
}

const VatItemIcon: React.FC<VatItemIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M8 7v10" />
      <path d="M16 7v10" />
      <path d="M9 9l6 6" />
      <circle cx="8.5" cy="8.5" r="0.5" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="0.5" fill="currentColor" />
    </svg>
  );
};

export default VatItemIcon;