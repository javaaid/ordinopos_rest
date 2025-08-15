import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023 1.093-2.117 1.6-3.221m3.024 4.043c.228-1.057.322-2.148.322-3.272M6.12 20.25a9.03 9.03 0 015.36-1.634m7.662-3.243a9.03 9.03 0 01-5.36 1.634m0-3.243l.353.353m-3.536-3.535l.353.353m-1.061-1.061l.353.353m3.536 3.535l.353.353M12 6.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export default UsersIcon;