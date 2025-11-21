import type { SVGProps } from 'react';

export default function OrderGroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17h6m-6-4h6m-6-4h6M5 3h14v18H5z"
      />
    </svg>
  );
}
