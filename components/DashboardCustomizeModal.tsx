import React, { useState, useEffect, useMemo } from 'react';
import { SalesDashboardWidgetId } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface DashboardCustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visibleWidgets: SalesDashboardWidgetId[]) => void;
    widgetOrder: SalesDashboardWidgetId[];
}

const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({ isOpen, onClose, onSave, widgetOrder }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [orderedWidgets, setOrderedWidgets] = useState<SalesDashboardWidgetId[]>(widgetOrder);

    const widgetLabels: Record<SalesDashboardWidgetId, string> = useMemo(() => ({
        stats: t('keyStatCards'),
        chart: t('salesTrendChart'),
        payment: t('paymentBreakdown'),
        topItems: t('topSellingItems'),
        locationPerformance: t('locationPerformance'),
        quickActions: t('quickActions'),
        lowStock: t('lowStockAlerts'),
        recentTransactions: t('recentTransactions'),
    }), [t]);

    const moveWidget = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...orderedWidgets];
        const [item] = newOrder.splice(index, 1);
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newOrder.splice(newIndex, 0, item);
        setOrderedWidgets(newOrder);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>{t('customizeDashboard')}</ModalTitle>
            </ModalHeader>
            <ModalContent>
                <p className="text-sm text-muted-foreground mb-4">{t('reorderWidgets')}</p>
                <div className="space-y-2">
                    {orderedWidgets.map((widgetId, index) => (
                        <div key={widgetId} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                            <span className="font-semibold text-foreground">{widgetLabels[widgetId]}</span>
                            <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" onClick={() => moveWidget(index, 'up')} disabled={index === 0}>
                                    <ArrowUpIcon className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => moveWidget(index, 'down')} disabled={index === orderedWidgets.length - 1}>
                                    <ArrowDownIcon className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ModalContent>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={() => onSave(orderedWidgets)}>{t('saveLayout')}</Button>
            </ModalFooter>
        </Modal>
    );
};

// Simple arrow icons for the modal
const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export default DashboardCustomizeModal;