
import React from 'react';
import { AIResponse, Language } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import { useTranslations } from '../hooks/useTranslations';

interface AISuggestionsProps {
  suggestions: AIResponse | null;
  isLoading: boolean;
  onSelectSuggestion: (itemName: string) => void;
  language: Language;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions, isLoading, onSelectSuggestion, language }) => {
  const t = useTranslations(language);

  if (isLoading) {
    return (
      <div className="p-4 bg-secondary rounded-lg">
        <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-3">
          <SparklesIcon className="w-5 h-5" />
          {t('thinking_suggestions')}
        </h4>
        <div className="space-y-2 animate-pulse">
            <div className="h-10 bg-muted rounded-md"></div>
            <div className="h-10 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
      <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-3">
        <SparklesIcon className="w-5 h-5" />
        {t('ai_suggestions')}
      </h4>
      <div className="space-y-2">
        {suggestions.suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion.itemName)}
            className="w-full text-left p-2 bg-secondary hover:bg-muted rounded-md transition-colors"
          >
            <p className="font-semibold text-foreground">{t('add')}: {suggestion.itemName}</p>
            <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;