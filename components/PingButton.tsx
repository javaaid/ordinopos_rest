
import React, { useState } from 'react';
import { Button } from './ui/Button';
import CheckIcon from './icons/CheckIcon';
import XMarkIcon from './icons/XMarkIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface PingButtonProps {
  ipAddress?: string;
  port?: number;
}

const PingButton: React.FC<PingButtonProps> = ({ ipAddress, port }) => {
    const [status, setStatus] = useState<'idle' | 'pinging' | 'success' | 'failure'>('idle');

    const handlePing = () => {
        if (!ipAddress) {
            setStatus('failure');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        setStatus('pinging');

        // Simulate network delay and success
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    const getButtonContent = () => {
        switch (status) {
            case 'pinging':
                return 'Pinging...';
            case 'success':
                return <><CheckIcon className="w-4 h-4 mr-2"/> Reachable</>;
            case 'failure':
                return <><XMarkIcon className="w-4 h-4 mr-2"/> Unreachable</>;
            case 'idle':
            default:
                return 'Check Reachability';
        }
    };
    
    const getVariant = () => {
        switch (status) {
            case 'success': return 'default'; // will be styled green below
            case 'failure': return 'destructive';
            default: return 'outline';
        }
    };
    
    return (
        <div className="flex flex-col items-center w-full">
            <Button 
                type="button" 
                variant={getVariant()} 
                onClick={handlePing} 
                disabled={status !== 'idle'}
                className={`w-full transition-all ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
                {getButtonContent()}
            </Button>
        </div>
    );
};

export default PingButton;
