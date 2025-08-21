
import React, { useMemo } from 'react';
import { useDataContext, usePOSContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface CategoryTabsProps {
  categories?: Array<{ id: string; name: string; itemCount: number; }>;
  activeCategory?: string;
  onSelectCategory?: (id: string) => void;
}

const COLORS = [
  'bg-red-500', 'bg-blue-600', 'bg-green-500', 'bg-yellow-500', 
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
  'bg-orange-500',
];

const CategoryTabs: React.FC<CategoryTabsProps> = (props) => {
  const contextData = useDataContext();
  const posContext = usePOSContext();
  const { settings } = useAppContext();
  const t = useTranslations(settings.language.staff);

  // Use props if available, otherwise fall back to context
  const activeCategory = props.activeCategory ?? posContext.activeCategory;
  const onSelectCategory = props.onSelectCategory ?? posContext.onSelectCategory;

  const allCategories = useMemo(() => {
      if (props.categories) {
          return props.categories;
      }
      const categoriesWithCounts = contextData.categoriesWithCounts || [];
      return [
        { id: 'all', name: t('all'), itemCount: categoriesWithCounts.reduce((sum: number, c: {itemCount: number}) => sum + c.itemCount, 0) }, 
        ...categoriesWithCounts
      ];
  }, [props.categories, contextData.categoriesWithCounts, t]);

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const categoriesForColor = allCategories.filter(c => c.id !== 'all');
    categoriesForColor.forEach((cat, index) => {
      map.set(cat.id, COLORS[index % COLORS.length]);
    });
    return map;
  }, [allCategories]);

  return (
    <nav className="flex-shrink-0">
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const isAllButton = category.id === 'all';
          
          const baseBgColor = isAllButton
            ? 'bg-secondary text-secondary-foreground' 
            : `${categoryColorMap.get(category.id)} text-white`;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`py-2.5 px-4 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap font-semibold hover:brightness-[0.93] active:scale-105 active:shadow-lg focus:outline-none text-sm ${baseBgColor} ${
                isActive ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''
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

export default CategoryTabs;