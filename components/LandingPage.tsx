
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { View } from '../types';
import { Button } from './ui/Button';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import ChefHatIcon from './icons/ChefHatIcon';
import TruckIcon from './icons/TruckIcon';
import TvIcon from './icons/TvIcon';
import AccountingIcon from './icons/AccountingIcon';
import ComputerDesktopIcon from './icons/ComputerDesktopIcon';
import QrCodeIcon from './icons/QrCodeIcon';
import QueueListIcon from './icons/QueueListIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';

interface FeatureCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  view: View;
  action: (view: View) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, view, action }) => (
    <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col text-center items-center border border-border">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6 flex-grow">{description}</p>
        <Button onClick={() => action(view)} variant="outline" className="w-full">
            Launch
        </Button>
    </div>
);


const LandingPage: React.FC = () => {
    const { setView, settings, theme, onToggleTheme } = useAppContext();
    
    const features = [
        {
            icon: BuildingStorefrontIcon,
            title: 'Point of Sale',
            description: 'Intuitive interface for fast and accurate order taking. Manage your sales seamlessly.',
            view: 'pos' as View,
        },
        {
            icon: ChefHatIcon,
            title: 'Kitchen Display System',
            description: 'Send orders directly to the kitchen. Improve communication and reduce ticket times.',
            view: 'kds' as View,
        },
        {
            icon: TruckIcon,
            title: 'Delivery Management',
            description: 'Assign drivers and track delivery orders from preparation to the customer\'s door.',
            view: 'delivery' as View,
        },
        {
            icon: TvIcon,
            title: 'Customer Facing Display',
            description: 'Show order details and promotions to customers at the counter.',
            view: 'cfd' as View,
        },
        {
            icon: ComputerDesktopIcon,
            title: 'Self-Service Kiosk',
            description: 'Allow customers to place their own orders, reducing queues and freeing up staff.',
            view: 'kiosk' as View,
        },
        {
            icon: QrCodeIcon,
            title: 'QR Table Ordering',
            description: 'Enable contactless ordering and payments directly from the customer\'s table.',
            view: 'qr_ordering' as View,
        },
         {
            icon: QueueListIcon,
            title: 'Order Number Display',
            description: 'Display called order numbers for customer pickup.',
            view: 'order_number_display' as View,
        },
        {
            icon: AccountingIcon,
            title: 'Management & Reports',
            description: 'Access detailed reports, manage users, menu items, and system settings.',
            view: 'management' as View,
        },
    ];

    return (
        <div className="bg-background w-full h-full overflow-y-auto text-foreground relative">
             <div className="absolute top-8 right-8 z-10">
                <Button onClick={onToggleTheme} variant="outline" size="icon" className="rounded-full w-12 h-12 shadow-md" title="Toggle Theme">
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </Button>
            </div>
            <div className="container mx-auto px-4 py-16">
                <header className="text-center mb-16">
                    <img src={settings.receipt.logoUrl} alt="ordino Pos" className="h-20 w-auto mx-auto mb-4" />
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">The All-in-One Solution for Your Business</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Streamline operations with our intuitive Point of Sale, Kitchen Display, Delivery Management, and more.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" onClick={() => setView('pos')}>
                            Go to POS
                        </Button>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {features.map(feature => (
                            <FeatureCard
                                key={feature.view}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                view={feature.view}
                                action={setView}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default LandingPage;