

import React, { useState, useEffect } from 'react';
import { SalesDashboardWidgetId } from '../types';

interface CustomizeDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visibleWidgets: SalesDashboardWidgetId[]) => void;
    allWidgets: SalesDashboardWidgetId[];
    visibleWidgets: SalesDashboardWidgetId[];
}

const widgetLabels: Record<SalesDashboardWidgetId, string> = {
    stats: "Key Stat Cards",
    chart: "Sales Trend Chart",
    payment: "Payment Breakdown",
    topItems: "Top Selling Items",
    locationPerformance: "Location Performance",
    quickActions: "Quick Actions",
    lowStock: "Low Stock Alerts",
    recentTransactions: "Recent Transactions"
};

const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({ isOpen, onClose, onSave, allWidgets, visibleWidgets }) => {
    const [selectedWidgets, setSelectedWidgets] = useState<Set<SalesDashboardWidgetId>>(new Set(visibleWidgets));

    useEffect(() => {
        setSelectedWidgets(new Set(visibleWidgets));
    }, [visibleWidgets]);

    if (!isOpen) return null;

    const handleToggle = (widgetId: SalesDashboardWidgetId) => {
        setSelectedWidgets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(widgetId)) {
                newSet.delete(widgetId);
            } else {
                newSet.add(widgetId);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        onSave(Array.from(selectedWidgets));
    };

    return (
        <div className="fixed inset-0 bg-background/70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">Customize Dashboard</h2>
                    <p className="text-muted-foreground">Select the widgets you want to see on your dashboard.</p>
                </div>
                <div className="p-6 space-y-3">
                    {allWidgets.map(widgetId => {
                        const label = widgetLabels[widgetId as keyof typeof widgetLabels];
                        if (!label) return null;
                        return (
                            <label key={widgetId} className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-muted cursor-pointer">
                                <span className="text-foreground font-medium">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={selectedWidgets.has(widgetId)}
                                    onChange={() => handleToggle(widgetId)}
                                    className="h-6 w-6 bg-background border-border text-primary focus:ring-ring rounded"
                                />
                            </label>
                        )
                    })}
                </div>
                <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Layout</button>
                </div>
            </div>
        </div>
    );
};

export default CustomizeDashboardModal;