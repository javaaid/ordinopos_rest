
import React from 'react';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex w-full items-center gap-1 rounded-lg bg-secondary p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`w-full rounded-md py-2.5 text-sm font-semibold transition-all
            ${value === option.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
