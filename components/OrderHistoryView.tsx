import React, { useState, useMemo, Fragment } from 'react';
import { Order, Employee, Role, OrderStatus, Table, OrderType } from '../types';
import SearchIcon from './icons/SearchIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import ReceiptRefundIcon from './icons/ReceiptRefundIcon';
import PrinterIcon from './icons/PrinterIcon';
import MapPinIcon from './icons/MapPinIcon';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import ChevronDownIcon from './icons/ChevronDownIcon';

const statusStyles: Record<OrderStatus, { text: string, bg: string, text_color: string }> = {
    'pending': { text: 'Pending Payment', bg: 'bg-yellow-500/20', text_color: 'text-yellow-400' },
    'completed': { text: 'Completed', bg: 'bg-sky-500/20', text_color: 'text-sky-400' },
    'partially-paid': { text: 'Partially Paid', bg: 'bg-amber-500/20', text_color: 'text-amber-400' },
    'out-for-delivery': { text: 'Out for Delivery', bg: 'bg-blue-500/20', text_color: 'text-blue-400' },
    'delivered': { text: 'Delivered', bg: 'bg-green-500/20', text_color: 'text-green-400' },
    'refund-pending': { text: 'Refund Pending', bg: 'bg-orange-500/20', text_color: 'text-orange-400' },
    'refunded': { text: 'Refunded', bg: 'bg-red-500/20', text_color: 'text-red-400' },
    'kitchen': { text: 'In Kitchen', bg: 'bg-orange-500/20', text_color: 'text-orange-400' },
    'served': { text: 'Served', bg: 'bg-purple-500/20', text_color: 'text-purple-400' },
    'process': { text: 'Processing', bg: 'bg-yellow-500/20', text_color: 'text-yellow-400' },
};

const typeColors: Record<OrderType, string> = {
    'dine-in': 'border-blue-500',
    'takeaway': 'border-purple-500',
    'delivery': 'border-amber-500',
    'kiosk': 'border-indigo-500',
    'tab': 'border-teal-500',
};

const OrderHistoryView: React.FC = () => {
    const { 
        settings, setView, tables, orders, roles, currentEmployee,
        onLoadOrder, onPrintA4, onInitiateRefund, onViewReceipt, onApproveRefund, onDenyRefund
    } = useAppContext();

    const t = useTranslations(settings.language.staff);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState(new Date());
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const sortedOrders = useMemo(() => {
        return [...(orders || [])].sort((a, b) => b.createdAt - a.createdAt);
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const dateFiltered = sortedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startOfDay && orderDate <= endOfDay;
        });

        if (!searchQuery.trim()) return dateFiltered;

        const lowerQuery = searchQuery.toLowerCase();
        return dateFiltered.filter(order =>
            order.orderNumber.includes(lowerQuery) ||
            order.customer?.name.toLowerCase().includes(lowerQuery)
        );
    }, [sortedOrders, searchQuery, filterDate]);

    const handleViewOnFloor = (tableId: string) => {
        const table = (tables || []).find((t: Table) => t.id === tableId);
        if (table) {
            setView('tables');
        }
    };

    const currentRole = useMemo(() => {
        if (!currentEmployee) return null;
        return (roles || []).find((r: Role) => r.id === currentEmployee.roleId);
    }, [currentEmployee, roles]);
    
    const renderActions = (order: Order) => {
        if (!currentRole) return null;

        const canRequestRefund = order.status === 'completed' || order.status === 'delivered';
        const canApproveRefund = currentRole.permissions.canApproveRefunds;
        const isPartiallyPaid = order.status === 'partially-paid';
        
        return (
            <div className="flex items-center justify-end gap-2">
                <button onClick={() => onViewReceipt(order)} className="text-muted-foreground hover:text-foreground p-1" title="Print Receipt">
                    <PrinterIcon className="w-5 h-5" />
                </button>
                {order.orderType === 'dine-in' && order.tableId && (
                    <button onClick={() => handleViewOnFloor(order.tableId!)} className="text-muted-foreground hover:text-foreground p-1" title="View on Floor Plan">
                        <MapPinIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={() => onPrintA4(order)} className="text-muted-foreground hover:text-foreground p-1" title="Download PDF Invoice">
                    <DocumentArrowDownIcon className="w-5 h-5" />
                </button>
                {isPartiallyPaid && (
                    <button
                        onClick={() => onLoadOrder(order)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-1 px-3 rounded-md transition-colors"
                    >
                        <CurrencyDollarIcon className="w-4 h-4"/>
                        Make Payment
                    </button>
                )}
                 {canRequestRefund && (
                    <button
                        onClick={() => onInitiateRefund(order)}
                        className="text-yellow-400 hover:text-foreground p-1"
                        title="Refund Items"
                    >
                        <ReceiptRefundIcon className="w-5 h-5" />
                    </button>
                )}
                {order.status === 'refund-pending' && canApproveRefund && (
                    <div className="flex gap-2">
                        <button onClick={() => onApproveRefund(order.id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-1 px-3 rounded-md">Approve</button>
                        <button onClick={() => onDenyRefund(order.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-1 px-3 rounded-md">Deny</button>
                    </div>
                )}
            </div>
        )
    }
    
    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('order_history')}</h1>
            <p className="text-muted-foreground mb-6">Search and manage past orders, including partially paid tabs and refund requests.</p>
            
            <div className="mb-4 flex gap-4">
                <div className="relative flex-grow max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search by Order # or Customer Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-0 bg-secondary py-2.5 pl-10 pr-4 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                </div>
                 <div>
                    <input
                        type="date"
                        value={filterDate.toISOString().split('T')[0]}
                        onChange={e => {
                            const date = new Date(e.target.value);
                            const timezoneOffset = date.getTimezoneOffset() * 60000;
                            setFilterDate(new Date(date.getTime() + timezoneOffset));
                        }}
                        className="block w-full rounded-md border-0 bg-secondary py-2.5 px-4 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="flex-grow bg-card rounded-lg overflow-hidden flex flex-col border border-border">
                <div className="overflow-y-auto">
                    <table className="min-w-full divide-y divide-border">
                         <thead className="bg-muted/50 sticky top-0">
                            <tr>
                                <th className={thClass} style={{ width: '40px' }}></th>
                                <th className={thClass}>{t('order_hash')}</th>
                                <th className={thClass}>{t('customers')}</th>
                                <th className={thClass}>Type</th>
                                <th className={thClass}>Table</th>
                                <th className={thClass}>{t('date_time')}</th>
                                <th className={thClass}>{t('balance_due')}</th>
                                <th className={thClass}>Total</th>
                                <th className={thClass}>{t('status')}</th>
                                <th className={`${thClass} text-right`}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                           {filteredOrders.map(order => {
                               const statusStyle = statusStyles[order.status];
                               const table = order.tableId ? (tables || []).find((t: Table) => t.id === order.tableId) : null;
                               const orderTypeLabel = order.orderType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

                               return (
                                   <Fragment key={order.id}>
                                       <tr className={`hover:bg-muted/50 border-l-4 ${typeColors[order.orderType] || 'border-transparent'}`}>
                                           <td className="px-2 py-3 text-center">
                                               {order.payments.length > 0 && (
                                                   <button onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)} className="p-1 rounded-full hover:bg-secondary">
                                                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                                   </button>
                                               )}
                                           </td>
                                           <td className="px-4 py-3 font-mono text-foreground">#{order.orderNumber}</td>
                                           <td className="px-4 py-3 text-muted-foreground">{order.customer?.name || t('walk_in_customer')}</td>
                                           <td className="px-4 py-3 text-muted-foreground">{orderTypeLabel}</td>
                                           <td className="px-4 py-3 text-muted-foreground">{table ? table.name : 'N/A'}</td>
                                           <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</td>
                                           <td className={`px-4 py-3 font-semibold ${order.balanceDue > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>${order.balanceDue.toFixed(2)}</td>
                                           <td className="px-4 py-3 font-semibold text-foreground">${order.total.toFixed(2)}</td>
                                           <td className="px-4 py-3">
                                               <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text_color}`}>
                                                   {statusStyle.text}
                                               </span>
                                           </td>
                                           <td className="px-4 py-3">
                                               {renderActions(order)}
                                           </td>
                                       </tr>
                                       {expandedOrderId === order.id && (
                                           <tr className="bg-accent">
                                               <td colSpan={10} className="p-4">
                                                    <h4 className="font-bold text-foreground mb-2">Payment Transactions</h4>
                                                    {order.payments.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {order.payments.map((p, i) => (
                                                                <div key={i} className="flex justify-between items-center bg-background p-2 rounded-md text-sm">
                                                                    <div>
                                                                        <span className="font-semibold text-foreground">{p.method}</span>
                                                                        <span className="text-muted-foreground ml-4">{new Date(p.timestamp).toLocaleString()}</span>
                                                                    </div>
                                                                    <span className="font-mono font-semibold text-green-500">${p.amount.toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No payment transactions for this order.</p>
                                                    )}
                                               </td>
                                           </tr>
                                       )}
                                   </Fragment>
                               );
                           })}
                        </tbody>
                    </table>
                     {filteredOrders.length === 0 && (
                        <div className="text-center text-muted-foreground py-20">
                            <p>No orders found for the selected date.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default OrderHistoryView;