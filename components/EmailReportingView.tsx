
import React from 'react';
import { ReportSchedule } from '../types';
import ScheduledReportsView from './ScheduledReportsView';
import { useDataContext } from '../contexts/AppContext';

const EmailReportingView: React.FC = () => {
    const { reportSchedules, handleAddReportSchedule, handleDeleteReportSchedule } = useDataContext();

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4">Email Reporting</h2>
            <ScheduledReportsView 
                schedules={reportSchedules}
                onAddSchedule={handleAddReportSchedule}
                onDeleteSchedule={handleDeleteReportSchedule}
            />
        </div>
    );
};

export default EmailReportingView;
