
import React, { useState } from 'react';
import { ReportSchedule } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ScheduledReportsViewProps {
    schedules: ReportSchedule[];
    onAddSchedule: (schedule: Omit<ReportSchedule, 'id' | 'locationId'>) => void;
    onDeleteSchedule: (scheduleId: string) => void;
}

const ScheduledReportsView: React.FC<ScheduledReportsViewProps> = ({ schedules, onAddSchedule, onDeleteSchedule }) => {
    const [reportName, setReportName] = useState<'Daily Sales Summary' | 'Weekly Sales Summary'>('Daily Sales Summary');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [recipients, setRecipients] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipients.trim()) {
            alert('Please enter at least one recipient email.');
            return;
        }
        const recipientList = recipients.split(',').map(email => email.trim()).filter(Boolean);
        onAddSchedule({ reportName, frequency, recipients: recipientList });
        setRecipients('');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-6">Automatically email PDF reports to managers and stakeholders. (This is a simulation).</p>
            
            <form onSubmit={handleSubmit} className="bg-secondary p-4 rounded-lg mb-8 flex flex-wrap items-end gap-4">
                <div className="flex-grow">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Report</label>
                    <select value={reportName} onChange={(e) => setReportName(e.target.value as any)} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                        <option>Daily Sales Summary</option>
                        <option>Weekly Sales Summary</option>
                    </select>
                </div>
                <div className="flex-grow">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
                <div className="flex-grow-[2]">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Recipients (comma-separated emails)</label>
                    <input type="text" value={recipients} onChange={e => setRecipients(e.target.value)} placeholder="manager@example.com, owner@example.com" className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" />
                </div>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors">Add Schedule</button>
            </form>

            <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Current Schedules</h3>
                {schedules.length > 0 ? (
                    <div className="space-y-3">
                        {schedules.map(schedule => (
                            <div key={schedule.id} className="bg-secondary p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-foreground">{schedule.reportName}</p>
                                    <p className="text-sm text-muted-foreground">Sent <span className="capitalize">{schedule.frequency}</span> to: {schedule.recipients.join(', ')}</p>
                                </div>
                                <button onClick={() => onDeleteSchedule(schedule.id)} className="text-destructive hover:opacity-80 p-2 rounded-md hover:bg-destructive/10">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No reports are scheduled for this location.</p>
                )}
            </div>
        </div>
    );
};

export default ScheduledReportsView;
