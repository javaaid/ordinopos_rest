

import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'itemCount'>) => void;
  category: Category | null;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: category?.id || name.toLowerCase().replace(/\s+/g, '_'),
      name: name.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-background/70 flex justify-center items-center z-[60] p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">{category ? 'Edit Category' : 'Add New Category'}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Category Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
            </div>
          </div>
          <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditModal;