import React from 'react';

const FlagSAIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" {...props}>
    <path fill="#165c41" d="M0 6h72v60H0z"/>
    <g fill="#fff" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M13.5 32.5h45v3h-45z"/>
      <path d="M16 38.5c1.23-1.04 6.13-2.58 13-3 6.88-.42 12 1.39 12 1.39s.44-4.83-2-7c-2.44-2.17-8.44-1.11-12-1-3.56.11-10.44 1.17-13 3 .67 1.25 1.78 3.06 2 3.61z"/>
      <path d="M57 30.5c-2.83 1.05-7.33 2.5-12 2s-8-1-11-2c-3-1-4-2-4-2s-1 4 2 5c3 1 8 2 11 2s8.17-.95 12-2c3.83-1.05 4-4 4-4z"/>
    </g>
  </svg>
);

export default FlagSAIcon;