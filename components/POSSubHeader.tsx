import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import OrderNumberControl from './OrderNumberControl';
import PhoneIcon from './icons/PhoneIcon';
import { Button } from './ui/Button';

const POSSubHeader: React.FC = () => {
    const { 
        isOrderNumberDisplayPluginActive,
        isCallerIdPluginActive,
        handleIncomingCall
    } = useAppContext();

    const showSubHeader = isOrderNumberDisplayPluginActive || isCallerIdPluginActive;

    if (!showSubHeader) {
        return null;
    }

    // Simulate a call from a known and an unknown customer
    const simulateKnownCall = () => handleIncomingCall('555-1234');
    const simulateUnknownCall = () => handleIncomingCall('555-9999');

    return (
        <div className="flex-shrink-0 px-1.5 py-1 flex items-center justify-between gap-4 border-b border-border bg-card">
            <div className="flex items-center gap-4">
                {isOrderNumberDisplayPluginActive && <OrderNumberControl />}
            </div>
            <div className="flex items-center gap-2">
                {isCallerIdPluginActive && (
                    <>
                         <Button onClick={simulateKnownCall} variant="outline" size="sm" className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4" /> Simulate Known Call
                        </Button>
                        <Button onClick={simulateUnknownCall} variant="outline" size="sm" className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4" /> Simulate Unknown Call
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default POSSubHeader;
