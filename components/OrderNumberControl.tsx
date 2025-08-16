
import React from 'react';
import { Button } from './ui/Button';
import { useAppContext } from '../contexts/AppContext';
import XCircleIcon from './icons/XCircleIcon';
import { useTranslations } from '../hooks/useTranslations';

const OrderNumberControl: React.FC = () => {
    const { calledOrderNumber, cycleCalledOrderNumber, clearCalledOrderNumber, settings } = useAppContext();
    const t = useTranslations(settings.language.staff);

    return (
        <div className="bg-secondary h-9 px-2 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-secondary-foreground">{t('now_serving')}:</p>
                <p className="font-bold text-lg text-primary font-mono bg-background px-3 py-1 rounded-md">
                    {calledOrderNumber || '----'}
                </p>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-secondary-foreground" onClick={() => cycleCalledOrderNumber('prev')}>Prev</Button>
                <Button variant="ghost" size="sm" className="h-7 text-secondary-foreground" onClick={() => cycleCalledOrderNumber('next')}>Next</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={clearCalledOrderNumber}>
                    <XCircleIcon className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default OrderNumberControl;