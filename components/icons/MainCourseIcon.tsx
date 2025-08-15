import React from 'react';

// Using a more generic "RectangleStackIcon" from Heroicons for Main Course
const MainCourseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 15.25l5.571-3m-11.142 0L12 6.75l5.571 3M3.255 12h17.49" />
  </svg>
);

export default MainCourseIcon;
