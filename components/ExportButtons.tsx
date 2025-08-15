import React from 'react';
import { Button } from './ui/Button';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import PrinterIcon from './icons/PrinterIcon';
import { useToastContext } from '../contexts/AppContext';

interface ExportButtonsProps {
  onCsvExport?: () => void;
  onPrint?: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onCsvExport, onPrint }) => {
  const { addToast } = useToastContext();

  const handleSimulatedExport = (format: string) => {
    addToast({
      type: 'info',
      title: 'Feature Not Available',
      message: `${format} export is a simulated feature for this demo.`,
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onCsvExport && (
        <Button onClick={onCsvExport} variant="outline" size="sm" className="flex items-center gap-1.5">
          <ArrowDownTrayIcon className="w-4 h-4" /> CSV
        </Button>
      )}
      <Button type="button" onClick={() => handleSimulatedExport('Excel')} variant="outline" size="sm" className="flex items-center gap-1.5">
        <ArrowDownTrayIcon className="w-4 h-4" /> Excel
      </Button>
      <Button type="button" onClick={() => handleSimulatedExport('PDF')} variant="outline" size="sm" className="flex items-center gap-1.5">
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
