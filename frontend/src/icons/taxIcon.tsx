import React from 'react';

interface TaxIconProps {
  className?: string;
}

const TaxIcon: React.FC<TaxIconProps> = ({ className = "w-5 h-5" }) => {
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
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
};

export default TaxIcon;