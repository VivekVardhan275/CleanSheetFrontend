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
    <rect width="24" height="24" rx="6" className="fill-primary" />
    <path
      d="M10 13L17 6"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 9L18 13L10 21L6 17L14 9Z"
      fill="hsl(var(--accent))"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7"
      cy="8"
      r="1"
      fill="hsl(var(--primary-foreground))"
      fillOpacity="0.6"
    />
    <circle
      cx="9"
      cy="6"
      r="0.5"
      fill="hsl(var(--primary-foreground))"
      fillOpacity="0.6"
    />
    <circle
      cx="6"
      cy="11"
      r="0.5"
      fill="hsl(var(--primary-foreground))"
      fillOpacity="0.6"
    />
  </svg>
);
