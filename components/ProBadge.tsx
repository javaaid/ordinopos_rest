import React from 'react';
import StarIcon from './icons/StarIcon';

const ProBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
    <span className={`bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 ${className}`}>
        <StarIcon className="w-3 h-3"/>
        PRO
    </span>
);

export default ProBadge;