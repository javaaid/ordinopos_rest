import React from 'react';

const SignalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h.008v.008H3.75V9.75zM8.25 6h.008v.008H8.25V6zM12.75 3h.008v.008h-.008V3zm4.5 3h.008v.008h-.008V6zm3.75 3.75h.008v.008h-.008v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 0116.5 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15a3.75 3.75 0 017.5 0" />
  </svg>
);

export default SignalIcon;