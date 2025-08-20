import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, BurgerConfiguration, BurgerBun, BurgerPatty, BurgerCheese, BurgerToppingItem, BurgerSauce, BurgerExtras } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import { useAppContext, usePOSContext } from '../contexts/AppContext';
import { Button } from './ui/Button';

interface BurgerBuilderProps {
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

const MultiOptionButton: React.FC<{ label: string; price: number; isSelected: boolean; onClick: () => void; }> = ({ label, price, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex justify-between items-center ${
            isSelected ? 'bg-primary/20 border-primary shadow-md' : 'bg-secondary border-border hover:border-muted-foreground'
        }`}
    >
        <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{label}</span>
        <div className="flex items-center gap-2">
            {price > 0 && <span className={`text-sm ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>+${price.toFixed(2)}</span>}
            <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
        </div>
    </button>
);


const BurgerBuilder: React.FC<BurgerBuilderProps> = ({ isOpen, onClose, item }) => {
    const { currentLocation } = useAppContext();
    const { handleAddBurgerToCart } = usePOSContext();
    const BURGER_OPTIONS = currentLocation.burgerBuilder;

    const [config, setConfig] = useState<Partial<BurgerConfiguration>>({});

    useEffect(() => {
        if (item) {
            setConfig({
                bun: BURGER_OPTIONS.buns[0],
                patty: BURGER_OPTIONS.patties[0],
                toppings: [],
                sauces: [],
                extras: [],
            });
        }
    }, [item, isOpen, BURGER_OPTIONS]);

    const finalPrice = useMemo(() => {
        if (!item || !config.bun || !config.patty) return 0;
        let price = item.price; // Base price for "Build Your Own"
        price += config.bun.price || 0;
        price += config.patty.price || 0;
        price += config.cheese?.price || 0;
        price += (config.toppings || []).reduce((sum, t) => sum + t.price, 0);
        price += (config.sauces || []).reduce((sum, s) => sum + s.price, 0);
        price += (config.extras || []).reduce((sum, e) => sum + e.price, 0);
        if (config.isDouble) {
            price += config.patty.price;
        }
        return price;
    }, [item, config]);

    if (!isOpen || !item) return null;

    const handleMultiSelect = <T extends { id: string }>(type: keyof BurgerConfiguration, option: T) => {
        setConfig(prev => {
            const currentSelection = (prev[type] as unknown as T[] || []);
            const isSelected = currentSelection.some(o => o.id === option.id);
            if (isSelected) {
                return { ...prev, [type]: currentSelection.filter(o => o.id !== option.id) };
            } else {
                return { ...prev, [type]: [...currentSelection, option] };
            }
        });
    };

    const handleAdd = () => {
        if (config.bun && config.patty) {
            handleAddBurgerToCart(item, config as BurgerConfiguration, finalPrice);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col z-50 animate-fade-in-down">
            <header className="flex-shrink-0 bg-card/80 p-4 flex justify-between items-center border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Build Your Burger</h2>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full">
                    <XCircleIcon className="w-8 h-8"/>
                </button>
            </header>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <aside className="w-full md:w-1/3 xl:w-1/4 bg-card p-6 flex flex-col border-e border-border">
                    <img src={item.imageUrl} alt="Burger" className="rounded-lg mb-6 aspect-square object-cover shadow-lg" />
                    <h3 className="text-2xl font-bold text-foreground">{item.name}</h3>
                    <div className="mt-4 flex-grow space-y-2 overflow-y-auto text-muted-foreground">
                         <p><span className="font-semibold text-foreground">Bun:</span> {config.bun?.name}</p>
                        <p><span className="font-semibold text-foreground">Patty:</span> {config.patty?.name} {config.isDouble && "(Double)"}</p>
                        {config.cheese && <p><span className="font-semibold text-foreground">Cheese:</span> {config.cheese.name}</p>}
                        {config.toppings && config.toppings.length > 0 && <p><span className="font-semibold text-foreground">Toppings:</span> {config.toppings.map(t => t.name).join(', ')}</p>}
                        {config.sauces && config.sauces.length > 0 && <p><span className="font-semibold text-foreground">Sauces:</span> {config.sauces.map(s => s.name).join(', ')}</p>}
                        {config.extras && config.extras.length > 0 && <p><span className="font-semibold text-foreground">Extras:</span> {config.extras.map(e => e.name).join(', ')}</p>}
                    </div>
                </aside>
                <main className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow p-6 overflow-y-auto space-y-8">
                        <section><SectionTitle>1. Choose Your Bun</SectionTitle><div className="grid grid-cols-2 gap-4">{BURGER_OPTIONS.buns.map(b => <OptionButton key={b.id} label={b.name} price={b.price} isSelected={config.bun?.id === b.id} onClick={() => setConfig(p => ({...p, bun: b}))}/>)}</div></section>
                        <section><SectionTitle>2. Choose Your Patty</SectionTitle><div className="grid grid-cols-2 gap-4">{BURGER_OPTIONS.patties.map(p => <OptionButton key={p.id} label={p.name} price={p.price} isSelected={config.patty?.id === p.id} onClick={() => setConfig(c => ({...c, patty: p}))}/>)}</div></section>
                        <section><SectionTitle>3. Choose Your Cheese</SectionTitle><div className="grid grid-cols-2 gap-4">{BURGER_OPTIONS.cheeses.map(c => <OptionButton key={c.id} label={c.name} price={c.price} isSelected={config.cheese?.id === c.id} onClick={() => setConfig(p => ({...p, cheese: p.cheese?.id === c.id ? undefined : c}))}/>)}</div></section>
                        <section><SectionTitle>4. Add Toppings</SectionTitle><div className="grid grid-cols-2 gap-4">{BURGER_OPTIONS.toppings.map(t => <MultiOptionButton key={t.id} label={t.name} price={t.price} isSelected={(config.toppings || []).some(s => s.id === t.id)} onClick={() => handleMultiSelect('toppings', t)}/>)}</div></section>
                        <section><SectionTitle>5. Add Sauces</SectionTitle><div className="grid grid-cols-2 gap-4">{BURGER_OPTIONS.sauces.map(s => <MultiOptionButton key={s.id} label={s.name} price={s.price} isSelected={(config.sauces || []).some(sl => sl.id === s.id)} onClick={() => handleMultiSelect('sauces', s)}/>)}</div></section>
                        <section><SectionTitle>6. Add Extras</SectionTitle><div className="grid grid-cols-2 gap-4">{BURGER_OPTIONS.extras.map(e => <MultiOptionButton key={e.id} label={e.name} price={e.price} isSelected={(config.extras || []).some(se => se.id === e.id)} onClick={() => handleMultiSelect('extras', e)}/>)}</div></section>
                    </div>
                    <footer className="flex-shrink-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border flex justify-between items-center">
                        <div>
                            <span className="text-muted-foreground">Total Price</span>
                            <p className="text-4xl font-bold text-foreground">${finalPrice.toFixed(2)}</p>
                        </div>
                        <Button onClick={handleAdd} className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            Add to Order
                        </Button>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default BurgerBuilder;