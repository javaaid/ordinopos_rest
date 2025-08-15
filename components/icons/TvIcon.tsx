import React from 'react';

const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m-3.75-3.75H1.5V9h1.5m18 0h-1.5v5.25h1.5M12 4.5v3.75m-3.75-3.75H1.5V15h1.5m18 0h-1.5v-5.25h1.5m-15-3.75H12a2.25 2.25 0 012.25 2.25v.75m-4.5 0A2.25 2.25 0 0012 15h.75M12 4.5v3.75m3.75-3.75H22.5V15h-1.5m-18 0h1.5v-5.25H1.5M4.5 4.5H12a2.25 2.25 0 012.25 2.25v.75m-4.5 0A2.25 2.25 0 0012 15h.75" />
  </svg>
);

export default TvIcon;
