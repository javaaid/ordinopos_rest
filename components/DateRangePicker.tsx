import React, { useState } from 'react';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onDateChange: (start: Date, end: Date) => void;
}

type Preset = 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'last_month';

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onDateChange }) => {
    
    const [activePreset, setActivePreset] = useState<Preset | 'custom'>('7days');
    
    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

    const handlePresetClick = (preset: Preset) => {
        let end = new Date();
        end.setHours(23, 59, 59, 999);
        let start = new Date();
        start.setHours(0, 0, 0, 0);

        switch (preset) {
            case 'today':
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case '7days':
                start.setDate(start.getDate() - 6);
                break;
            case '30days':
                start.setDate(start.getDate() - 29);
                break;
            case 'month':
                start.setDate(1);
                break;
            case 'last_month':
                start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
                end = new Date(end.getFullYear(), end.getMonth(), 0);
                end.setHours(23, 59, 59, 999);
                break;
        }
        setActivePreset(preset);
        onDateChange(start, end);
    };
    
    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
        const newDate = new Date(e.target.value);
        const timezoneOffset = newDate.getTimezoneOffset() * 60000;
        const localDate = new Date(newDate.getTime() + timezoneOffset);

        setActivePreset('custom');
        if (type === 'start') {
            onDateChange(localDate, endDate);
        } else {
            onDateChange(startDate, localDate);
        }
    }
     
    return (
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Date Range:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={() => handlePresetClick('today')} variant={activePreset === 'today' ? 'default' : 'secondary'} size="sm">Today</Button>
                <Button onClick={() => handlePresetClick('yesterday')} variant={activePreset === 'yesterday' ? 'default' : 'secondary'} size="sm">Yesterday</Button>
                <Button onClick={() => handlePresetClick('7days')} variant={activePreset === '7days' ? 'default' : 'secondary'} size="sm">Last 7 Days</Button>
                <Button onClick={() => handlePresetClick('month')} variant={activePreset === 'month' ? 'default' : 'secondary'} size="sm">This Month</Button>
            </div>
            <div className="flex items-center gap-2">
                 <Input
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={(e) => handleDateInputChange(e, 'start')}
                    className="h-9"
                 />
                 <span className="text-muted-foreground">-</span>
                 <Input
                    type="date"
                    value={formatDateForInput(endDate)}
                    onChange={(e) => handleDateInputChange(e, 'end')}
                    max={formatDateForInput(new Date())}
                    className="h-9"
                 />
            </div>
        </div>
    );
};

export default DateRangePicker;