import React, { useState } from 'react';
import { Button } from './ui/Button';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import { cn } from '../lib/utils';
import { getErrorMessage } from '../lib/utils';

interface PingButtonProps {
  ipAddress?: string;
}

const PingButton: React.FC<PingButtonProps> = ({ ipAddress }) => {
    const [status, setStatus] = useState<'idle' | 'pinging' | 'success' | 'failure'>('idle');
    const [message, setMessage] = useState('');

    const handlePing = async () => {
        if (!ipAddress) {
            setStatus('failure');
            setMessage('No URL');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        let fullUrl = ipAddress;
        if (!/^https?:\/\//i.test(ipAddress)) {
            fullUrl = 'http://' + ipAddress;
        }

        setStatus('pinging');
        setMessage('Pinging...');
        
        // Stage 1: Basic connectivity check
        try {
            const healthUrl = new URL('/health', fullUrl).toString();
            const healthResponse = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
            if (!healthResponse.ok) {
                throw new Error(`Health check failed: ${healthResponse.status}`);
            }
        } catch (error: any) {
            setStatus('failure');
            setMessage('Unreachable');
            console.error('PingButton health check failed:', { url: fullUrl, error: getErrorMessage(error) });
            setTimeout(() => setStatus('idle'), 4000);
            return;
        }

        // Stage 2: CORS and print endpoint check
        try {
            setMessage('Testing Print...');
            const printUrl = new URL('/print', fullUrl).toString();
            const printResponse = await fetch(printUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-POS-Test-Request': 'true'
                },
                body: JSON.stringify({ printer: "test-connection", data: "" }),
                signal: AbortSignal.timeout(3000)
            });

            if (!printResponse.ok) {
                 throw new Error(`Server responded with status ${printResponse.status}`);
            }
        } catch (error: any) {
            setStatus('failure');
            const errorMessage = getErrorMessage(error);
            if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
                setMessage('CORS Error');
                console.error('PingButton print check failed:', { url: fullUrl, message: 'CORS or Network Error. Check browser console & server logs.', error: errorMessage });
            } else {
                setMessage(errorMessage || 'Print Failed');
                console.error('PingButton print check failed:', { url: fullUrl, error: errorMessage });
            }
            setTimeout(() => setStatus('idle'), 5000);
            return;
        }

        setStatus('success');
        setMessage('Success');
        setTimeout(() => setStatus('idle'), 3000);
    };
    
    const getButtonContent = () => {
        switch (status) {
            case 'pinging': return <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>{message}</>;
            case 'success': return <><CheckCircleIcon className="w-5 h-5 mr-2"/> {message}</>;
            case 'failure': return <><XCircleIcon className="w-5 h-5 mr-2"/> {message}</>;
            case 'idle':
            default:
                return 'Test';
        }
    };

    const getVariant = () => {
        switch (status) {
            case 'success': return 'default';
            case 'failure': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Button 
            type="button" 
            variant={getVariant()} 
            size="sm"
            onClick={handlePing} 
            disabled={status !== 'idle'}
            className={cn('transition-all min-w-[6rem]', status === 'success' ? 'bg-green-600 hover:bg-green-700' : '')}
        >
            {getButtonContent()}
        </Button>
    );
};

export default PingButton;