
import React, { useState, useEffect } from 'react';
import { Ingredient, Supplier, Location } from '../types';
import { useDataContext } from '../contexts/AppContext';

interface IngredientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  ingredient: Ingredient | null;
}

const IngredientEditModal: React.FC<IngredientEditModalProps> = ({ isOpen, onClose, onSave, ingredient }) => {
  const { suppliers, locations } = useDataContext();
  const [formData, setFormData] = useState<Omit<Ingredient, 'id'>>({
    name: '', stock: 0, unit: 'g', costPerUnit: 0, reorderThreshold: 0, supplierId: '', locationId: '',
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({ ...ingredient });
    } else {
      setFormData({
        name: '', stock: 0, unit: 'g', costPerUnit: 0, reorderThreshold: 0, supplierId: suppliers[0]?.id || '', locationId: locations[0]?.id || '',
      });
    }
  }, [ingredient, suppliers, locations]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['stock', 'costPerUnit', 'reorderThreshold'].includes(name) ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = ingredient?.id || `ing_${Date.now()}`;
    onSave({ ...formData, id: newId });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">{ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div><label className="block text-sm text-muted-foreground">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" required/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-muted-foreground">Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" step="0.01"/></div>
                <div><label className="block text-sm text-muted-foreground">Unit</label><select name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border">
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="l">Liters (l)</option>
                    <option value="unit">Units</option>
                </select></div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-muted-foreground">Cost per Unit</label><input type="number" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" step="0.0001"/></div>
                <div><label className="block text-sm text-muted-foreground">Reorder At</label><input type="number" name="reorderThreshold" value={formData.reorderThreshold} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border"/></div>
            </div>
             <div><label className="block text-sm text-muted-foreground">Supplier</label><select name="supplierId" value={formData.supplierId} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border"><option value="">None</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
             <div><label className="block text-sm text-muted-foreground">Location</label><select name="locationId" value={formData.locationId} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border">{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
          </div>
          <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Ingredient</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientEditModal;