
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Customer, Subscription, Order } from '../types';
import MegaphoneIcon from './icons/MegaphoneIcon';
import TrashIcon from './icons/TrashIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import { useModalContext, useDataContext, useToastContext, useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
// FIX: Changed to a named import to resolve "Module has no default export" error.
import { ExportButtons } from './ExportButtons';
import { exportToCsv } from '../lib/utils';
import { useTranslations } from '../hooks/useTranslations';

const CustomersView: React.FC = () => {
    const { openModal, closeModal } = useModalContext();
    const { customers, subscriptions, orders, menuItems, handleSaveCustomer, handleDeleteCustomer, handleSaveSubscription, settings } = useDataContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([250, 150, 150, 250, 150, 120, 120]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const onAddCustomer = () => openModal('customerEdit', { onSave: (customer: Customer, isNew: boolean) => { handleSaveCustomer(customer, isNew); closeModal(); } });
    const onEditCustomer = (customer: Customer) => openModal('customerEdit', { customer, onSave: (customer: Customer, isNew: boolean) => { handleSaveCustomer(customer, isNew); closeModal(); } });
    const onAddSubscription = (customer: Customer) => openModal('subscription', { customer, menuItems, onSave: handleSaveSubscription });

    const handleSelectCustomer = (customerId: string) => {
        setSelectedCustomers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(customerId)) {
                newSet.delete(customerId);
            } else {
                newSet.add(customerId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCustomers(new Set((customers || []).map((c: Customer) => c.id)));
        } else {
            setSelectedCustomers(new Set());
        }
    };
    
    const handlePromotionClick = () => {
        openModal('promotion', {
            recipientCount: selectedCustomers.size,
            onSend: (message: string) => {
                console.log(`Sending promo: "${message}" to ${selectedCustomers.size} customers.`);
                addToast({
                    type: 'success',
                    title: 'Promotion Sent',
                    message: `Your message has been sent to ${selectedCustomers.size} customer(s).`
                });
                closeModal();
                setSelectedCustomers(new Set());
            }
        });
    };

     const handleCsvExport = (filename: string = 'customers.csv') => {
        const headers = ["ID", "Name", "Phone", "Email", "Address", "LoyaltyPoints", "MembershipID"];
        const rows = (customers || []).map((c: Customer) => [c.id, c.name, c.phone, c.email, c.address, c.loyaltyPoints || 0, c.membershipId || '']);
        exportToCsv(headers, rows, filename);
        addToast({ type: 'success', title: 'Export Successful', message: `Exported ${rows.length} customers.` });
    };

    const handlePrint = () => window.print();
    
    const onMouseMove = useCallback((e: MouseEvent) => {
        if (resizingColumnIndex.current === null) return;
        const dx = e.clientX - startX.current;
        const newWidth = startWidths.current[resizingColumnIndex.current] + dx;
        setColumnWidths(prevWidths => {
            const newWidths = [...prevWidths];
            newWidths[resizingColumnIndex.current!] = Math.max(100, newWidth);
            return newWidths;
        });
    }, []);

    const onMouseUp = useCallback(() => {
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        resizingColumnIndex.current = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }, [onMouseMove]);

    const onMouseDown = useCallback((index: number, e: React.MouseEvent) => {
        e.preventDefault();
        resizingColumnIndex.current = index;
        startX.current = e.clientX;
        startWidths.current = columnWidths;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [columnWidths, onMouseMove, onMouseUp]);
    
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    const thClass = "p-3 text-start rtl:text-end text-xs font-semibold text-muted-foreground uppercase";
    
    return (
        <div className={cn("p-6 h-full flex flex-col", isFullScreen && "fixed inset-0 z-50 bg-card")}>
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-3xl font-bold text-foreground rtl:text-right">{t('customers')}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={onAddCustomer} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors">
                        <UserPlusIcon className="w-5 h-5"/>
                        {t('addCustomer')}
                    </button>
                    <button onClick={() => setIsFullScreen(fs => !fs)} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                        {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <div className="bg-card rounded-lg flex-grow overflow-hidden flex flex-col border border-border">
                {/* Header with search and actions */}
                <div className="flex justify-between items-center p-4 no-print">
                    <div className="flex items-center gap-2">
                         <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    </div>
                    <div>
                        <button disabled={selectedCustomers.size === 0} onClick={handlePromotionClick} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm disabled:bg-muted disabled:cursor-not-allowed">
                            <MegaphoneIcon className="w-5 h-5" />
                            {t('sendPromo')} ({selectedCustomers.size})
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div ref={tableContainerRef} className="overflow-auto flex-grow printable-area">
                    <table className="min-w-full divide-y divide-border" style={{ tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: `50px` }} />
                            {columnWidths.map((width, i) => <col key={i} style={{ width: `${width}px` }} />)}
                        </colgroup>
                        <thead className="bg-card sticky top-0 z-10 border-b border-border">
                            <tr className="no-print">
                                <th className="p-3 w-10">
                                    <input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                </th>
                                <th className={`${thClass} relative`}>{t('name')} <div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                                <th className={`${thClass} relative`}>{t('phone')} <div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                                <th className={`${thClass} relative`}>{t('membershipId')} <div onMouseDown={e => onMouseDown(2, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                                <th className={`${thClass} relative`}>{t('email')} <div onMouseDown={e => onMouseDown(3, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                                <th className={`${thClass} relative`}>{t('totalSpent')} <div onMouseDown={e => onMouseDown(4, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                                <th className={`${thClass} relative`}>{t('loyaltyPoints')} <div onMouseDown={e => onMouseDown(5, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                                <th className={`${thClass} text-end`}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {(customers || []).map((customer: Customer) => {
                                const customerOrders = (orders || []).filter((o: Order) => o.customer?.id === customer.id);
                                const totalSpent = customerOrders.reduce((sum: number, o: Order) => sum + o.total, 0);
                                return (
                                    <tr key={customer.id} className="hover:bg-muted/50">
                                        <td className="p-3 no-print">
                                            <input type="checkbox" checked={selectedCustomers.has(customer.id)} onChange={() => handleSelectCustomer(customer.id)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                        </td>
                                        <td className="p-3 font-medium text-foreground truncate">{customer.name}</td>
                                        <td className="p-3 text-muted-foreground truncate">{customer.phone}</td>
                                        <td className="p-3 text-muted-foreground truncate font-mono">{customer.membershipId}</td>
                                        <td className="p-3 text-muted-foreground truncate">{customer.email}</td>
                                        <td className="p-3 text-green-500 font-semibold truncate">${totalSpent.toFixed(2)}</td>
                                        <td className="p-3 text-blue-500 font-semibold truncate">{customer.loyaltyPoints || 0}</td>
                                        <td className="p-3 text-end no-print">
                                            <div className="flex justify-end items-center gap-2">
                                                <button onClick={() => onAddSubscription(customer)} className="text-sm font-semibold text-primary hover:underline">{t('subscribe')}</button>
                                                <button onClick={() => onEditCustomer(customer)} className="p-1 text-primary hover:opacity-80"><PencilSquareIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteCustomer(customer.id)} className="p-1 text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomersView;