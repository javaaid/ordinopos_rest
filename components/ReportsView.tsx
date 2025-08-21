

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
        const role = roles.find((r: Role) => r.id === currentEmployee.roleId);
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

    const filteredOrders = useMemo(() => {
        const start = startDate.getTime();
        const end = endDate.getTime();
        return (orders || []).filter((o: Order) => {
            const createdAt = o.createdAt;
            const inDateRange = createdAt >= start && createdAt <= end;
            const matchesLocation = currentLocationId === 'all_locations' || o.locationId === currentLocationId;
            return inDateRange && matchesLocation;
        });
    }, [orders, startDate, endDate, currentLocationId]);

    const renderActiveReport = () => {
        switch (activeTab) {
            case 'summary': return <ExecutiveSummaryReport orders={filteredOrders} menuItems={menuItems} employees={employees} startDate={startDate} endDate={endDate} aiSettings={settings.ai} />;
            case 'sales': return <SalesDashboard orders={filteredOrders} startDate={startDate} endDate={endDate} locations={locations} currentLocationId={currentLocationId} recipes={recipes} ingredients={ingredients} allPaymentTypes={allPaymentTypes} />;
            case 'menu': return <MenuReport orders={filteredOrders} menuItems={menuItems} ingredients={ingredients} recipes={recipes} filterCategoryId={filterCategoryId} locations={locations} currentLocationId={currentLocationId} aiSettings={settings.ai} />;
            case 'categories': return <CategoryReport orders={filteredOrders} categories={categories} ingredients={ingredients} recipes={recipes} filterCategoryId={filterCategoryId} />;
            case 'financials': return <FinancialsReport orders={filteredOrders} settings={settings} lastQuickBooksSync={lastAccountingSync} onSyncToQuickBooks={handleSyncAccounting} allPaymentTypes={allPaymentTypes} />;
            case 'discounts': return <DiscountReport orders={filteredOrders} />;
            case 'delivery': return <DeliveryReport orders={filteredOrders} />;
            case 'staff_performance': return <StaffSalesReport orders={filteredOrders} employees={employees} locations={locations} currentLocationId={currentLocationId} aiSettings={settings.ai}/>;
            case 'labor': return <LaborReport employees={employees} />;
            case 'customer': return <CustomerReport orders={filteredOrders} customers={customers} locations={locations} currentLocationId={currentLocationId} />;
            case 'retention': return <RetentionReport ordersInDateRange={filteredOrders} allOrders={orders} startDate={startDate} />;
            case 'inventory': return <InventoryReport orders={filteredOrders} ingredients={ingredients} recipes={recipes} suppliers={suppliers} wastageLog={wastageLog} onRequestLogWaste={() => openModal('logWaste', { ingredients, onLogWaste: handleLogWaste })} onRequestStockCount={() => openModal('stockCount', { ingredients, onUpdateStock: handleUpdateStock })} startDate={startDate} endDate={endDate} />;
            case 'kiosk': return <KioskReport orders={filteredOrders} />;
            case 'cfd': return <CFDReport orders={filteredOrders} />;
            case 'bi_dashboard': return <BIView />;
            default: return <div>Select a report</div>;
        }
    };
    
    if (!currentGroupData) return <div>Loading reports or no permissions...</div>;
    
    return (
        <div className="p-6 h-full flex flex-col">
            <header className="flex-shrink-0 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-foreground">Reports</h1>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-bold py-2 px-4 rounded-lg">
                            <DocumentDuplicateIcon className="w-5 h-5"/> Export
                        </button>
                    </div>
                </div>
                <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                 <div className="mt-4 flex gap-x-6 gap-y-2 border-b border-border flex-wrap">
                    {Object.entries(availableGroups).map(([key, groupData]) => (
                         <button key={key} onClick={() => { setActiveGroup(key as ReportGroup); setActiveTab(groupData.tabs[0]); }} className={`py-2 px-1 text-sm font-semibold transition-colors border-b-2 ${activeGroup === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            {groupData.name}
                        </button>
                    ))}
                </div>
            </header>
            
            <div className="flex-grow flex gap-6 overflow-hidden">
                <aside className="w-56 bg-card rounded-xl p-3 shrink-0 flex flex-col border border-border">
                    <nav className="space-y-1">
                        {currentGroupData.tabs.map((tabId: ReportTab) => (
                             <button key={tabId} onClick={() => setActiveTab(tabId)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeTab === tabId ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                                {reportTitles[tabId]}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-grow bg-card rounded-xl overflow-y-auto p-6 border border-border">
                    {renderActiveReport()}
                </main>
            </div>
        </div>
    );
};

export default ReportsView;
