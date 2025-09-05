import React from 'react';
import QRCode from 'react-qr-code';
import { Table } from '../types';
import PrinterIcon from './icons/PrinterIcon';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: Table;
    baseUrl?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, table, baseUrl }) => {
    if (!isOpen) return null;

    const qrValue = baseUrl 
        ? `${baseUrl}?table=${table.id}&location=${table.locationId}`
        : `${window.location.origin}/#/qr_ordering?table=${table.id}&location=${table.locationId}`;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code - ${table.name}</title>
                        <style>
                            body { font-family: sans-serif; text-align: center; margin-top: 50px; }
                            h1 { font-size: 24px; }
                            p { font-size: 14px; color: #555; }
                        </style>
                    </head>
                    <body>
                        <h1>${table.name}</h1>
                        <p>Scan to Order & Pay</p>
                        <div id="qr-code-print"></div>
                    </body>
                </html>
            `);

            const qrCodeContainer = printWindow.document.getElementById('qr-code-print');
            if (qrCodeContainer) {
                // This is a trick to render the React QR code component into the new window
                const qrCodeSvg = document.getElementById('qr-code-svg')?.outerHTML;
                if(qrCodeSvg) {
                   qrCodeContainer.innerHTML = qrCodeSvg;
                }
            }

            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { // Timeout needed for images to load in some browsers
                 printWindow.print();
                 printWindow.close();
            }, 250);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 no-print">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-sm flex flex-col border border-border">
                <div className="p-6 border-b border-border text-center">
                    <h2 className="text-2xl font-bold text-foreground">QR Code for ${table.name}</h2>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg">
                        <QRCode id="qr-code-svg" value={qrValue} size={256} level="L" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Scan this code with a mobile device to view the menu and order directly to this table.
                    </p>
                </div>
                <div className="p-4 border-t border-border flex gap-4">
                    <button onClick={onClose} className="w-full py-2 rounded-md bg-secondary hover:bg-muted text-secondary-foreground font-semibold">Close</button>
                    <button onClick={handlePrint} className="w-full py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2">
                        <PrinterIcon className="w-5 h-5" /> Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;