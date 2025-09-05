import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'itemCount'>) => void;
  category: Category | null;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const { settings } = useAppContext();
  const t = useTranslations(settings.language.staff);
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
          <ModalHeader>
            <ModalTitle>{category ? t('edit') : t('addNewCategory')}</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('categoryName')}</label>
              <Input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground text-start rtl:text-end" required />
            </div>
          </ModalContent>
          <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
            <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit">{t('saveCategory')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditModal;