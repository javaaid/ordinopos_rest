import React from 'react';

const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.042.502.092.752.152v5.456a2.25 2.25 0 00.659 1.591L14 14.5M9.75 3.104a6.375 6.375 0 014.292 1.586M14.25 9.75L12 12m2.25-2.25L12 9.75M5 14.5h14a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25H5a2.25 2.25 0 01-2.25-2.25v-2.25A2.25 2.25 0 015 14.5z" />
  </svg>
);

export default BeakerIcon;