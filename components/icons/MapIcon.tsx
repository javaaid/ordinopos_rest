import React from 'react';

const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-11.492l-9.5 3.393m9.5-3.393a11.95 11.95 0 01-9.5 3.393m9.5-3.393l.5 2.256m-10-5.649l-1.586 5.649m1.586-5.649L3 9.75l.5 2.256m.5-2.256L5.25 12l.5 2.256M5.25 12l-1.586 5.649m1.586-5.649l9.5 3.393" />
  </svg>
);

export default MapIcon;
