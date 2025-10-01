import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, ModifierGroup, ModifierOption, Language } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from './ui/Button';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from './ui/Modal';
import { useAppContext } from '../contexts/AppContext';

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddItem: (item: MenuItem, selectedModifiers: ModifierOption[]) => void;
  language: Language;
}

const ModifierModal: React.FC<ModifierModalProps> = ({ isOpen, onClose, item, onAddItem, language }) => {
  const { modifierGroups } = useAppContext();
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption | ModifierOption[] | null>>({});
  const t = useTranslations(language);

  const itemModifierGroups = useMemo(() => {
    if (!item?.modifierGroupIds) return [];
    return item.modifierGroupIds.map(id => (modifierGroups || []).find((mg: ModifierGroup) => mg.id === id)).filter(Boolean) as ModifierGroup[];
  }, [item, modifierGroups]);

  useEffect(() => {
    if (item) {
      const initialSelections: Record<string, ModifierOption | ModifierOption[] | null> = {};
      itemModifierGroups.forEach(group => {
        if (group.isRequired && !group.allowMultiple) {
          initialSelections[group.name] = null; // Force a selection by starting with null
        } else if (!group.allowMultiple && group.options.length > 0) {
          initialSelections[group.name] = group.options[0]; // Pre-select for non-required single-choice
        } else {
          initialSelections[group.name] = [];
        }
      });
      setSelectedModifiers(initialSelections);
    }
  }, [item, itemModifierGroups]);
  
  const isReadyToAdd = useMemo(() => {
    if (!item) return false;
    const requiredGroups = itemModifierGroups.filter(g => g.isRequired) || [];
    if (requiredGroups.length === 0) return true;

    return requiredGroups.every(group => {
      const selection = selectedModifiers[group.name];
      if (Array.isArray(selection)) {
        return selection.length > 0;
      }
      return !!selection;
    });
  }, [item, selectedModifiers, itemModifierGroups]);

  if (!item) return null;

  const handleSingleSelection = (groupName: string, option: ModifierOption) => {
    setSelectedModifiers(prev => ({ ...prev, [groupName]: option }));
  };

  const handleMultiSelection = (groupName: string, option: ModifierOption) => {
    setSelectedModifiers(prev => {
      const currentSelection = (prev[groupName] as ModifierOption[]) || [];
      const isSelected = currentSelection.some(o => o.name === option.name);
      if (isSelected) {
        return { ...prev, [groupName]: currentSelection.filter(o => o.name !== option.name) };
      } else {
        return { ...prev, [groupName]: [...currentSelection, option] };
      }
    });
  };
  
  const getFlatModifiers = (): ModifierOption[] => {
    return Object.values(selectedModifiers).flat().filter(Boolean) as ModifierOption[];
  };

  const handleConfirm = () => {
    onAddItem(item, getFlatModifiers());
    onClose();
  };
  
  const calculateTotalPrice = () => {
    const basePrice = item.price;
    const modifierPrice = getFlatModifiers().reduce((sum, option) => sum + option.price, 0);
    return basePrice + modifierPrice;
  }
  
  const GroupTitle: React.FC<{group: ModifierGroup}> = ({group}) => (
    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-3 flex items-center">
        {group.name}
        {group.isRequired && <span className="ms-2 text-destructive text-xs font-bold">* REQUIRED</span>}
    </h3>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader>
        <ModalTitle>{item.name}</ModalTitle>
        <ModalDescription>{t('customize_item')}</ModalDescription>
      </ModalHeader>
      
      <ModalContent>
        {itemModifierGroups.map((group) => (
          <div key={group.name} className="mb-6">
            <GroupTitle group={group} />
            <div className="space-y-2">
              {group.options.map((option) => (
                <label key={option.name} className="flex items-center justify-between p-3 rounded-lg bg-accent hover:bg-muted cursor-pointer transition-colors">
                  <div className="flex items-center">
                    <input
                      type={group.allowMultiple ? 'checkbox' : 'radio'}
                      name={group.name}
                      checked={group.allowMultiple 
                          ? (selectedModifiers[group.name] as ModifierOption[])?.some(o => o.name === option.name)
                          : (selectedModifiers[group.name] as ModifierOption | null)?.name === option.name
                      }
                      onChange={() => group.allowMultiple ? handleMultiSelection(group.name, option) : handleSingleSelection(group.name, option)}
                      className="h-5 w-5 me-3 bg-background border-border text-primary focus:ring-primary"
                    />
                    <span className="text-foreground">{option.name}</span>
                  </div>
                  {option.price > 0 && <span className="text-muted-foreground">+${option.price.toFixed(2)}</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </ModalContent>

      <ModalFooter>
        <div className="flex justify-between items-center w-full">
            <div className="text-xl font-bold text-foreground">
                {t('total')}: ${calculateTotalPrice().toFixed(2)}
            </div>
            <div className="flex space-x-2">
                <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
                <Button 
                    onClick={handleConfirm} 
                    disabled={!isReadyToAdd}
                >
                    {t('add_to_order')}
                </Button>
            </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ModifierModal;