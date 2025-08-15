

import React, { useState, useMemo, useEffect } from 'react';
import { Order, MenuItem, Employee, Location, Category, Customer, Supplier, WastageEntry, Role, AppSettings, Ingredient, RecipeItem, PaymentType, AISettings } from '../types';
import SalesDashboard from './SalesDashboard';
import MenuReport from './MenuReport';
import StaffSalesReport from './StaffSalesReport';
import CategoryReport from './CategoryReport';
import InventoryReport from './InventoryReport';
import LaborReport from './LaborReport';
import CustomerReport from './CustomerReport';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import DateRangePicker from './DateRangePicker';
import FinancialsReport from './FinancialsReport';
import DiscountReport from './DiscountReport';
import DeliveryReport from './DeliveryReport';
import RetentionReport from './RetentionReport';
import PrinterIcon from './icons/PrinterIcon';
import ExecutiveSummaryReport from './ExecutiveSummaryReport';
import KioskReport from './KioskReport';
import CFDReport from './CFDReport';
import BIView from './BIView';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import { Select } from './ui/Select';
import { useDataContext, useAppContext, useModalContext } from '../contexts/AppContext';

type ReportGroup = 'sales' | 'people' | 'operations' | 'bi';
type ReportTab = 'summary' | 'sales' | 'menu' | 'categories' | 'inventory' | 'staff_performance' | 'labor' | 'customer' | 'financials' | 'discounts' | 'delivery' | 'retention' | 'kiosk' | 'cfd' | 'bi_dashboard';

const reportGroups: Record<ReportGroup, { name: string, tabs: ReportTab[] }> = {
    sales: { name: 'Sales & Financials', tabs: ['summary', 'sales', 'menu', 'categories', 'financials', 'discounts', 'delivery'] },
    people: { name: 'People & Customers', tabs: ['staff_performance', 'labor', 'customer', 'retention'] },
    operations: { name: 'Operations', tabs: ['inventory', 'kiosk', 'cfd'] },
    bi: { name: 'BI & Analytics', tabs: ['bi_dashboard'] },
};

const reportTitles: Record<ReportTab, string> = {
    summary: 'Executive Summary',
    sales: 'Sales Dashboard',
    menu: 'Menu Performance Analysis',
    categories: 'Category Performance Analysis',
    financials: 'Financials Report (Z-Report)',
    discounts: 'Discount & Promotion Report',
    delivery: 'Delivery & Online Order Report',
    staff_performance: 'Staff Performance Report',
    labor: 'Labor & Attendance Report',
    customer: 'Customer Spending Habits',
    retention: 'Customer Retention Report',
    inventory: 'Inventory Report',
    kiosk: 'Kiosk Performance Report',
    cfd: 'CFD Performance Report',
    bi_dashboard: 'Business Intelligence',
};

