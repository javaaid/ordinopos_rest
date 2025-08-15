
import React from 'react';
import PuzzlePieceIcon from './icons/PuzzlePieceIcon';

interface QRCodePluginInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QRCodePluginInfoModal: React.FC<QRCodePluginInfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <PuzzlePieceIcon className="w-8 h-8 text-primary" />
                        About: QR Code Contactless Ordering
                    </h2>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <p className="text-muted-foreground">
                        Our modern SaaS QR code ordering system allows customers to scan a table-specific QR code to view a mobile-friendly digital menu, place orders, customize them, and make payments directly from their own devices.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-foreground pt-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                        <li><strong>Contactless Ordering:</strong> Minimize physical contact and enhance safety by allowing customers to order and pay without staff interaction.</li>
                        <li><strong>Real-time Order Transmission:</strong> Orders are sent instantly to the kitchen (KDS) and main POS system, reducing errors and delays.</li>
                        <li><strong>Reduced Wait Times:</strong> Customers can order as soon as they are ready, improving table turnover and overall efficiency.</li>
                        <li><strong>Upselling via Promotions:</strong> Display targeted promotions and popular add-ons directly on the digital menu to increase average order value.</li>
                        <li><strong>Customer Data Collection:</strong> Gather valuable insights into customer preferences and ordering habits for targeted marketing and analytics.</li>
                        <li><strong>Multi-Mode Support:</strong> Flexible system supports dine-in (table-specific), takeaway, and delivery ordering modes.</li>
                        <li><strong>POS Integration:</strong> Seamlessly integrates with your existing POS system for unified order and sales management.</li>
                    </ul>

                     <h3 className="text-lg font-semibold text-foreground pt-2">Similar Platforms</h3>
                     <p className="text-xs text-muted-foreground">This feature provides functionality similar to industry-leading solutions such as:</p>
                     <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-secondary px-2 py-1 rounded">Square Online</span>
                        <span className="bg-secondary px-2 py-1 rounded">Bopple</span>
                        <span className="bg-secondary px-2 py-1 rounded">Jamezz</span>
                        <span className="bg-secondary px-2 py-1 rounded">Otter</span>
                        <span className="bg-secondary px-2 py-1 rounded">Ordú</span>
                        <span className="bg-secondary px-2 py-1 rounded">Storekit</span>
                        <span className="bg-secondary px-2 py-1 rounded">Resmio</span>
                        <span className="bg-secondary px-2 py-1 rounded">MENU TIGER</span>
                        <span className="bg-secondary px-2 py-1 rounded">mypreorder</span>
                        <span className="bg-secondary px-2 py-1 rounded">Instalacarte</span>
                     </div>
                </div>
                <div className="p-4 border-t border-border mt-auto">
                    <button onClick={onClose} className="w-full py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Close</button>
                </div>
            </div>
        </div>
    );
};

export default QRCodePluginInfoModal;
