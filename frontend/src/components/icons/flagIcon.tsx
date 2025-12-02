import React from 'react';

type FlagCode = 'lt' | 'en' | string;

type FlagIconProps = {
  code: FlagCode;
  size?: number;
  className?: string;
};

export const FlagIcon: React.FC<FlagIconProps> = ({
  code,
  size = 20,
  className = '',
}) => {
  const renderFlag = () => {
    switch (code.toLowerCase()) {
      case 'lt':
        return (
          <>
            <rect width="20" height="6.67" fill="#FDB913" />
            <rect y="6.67" width="20" height="6.67" fill="#006A44" />
            <rect y="13.34" width="20" height="6.66" fill="#C1272D" />
          </>
        );

      case 'en':
      case 'gb':
      case 'uk':
      default:
        return (
          <>
            <rect width="20" height="20" fill="#012169" />
            <path d="M0 0L20 20M20 0L0 20" stroke="#FFF" strokeWidth="3" />
            <path d="M0 0L20 20M20 0L0 20" stroke="#C8102E" strokeWidth="2" />
            <path d="M10 0V20M0 10H20" stroke="#FFF" strokeWidth="4" />
            <path d="M10 0V20M0 10H20" stroke="#C8102E" strokeWidth="2.5" />
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={`inline-block shadow-sm ${className}`}
      aria-hidden="true"
    >
      {renderFlag()}
    </svg>
  );
};
