
import React, { useState, useEffect } from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface SessionTimeoutWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    onStayLoggedIn: () => void;
}

const SessionTimeoutWarningModal: React.FC<SessionTimeoutWarningModalProps> = ({ isOpen, onClose, onLogout, onStayLoggedIn }) => {
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (isOpen) {
            setCountdown(60); // Reset countdown when modal opens
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen, onLogout]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md text-center p-8 border-2 border-primary/50">
                <ExclamationTriangleIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground">Session Timeout Warning</h2>
                <p className="text-muted-foreground mt-2 mb-4">
                    You will be logged out due to inactivity in...
                </p>
                <p className="text-6xl font-mono font-bold text-primary mb-6">
                    {countdown}
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                    Please click the button below to stay logged in.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={onLogout} 
                        className="px-6 py-3 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted transition-colors"
                    >
                        Log Out Now
                    </button>
                    <button 
                        onClick={onStayLoggedIn}
                        className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        I'm Still Here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutWarningModal;
