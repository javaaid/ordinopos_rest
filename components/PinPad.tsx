
import React, { useState, useEffect } from 'react';
import XCircleIcon from './icons/XCircleIcon';

interface PinPadProps {
    employeeName: string;
    onClose: () => void;
    onPinSubmit: (pin: string) => void;
    error: string;
}

const PinPad: React.FC<PinPadProps> = ({ employeeName, onClose, onPinSubmit, error }) => {
    const [pin, setPin] = useState('');

    const handleKeyPress = (key: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + key);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPin('');
    };

    useEffect(() => {
        if (pin.length === 6) {
            onPinSubmit(pin);
        }
    }, [pin, onPinSubmit]);

    useEffect(() => {
        if (error) {
            // Clear pin on error after a short delay to show shake animation
            setTimeout(() => setPin(''), 300);
        }
    }, [error]);

    const pinDots = Array(6).fill(0).map((_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < pin.length ? 'bg-primary' : 'bg-muted'}`}></div>
    ));

    const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-sm border border-border">
                <div className="p-6 text-center border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">Enter PIN</h2>
                    <p className="text-muted-foreground">for {employeeName}</p>
                </div>
                <div className="p-6">
                    <div className={`flex justify-center gap-4 mb-4 ${error ? 'animate-shake' : ''}`}>
                        {pinDots}
                    </div>
                    {error && <p className="text-red-400 text-center text-sm mb-4 h-5">{error}</p>}
                    {!error && <div className="h-5 mb-4"></div>}
                    <div className="grid grid-cols-3 gap-4">
                        {keypadButtons.map(key => {
                            let action = () => handleKeyPress(key);
                            if (key === 'Clear') action = handleClear;
                            if (key === '⌫') action = handleBackspace;

                            const isSpecial = key === 'Clear' || key === '⌫';
                            
                            return (
                                <button
                                    key={key}
                                    onClick={action}
                                    className={`py-5 rounded-lg text-2xl font-bold transition-colors ${
                                        isSpecial 
                                        ? 'bg-muted text-muted-foreground hover:bg-accent' 
                                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                                    }`}
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-2 bg-secondary rounded-b-lg">
                    <button onClick={onClose} className="w-full py-2 text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
                </div>
            </div>
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default PinPad;