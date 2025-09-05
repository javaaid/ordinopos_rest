


import React from 'react';
import { Button } from './ui/Button';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import PrinterIcon from './icons/PrinterIcon';
import { useToastContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface ExportButtonsProps {
  onCsvExport?: (filename?: string) => void;
  onPrint?: () => void;
}

// FIX: Changed to a named export to resolve module resolution errors.
export const ExportButtons: React.FC<ExportButtonsProps> = ({ onCsvExport, onPrint }) => {
  const { addToast } = useToastContext();
  const { settings } = useAppContext();
  const t = useTranslations(settings.language.staff);

  const handleExcelExport = () => {
    if (onCsvExport) {
        onCsvExport('export.xls');
    } else {
        addToast({
            type: 'info',
            title: 'Feature Not Available',
            message: `Excel export is not configured for this view.`,
        });
    }
  };
  
  const handlePdfExport = () => {
      if (onPrint) {
          addToast({type: 'info', title: 'Printing to PDF', message: 'Use your browser\'s print dialog to "Save as PDF".'});
          onPrint();
      } else {
           addToast({
            type: 'info',
            title: 'Feature Not Available',
            message: `PDF export is not configured for this view.`,
        });
      }
  };
  
  const handleCsvClick = () => {
    if (onCsvExport) {
      onCsvExport();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onCsvExport && (
        <Button type="button" onClick={handleCsvClick} variant="outline" size="sm" className="flex items-center gap-1.5">
          <ArrowDownTrayIcon className="w-4 h-4" /> {t('csv')}
        </Button>
      )}
      <Button type="button" onClick={handleExcelExport} variant="outline" size="sm" className="flex items-center gap-1.5">
        <ArrowDownTrayIcon className="w-4 h-4" /> {t('excel')}
      </Button>
      <Button type="button" onClick={handlePdfExport} variant="outline" size="sm" className="flex items-center gap-1.5">
        <ArrowDownTrayIcon className="w-4 h-4" /> {t('pdf')}
      </Button>
      {onPrint && (
        <Button type="button" onClick={onPrint} variant="outline" size="sm" className="flex items-center gap-1.5">
          <PrinterIcon className="w-4 h-4" /> {t('print')}
        </Button>
      )}
    </div>
  );
};