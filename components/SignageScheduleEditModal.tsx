import React, { useState, useEffect } from 'react';
import { SignageScheduleEntry, SignageDisplay, SignagePlaylist } from '../types';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';

interface SignageScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: SignageScheduleEntry) => void;
  schedule: SignageScheduleEntry | null;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SignageScheduleEditModal: React.FC<SignageScheduleEditModalProps> = ({ isOpen, onClose, onSave, schedule }) => {
    const { signageDisplays, signagePlaylists } = useDataContext();
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
                    <ModalTitle>{schedule ? 'Edit Schedule' : 'Add New Schedule'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Display</label>
                        <Select value={displayId} onChange={e => setDisplayId(e.target.value)} required>
                            {signageDisplays.map((d: SignageDisplay) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Playlist</label>
                        <Select value={playlistId} onChange={e => setPlaylistId(e.target.value)} required>
                            {signagePlaylists.map((p: SignagePlaylist) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Day of Week</label>
                        <Select value={dayOfWeek} onChange={e => setDayOfWeek(parseInt(e.target.value))} required>
                            {DAYS_OF_WEEK.map((day, index) => <option key={index} value={index}>{day}</option>)}
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Start Time</label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">End Time</label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Schedule</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SignageScheduleEditModal;
