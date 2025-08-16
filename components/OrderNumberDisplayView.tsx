

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/Button';
import { AppSettings, Language } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { hexToHsl } from '../lib/utils';
// NOTE: useAppContext is removed as this component must function in a separate window without context.
// State will be synced via BroadcastChannel.

const OrderNumberDisplayView: React.FC = () => {
    const [calledOrderNumber, setCalledOrderNumber] = useState<string | null>(null);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const language = settings?.language.customer || 'en';
    const channelRef = useRef<BroadcastChannel | null>(null);
    const t = useTranslations(language);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
    
    useEffect(() => {
        if (settings?.theme) {
            const root = document.documentElement;
            root.style.setProperty('--primary', hexToHsl(settings.theme.primary));
            root.style.setProperty('--background', hexToHsl(settings.theme.background));
            root.style.setProperty('--card', hexToHsl(settings.theme.surface));
            root.style.setProperty('--foreground', hexToHsl(settings.theme.textBase));
            root.style.setProperty('--muted-foreground', hexToHsl(settings.theme.textMuted));
        }
        document.documentElement.setAttribute('data-theme', 'dark');
    }, [settings?.theme]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragInfo.current.isDragging) return;
        const dx = e.clientX - dragInfo.current.startX;
        const dy = e.clientY - dragInfo.current.startY;
        setPosition({
            x: dragInfo.current.initialX + dx,
            y: dragInfo.current.initialY + dy,
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        document.body.style.userSelect = '';
        dragInfo.current.isDragging = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        document.body.style.userSelect = 'none';
        dragInfo.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y,
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

     useEffect(() => {
        // Cleanup listeners on component unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const channel = new BroadcastChannel('ordino_pos_sync');
        channelRef.current = channel;

        const handleMessage = (event: MessageEvent) => {
            try {
                const { type, payload } = event.data;
                if (type === 'STATE_SYNC') {
                    setCalledOrderNumber(payload.calledOrderNumber || null);
                    if (payload.allSettings) {
                        setSettings(payload.allSettings);
                    }
                } else if (type === 'CALLED_ORDER_NUMBER_UPDATE') {
                    setCalledOrderNumber(payload || null);
                } else if (type === 'SETTINGS_UPDATE') {
                    if (payload) {
                        setSettings(payload);
                    }
                }
            } catch(e) {
                console.error("Order Number Display failed to handle message", e);
            }
        };

        channel.addEventListener('message', handleMessage);
        channel.postMessage({ type: 'REQUEST_STATE' });

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, []);

    const handleClose = () => {
        // This component is designed to be opened in a new window.
        if (window.opener) {
            window.close();
        } else {
            // For the edge case where it's embedded, navigate back to POS view.
            window.location.hash = '#/pos';
        }
    };

    return (
        <div className="w-full h-full bg-background flex flex-col items-center justify-center text-foreground p-8 relative overflow-hidden">
             <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button onClick={handleClose} variant="secondary">
                    {window.opener ? t('close_window') : t('back_to_main_screen')}
                </Button>
            </div>

            <div
                className="relative text-center cursor-grab active:cursor-grabbing"
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                onMouseDown={handleMouseDown}
            >
                <p className="text-4xl font-semibold mb-4 text-foreground">{t('now_serving')}</p>
                <div className="font-mono font-bold text-primary" style={{ fontSize: 'clamp(8rem, 30vw, 25rem)', lineHeight: 1 }}>
                    {calledOrderNumber || '----'}
                </div>
            </div>

             <footer className="absolute bottom-4 right-4 text-xs text-muted-foreground/50 z-10">
                powered by ordinopos.com
            </footer>
        </div>
    );
};

export default OrderNumberDisplayView;