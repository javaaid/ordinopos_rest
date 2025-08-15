
import React from 'react';
import { AppPlugin } from '../types';
import RocketLaunchIcon from './icons/RocketLaunchIcon';

interface GoProModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: () => void;
    license: AppPlugin;
}

const GoProModal: React.FC<GoProModalProps> = ({ isOpen, onClose, onPurchase, license }) => {
    if (!isOpen) return null;

    const daysRemaining = license.trialStartDate 
        ? Math.max(0, 30 - (Date.now() - license.trialStartDate) / (1000 * 60 * 60 * 24)).toFixed(0)
        : 30;

    const renderStatus = () => {
        if (license.status === 'trial') {
            return (
                <div className="bg-primary/20 text-primary text-center p-3 rounded-lg">
                    <p className="font-bold">You have {daysRemaining} days left in your Pro trial.</p>
                </div>
            );
        }
        if (license.status === 'expired') {
            return (
                <div className="bg-destructive/20 text-destructive text-center p-3 rounded-lg">
                    <p className="font-bold">Your Pro trial has expired.</p>
                    <p className="text-sm">Upgrade now to restore access to Pro features.</p>
                </div>
            );
        }
        return null; // Pro status doesn't need a banner here
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
                <div className="p-6 text-center border-b border-border">
                    <RocketLaunchIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-foreground">Unlock OrinOpos Pro</h2>
                    <p className="text-muted-foreground mt-2">Supercharge your business with powerful, professional-grade tools.</p>
                </div>
                <div className="p-6">
                    {renderStatus()}
                    <h3 className="text-lg font-semibold text-foreground mt-6 mb-4">Pro Features Include:</h3>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-primary">✓</span>
                            <div>
                                <strong className="text-foreground">Purchase Orders (POs):</strong> Create, send, and track orders with your suppliers to streamline inventory management.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-primary">✓</span>
                            <div>
                                <strong className="text-foreground">Client Invoicing:</strong> Bill corporate or regular clients directly to their account instead of immediate payment.
                            </div>
                        </li>
                         <li className="flex items-start gap-3">
                            <span className="font-bold text-primary">✓</span>
                            <div>
                                <strong className="text-foreground">Automatic Late Fees:</strong> Encourage timely payments by automatically applying late fees to overdue client invoices.
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="p-6 border-t border-border flex flex-col items-center gap-4">
                    <button
                        onClick={onPurchase}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Upgrade Now - $49/mo (Simulated)
                    </button>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoProModal;