import React, { useState, useMemo } from 'react';
import { Employee, Shift, ScheduleEntry } from '../types';
import ClockIcon from './icons/ClockIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from './ui/Button';

const TimeClockView: React.FC = () => {
    const { currentEmployee, settings } = useAppContext();
    const { employees: allEmployees, schedule, handleClockIn, handleClockOut, handleStartBreak, handleEndBreak, onSaveScheduleEntry, onDeleteScheduleEntry } = useDataContext();
    const t = useTranslations(settings.language.staff);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentEmployee?.id || '');

    const selectedEmployee = useMemo(() => {
        return (allEmployees || []).find((e: Employee) => e.id === selectedEmployeeId);
    }, [selectedEmployeeId, allEmployees]);
    
    if (!currentEmployee) return null;

    const renderPersonalTimeClock = () => {
        const { shiftStatus, shifts } = currentEmployee;
        const lastShift = shifts?.[shifts.length - 1];
        const lastBreak = lastShift?.breaks?.[lastShift.breaks.length - 1];

        let statusText;
        let statusColor;

        switch (shiftStatus) {
            case 'clocked-in':
                statusText = `${t('clockedInSince')} ${new Date(lastShift.clockIn).toLocaleTimeString()}`;
                statusColor = "text-green-500";
                break;
            case 'on-break':
                statusText = `On Break since ${new Date(lastBreak!.start).toLocaleTimeString()}`;
                statusColor = "text-yellow-500";
                break;
            default:
                statusText = "Clocked Out";
                statusColor = "text-red-500";
                break;
        }

        return (
            <div className="bg-card p-6 rounded-lg text-center border border-border">
                <h3 className="text-xl font-bold text-foreground mb-2">{t('myTimeClock')}</h3>
                <p className={`font-semibold mb-4 ${statusColor}`}>{statusText}</p>

                <div className="grid grid-cols-2 gap-3">
                    {shiftStatus === 'clocked-out' && (
                        <Button onClick={() => handleClockIn(currentEmployee.id)} className="col-span-2">
                            {t('clockIn')}
                        </Button>
                    )}
                    {shiftStatus === 'clocked-in' && (
                        <>
                            <Button onClick={() => handleStartBreak(currentEmployee.id)} variant="secondary">
                                Start Break
                            </Button>
                            <Button onClick={() => handleClockOut(currentEmployee.id)} variant="destructive">
                                {t('clockOut')}
                            </Button>
                        </>
                    )}
                    {shiftStatus === 'on-break' && (
                        <Button onClick={() => handleEndBreak(currentEmployee.id)} className="col-span-2">
                            End Break
                        </Button>
                    )}
                </div>
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