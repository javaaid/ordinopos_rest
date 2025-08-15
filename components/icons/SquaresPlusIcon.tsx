import React from 'react';

const SquaresPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.5h-6v-6h6v6zm0-10.5h-6v6h6v-6zm7.5 10.5h-6v-6h6v6zm-7.5-10.5h6v6h-6v-6z" />
  </svg>
);

export default SquaresPlusIcon;
