
import React, { useState, useEffect } from 'react';
import { SignageScheduleEntry, SignageDisplay, SignagePlaylist, TranslationKey } from '../types';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { useTranslations } from '../hooks/useTranslations';

interface SignageScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: SignageScheduleEntry) => void;
  schedule: SignageScheduleEntry | null;
}

const DAYS_OF_WEEK_KEYS: TranslationKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const SignageScheduleEditModal: React.FC<SignageScheduleEditModalProps> = ({ isOpen, onClose, onSave, schedule }) => {
    const { signageDisplays, signagePlaylists, settings } = useDataContext();
    const t = useTranslations(settings.language.staff);
    const [displayId, setDisplayId] = useState('');
    const [playlistId, setPlaylistId] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    useEffect(() => {
        if (schedule) {
            setDisplayId(schedule.displayId);
            setPlaylistId(schedule.playlistId);
            setDayOfWeek(schedule.dayOfWeek);
            setStartTime(schedule.startTime);
            setEndTime(schedule.endTime);
        } else {
            setDisplayId(signageDisplays[0]?.id || '');
            setPlaylistId(signagePlaylists[0]?.id || '');
            setDayOfWeek(1);
            setStartTime('09:00');
            setEndTime('17:00');
        }
    }, [schedule, isOpen, signageDisplays, signagePlaylists]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: schedule?.id || `sch_${Date.now()}`,
            displayId,
            playlistId,
            dayOfWeek,
            startTime,
            endTime,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{schedule ? t('edit') : t('addNewSchedule')}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('display')}</label>
                        <Select value={displayId} onChange={e => setDisplayId(e.target.value)} required>
                            {signageDisplays.map((d: SignageDisplay) => <option key={d.id} value={d.id}>{t(d.name as TranslationKey)}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('playlist')}</label>
                        <Select value={playlistId} onChange={e => setPlaylistId(e.target.value)} required>
                            {signagePlaylists.map((p: SignagePlaylist) => <option key={p.id} value={p.id}>{t(p.name as TranslationKey)}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('dayOfWeek')}</label>
                        <Select value={dayOfWeek} onChange={e => setDayOfWeek(parseInt(e.target.value))} required>
                            {DAYS_OF_WEEK_KEYS.map((dayKey, index) => <option key={index} value={index}>{t(dayKey)}</option>)}
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('startTime')}</label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('endTime')}</label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('saveSchedule')}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SignageScheduleEditModal;
