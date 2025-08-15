
import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, PizzaConfiguration, PizzaTopping, PizzaToppingPlacement, PizzaToppingItem, PizzaSize, PizzaCrust, PizzaSauce, PizzaCheese } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import StarIcon from './icons/StarIcon';
import { useAppContext, usePOSContext } from '../contexts/AppContext';

interface PizzaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-bold text-foreground border-b-2 border-border pb-2 mb-4">{children}</h3>
);

const OptionButton: React.FC<{ label: string; price: number; isSelected: boolean; onClick: () => void; }> = ({ label, price, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex justify-between items-center ${
            isSelected ? 'bg-primary/20 border-primary shadow-md' : 'bg-secondary border-border hover:border-muted-foreground'
        }`}
    >
        <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{label}</span>
        {price > 0 && <span className={`text-sm ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>+${price.toFixed(2)}</span>}
    </button>
);

const ToppingSelector: React.FC<{ topping: PizzaToppingItem; selectedPlacement: PizzaToppingPlacement | null; onSelect: (topping: PizzaToppingItem, placement: PizzaToppingPlacement) => void; }> = ({ topping, selectedPlacement, onSelect }) => {
    const btnClass = (placement: PizzaToppingPlacement) => `w-10 h-10 flex items-center justify-center font-bold text-xs rounded-md transition-colors ${
        selectedPlacement === placement
        ? 'bg-primary text-primary-foreground shadow'
        : 'bg-muted hover:bg-accent text-accent-foreground'
    }`;
    
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
                <span className="text-foreground">{topping.name}</span>
                <span className="text-muted-foreground text-sm ml-2">+${topping.price.toFixed(2)}</span>
            </div>
            <div className="flex gap-1.5">
                <button aria-label={`Add ${topping.name} to left half`} onClick={() => onSelect(topping, 'left')} className={btnClass('left')}>L</button>
                <button aria-label={`Add ${topping.name} to whole pizza`} onClick={() => onSelect(topping, 'whole')} className={btnClass('whole')}>W</button>
                <button aria-label={`Add ${topping.name} to right half`} onClick={() => onSelect(topping, 'right')} className={btnClass('right')}>R</button>
            </div>
        </div>
    );
};


