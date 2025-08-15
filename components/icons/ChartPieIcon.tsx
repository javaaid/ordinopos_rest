
import React from 'react';

const ChartPieIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15h8.25a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H10.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3 3 0 00-3-3V15h3V6z" />
  </svg>
);

export default ChartPieIcon;