
import React from 'react';

const FlagESIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" {...props}>
    <path fill="#d22f27" d="M0 6h72v18H0z" />
    <path fill="#d22f27" d="M0 48h72v18H0z" />
    <path fill="#f1b31c" d="M0 24h72v24H0z" />
    <g fill="none" stroke="#d22f27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M19.5 32.5a4.5 4.5 0 100-9 4.5 4.5 0 100 9zM19.5 45.5a4.5 4.5 0 100-9 4.5 4.5 0 100 9zM28.5 39V27M15 39V27" />
    </g>
    <path fill="#d22f27" stroke="#d22f27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 36h3v-3h-3z" />
  </svg>
);

export default FlagESIcon;