const ReportsView: React.FC = () => {
    const {
        orders, menuItems, ingredients, recipes, employees, locations, 
        categories, customers, suppliers, wastageLog, roles,
        lastAccountingSync, paymentTypes: allPaymentTypes,
        handleSyncAccounting, handleLogWaste, handleUpdateStock
    } = useDataContext();
    const { currentLocationId, currentEmployee, settings } = useAppContext();
    const { openModal, closeModal } = useModalContext();

    // Guard against settings not being loaded
    if (!settings) {
        return null; 
    }
    
    const [startDate, setStartDate] = useState<Date>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [endDate, setEndDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    });

    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
    const [filterCategoryId, setFilterCategoryId] = useState<string>('');
    
    const availableGroups = useMemo((): Partial<Record<ReportGroup, { name: string; tabs: ReportTab[]; }>> => {
        if (!currentEmployee) return {};
        const role = roles.find(r => r.id === currentEmployee.roleId);
        if (!role) return {};
        const p = role.permissions;

        if (p.canViewAllReports) {
            return reportGroups; // Admin, Manager get all
        }

        const accessibleGroups: Partial<Record<ReportGroup, { name: string; tabs: ReportTab[]; }>> = {};
        if (p.canViewInventoryReport) {
            accessibleGroups.operations = { name: 'Operations', tabs: ['inventory'] };
        }
        
        return accessibleGroups;
    }, [currentEmployee, roles]);
    
    const [activeGroup, setActiveGroup] = useState<ReportGroup>('sales');
    const [activeTab, setActiveTab] = useState<ReportTab>('summary');

    useEffect(() => {
        const availableGroupKeys = Object.keys(availableGroups) as ReportGroup[];
        if (availableGroupKeys.length === 0) return;

        let currentValidGroup = activeGroup;
        if (!availableGroupKeys.includes(currentValidGroup)) {
            currentValidGroup = availableGroupKeys[0];
        }

        const availableTabs = availableGroups[currentValidGroup]?.tabs || [];
        let currentValidTab = activeTab;
        if (!availableTabs.includes(currentValidTab)) {
            currentValidTab = availableTabs.length > 0 ? availableTabs[0] : 'summary';
        }

        if (activeGroup !== currentValidGroup || activeTab !== currentValidTab) {
            setActiveGroup(currentValidGroup);
            setActiveTab(currentValidTab);
        }
    }, [availableGroups, activeGroup, activeTab]);

    const currentGroupData = availableGroups[activeGroup];
    const isStateReadyForRender = currentGroupData && currentGroupData.tabs && currentGroupData.tabs.includes(activeTab);

    if (Object.keys(availableGroups).length > 0 && !isStateReadyForRender) {
        return null;
    }

    const handleDateChange = (start: Date, end: Date) => {
        setStartDate(start);
        setEndDate(end);
    };
    
    const handleGroupSelect = (group: ReportGroup) => {
        setActiveGroup(group);
    };

    const realOrders = useMemo(() => (orders || []).filter(o => !o.isTraining), [orders]);
    
    const filteredOrders = useMemo(() => {
        return realOrders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            const isDateMatch = orderDate >= startDate && orderDate <= endOfDay;
            const isEmployeeMatch = !filterEmployeeId || o.employeeId === filterEmployeeId;
            return isDateMatch && isEmployeeMatch;
        });
    }, [realOrders, startDate, endDate, filterEmployeeId]);

    const handleExportCSV = () => {
        const headers = ["OrderID", "Date", "Time", "Location", "Employee", "Customer", "Subtotal", "DiscountName", "DiscountAmount", "Tax", "Total", "Type", "Source", "PaymentMethod", "ItemCount"];
        const rows = filteredOrders.map(order => [order.id.slice(-6), new Date(order.createdAt).toLocaleDateString(), new Date(order.createdAt).toLocaleTimeString(), locations.find(l => l.id === order.locationId)?.name || 'N/A', employees.find(e => e.id === order.employeeId)?.name.replace(/\s\(.*\)/, '') || 'N/A', order.customer?.name || 'Walk-in', order.subtotal.toFixed(2), order.appliedDiscount?.name || '', (order.appliedDiscount?.amount || 0).toFixed(2), order.tax.toFixed(2), order.total.toFixed(2), order.orderType, order.source, order.payments.map(p => p.method).join('/'), order.cart.reduce((sum, item) => sum + item.quantity, 0)].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `ordino_pos_sales_${currentLocationId}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const onRequestLogWaste = () => openModal('logWaste', { ingredients, onLogWaste: (data: any) => { handleLogWaste(data); closeModal(); } });
    const onRequestStockCount = () => openModal('stockCount', { ingredients, onUpdateStock: handleUpdateStock });
    
    const renderContent = () => {
        switch(activeTab) {
            case 'summary': return <ExecutiveSummaryReport orders={filteredOrders} menuItems={menuItems} employees={employees} startDate={startDate} endDate={endDate} aiSettings={settings.ai} />;
            case 'sales': return <SalesDashboard orders={filteredOrders} startDate={startDate} endDate={endDate} locations={locations} currentLocationId={currentLocationId} recipes={recipes} ingredients={ingredients} allPaymentTypes={allPaymentTypes} />;
            case 'menu': return <MenuReport orders={filteredOrders} menuItems={menuItems} ingredients={ingredients} recipes={recipes} filterCategoryId={filterCategoryId} locations={locations} currentLocationId={currentLocationId} aiSettings={settings.ai} />;
            case 'categories': return <CategoryReport orders={filteredOrders} categories={categories} filterCategoryId={filterCategoryId} ingredients={ingredients} recipes={recipes} />;
            case 'inventory': return <InventoryReport ingredients={ingredients} orders={filteredOrders} recipes={recipes} suppliers={suppliers} wastageLog={wastageLog} onRequestLogWaste={onRequestLogWaste} onRequestStockCount={onRequestStockCount} startDate={startDate} endDate={endDate} />;
            case 'staff_performance': return <StaffSalesReport orders={filteredOrders} employees={employees} locations={locations} currentLocationId={currentLocationId} aiSettings={settings.ai} />;
            case 'labor': return <LaborReport employees={(employees || []).filter(e => !filterEmployeeId || e.id === filterEmployeeId)} />;
            case 'customer': return <CustomerReport orders={filteredOrders} customers={customers} locations={locations} currentLocationId={currentLocationId} />;
            case 'financials': return <FinancialsReport orders={filteredOrders} settings={settings} lastQuickBooksSync={lastAccountingSync} onSyncToQuickBooks={handleSyncAccounting} allPaymentTypes={allPaymentTypes} />;
            case 'discounts': return <DiscountReport orders={filteredOrders} />;
            case 'delivery': return <DeliveryReport orders={filteredOrders} />;
            case 'retention': return <RetentionReport ordersInDateRange={filteredOrders} allOrders={realOrders} startDate={startDate} />;
            case 'kiosk': return <KioskReport orders={filteredOrders} />;
            case 'cfd': return <CFDReport orders={filteredOrders} />;
            case 'bi_dashboard': return <BIView />;
        }
    };
    
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Reports</h1>
                    <p className="text-muted-foreground">{reportTitles[activeTab]}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => {}} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm py-2 px-3 rounded-lg hover:bg-secondary">
                        <PrinterIcon className="w-5 h-5" />
                        Print
                    </button>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm py-2 px-3 rounded-lg hover:bg-secondary">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export
                    </button>
                    <button onClick={() => {}} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm py-2 px-3 rounded-lg hover:bg-secondary">
                        <DocumentDuplicateIcon className="w-5 h-5" />
                        Copy
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden">
                <aside className="w-full md:w-56 bg-card rounded-xl p-3 shrink-0 border border-border">
                    <nav className="space-y-4">
                         {Object.entries(availableGroups).map(([key, group]) => (
                            <div key={key}>
                                <h3 className="px-3 text-sm font-semibold text-foreground mb-2">{group.name}</h3>
                                {group.tabs.map(tabId => (
                                    <button
                                        key={tabId}
                                        onClick={() => setActiveTab(tabId)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            activeTab === tabId
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                    >
                                        {reportTitles[tabId]}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </nav>
                </aside>
                <main className="flex-grow bg-card rounded-xl p-6 overflow-y-auto border border-border">
                     {(activeTab === 'menu' || activeTab === 'categories') && (
                        <div className="mb-4 max-w-sm">
                            <Select value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value)}>
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                    )}
                    {(activeTab === 'staff_performance' || activeTab === 'labor') && (
                        <div className="mb-4 max-w-sm">
                            <Select value={filterEmployeeId} onChange={e => setFilterEmployeeId(e.target.value)}>
                                <option value="">All Employees</option>
                                {(employees || []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </Select>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
export default ReportsView;
