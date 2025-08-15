import React, { useState, useEffect } from 'react';
import { SignageContentItem, SignageContentType, MenuItem } from '../types';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface SignageContentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: SignageContentItem) => void;
  content: SignageContentItem | null;
}

const SignageContentEditModal: React.FC<SignageContentEditModalProps> = ({ isOpen, onClose, onSave, content }) => {
    const { menuItems } = useDataContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<SignageContentType>('image');
    const [sourceUrl, setSourceUrl] = useState('');
    const [duration, setDuration] = useState(10);
    const [selectedMenuItemIds, setSelectedMenuItemIds] = useState<number[]>([]);

    useEffect(() => {
        if (content) {
            setName(content.name);
            setType(content.type);
            setSourceUrl(content.sourceUrl);
            setDuration(content.duration);
            setSelectedMenuItemIds(content.menuItemIds || []);
        } else {
            setName('');
            setType('image');
            setSourceUrl('');
            setDuration(10);
            setSelectedMenuItemIds([]);
        }
    }, [content, isOpen]);

    const handleMenuItemToggle = (id: number) => {
        setSelectedMenuItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: content?.id || `content_${Date.now()}`,
            name,
            type,
            sourceUrl: type === 'menu_promo' ? '' : sourceUrl,
            duration,
            menuItemIds: type === 'menu_promo' ? selectedMenuItemIds : [],
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{content ? 'Edit Content' : 'Add New Content'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Content Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                            <Select value={type} onChange={e => setType(e.target.value as SignageContentType)}>
                                <option value="image">Image</option>
                                <option value="video">Video (Simulated)</option>
                                <option value="menu_promo">Menu Promotion</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (seconds)</label>
                            <Input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} min="1" required />
                        </div>
                    </div>
                    {type === 'image' && (
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Image URL</label>
                            <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://example.com/image.jpg" required />
                        </div>
                    )}
                    {type === 'video' && (
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Video URL (Not functional)</label>
                            <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://example.com/video.mp4" />
                        </div>
                    )}
                    {type === 'menu_promo' && (
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Select Menu Items</label>
                            <div className="max-h-40 overflow-y-auto bg-secondary p-2 rounded-md border border-border">
                                {menuItems.map((item: MenuItem) => (
                                    <label key={item.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted">
                                        <input
                                            type="checkbox"
                                            checked={selectedMenuItemIds.includes(item.id)}
                                            onChange={() => handleMenuItemToggle(item.id)}
                                        />
                                        {item.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Content</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SignageContentEditModal;
