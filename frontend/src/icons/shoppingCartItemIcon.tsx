import { SVGProps } from 'react';

interface ShoppingCartIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export const ShoppingCartIcon = ({
  className = 'h-8 w-8 text-gray-400',
  ...props
}: ShoppingCartIconProps) => (
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
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);
