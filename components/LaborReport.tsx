import React, { useMemo } from 'react';
import { Employee, Shift } from '../types';

interface LaborReportProps {
    employees: Employee[];
}

interface ShiftRow {
    employeeName: string;
    shift: Shift;
}

const LaborReport: React.FC<LaborReportProps> = ({ employees }) => {

    const allShifts = useMemo<ShiftRow[]>(() => {
        const shifts: ShiftRow[] = [];
        employees.forEach(emp => {
            emp.shifts.forEach(shift => {
                shifts.push({
                    employeeName: emp.name,
                    shift: shift
                });
            });
        });
        // Sort by most recent clock-in time
        return shifts.sort((a, b) => b.shift.clockIn - a.shift.clockIn);
    }, [employees]);

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    }
    
    const calculateDuration = (shift: Shift) => {
        if (!shift.clockOut) {
            return "Ongoing";
        }
        const durationMs = shift.clockOut - shift.clockIn;
        const hours = durationMs / (1000 * 60 * 60);
        return `${hours.toFixed(2)} hrs`;
    }

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-4">Labor & Attendance Report</h2>
            <div className="overflow-x-auto bg-card rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className={thClass}>Employee</th>
                            <th className={thClass}>Date</th>
                            <th className={thClass}>Clock In</th>
                            <th className={thClass}>Clock Out</th>
                            <th className={thClass}>Duration</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {allShifts.map((row, index) => (
                            <tr key={`${row.employeeName}-${row.shift.clockIn}-${index}`} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{row.employeeName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(row.shift.clockIn)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-green-500 font-mono">{formatTime(row.shift.clockIn)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-red-500 font-mono">
                                    {row.shift.clockOut ? formatTime(row.shift.clockOut) : <span className="text-yellow-500">Clocked In</span>}
                                </td>
                                 <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-semibold">{calculateDuration(row.shift)}</td>
                            </tr>
                        ))}
                        {allShifts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted-foreground p-10">
                                    No shift data has been recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LaborReport;