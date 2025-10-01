
import React, { useState, useMemo } from 'react';
import { ManagementSubView, SettingsSubView, PermissionSet, Role, NavItem, AppPlugin } from '../types';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { coreModules, optionalPlugins } from '../plugins';
import { useTranslations } from '../hooks/useTranslations';
import ChevronDownIcon from './icons/ChevronDownIcon';


interface SidebarLayoutProps {
  title: string;
  activeItem: ManagementSubView | SettingsSubView;
  onNavItemClick: (itemId: string) => void;
  children: React.ReactNode;
}

function hasPermission(viewId: string, p: PermissionSet): boolean {
    switch (viewId) {
        case 'users':
        case 'roles':
        case 'locations':
            return p.canManageUsersAndRoles;
        case 'email_reporting':
        case 'reports':
            return p.viewReports;
        case 'customers':
        case 'call_log':
            return p.viewCustomers;
        case 'suppliers':
        case 'ingredients':
        case 'purchasing':
            return p.viewPurchasing;
        case 'accounting':
            return p.canViewAllReports;
        // All other management views fall under this general permission
        default:
            return p.canPerformManagerFunctions;
    }
}


const SidebarLayout: React.FC<SidebarLayoutProps> = ({ title, activeItem, onNavItemClick, children }) => {
    const { currentEmployee, settings, plugins: activeOptionalPlugins } = useAppContext();
    const { roles } = useDataContext();
    const t = useTranslations(settings.language.staff);

    const permissions = useMemo<PermissionSet | null>(() => {
        if (!currentEmployee || !roles) return null;
        return roles.find((r: Role) => r.id === currentEmployee.roleId)?.permissions;
    }, [currentEmployee, roles]);
    
    const navItems = useMemo(() => {
        const isSettingsView = title === t('settings');
        const navItemFactory = isSettingsView ? (p: any) => p.getSettingsNavItem : (p: any) => p.getManagementNavItem;

        // 1. Get base navigation structure from core modules
        let coreNavItems: NavItem[] = coreModules.map(module => {
            const getNavItem = navItemFactory(module);
            return getNavItem ? getNavItem(t) : null;
        }).filter((item): item is NavItem => item !== null);

        // 2. Inject active optional plugin items into their parent groups
        (activeOptionalPlugins || []).forEach((activePlugin: AppPlugin) => {
            if (activePlugin.status === 'enabled' || activePlugin.status === 'trial') {
                const definition = optionalPlugins.find(p => p.manifest.id === activePlugin.id);
                if (definition) {
                    const getNavItem = navItemFactory(definition);
                    if (getNavItem) {
                        const navItem = getNavItem(t);
                        if (navItem && navItem.parentId) {
                            const parent = coreNavItems.find(item => item.id === navItem.parentId);
                            if (parent && parent.children) {
                                parent.children.push(navItem);
                            }
                        } else if (navItem) {
                            coreNavItems.push(navItem); // Add as top-level if no parentId
                        }
                    }
                }
            }
        });
        
        if (!permissions) return [];
        
        // 3. Filter all items based on permissions
        return coreNavItems.reduce((acc: NavItem[], item) => {
            if (Array.isArray(item.children)) {
                const visibleChildren = item.children.filter(child => hasPermission(child.id, permissions!));
                if (visibleChildren.length > 0) {
                     acc.push({ ...item, children: visibleChildren });
                }
            } else {
                if (hasPermission(item.id, permissions!)) {
                    acc.push(item);
                }
            }
            return acc;
        }, []);

    }, [title, t, activeOptionalPlugins, permissions]);


    const [openSubMenu, setOpenSubMenu] = useState<string | null>(() => {
        const activeParent = navItems.find(item => Array.isArray(item.children) && item.children.some(child => child.id === activeItem));
        return activeParent ? activeParent.id : null;
    });

    const handleSubMenuToggle = (id: string) => {
        setOpenSubMenu(prev => prev === id ? null : id);
    };

    const navItemClass = (id: string, isChild = false) =>
        `w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-start ${isChild ? 'ps-11 pe-3' : 'px-3'} ${
            activeItem === id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`;

    return (
        <div className="h-screen flex flex-col md:flex-row gap-6 p-6 bg-background">
            <aside className="w-full md:w-64 bg-card rounded-xl p-4 shrink-0 flex flex-col border border-border shadow-md">
                <h2 className="text-xl font-bold text-foreground px-2 mb-6">{title}</h2>
                <nav className="space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        if (Array.isArray(item.children)) {
                            const isOpen = openSubMenu === item.id;
                            const isChildActive = item.children.some(child => child.id === activeItem);
                            const Icon = item.icon;
                            return (
                                <div key={item.id}>
                                    <button
                                        onClick={() => handleSubMenuToggle(item.id)}
                                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isChildActive ? 'text-foreground bg-accent' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5 shrink-0"/>
                                            <span className="flex-grow text-start">{item.label}</span>
                                        </div>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="mt-1 space-y-1 animate-fade-in-down">
                                            {item.children.map(child => {
                                                return (
                                                    <button key={child.id} onClick={() => onNavItemClick(child.id)} className={navItemClass(child.id, true)}>
                                                        <span className="flex-grow text-start">{child.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const Icon = item.icon;
                        return (
                             <button key={item.id} onClick={() => onNavItemClick(item.id)} className={navItemClass(item.id)}>
                                <Icon className="w-5 h-5 shrink-0"/>
                                <span className="flex-grow text-start">{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </aside>
            <main className="flex-grow bg-card rounded-xl overflow-hidden flex flex-col border border-border shadow-md">
                {children}
            </main>
        </div>
    );
};

export default SidebarLayout;
