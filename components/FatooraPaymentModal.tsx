
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import MadaIcon from './icons/MadaIcon';
import ApplePayIcon from './icons/ApplePayIcon';
import BanknotesIcon from './icons/BanknotesIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface FatooraPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderTotal: number;
    onPaymentSuccess: () => void;
}

type PaymentStatus = 'pending' | 'checking' | 'success';

const FatooraPaymentModal: React.FC<FatooraPaymentModalProps> = ({ isOpen, onClose, orderTotal, onPaymentSuccess }) => {
    const [status, setStatus] = useState<PaymentStatus>('pending');
    const paymentLink = `https://fatoora.sa/pay/${Math.random().toString(36).substring(2, 10)}`;

    const handleCheckStatus = () => {
        setStatus('checking');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                onPaymentSuccess();
            }, 1000);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <div className="p-6 border-b border-border text-center">
                    <h2 className="text-2xl font-bold text-foreground">Fatoora Payment</h2>
                    <p className="text-5xl font-mono font-bold text-green-500 mt-2">${orderTotal.toFixed(2)}</p>
                </div>
                {status === 'success' ? (
                    <div className="p-8 text-center">
                        <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-foreground">Payment Successful</h3>
                        <p className="text-muted-foreground">Finalizing your order...</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        <p className="text-center text-muted-foreground">Scan the QR code or use the link to pay.</p>
                        <div className="bg-white p-4 rounded-lg flex justify-center">
                            <QRCode value={paymentLink} size={200} level="L" />
                        </div>
                        <p className="text-center text-xs text-muted-foreground/50 font-mono break-all">{paymentLink}</p>
                        <div className="flex justify-center items-center gap-4">
                            <MadaIcon />
                            <ApplePayIcon />
                            <div className="bg-muted p-2 rounded-md"><BanknotesIcon className="w-12 h-8 text-foreground"/></div>
                        </div>
                        <button
                            onClick={handleCheckStatus}
                            disabled={status === 'checking'}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:cursor-wait"
                        >
                            {status === 'checking' ? 'Checking...' : 'Check Payment Status'}
                        </button>
                    </div>
                )}
                <div className="p-4 border-t border-border">
                    <button onClick={onClose} className="w-full py-2 rounded-md text-muted-foreground font-semibold hover:bg-muted">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default FatooraPaymentModal;