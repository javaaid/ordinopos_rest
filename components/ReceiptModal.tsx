





import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Order, Location, CartItem, AppSettings, ReceiptSettings, Language, Employee, Printer, PrintJob } from '../types';
import PrinterIcon from './icons/PrinterIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import DevicePhoneMobileIcon from './icons/DevicePhoneMobileIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { getPriceForItem } from '../utils/calculations';
import { Button } from './ui/Button';
import TemplateRenderer from './receipt-templates/TemplateRenderer';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    location: Location;
    onSendDigitalReceipt: (type: 'email' | 'sms', destination: string) => void;
    settings: AppSettings;
    isSaudiCompliancePluginActive: boolean;
    receiptSettings: ReceiptSettings;
    onPrintA4: (order: Order) => void;
    language: Language;
    showPrintInvoiceButton?: boolean;
}

const ReceiptModal: React.FC<ReceiptModalProps> = (props) => {
    const { isOpen, onClose, order, onSendDigitalReceipt, onPrintA4, showPrintInvoiceButton = false } = props;
    const { handleFullRefund } = useDataContext();
    const { addPrintJobs } = useAppContext();
    const [email, setEmail] = useState('');
    const [sms, setSms] = useState('');

    const receiptBody = <TemplateRenderer format="thermal" {...props} />;

    useEffect(() => {
        if(order.customer) {
            setEmail(order.customer.email || '');
            setSms(order.customer.phone || '');
        }
    }, [order, isOpen]);

    const handlePrint = () => {
        const newJob: Omit<PrintJob, 'id' | 'timestamp' | 'status'> = {
            component: 'TemplateRenderer',
            props: { ...props, format: 'thermal' }
        };
        addPrintJobs([newJob]);
        onClose();
    };

    if (!isOpen) return null;
    
    const handleSendEmail = () => { if (email.trim()) { onSendDigitalReceipt('email', email.trim()); } }
    const handleSendSms = () => { if (sms.trim()) { onSendDigitalReceipt('sms', sms.trim()); } }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[5000] p-4 no-print">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-sm flex flex-col border border-border">
                <div className="p-4 flex-grow overflow-y-auto flex justify-center">
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-foreground text-center mb-4">Receipt Preview</h3>
                        <div className="w-[302px] h-96 overflow-y-scroll bg-gray-200 border-4 border-gray-300 rounded-sm">
                           {receiptBody}
                        </div>
                    </div>
                </div>

                 <div className="p-4 border-t border-border space-y-3">
                    <div className="flex gap-2">
                         <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-input p-2 rounded-md text-sm border border-border" />
                        <button onClick={handleSendEmail} className="p-2 bg-secondary rounded-md text-foreground"><EnvelopeIcon className="w-5 h-5"/></button>
                    </div>
                     <div className="flex gap-2">
                         <input type="tel" placeholder="Phone Number (SMS)" value={sms} onChange={e => setSms(e.target.value)} className="w-full bg-input p-2 rounded-md text-sm border border-border" />
                         <button onClick={handleSendSms} className="p-2 bg-secondary rounded-md text-foreground"><DevicePhoneMobileIcon className="w-5 h-5"/></button>
                    </div>
                </div>

                <div className="p-4 border-t border-border flex justify-between gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <div className="flex gap-2">
                        {showPrintInvoiceButton && (
                            <Button variant="outline" onClick={() => { onPrintA4(order); onClose(); }}>
                                <DocumentTextIcon className="w-5 h-5 mr-2"/> A4 Invoice
                            </Button>
                        )}
                        <Button onClick={handlePrint} className="flex items-center gap-2"><PrinterIcon className="w-5 h-5"/> Print Receipt</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;