

import React, { useState, useEffect } from 'react';
import { ToastNotification } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface ToastProps {
  notification: ToastNotification;
  onDismiss: (id: number) => void;
  duration: number;
  theme: 'dark' | 'transparent';
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
  error: <XCircleIcon className="w-6 h-6 text-red-400" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-400" />,
};

const Toast: React.FC<ToastProps> = ({ notification, onDismiss, duration, theme }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(notification.id), 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss, duration]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };
  
  const animationClasses = exiting 
    ? 'animate-toast-exit' 
    : 'animate-toast-enter';

  const themeClasses = theme === 'dark'
    ? 'bg-card border border-border'
    : 'bg-popover/80 backdrop-blur-sm border border-border';

  return (
    <div
      className={`relative w-full max-w-sm p-3 rounded-lg shadow-2xl flex items-start gap-3 overflow-hidden ${animationClasses} ${themeClasses}`}
    >
      <div className="flex-shrink-0">{icons[notification.type]}</div>
      <div className="flex-grow">
        <p className="font-bold text-popover-foreground">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
      </div>
      <button onClick={handleDismiss} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
        <XCircleIcon className="w-5 h-5" />
      </button>
      <div className="absolute bottom-0 left-0 h-1 bg-muted/50">
         <div className="h-1 bg-primary animate-progress" style={{ animationDuration: `${duration / 1000}s`}}></div>
      </div>
      <style>{`
        @keyframes toast-flip-enter {
          from { 
            transform: perspective(600px) rotateX(-90deg);
            opacity: 0; 
          }
          to { 
            transform: perspective(600px) rotateX(0deg);
            opacity: 1; 
          }
        }
        .animate-toast-enter { 
            animation: toast-flip-enter 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards; 
            transform-origin: top center;
        }
        
        @keyframes toast-flip-exit {
          from { 
            transform: perspective(600px) rotateX(0deg);
            opacity: 1; 
          }
          to { 
            transform: perspective(600px) rotateX(90deg);
            opacity: 0; 
          }
        }
        .animate-toast-exit { 
            animation: toast-flip-exit 0.3s cubic-bezier(0.550, 0.055, 0.675, 0.190) forwards;
            transform-origin: bottom center;
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress { animation: progress linear forwards; }
      `}</style>
    </div>
  );
};

export default Toast;