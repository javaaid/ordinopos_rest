import React from 'react';

const CloudArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-2.25 2.25M12 9.75l2.25 2.25m-1.5-6.75l.6-1.536c.126-.33.44-.564.793-.564h.6c.353 0 .667.234.793.564l.6 1.536M12 16.5h2.25m-4.5 0H7.5m9-6.75h2.25c.621 0 1.125.504 1.125 1.125v7.5c0 .621-.504 1.125-1.125 1.125h-15c-.621 0-1.125-.504-1.125-1.125v-7.5c0-.621.504-1.125 1.125-1.125h2.25" />
  </svg>
);

export default CloudArrowUpIcon;
