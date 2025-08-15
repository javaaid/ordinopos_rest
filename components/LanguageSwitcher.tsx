
import React from 'react';
import { Language } from '../types';
import FlagUSAIcon from './icons/FlagUSAIcon';
import FlagESIcon from './icons/FlagESIcon';
import FlagSAIcon from './icons/FlagSAIcon';

interface LanguageSwitcherProps {
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onLanguageChange }) => {
    
    const buttonClass = (lang: Language) => 
        `p-2 rounded-full transition-all duration-200 transform ${
            currentLanguage === lang ? 'bg-primary/20 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
        }`;

    return (
        <div className="bg-popover/80 backdrop-blur-sm p-2 rounded-full flex gap-2 border border-border">
            <button onClick={() => onLanguageChange('en')} className={buttonClass('en')} aria-label="Switch to English">
                <FlagUSAIcon className="w-8 h-8 rounded-full" />
            </button>
            <button onClick={() => onLanguageChange('es')} className={buttonClass('es')} aria-label="Switch to Spanish">
                 <FlagESIcon className="w-8 h-8 rounded-full" />
            </button>
            <button onClick={() => onLanguageChange('ar')} className={buttonClass('ar')} aria-label="Switch to Arabic">
                 <FlagSAIcon className="w-8 h-8 rounded-full" />
            </button>
        </div>
    );
};

export default LanguageSwitcher;
