import type { SVGProps } from 'react';

export default function ErrorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M12 8v4m0 4h.01"
      />
    </svg>
  );
}
