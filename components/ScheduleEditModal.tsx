
import React, { useState } from 'react';
import { Employee, ScheduleEntry } from '../types';

interface ScheduleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<ScheduleEntry, 'id'>) => void;
    day: number;
    employees: Employee[];
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({ isOpen, onClose, onSave, day, employees }) => {
    const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            employeeId,
            dayOfWeek: day,
            startTime,
            endTime
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">Add Shift</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Employee</label>
                            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground">
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Start Time</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">End Time</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Shift</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleEditModal;