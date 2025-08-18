
import React from 'react';
import { Notification } from '../types';
import BellIcon from './icons/BellIcon';

interface NotificationsPanelProps {
    notifications: Notification[];
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onMarkAllAsRead, onClose }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-popover rounded-lg shadow-2xl border border-border z-50 animate-fade-in-down">
            <div className="p-3 flex justify-between items-center border-b border-border">
                <h3 className="font-semibold text-popover-foreground">Notifications</h3>
                {notifications.some(n => !n.read) && (
                     <button onClick={onMarkAllAsRead} className="text-xs text-primary hover:underline">Mark all as read</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <BellIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2"/>
                        <p>No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map(notification => (
                             <div key={notification.id} className={`p-3 transition-colors ${!notification.read ? 'bg-primary/10' : ''}`}>
                                 <p className="text-sm text-popover-foreground">{notification.message}</p>
                                 <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.timestamp)}</p>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;