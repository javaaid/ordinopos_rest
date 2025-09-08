import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';
import { ordinoLogoBase64 } from '../assets/logo';
import { Modal } from './ui/Modal';
import { useAppContext } from '../contexts/AppContext';

export const NumberDisplayModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { calledOrderNumber, settings } = useAppContext();
    const language = settings?.language.customer || 'en';
    const t = useTranslations(language);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-full h-full !rounded-none">
            <div className="w-full h-full bg-background flex flex-col items-center justify-center text-foreground p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Button onClick={onClose} variant="secondary">
                        {t('close_window')}
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

                <footer className="absolute bottom-4 text-center w-full z-10">
                    <img src={ordinoLogoBase64} alt="Logo" className="h-12 w-auto mx-auto mb-2 opacity-80" />
                    <p className="text-xl text-muted-foreground mb-1">Fast • Reliable • Smart POS</p>
                </footer>
            </div>
        </Modal>
    );
};