const PizzaBuilder: React.FC<PizzaBuilderProps> = ({ isOpen, onClose, item }) => {
    const { currentLocation } = useAppContext();
    const { handleAddPizzaToCart } = usePOSContext();
    const PIZZA_OPTIONS = currentLocation.pizzaBuilder;

    const [config, setConfig] = useState<PizzaConfiguration>({
        size: PIZZA_OPTIONS.sizes[1],
        crust: PIZZA_OPTIONS.crusts[0],
        sauce: PIZZA_OPTIONS.sauces[0],
        cheese: PIZZA_OPTIONS.cheeses[0],
        toppings: [],
    });

    useEffect(() => {
        // Reset to default when modal opens with a new item
        if (item) {
            setConfig({
                size: PIZZA_OPTIONS.sizes[1] || PIZZA_OPTIONS.sizes[0],
                crust: PIZZA_OPTIONS.crusts[0],
                sauce: PIZZA_OPTIONS.sauces[0],
                cheese: PIZZA_OPTIONS.cheeses[0],
                toppings: [],
            });
        }
    }, [item, isOpen, PIZZA_OPTIONS]);
    
    const finalPrice = useMemo(() => {
        if (!item) return 0;
        let price = item.price; // Base price for "Build Your Own"
        price += config.size?.price || 0;
        price += config.crust?.price || 0;
        price += config.sauce?.price || 0;
        price += config.cheese?.price || 0;
        
        price += config.toppings.reduce((sum, topping) => {
            const toppingData = PIZZA_OPTIONS.toppings.find(t => t.id === topping.id);
            if (!toppingData) return sum;
            if (topping.placement === 'whole') {
                return sum + toppingData.price;
            }
            return sum + (toppingData.price / 2);
        }, 0);
        
        return price;

    }, [item, config, PIZZA_OPTIONS.toppings]);

    if (!isOpen || !item) return null;

    const handleToppingSelect = (topping: PizzaToppingItem, placement: PizzaToppingPlacement) => {
        setConfig(prev => {
            const existing = prev.toppings.find(t => t.id === topping.id);
            if (existing) {
                if (existing.placement === placement) {
                    // It's a deselect
                    return { ...prev, toppings: prev.toppings.filter(t => t.id !== topping.id) };
                } else {
                    // Change placement
                    return { ...prev, toppings: prev.toppings.map(t => t.id === topping.id ? { ...t, placement } : t) };
                }
            } else {
                // Add new topping
                return { ...prev, toppings: [...prev.toppings, { id: topping.id, name: topping.name, placement }] };
            }
        });
    };
    
    const handleAdd = () => {
        handleAddPizzaToCart(item, config, finalPrice);
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col z-50 animate-fade-in-down">
            <header className="flex-shrink-0 bg-card/80 p-4 flex justify-between items-center border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Create Your Masterpiece</h2>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
            </header>

            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                {/* Left Column - Summary */}
                <aside className="w-full md:w-1/3 xl:w-1/4 bg-card p-6 flex flex-col border-e border-border">
                    <img src={item.imageUrl} alt="Pizza" className="rounded-lg mb-6 aspect-square object-cover shadow-lg" />
                    <h3 className="text-2xl font-bold text-foreground">{config.size?.name || ''} Pizza</h3>
                    <div className="mt-4 flex-grow space-y-2 overflow-y-auto text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Crust:</span> {config.crust?.name || ''}</p>
                        <p><span className="font-semibold text-foreground">Sauce:</span> {config.sauce?.name || ''}</p>
                        <p><span className="font-semibold text-foreground">Cheese:</span> {config.cheese?.name || ''}</p>
                        {config.toppings.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-foreground mt-2">Toppings:</h4>
                                <ul className="list-disc list-inside text-sm">
                                    {config.toppings.map(t => <li key={t.id}>{t.name} ({t.placement})</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Column - Options */}
                <main className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow p-6 overflow-y-auto space-y-8">
                        <section><SectionTitle>1. Choose Your Size</SectionTitle><div className="grid grid-cols-3 gap-4">{PIZZA_OPTIONS.sizes.map(s => <OptionButton key={s.id} label={s.name} price={s.price} isSelected={config.size?.id === s.id} onClick={() => setConfig(p => ({...p, size: s}))}/>)}</div></section>
                        <section><SectionTitle>2. Select Your Crust</SectionTitle><div className="grid grid-cols-2 gap-4">{PIZZA_OPTIONS.crusts.map(c => <OptionButton key={c.id} label={c.name} price={c.price} isSelected={config.crust?.id === c.id} onClick={() => setConfig(p => ({...p, crust: c}))}/>)}</div></section>
                        <section><SectionTitle>3. Pick Your Sauce</SectionTitle><div className="grid grid-cols-2 gap-4">{PIZZA_OPTIONS.sauces.map(s => <OptionButton key={s.id} label={s.name} price={s.price} isSelected={config.sauce?.id === s.id} onClick={() => setConfig(p => ({...p, sauce: s}))}/>)}</div></section>
                        <section><SectionTitle>4. Decide on Cheese</SectionTitle><div className="grid grid-cols-2 gap-4">{PIZZA_OPTIONS.cheeses.map(c => <OptionButton key={c.id} label={c.name} price={c.price} isSelected={config.cheese?.id === c.id} onClick={() => setConfig(p => ({...p, cheese: c}))}/>)}</div></section>
                        <section>
                            <SectionTitle>5. Add Toppings</SectionTitle>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                {PIZZA_OPTIONS.toppings.map(t => {
                                    const selection = config.toppings.find(st => st.id === t.id);
                                    return <ToppingSelector key={t.id} topping={t} selectedPlacement={selection?.placement || null} onSelect={handleToppingSelect} />
                                })}
                            </div>
                        </section>
                    </div>
                    <footer className="flex-shrink-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border flex justify-between items-center">
                        <div>
                            <span className="text-muted-foreground">Total Price</span>
                            <p className="text-4xl font-bold text-foreground">${finalPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-5 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-muted transition-colors flex items-center gap-2">
                                <StarIcon className="w-5 h-5 text-yellow-400"/> Save as Favorite
                            </button>
                            <button onClick={handleAdd} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                Add to Order
                            </button>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default PizzaBuilder;
