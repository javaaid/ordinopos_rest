
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SignageContentItem, SignagePlaylist, SignageDisplay, SignageScheduleEntry, MenuItem, SignageContentType, SignageSubView, AppSettings } from '../types';
import PhotoIcon from './icons/PhotoIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import TagIcon from './icons/TagIcon';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext, useAppContext } from '../contexts/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// #region --- Sub-components ---

const SignagePreview: React.FC<{
    content: SignageContentItem | null;
    menuItems?: MenuItem[];
    onNext: () => void;
}> = ({ content, menuItems, onNext }) => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!content) return;
        const duration = content.duration * 1000;
        const timer = setTimeout(onNext, duration);
        if (progressRef.current) {
            progressRef.current.style.animation = 'none';
            void progressRef.current.offsetWidth;
            progressRef.current.style.animation = `progress ${content.duration}s linear forwards`;
        }
        return () => clearTimeout(timer);
    }, [content, onNext]);

    return (
        <div className="bg-black aspect-video rounded-lg p-2 border-4 border-muted flex flex-col relative overflow-hidden">
            <style>{`@keyframes progress { from { width: 100%; } to { width: 0%; } }`}</style>
            {!content ? (
                <div className="flex-grow flex items-center justify-center text-muted-foreground">No content scheduled</div>
            ) : (
                <div className="flex-grow relative text-white flex items-center justify-center">
                    {content.type === 'image' && <img src={content.sourceUrl} alt={content.name} className="max-w-full max-h-full object-contain" />}
                    {content.type === 'video' && <div className="text-center"><VideoCameraIcon className="w-24 h-24 mx-auto" /><p>Simulating video: {content.name}</p></div>}
                    {content.type === 'menu_promo' && menuItems && menuItems.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-blue-900 to-purple-900 w-full h-full flex flex-col justify-center items-center overflow-y-auto">
                            <div className={`grid gap-4 items-center justify-center ${menuItems.length > 4 ? 'grid-cols-3' : (menuItems.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}`}>
                                {menuItems.map(menuItem => (
                                    <div key={menuItem.id} className="text-center animate-fade-in">
                                        <img src={menuItem.imageUrl} alt={menuItem.name} className="w-24 h-24 object-cover rounded-lg mx-auto mb-2 shadow-lg"/>
                                        <h3 className="text-xl font-bold">{menuItem.name}</h3>
                                        <p className="text-2xl font-bold text-amber-300">${menuItem.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
             <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/50">
                {content && <div ref={progressRef} className="h-full bg-primary" />}
            </div>
        </div>
    );
};

const TableRow: React.FC<{ children: React.ReactNode, onEdit: () => void, onDelete: () => void }> = ({ children, onEdit, onDelete }) => (
    <tr className="hover:bg-muted/50">
        {children}
        <td className="p-3 text-end">
            <div className="flex gap-2 justify-end">
                <button onClick={onEdit} className="text-primary hover:opacity-80"><PencilSquareIcon className="w-5 h-5"/></button>
                <button onClick={onDelete} className="text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </td>
    </tr>
);

const TableHeader: React.FC<{ headers: string[] }> = ({ headers }) => (
    <thead className="bg-muted/50 sticky top-0">
        <tr>
            {headers.map(h => <th key={h} className="p-3 text-start text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            <th className="p-3"></th>
        </tr>
    </thead>
);

// #endregion --- Sub-components ---

// #region --- Props & State Types ---

type ModalState = {
    type: 'content' | 'playlist' | 'display' | 'schedule';
    data: SignageContentItem | SignagePlaylist | SignageDisplay | SignageScheduleEntry | null;
};
// #endregion --- Props & State Types ---

const DigitalSignageView: React.FC = () => {
    const {
        signageContent, signagePlaylists, signageDisplays, signageSchedule, menuItems,
        handleSaveSignageContent, handleDeleteSignageContent, handleSaveSignagePlaylist, handleDeleteSignagePlaylist,
        handleSaveSignageDisplay, handleDeleteSignageDisplay, handleSaveSignageSchedule, handleDeleteSignageSchedule
    } = useDataContext();
    const { settings, setSettings: onSaveCfdSettings } = useAppContext();
    const { openModal, closeModal } = useModalContext();
    
    const [activeTab, setActiveTab] = useState<SignageSubView>('displays');
    
    // Preview state
    const [selectedDisplayId, setSelectedDisplayId] = useState<string>(signageDisplays[0]?.id || '');
    const [activeContentIndex, setActiveContentIndex] = useState(0);

    const currentPlaylist = useMemo(() => {
        if (!selectedDisplayId) return null;
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const activeSchedule = signageSchedule.find(s => 
            s.displayId === selectedDisplayId &&
            s.dayOfWeek === dayOfWeek &&
            s.startTime <= currentTime &&
            s.endTime >= currentTime
        );
        return activeSchedule ? signagePlaylists.find(p => p.id === activeSchedule.playlistId) : null;
    }, [selectedDisplayId, signageSchedule, signagePlaylists]);

    const playlistContent = useMemo(() => {
        if (!currentPlaylist) return [];
        return currentPlaylist.items.map(itemId => signageContent.find(c => c.id === itemId)).filter(Boolean) as SignageContentItem[];
    }, [currentPlaylist, signageContent]);

    useEffect(() => {
        setActiveContentIndex(0);
    }, [currentPlaylist]);

    const handleNextContent = () => {
        setActiveContentIndex(prev => (prev + 1) % (playlistContent.length || 1));
    };

    const currentContent = playlistContent[activeContentIndex];
    const currentMenuItems = useMemo(() => {
        if (currentContent?.type === 'menu_promo' && currentContent.menuItemIds) {
            return currentContent.menuItemIds.map(id => menuItems.find(m => m.id === id)).filter(Boolean) as MenuItem[];
        }
        return [];
    }, [currentContent, menuItems]);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'content': return (
                <div className="space-y-4">
                    <Button onClick={() => openModal('signageContentEdit', { onSave: handleSaveSignageContent })} className="flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Add Content</Button>
                    <table className="min-w-full bg-card rounded-lg"><TableHeader headers={['Name', 'Type', 'Duration']} />
                        <tbody className="divide-y divide-border">
                            {signageContent.map(c => <TableRow key={c.id} onEdit={() => openModal('signageContentEdit', { content: c, onSave: handleSaveSignageContent })} onDelete={() => handleDeleteSignageContent(c.id)}>
                                <td className="p-3 font-semibold">{c.name}</td><td className="p-3 capitalize">{c.type.replace('_', ' ')}</td><td className="p-3">{c.duration}s</td>
                            </TableRow>)}
                        </tbody>
                    </table>
                </div>
            );
            case 'playlists': return (
                 <div className="space-y-4">
                    <Button onClick={() => openModal('signagePlaylistEdit', { onSave: handleSaveSignagePlaylist })} className="flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Add Playlist</Button>
                    <table className="min-w-full bg-card rounded-lg"><TableHeader headers={['Name', 'Item Count']} />
                        <tbody className="divide-y divide-border">
                            {signagePlaylists.map(p => <TableRow key={p.id} onEdit={() => openModal('signagePlaylistEdit', { playlist: p, onSave: handleSaveSignagePlaylist })} onDelete={() => handleDeleteSignagePlaylist(p.id)}>
                                <td className="p-3 font-semibold">{p.name}</td><td className="p-3">{p.items.length}</td>
                            </TableRow>)}
                        </tbody>
                    </table>
                </div>
            );
            case 'scheduler': return (
                 <div className="space-y-4">
                    <Button onClick={() => openModal('signageScheduleEdit', { onSave: handleSaveSignageSchedule })} className="flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Add Schedule</Button>
                    <table className="min-w-full bg-card rounded-lg"><TableHeader headers={['Display', 'Playlist', 'Day', 'Time']} />
                        <tbody className="divide-y divide-border">
                            {signageSchedule.map(s => <TableRow key={s.id} onEdit={() => openModal('signageScheduleEdit', { schedule: s, onSave: handleSaveSignageSchedule })} onDelete={() => handleDeleteSignageSchedule(s.id)}>
                                <td className="p-3 font-semibold">{signageDisplays.find(d=>d.id===s.displayId)?.name}</td>
                                <td className="p-3">{signagePlaylists.find(p=>p.id===s.playlistId)?.name}</td>
                                <td className="p-3">{DAYS_OF_WEEK[s.dayOfWeek]}</td>
                                <td className="p-3">{s.startTime} - {s.endTime}</td>
                            </TableRow>)}
                        </tbody>
                    </table>
                </div>
            );
            case 'displays': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-foreground">Displays</h3>
                            <Button onClick={() => openModal('signageDisplayEdit', { onSave: handleSaveSignageDisplay })} size="sm" className="flex items-center gap-1"><PlusIcon className="w-4 h-4"/> Add</Button>
                        </div>
                        <div className="space-y-2">
                            {signageDisplays.map(d => <div key={d.id} className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${selectedDisplayId === d.id ? 'bg-primary' : 'bg-secondary'}`}>
                                <button onClick={() => setSelectedDisplayId(d.id)} className="flex-grow text-start font-semibold">{d.name}</button>
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center gap-2 text-xs font-bold ${d.status === 'online' ? 'text-green-500' : 'text-red-500'}`}><div className={`w-2 h-2 rounded-full ${d.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>{d.status.toUpperCase()}</span>
                                    <button onClick={() => openModal('signageDisplayEdit', { display: d, onSave: handleSaveSignageDisplay })} className="text-muted-foreground hover:text-foreground"><PencilSquareIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteSignageDisplay(d.id)} className="text-muted-foreground hover:text-destructive"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>)}
                        </div>
                    </div>
                    <div>
                         <h3 className="font-bold text-lg text-foreground mb-4">Live Preview</h3>
                         <SignagePreview content={currentContent} menuItems={currentMenuItems} onNext={handleNextContent} />
                         <div className="text-sm text-muted-foreground mt-2">
                             <p>Playing on: <span className="font-semibold text-foreground">{signageDisplays.find(d=>d.id===selectedDisplayId)?.name || 'N/A'}</span></p>
                             <p>Current Playlist: <span className="font-semibold text-foreground">{currentPlaylist?.name || 'None Scheduled'}</span></p>
                         </div>
                    </div>
                </div>
            );
            case 'cfd_attract': return (
                <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">CFD Attract Screen Settings</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Select a playlist to run on the Customer Facing Display when it's idle. You can create and manage playlists in the 'Playlists' tab.
                    </p>
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Active Playlist</label>
                        <Select
                            value={settings.cfd.attractScreenPlaylistId || ''}
                            onChange={e => {
                                onSaveCfdSettings({
                                    ...settings,
                                    cfd: {
                                        ...settings.cfd,
                                        attractScreenPlaylistId: e.target.value || null,
                                    }
                                })
                            }}
                        >
                            <option value="">-- No Attract Screen --</option>
                            {signagePlaylists.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </Select>
                         <Button
                            onClick={() => alert("CFD Settings Saved!")}
                            className="mt-4"
                        >
                            Save Settings
                        </Button>
                    </div>
                </div>
            );
        }
    };
    
    const tabButtonClass = (tab: SignageSubView) => `py-2 px-4 text-sm font-semibold rounded-md ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`;

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4">Digital Signage</h2>
            <div className="flex gap-2 border-b border-border mb-6 flex-wrap">
                <button onClick={() => setActiveTab('displays')} className={tabButtonClass('displays')}>Displays & Preview</button>
                <button onClick={() => setActiveTab('content')} className={tabButtonClass('content')}>Content Library</button>
                <button onClick={() => setActiveTab('playlists')} className={tabButtonClass('playlists')}>Playlists</button>
                <button onClick={() => setActiveTab('scheduler')} className={tabButtonClass('scheduler')}>Scheduler</button>
                 <button onClick={() => setActiveTab('cfd_attract')} className={tabButtonClass('cfd_attract')}>CFD Attract Screen</button>
            </div>
            <div className="flex-grow">{renderTabContent()}</div>
        </div>
    );
};

export default DigitalSignageView;