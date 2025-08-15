import React from 'react';

const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l-1.026-5.592a1.125 1.125 0 00-1.093-.822H7.5m0 0l-.372 1.486M7.5 14.25L5.106 5.165A1.125 1.125 0 004.02 4.11H2.25M16.5 21a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

export default ShoppingCartIcon;
