import React from 'react';

const ReceiptPercentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v12.75M15 21H9a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 019 3h6a2.25 2.25 0 012.25 2.25v3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5zm-2.625 2.625a.375.375 0 10-.53.53l2.625 2.625a.375.375 0 00.53 0l-1.5-1.5a.375.375 0 10-.53-.53zM18 18.375a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

export default ReceiptPercentIcon;
