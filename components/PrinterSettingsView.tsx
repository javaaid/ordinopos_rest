


import React, { useState, useEffect, useMemo } from 'react';
import { Printer, PrinterReceiptSettings, Order, Location, PrinterConnectionType } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import PingButton from './PingButton';
import { DEFAULT_RECEIPT_SETTINGS } from '../constants';
import { useDataContext } from '../contexts/AppContext';

const DUMMY_ORDER: Partial<Order> = {
    invoiceNumber: "A-00001", orderNumber: "001", createdAt: new Date().getTime(),
    cart: [
        { cartId: '1', menuItem: { id: 9, name: 'Classic Cheeseburger', price: 15.99 } as any, quantity: 1, selectedModifiers: [] },
        { cartId: '2', menuItem: { id: 28, name: 'Coca-Cola', price: 3.50 } as any, quantity: 2, selectedModifiers: [] },
    ],
    subtotal: 22.99, tax: 2.30, total: 25.29, payments: [{ method: 'Cash', amount: 30.00, timestamp: Date.now() }]
};
const DUMMY_LOCATION: Partial<Location> = { name: "Your Company", currency: '$' };

const ReceiptPreview: React.FC<{ settings: PrinterReceiptSettings, paperWidth: number }> = ({ settings, paperWidth }) => {
    const { currency } = DUMMY_LOCATION;
    const line = '-'.repeat(paperWidth === 48 ? 32 : 42);
    const textStyle: React.CSSProperties = { fontSize: `${settings.fontSize * 0.6}rem`, lineHeight: 1.5 };
    
    return (
        <div style={textStyle} className="p-2 bg-white text-black font-mono w-full h-full">
            <div className="text-center mb-1">
                {settings.logoUrl && <img src={settings.logoUrl} alt="Header Logo" className="mx-auto h-12 w-auto mb-2" />}
                {settings.headerLines.map((line, i) => line && <p key={i}>{line}</p>)}
            </div>
            <p className="whitespace-pre-wrap">{line}</p>
            <div className="my-1">{DUMMY_ORDER.cart?.map((item, index) => <p key={index}>{item.quantity}x {item.menuItem.name}</p>)}</div>
            <p className="whitespace-pre-wrap">{line}</p>
            <div className="flex justify-between font-bold"><span>TOTAL:</span><span>{currency}{DUMMY_ORDER.total?.toFixed(2)}</span></div>
            <div className="text-center mt-1">
                {settings.footerLines.map((line, i) => line && <p key={i}>{line}</p>)}
                {settings.footerLogoUrl && <img src={settings.footerLogoUrl} alt="Footer Logo" className="mx-auto h-8 w-auto mt-2" />}
            </div>
        </div>
    );
};

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <label className="flex items-center justify-between p-2 rounded-md bg-background cursor-pointer border border-border">
        <span className="text-sm font-medium text-secondary-foreground">{label}</span>
        <button type="button" onClick={onToggle} className={`relative inline-flex items-center h-5 w-9 transition-colors rounded-full ${enabled ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}/>
        </button>
    </label>
);

interface PrinterSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (printer: Printer) => void;
    printer: Printer | null;
}

const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({ isOpen, onClose, onSave, printer }) => {
    const [activeTab, setActiveTab] = useState<'connection' | 'layout'>('connection');
    const [formData, setFormData] = useState<Partial<Printer>>({});

    useEffect(() => {
        if (printer) {
            setFormData({
                ...printer,
                receiptSettings: { ...DEFAULT_RECEIPT_SETTINGS, ...printer.receiptSettings },
            });
        } else {
            setFormData({
                name: 'New Printer', type: 'thermal', connection: 'PDF Printer', status: 'connected',
                paperWidth: 80, hasDrawer: true, isEnabled: true,
                receiptSettings: DEFAULT_RECEIPT_SETTINGS,
            });
        }
    }, [printer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNum = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNum ? parseInt(value) : value }));
    };

    const handleLayoutChange = (updates: Partial<PrinterReceiptSettings>) => {
        setFormData(prev => ({ ...prev, receiptSettings: { ...(prev.receiptSettings || DEFAULT_RECEIPT_SETTINGS), ...updates } }));
    };

    const handleToggle = (key: keyof PrinterReceiptSettings) => {
        setFormData(prev => ({...prev, receiptSettings: { ...prev.receiptSettings, [key]: !prev.receiptSettings![key] } as PrinterReceiptSettings }));
    };

    const handleLineChange = (type: 'headerLines' | 'footerLines', index: number, value: string) => {
        const currentLines = formData.receiptSettings![type] || [];
        const newLines = [...currentLines];
        newLines[index] = value;
        handleLayoutChange({ [type]: newLines });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Printer);
    };

    const renderConnectionTab = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Printer Name</label>
                <Input name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Connection Type</label>
                <Select name="connection" value={formData.connection || ''} onChange={handleChange}>
                    {/* FIX: Use 'Print Server' to match the type definition. */}
                    <option value="Print Server">Print Server</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="USB">USB</option>
                    <option value="PDF Printer">PDF Printer</option>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">IP Address</label>
                <Input name="ipAddress" value={formData.ipAddress || ''} onChange={handleChange} placeholder="192.168.1.100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Paper Width</label>
                <Select name="paperWidth" value={formData.paperWidth || 80} onChange={handleChange}>
                    <option value={48}>48mm</option><option value={58}>58mm</option><option value={80}>80mm</option>
                </Select>
            </div>
        </div>
    );
    
    const renderLayoutTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Font Size</label>
                    <Input type="number" step="0.1" value={formData.receiptSettings?.fontSize} onChange={e => handleLayoutChange({ fontSize: parseFloat(e.target.value) || 1 })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Copies</label>
                    <Input type="number" value={formData.receiptSettings?.copies} onChange={e => handleLayoutChange({ copies: parseInt(e.target.value) || 1 })} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {Object.keys(DEFAULT_RECEIPT_SETTINGS).filter(k => k.startsWith('show')).map(key => (
                   <Toggle key={key} label={key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()} enabled={!!formData.receiptSettings![key as keyof PrinterReceiptSettings]} onToggle={() => handleToggle(key as keyof PrinterReceiptSettings)} />
                ))}
            </div>
            <div>
                <label className="text-sm font-medium text-muted-foreground">Logo URL</label>
                <Input value={formData.receiptSettings?.logoUrl || ''} onChange={e => handleLayoutChange({ logoUrl: e.target.value })} />
            </div>
            <div>
                <label className="text-sm font-medium text-muted-foreground">Header Lines</label>
                <div className="space-y-1 mt-1">
                    {[...Array(6)].map((_, i) => <Input key={i} value={formData.receiptSettings?.headerLines[i] || ''} onChange={e => handleLineChange('headerLines', i, e.target.value)} />)}
                </div>
            </div>
             <div>
                <label className="text-sm font-medium text-muted-foreground">Footer Lines</label>
                <div className="space-y-1 mt-1">
                    {[...Array(6)].map((_, i) => <Input key={i} value={formData.receiptSettings?.footerLines[i] || ''} onChange={e => handleLineChange('footerLines', i, e.target.value)} />)}
                </div>
            </div>
             <div>
                <label className="text-sm font-medium text-muted-foreground">Footer Logo URL</label>
                <Input value={formData.receiptSettings?.footerLogoUrl || ''} onChange={e => handleLayoutChange({ footerLogoUrl: e.target.value })} />
            </div>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader><ModalTitle>{printer ? 'Edit Printer' : 'Add New Printer'}</ModalTitle></ModalHeader>
                <ModalContent>
                    <div className="flex gap-6">
                        <div className="w-3/5">
                            <div className="flex border-b border-border mb-4">
                                <button type="button" onClick={() => setActiveTab('connection')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'connection' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Connection</button>
                                <button type="button" onClick={() => setActiveTab('layout')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'layout' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Receipt Layout</button>
                            </div>
                            <div className="max-h-96 overflow-y-auto pr-2">
                                {activeTab === 'connection' ? renderConnectionTab() : renderLayoutTab()}
                            </div>
                        </div>
                        <div className="w-2/5 bg-gray-700 p-2 rounded-lg">
                            <h4 className="text-sm font-bold text-center text-white mb-2">Live Preview</h4>
                            <div className="w-[302px] mx-auto overflow-y-auto h-96">
                                <ReceiptPreview settings={formData.receiptSettings || DEFAULT_RECEIPT_SETTINGS} paperWidth={formData.paperWidth || 80} />
                            </div>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Save Printer</Button></ModalFooter>
            </form>
        </Modal>
    );
};

export default PrinterSettingsModal;