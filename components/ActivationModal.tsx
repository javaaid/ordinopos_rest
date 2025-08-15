
import React, { useState } from 'react';
import { AppPlugin } from '../types';

interface ActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActivate: (pluginId: AppPlugin['id'], code: string) => void;
    pluginToActivate: AppPlugin | null;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose, onActivate, pluginToActivate }) => {
    const [code, setCode] = useState('');

    if (!isOpen || !pluginToActivate) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onActivate(pluginToActivate.id, code);
    };

    return (
        <div className="fixed inset-0 bg-background/70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">Activate Plugin</h2>
                        <p className="text-muted-foreground">Enter code for: {pluginToActivate.name}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="activation-code" className="block text-sm font-medium text-muted-foreground mb-1">Activation Code</label>
                            <input
                                type="text"
                                id="activation-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full bg-input p-2 rounded-md border border-border font-mono tracking-widest text-foreground"
                                required
                            />
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Activate</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivationModal;
