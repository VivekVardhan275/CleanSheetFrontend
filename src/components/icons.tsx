import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2.69C12 2.69 6.49 7.03 6.49 12.33C6.49 16.31 8.92 19.5 12 19.5C15.08 19.5 17.51 16.31 17.51 12.33C17.51 7.03 12 2.69 12 2.69Z"
      className="stroke-primary"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 14V11"
      className="stroke-accent"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V9"
      className="stroke-accent"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 14V12"
      className="stroke-accent"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
