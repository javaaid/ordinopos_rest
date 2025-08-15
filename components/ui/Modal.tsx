import React from 'react';
import XMarkIcon from '../icons/XMarkIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-card text-card-foreground rounded-xl shadow-md w-full flex flex-col max-h-[90vh] animate-fade-in-up border border-border ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 z-10">
           <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent">
               <XMarkIcon className="w-6 h-6"/>
           </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 border-b border-border ${className}`}>{children}</div>
);

const ModalTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-bold text-foreground">{children}</h2>
);

const ModalDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 overflow-y-auto flex-grow ${className}`}>{children}</div>
);

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-4 border-t border-border bg-accent/50 rounded-b-xl flex justify-end items-center gap-2 ${className}`}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter };