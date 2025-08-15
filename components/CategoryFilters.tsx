import React, { useMemo } from 'react';
import { useDataContext, usePOSContext } from '../contexts/AppContext';

const COLORS = [
  'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600', 
  'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600',
  'bg-orange-600',
];

const CategoryFilters: React.FC = () => {
  const { categoriesWithCounts } = useDataContext();
  const { activeCategory, onSelectCategory } = usePOSContext();

  const allCategories = useMemo(() => [
      { id: 'all', name: 'All', itemCount: (categoriesWithCounts || []).reduce((sum, c) => sum + c.itemCount, 0) }, 
      ...(categoriesWithCounts || [])
  ], [categoriesWithCounts]);

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    (categoriesWithCounts || []).forEach((cat, index) => {
      map.set(cat.id, COLORS[index % COLORS.length]);
    });
    return map;
  }, [categoriesWithCounts]);

  return (
    <nav className="flex-shrink-0">
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_95%,rgba(0,0,0,0))]">
        {allCategories.map((category) => {
          if (category.itemCount === 0 && category.id !== 'all') return null;
          
          const isActive = activeCategory === category.id;
          const colorClass = categoryColorMap.get(category.id);

          if (category.id === 'all') {
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-2 py-3 px-5 rounded-full transition-all duration-200 whitespace-nowrap text-sm font-semibold ${
                  isActive
                    ? 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-offset-background ring-primary'
                    : 'bg-secondary text-secondary-foreground hover:brightness-95'
                }`}
              >
                <span>{category.name}</span>
              </button>
            )
          }

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-2 py-3 px-5 rounded-full transition-all duration-200 whitespace-nowrap text-sm font-semibold ${
                isActive
                  ? `border-2 border-b-4 border-white ${colorClass} text-white shadow-lg`
                  : `${colorClass} text-white opacity-90 hover:opacity-100 hover:brightness-95`
              }`}
            >
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryFilters;
