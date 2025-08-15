import React from 'react';
import { ToastNotification } from '../types';
import Toast from './Toast';
import { useAppContext } from '../contexts/AppContext';

interface ToastContainerProps {
  notifications: ToastNotification[];
  onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onDismiss }) => {
  const { settings } = useAppContext();
  const { position, theme, duration } = settings.notificationSettings;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed z-[9999] w-full max-w-sm space-y-3 ${positionClasses[position]}`}>
      {notifications.map(notification => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onDismiss={onDismiss} 
          duration={duration * 1000}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default ToastContainer;