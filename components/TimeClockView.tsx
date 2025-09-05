import React, { useState, useMemo } from 'react';
import { Employee, Shift, ScheduleEntry } from '../types';
import ClockIcon from './icons/ClockIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const TimeClockView: React.FC = () => {
    const { currentEmployee, settings } = useAppContext();
    const { employees: allEmployees, schedule, onToggleClockStatus, onSaveScheduleEntry, onDeleteScheduleEntry } = useDataContext();
    const t = useTranslations(settings.language.staff);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentEmployee?.id || '');

    const selectedEmployee = useMemo(() => {
        return allEmployees.find((e: Employee) => e.id === selectedEmployeeId);
    }, [selectedEmployeeId, allEmployees]);
    
    if (!currentEmployee) return null;

    const renderPersonalTimeClock = () => {
        const lastShift = currentEmployee.shifts[currentEmployee.shifts.length - 1];
        const isClockedIn = currentEmployee.shiftStatus === 'clocked-in';

        return (
            <div className="bg-card p-6 rounded-lg text-center border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('myTimeClock')}</h3>
                <button
                    onClick={() => onToggleClockStatus(currentEmployee.id)}
                    className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                        isClockedIn ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                >
                    {isClockedIn ? t('clockOut') : t('clockIn')}
                </button>
                 {isClockedIn && lastShift && (
                     <p className="text-muted-foreground text-sm mt-4">
                         {t('clockedInSince')} {new Date(lastShift.clockIn).toLocaleTimeString()}
                    </p>
                 )}
            </div>
        )
    };
    
    const renderTimesheetEditor = () => {
        const shifts = selectedEmployee?.shifts.slice().reverse() || [];
        return (
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">{t('timesheetFor')}</h3>
                <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full bg-secondary p-2 rounded-md mb-4 border border-border text-foreground">
                    {allEmployees.map((e: Employee) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {shifts.map((shift, i) => (
                        <div key={i} className="bg-muted p-3 rounded-md flex justify-between items-center text-sm">
                            <p className="font-semibold text-foreground">{new Date(shift.clockIn).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                                {new Date(shift.clockIn).toLocaleTimeString()} - {shift.clockOut ? new Date(shift.clockOut).toLocaleTimeString() : 'Ongoing'}
                            </p>
                        </div>
                    ))}
                    {shifts.length === 0 && <p className="text-muted-foreground text-center py-4">{t('noShiftsRecorded')}</p>}
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('timeClockScheduling')}</h1>
            <p className="text-muted-foreground mb-6 -mt-1 text-sm">{t('timeClockDescription')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {renderPersonalTimeClock()}
                    {currentEmployee.roleId !== 'role_cashier' && renderTimesheetEditor()}
                </div>
                <div className="lg:col-span-2 bg-card p-6 rounded-lg border border-border">
                     <h3 className="text-xl font-bold text-foreground mb-4">{t('weeklySchedule')}</h3>
                     {/* Schedule component would go here */}
                     <p className="text-muted-foreground">{t('weeklyScheduleComingSoon')}</p>
                </div>
            </div>
        </div>
    );
};

export default TimeClockView;