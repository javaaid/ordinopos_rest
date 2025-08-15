
import React, { useState, useRef, useEffect } from 'react';
import { SimulationLogEntry, SimulationReport } from '../types';
import BeakerIcon from './icons/BeakerIcon';
import ForwardIcon from './icons/ForwardIcon';

interface TrainingSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (orderCount: number, duration: number) => void;
    status: 'idle' | 'running' | 'complete';
    log: SimulationLogEntry[];
    report: SimulationReport | null;
}

const TrainingSimulationModal: React.FC<TrainingSimulationModalProps> = ({ isOpen, onClose, onStart, status, log, report }) => {
    const [orderCount, setOrderCount] = useState(100);
    const [duration, setDuration] = useState(60);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log]);

    if (!isOpen) return null;

    const handleStart = () => {
        onStart(orderCount, duration);
    };

    const renderConfigScreen = () => (
        <>
            <div className="p-6">
                <p className="text-muted-foreground mb-6">
                    Configure and run a peak-hour simulation to stress test the system and hardware connections (e.g., printers).
                    The system will rapidly create training orders to mimic a high-volume scenario.
                </p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="order-count" className="block text-sm font-medium text-muted-foreground mb-1">Number of Orders to Create</label>
                        <input
                            type="number"
                            id="order-count"
                            value={orderCount}
                            onChange={(e) => setOrderCount(Math.max(10, parseInt(e.target.value, 10)))}
                            className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
                            min="10"
                            step="10"
                        />
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-muted-foreground mb-1">Simulation Duration (seconds)</label>
                        <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value, 10)))}
                            className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
                            min="5"
                            step="5"
                        />
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
                <button
                    onClick={handleStart}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-primary/20"
                >
                    <ForwardIcon className="w-5 h-5" />
                    Start Simulation
                </button>
            </div>
        </>
    );
    
    const renderProgressScreen = () => {
        const progress = log.filter(l => l.message.includes('Created Order')).length;
        const progressPercent = (progress / orderCount) * 100;
        return (
             <>
                <div className="p-6">
                    <p className="text-muted-foreground mb-2">Simulation in progress...</p>
                    <div className="w-full bg-muted rounded-full h-4 mb-4">
                        <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div ref={logContainerRef} className="h-64 bg-background rounded-md p-3 font-mono text-xs text-muted-foreground overflow-y-auto border border-border">
                        {log.map(entry => (
                            <div key={entry.timestamp}>
                                <span className="text-muted-foreground/50 mr-2">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                <span>{entry.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )
    };
    
    const renderReportScreen = () => (
         <>
            <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Simulation Complete</h3>
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                    <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Orders Created</p>
                        <p className="text-3xl font-bold text-foreground">{report?.totalOrders}</p>
                    </div>
                     <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Orders Per Minute (OPM)</p>
                        <p className="text-3xl font-bold text-foreground">{report?.ordersPerMinute.toFixed(1)}</p>
                    </div>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Hardware Usage (Print Jobs)</h4>
                <div className="space-y-2">
                    {report && Object.entries(report.printerJobs).map(([printerName, jobCount]) => (
                        <div key={printerName} className="flex justify-between items-center bg-secondary p-3 rounded-md">
                            <span className="text-muted-foreground">{printerName}</span>
                            <span className="font-mono font-bold text-foreground bg-muted px-2 py-1 rounded-md">{jobCount} jobs</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
                <button
                    onClick={onClose}
                    className="bg-secondary hover:bg-muted text-secondary-foreground font-semibold py-2 px-4 rounded-lg"
                >
                    Close
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-background/70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl border border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <BeakerIcon className="w-8 h-8 text-primary" />
                        Training & Simulation Hub
                    </h2>
                </div>
                {status === 'idle' && renderConfigScreen()}
                {status === 'running' && renderProgressScreen()}
                {status === 'complete' && renderReportScreen()}
            </div>
        </div>
    );
};

export default TrainingSimulationModal;
