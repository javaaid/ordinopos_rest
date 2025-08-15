

import React, { useState, useEffect, useMemo } from 'react';
import { SignageContentItem, MenuItem } from '../types';
import VideoCameraIcon from './icons/VideoCameraIcon';

interface CFDAttractScreenProps {
    contentItems: (SignageContentItem | undefined)[];
    menuItems: MenuItem[];
}

const CFDAttractScreen: React.FC<CFDAttractScreenProps> = ({ contentItems, menuItems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const validContentItems = useMemo(() => (contentItems || []).filter(Boolean) as SignageContentItem[], [contentItems]);
    const itemsSignature = useMemo(() => JSON.stringify(validContentItems.map(i => i.id)), [validContentItems]);

    // Reset index if the content list itself changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [itemsSignature]);

    // Manages the timer to cycle to the next item
    useEffect(() => {
        if (validContentItems.length === 0) {
            return;
        }

        const currentContent = validContentItems[currentIndex];
        if (!currentContent) {
            setCurrentIndex(0);
            return;
        }

        const timerId = setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % validContentItems.length);
        }, currentContent.duration * 1000);

        return () => clearTimeout(timerId);
    }, [currentIndex, itemsSignature, validContentItems]);


    if (validContentItems.length === 0) {
        return <div className="w-full h-full flex items-center justify-center bg-background text-foreground text-4xl">Welcome!</div>
    }

    const currentItem = validContentItems[currentIndex % validContentItems.length];
    const menuItem = currentItem.type === 'menu_promo' ? menuItems.find(m => m.id === currentItem.menuItemIds?.[0]) : null;
    const imageUrl = currentItem.type === 'image' ? currentItem.sourceUrl : (menuItem ? menuItem.imageUrl : '');

    return (
        <div className="w-full h-full relative overflow-hidden bg-background">
             <style>{`
                @keyframes ken-burns {
                    0% { transform: scale(1) translate(0, 0); }
                    50% { transform: scale(1.1) translate(-2%, 2%); }
                    100% { transform: scale(1) translate(0, 0); }
                }
                .animate-ken-burns {
                    animation: ken-burns 20s ease-in-out infinite;
                }
                 @keyframes progress-bar { from { width: 100%; } to { width: 0%; } }
                .animate-progress-bar {
                    animation: progress-bar linear forwards;
                }
            `}</style>
            {imageUrl && (
                <div
                    key={currentItem.id}
                    className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                ></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 text-white">
                 <div className="animate-fade-in-up">
                    {currentItem.type === 'menu_promo' && menuItem ? (
                        <>
                            <h1 className="text-8xl font-bold drop-shadow-2xl">{menuItem.name}</h1>
                            <p className="text-5xl font-semibold text-amber-300 drop-shadow-xl mt-2">${menuItem.price.toFixed(2)}</p>
                        </>
                    ) : currentItem.type === 'video' ? (
                        <div className="text-center">
                            <VideoCameraIcon className="w-32 h-32 mx-auto" />
                            <h1 className="text-6xl font-bold drop-shadow-2xl">{currentItem.name}</h1>
                        </div>
                    ) : (
                        <h1 className="text-8xl font-bold drop-shadow-2xl">{currentItem.name}</h1>
                    )}
                 </div>
            </div>

            <div className="absolute top-0 left-0 h-2 bg-muted/50 w-full">
                 <div key={currentItem.id} className="h-full bg-primary animate-progress-bar" style={{ animationDuration: `${currentItem.duration}s`}}></div>
            </div>
        </div>
    );
};

export default CFDAttractScreen;
