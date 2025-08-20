import React from 'react';
import { Button } from './ui/Button';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import PrinterIcon from './icons/PrinterIcon';
import { useToastContext } from '../contexts/AppContext';

interface ExportButtonsProps {
  onCsvExport?: (filename?: string) => void;
  onPrint?: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onCsvExport, onPrint }) => {
  const { addToast } = useToastContext();

  const handleExcelExport = () => {
    if (onCsvExport) {
        // This is a common trick: export as CSV but with an .xls extension.
        // Excel will open it and usually handle the formatting automatically.
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
      if(onPrint) {
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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onCsvExport && (
        <Button type="button" onClick={() => onCsvExport()} variant="outline" size="sm" className="flex items-center gap-1.5">
          <ArrowDownTrayIcon className="w-4 h-4" /> CSV
        </Button>
      )}
      <Button type="button" onClick={handleExcelExport} variant="outline" size="sm" className="flex items-center gap-1.5">
        <ArrowDownTrayIcon className="w-4 h-4" /> Excel
      </Button>
      <Button type="button" onClick={handlePdfExport} variant="outline" size="sm" className="flex items-center gap-1.5">
        <ArrowDownTrayIcon className="w-4 h-4" /> PDF
      </Button>
      {onPrint && (
         <Button type="button" onClick={onPrint} variant="outline" size="sm" className="flex items-center gap-1.5">
          <PrinterIcon className="w-4 h-4" /> Print
        </Button>
      )}
    </div>
  );
};

export default ExportButtons;