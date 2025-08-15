import React from 'react';

const CoffeeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 0h10.5c.621 0 1.125-.504 1.125-1.125v-7.5c0-.621-.504-1.125-1.125-1.125h-10.5c-.621 0-1.125.504-1.125 1.125v7.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

export default CoffeeIcon;
