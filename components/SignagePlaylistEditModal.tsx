import React, { useState, useEffect, useMemo } from 'react';
import { SignagePlaylist, SignageContentItem } from '../types';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface SignagePlaylistEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playlist: SignagePlaylist) => void;
  playlist: SignagePlaylist | null;
}

const SignagePlaylistEditModal: React.FC<SignagePlaylistEditModalProps> = ({ isOpen, onClose, onSave, playlist }) => {
    const { signageContent } = useDataContext();
    const [name, setName] = useState('');
    const [itemIds, setItemIds] = useState<string[]>([]);

    useEffect(() => {
        if (playlist) {
            setName(playlist.name);
            setItemIds(playlist.items);
        } else {
            setName('');
            setItemIds([]);
        }
    }, [playlist, isOpen]);

    const availableContent = useMemo(() => {
        return signageContent.filter((c: SignageContentItem) => !itemIds.includes(c.id));
    }, [signageContent, itemIds]);

    const playlistItems = useMemo(() => {
        return itemIds.map(id => signageContent.find((c: SignageContentItem) => c.id === id)).filter(Boolean);
    }, [itemIds, signageContent]);

    const handleAddItem = (id: string) => {
        setItemIds(prev => [...prev, id]);
    };

    const handleRemoveItem = (id: string) => {
        setItemIds(prev => prev.filter(itemId => itemId !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: playlist?.id || `pl_${Date.now()}`,
            name,
            items: itemIds,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{playlist ? 'Edit Playlist' : 'Add New Playlist'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Playlist Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 h-64">
                        <div className="flex flex-col">
                            <h4 className="font-semibold text-foreground mb-2">Available Content</h4>
                            <div className="bg-secondary p-2 rounded-md border border-border flex-grow overflow-y-auto">
                                {availableContent.map((item: SignageContentItem) => (
                                    <button key={item.id} type="button" onClick={() => handleAddItem(item.id)} className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-semibold text-foreground mb-2">In Playlist</h4>
                            <div className="bg-secondary p-2 rounded-md border border-border flex-grow overflow-y-auto">
                                {playlistItems.map((item: any) => (
                                    <button key={item.id} type="button" onClick={() => handleRemoveItem(item.id)} className="w-full text-left p-2 rounded hover:bg-muted text-sm">
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Playlist</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SignagePlaylistEditModal;
