

import React from 'react';
import { Order, Location, AppSettings, Employee } from '../../types';
import ModernA4Invoice from './ModernA4Invoice';
import ClassicA4Invoice from './ClassicA4Invoice';
import ZatcaA4Invoice from './ZatcaA4Invoice';

interface InvoiceTemplateRendererProps {
    order: Order;
    location: Location;
    settings: AppSettings;
    employees: Employee[];
}

const InvoiceTemplateRenderer: React.FC<InvoiceTemplateRendererProps> = (props) => {
    const { settings } = props;
    const templateId = settings.invoice.template;

    switch (templateId) {
        case 'classic':
            return <ClassicA4Invoice {...props} />;
        case 'zatca_bilingual':
            return <ZatcaA4Invoice {...props} />;
        case 'modern':
        default:
            return <ModernA4Invoice {...props} />;
    }
};

export default InvoiceTemplateRenderer;