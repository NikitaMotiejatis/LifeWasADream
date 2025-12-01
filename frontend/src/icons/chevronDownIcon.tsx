import type { SVGProps } from 'react';

export default function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
