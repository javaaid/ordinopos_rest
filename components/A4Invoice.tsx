

import React from 'react';
import { Order, Location, AppSettings, Employee } from '../types';
import InvoiceTemplateRenderer from './invoice-templates/InvoiceTemplateRenderer';

interface A4InvoiceProps {
    order: Order;
    location: Location;
    settings: AppSettings;
    employees: Employee[];
}

const A4Invoice: React.FC<A4InvoiceProps> = (props) => {
    return (
        <div id="a4-invoice-wrapper" className="bg-white">
            <InvoiceTemplateRenderer {...props} />
        </div>
    );
};

export default A4Invoice;