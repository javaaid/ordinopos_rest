import React from 'react';

const VegIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="10" y="10" width="80" height="80" stroke="#4CAF50" strokeWidth="10" fill="none" />
    <circle cx="50" cy="50" r="15" fill="#4CAF50" />
  </svg>
);

export default VegIcon;
