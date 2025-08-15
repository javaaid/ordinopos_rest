import React from 'react';

const PizzaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25c.368 0 .723.013 1.072.038a7.5 7.5 0 00-2.144 0c.349-.025.704-.038 1.072-.038zM12 11.25a.375.375 0 01.375.375v4.875c0 .207.168.375.375.375h4.875a.375.375 0 01.375.375v.375a.375.375 0 01-.375.375h-4.875a.375.375 0 01-.375-.375v-4.875a.375.375 0 01.375-.375z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default PizzaIcon;
