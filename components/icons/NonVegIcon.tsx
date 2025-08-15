import React from 'react';

const NonVegIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="10" y="10" width="80" height="80" stroke="#d22f27" strokeWidth="10" fill="none" />
    <circle cx="50" cy="50" r="15" fill="#d22f27" />
  </svg>
);

export default NonVegIcon;
