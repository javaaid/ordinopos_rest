import React, { useState } from 'react';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';

interface BackupRestoreProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ onSuccess, onError }) => {
  const { settings } = useAppContext();
  const t = useTranslations(settings.language.staff);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    // Simulate an async backup operation
    setTimeout(() => {
      // In a real app, this would involve serializing state to a file.
      // For simulation, we'll just succeed.
      onSuccess('Data backed up successfully. (Simulated)');
      setIsBackingUp(false);
    }, 1500);
  };

  const handleRestore = () => {
    if (window.confirm('Are you sure you want to restore data? This will overwrite your current settings and data. This action cannot be undone.')) {
      setIsRestoring(true);
      // Simulate an async restore operation
      setTimeout(() => {
        // In a real app, you would read from a file and update the entire app state.
        // This is a dangerous operation, so we just simulate success.
        onSuccess('Data restored successfully. The application will now reload. (Simulated)');
        setIsRestoring(false);
        // Simulate a reload to apply changes
        setTimeout(() => window.location.reload(), 1500);
      }, 1500);
    }
  };

  return (
    <div className="bg-secondary p-4 rounded-lg mt-4 text-start rtl:text-end">
      <p className="font-bold text-foreground mb-1">{t('backup_title')}</p>
      <p className="text-muted-foreground text-sm mb-4">
        {t('backup_desc')}
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleBackup}
          disabled={isBackingUp || isRestoring}
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-muted disabled:cursor-wait"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {isBackingUp ? t('backup_backingUp') : t('backup_backup_button')}
        </button>
        <button
          onClick={handleRestore}
          disabled={isBackingUp || isRestoring}
          className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-muted-foreground font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          {isRestoring ? t('backup_restoring') : t('backup_restore_button')}
        </button>
      </div>
    </div>
  );
};

export default BackupRestore;
