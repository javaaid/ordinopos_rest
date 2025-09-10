import React, { useState, useMemo } from 'react';
import { View, Role } from '../types';
import HomeIcon from './icons/HomeIcon';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import TableCellsIcon from './icons/TableCellsIcon';
import TruckIcon from './icons/TruckIcon';
import AccountingIcon from './icons/AccountingIcon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import LogoutIcon from './icons/LogoutIcon';
import ReceiptLongIcon from './icons/ReceiptLongIcon';
import ClockIcon from './icons/ClockIcon';
import ChevronDoubleLeftIcon from './icons/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from './icons/ChevronDoubleRightIcon';
import QueueListIcon from './icons/QueueListIcon';
import { useAppContext, useDataContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';
import { useTranslations } from '../hooks/useTranslations';
import { ordinoLogoBase64 } from '../assets/logo';

interface SidebarNavItemDef {
  id: View;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface SidebarNavItem extends SidebarNavItemDef {
  allowed: boolean;
}

export const MainSidebar = (): React.ReactElement | null => {
  const { 
    activeView, setView: onSelectView, currentEmployee: currentUser, handleLogout, 
    settings, onToggleSidebarCollapse, isSidebarCollapsed
  } = useAppContext();
  
  if (!settings) {
    return null;
  }
  
  const { roles } = useDataContext();
  const [logoError, setLogoError] = useState(false);
  const t = useTranslations(settings.language.staff);

  const role = useMemo(() => {
    return currentUser ? (roles || []).find((r: Role) => r.id === currentUser.roleId) : null;
  }, [currentUser, roles]);
  
  const permissions = role?.permissions;

  const navItems = useMemo((): SidebarNavItemDef[] => {
    if (!permissions) return [];
    const items: SidebarNavItem[] = [
      { id: 'dashboard', label: t('dashboard'), icon: HomeIcon, allowed: permissions.viewDashboard },
      { id: 'pos', label: t('pos'), icon: BuildingStorefrontIcon, allowed: permissions.viewPOS },
      { id: 'tables', label: t('tables'), icon: TableCellsIcon, allowed: permissions.viewFloorPlan },
      { id: 'delivery', label: t('delivery'), icon: TruckIcon, allowed: permissions.viewDelivery },
      { id: 'history', label: t('order_history'), icon: ReceiptLongIcon, allowed: permissions.viewHistory },
      { id: 'timeclock', label: t('time_clock'), icon: ClockIcon, allowed: permissions.viewTimeClock },
      { id: 'management', label: t('management'), icon: AccountingIcon, allowed: permissions.canPerformManagerFunctions || permissions.canManageUsersAndRoles || permissions.viewCustomers || permissions.viewPurchasing || permissions.viewReports },
      { id: 'settings', label: t('settings'), icon: Cog6ToothIcon, allowed: permissions.viewSettings },
    ];
    return items.filter(item => item.allowed);
  }, [permissions, t]);

  const navItemClass = (isActive: boolean, isPrimaryAction = false) => cn(
    'w-full flex items-center gap-4 py-3 rounded-lg transition-colors duration-200',
    isSidebarCollapsed ? 'px-2 justify-center' : 'px-4',
    isActive 
    ? 'bg-primary text-primary-foreground shadow-md' 
    : isPrimaryAction 
    ? 'bg-primary/10 text-primary hover:bg-primary/20'
    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  );
  
  const renderNavItem = (item: SidebarNavItemDef, isPrimaryAction = false) => {
    const isActive = activeView === item.id;
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => onSelectView(item.id)}
        className={navItemClass(isActive, isPrimaryAction)}
        title={isSidebarCollapsed ? item.label : undefined}
      >
        <Icon className="w-6 h-6 shrink-0" />
        <span className={cn("font-semibold", isSidebarCollapsed && "sr-only")}>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className={cn(
        'relative h-full flex flex-col bg-card shadow-lg border-r border-border shrink-0 p-4 transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'w-20' : 'w-64'
    )}>
      
      <div className='p-4 mb-8 bg-background rounded-xl shadow-inner'>
        <div className='flex items-center justify-center h-10'>
            {logoError ? (
                <div className='flex items-center gap-3'>
                    <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-md font-bold text-xl shrink-0">
                        OP
                    </div>
                    {!isSidebarCollapsed && <span className="font-bold text-xl text-foreground">ordino POS</span>}
                </div>
            ) : (
                <img 
                    src={ordinoLogoBase64} 
                    alt="ordino Pos Logo" 
                    className={cn('h-full w-auto transition-all duration-300', isSidebarCollapsed ? 'max-w-10' : 'max-w-36')}
                    onError={() => setLogoError(true)}
                />
            )}
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map(item => renderNavItem(item, item.id === 'pos'))}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-border">
         <button
            onClick={onToggleSidebarCollapse}
            className="w-full flex items-center justify-center py-2 text-muted-foreground hover:bg-accent rounded-lg"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isSidebarCollapsed ? (
                <ChevronDoubleRightIcon className="w-5 h-5" />
            ) : (
                <ChevronDoubleLeftIcon className="w-5 h-5" />
            )}
        </button>
      </div>
    </aside>
  );
};