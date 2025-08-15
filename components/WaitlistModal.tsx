
import React, { useState } from 'react';
import { WaitlistEntry } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<WaitlistEntry, 'id' | 'status' | 'addedAt' | 'locationId'>) => void;
    onSuggestWaitTime: (partySize: number) => Promise<string>;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, onSave, onSuggestWaitTime }) => {
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [partySize, setPartySize] = useState(2);
    const [quotedWaitTime, setQuotedWaitTime] = useState('15');
    const [isSuggesting, setIsSuggesting] = useState(false);

    if (!isOpen) return null;

    const handleSuggest = async () => {
        setIsSuggesting(true);
        const suggestion = await onSuggestWaitTime(partySize);
        // Extract the first number from the suggestion string (e.g., "15-20 minutes" -> "15")
        const suggestedTime = suggestion.match(/\d+/)?.[0] || '15';
        setQuotedWaitTime(suggestedTime);
        setIsSuggesting(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            customerName,
            phone,
            partySize,
            quotedWaitTime: parseInt(quotedWaitTime, 10),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">Add to Waitlist</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Customer Name</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Party Size</label>
                                <input type="number" value={partySize} onChange={e => setPartySize(parseInt(e.target.value))} className="w-full bg-input p-2 rounded-md border border-border text-foreground" min="1" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Quoted Wait Time (minutes)</label>
                            <div className="flex gap-2">
                                <input type="number" value={quotedWaitTime} onChange={e => setQuotedWaitTime(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" min="0" required />
                                <button
                                    type="button"
                                    onClick={handleSuggest}
                                    disabled={isSuggesting}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg disabled:bg-muted"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    {isSuggesting ? '...' : 'AI Suggest'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground">Add Party</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WaitlistModal;