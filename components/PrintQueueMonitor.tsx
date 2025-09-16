import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { useAppContext, useDataContext, useToastContext } from '../contexts/AppContext';
import { PrintJob, PrintJobStatus, Printer, Employee, Table } from '../types';
import { cn, getErrorMessage } from '../lib/utils';
import PrinterIcon from './icons/PrinterIcon';
import XMarkIcon from './icons/XMarkIcon';
import PauseIcon from './icons/PauseIcon';
import PlayIcon from './icons/PlayIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon';
import ClockIcon from './icons/ClockIcon';
import { Button } from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';

// Import printable components
import { KitchenReceiptContent } from './KitchenReceiptContent';
import TemplateRenderer from './receipt-templates/TemplateRenderer';
import A4Invoice from './A4Invoice';

const componentMap: { [key: string]: React.FC<any> } = {
    KitchenReceiptContent,
    TemplateRenderer,
    A4Invoice,
};

const PrintableContent: React.FC<{ job: PrintJob; employees: Employee[]; tables: Table[] }> = ({ job, employees, tables }) => {
    const Component = componentMap[job.component];
    let contentToPrint = null;
    
    const allProps = { ...job.props, employees, tables };

    if (job.component === 'KitchenReceiptContent') {
        contentToPrint = <div id="kitchen-receipt-printable-area"><Component {...allProps} /></div>;
    } else if (job.component === 'TemplateRenderer') {
        contentToPrint = <div id="receipt-printable-area"><Component {...allProps} /></div>;
    } else if (job.component === 'A4Invoice') {
        contentToPrint = <Component {...allProps} />;
    }

    return <div className="printable-area-container">{contentToPrint}</div>;
};

const PrintJobProcessor: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
    const { printQueue, updatePrintJobStatus, settings } = useAppContext();
    const { addToast } = useToastContext();
    const { printers, employees, tables } = useDataContext();
    const [currentlyPrintingJob, setCurrentlyPrintingJob] = useState<PrintJob | null>(null);
    const isPrintingRef = useRef(false);
    const printContainer = document.getElementById('print-root');

     useEffect(() => {
        const jobToPrint = (printQueue || []).find((job: PrintJob) => job.status === 'pending');
        
        if (jobToPrint && !isPrintingRef.current && !isPaused) {
            isPrintingRef.current = true;
            updatePrintJobStatus(jobToPrint.id, 'printing');
            setCurrentlyPrintingJob(jobToPrint);
        }
    }, [printQueue, isPaused, updatePrintJobStatus]);
    
    useEffect(() => {
        if (!currentlyPrintingJob || !printContainer) return;
        
        const processJob = async () => {
            const { component, props } = currentlyPrintingJob;
            const targetPrinterId = props.order?.kitchenPrinterId || settings.devices.receiptPrinterId;
            const printer: Printer | undefined = (printers || []).find((p: Printer) => p.id === targetPrinterId);
            
            if (printer?.connection === 'Print Server' && settings.devices.printServerUrl) {
                const htmlString = renderToString(<PrintableContent job={currentlyPrintingJob} employees={employees} tables={tables} />);
                const base64Data = btoa(unescape(encodeURIComponent(htmlString)));
                
                try {
                    let fullUrl = settings.devices.printServerUrl;
                    if (!/^https?:\/\//i.test(fullUrl)) {
                        fullUrl = 'http://' + fullUrl;
                    }
                    const printUrl = new URL('/print', fullUrl).toString();
                    
                    const response = await fetch(printUrl, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ printer: printer.name, data: base64Data }),
                        signal: AbortSignal.timeout(5000)
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
                        const errorText = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
                        throw new Error(errorText || `HTTP error! Status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    if (result.success) {
                        updatePrintJobStatus(currentlyPrintingJob.id, 'completed');
                        addToast({type: 'success', title: 'Print Successful', message: `Job for ${printer.name} sent.`});
                    } else {
                        throw new Error(getErrorMessage(result.error) || 'Print server returned an unspecified error.');
                    }
                } catch (error: any) {
                    const errorMessage = getErrorMessage(error);
                    let message = `Could not connect to ${printer.name}. Job remains in queue.`;

                    if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
                        message = `Print Server connection failed for ${printer.name}. Check URL, CORS settings, and ensure it's running. See guide in Device Settings.`;
                    } else {
                        message = `Print job for ${printer.name} failed: ${errorMessage}`;
                    }

                    console.error("Print Server job failed:", {
                        error: errorMessage,
                        printerName: printer.name,
                        url: settings.devices.printServerUrl
                    });
                    addToast({type: 'error', title: 'Print Server job failed', message: message});
                    updatePrintJobStatus(currentlyPrintingJob.id, 'error');
                } finally {
                    setCurrentlyPrintingJob(null);
                    isPrintingRef.current = false;
                }
            } else {
                const handleAfterPrint = () => {
                    window.removeEventListener('afterprint', handleAfterPrint);
                    updatePrintJobStatus(currentlyPrintingJob.id, 'completed');
                    setCurrentlyPrintingJob(null);
                    isPrintingRef.current = false;
                };
                window.addEventListener('afterprint', handleAfterPrint);

                setTimeout(() => {
                    try { window.print(); } catch (e) {
                        console.error("Print failed:", e);
                        updatePrintJobStatus(currentlyPrintingJob.id, 'error');
                        setCurrentlyPrintingJob(null);
                        isPrintingRef.current = false;
                    }
                }, 150);
            }
        };

        processJob();

    }, [currentlyPrintingJob, printContainer, printers, settings.devices, updatePrintJobStatus, addToast, employees, tables]);


    if (!currentlyPrintingJob || !printContainer) {
        return null;
    }
    
    const printer = (printers || []).find((p: Printer) => p.id === (currentlyPrintingJob.props.order?.kitchenPrinterId || settings.devices.receiptPrinterId));
    if (printer?.connection === 'Print Server') {
        return null;
    }

    return createPortal(<PrintableContent job={currentlyPrintingJob} employees={employees} tables={tables} />, printContainer);
};

const getJobName = (job: PrintJob) => {
    if (job.component === 'KitchenReceiptContent' || job.component === 'TemplateRenderer') {
        const orderNumber = job.props.order?.orderNumber;
        const type = job.component === 'KitchenReceiptContent' ? 'Kitchen Ticket' : 'Receipt';
        return `${type} #${orderNumber}`;
    }
    if (job.component === 'A4Invoice') {
        return `Invoice #${job.props.order?.invoiceNumber}`;
    }
    return 'Unknown Print Job';
};

const statusIcons: Record<PrintJobStatus, React.ReactNode> = {
    pending: <ClockIcon className="w-5 h-5 text-yellow-400" />,
    printing: <PrinterIcon className="w-5 h-5 text-blue-400 animate-pulse" />,
    completed: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    error: <ExclamationCircleIcon className="w-5 h-5 text-red-400" />,
};

const PrintQueueMonitor: React.FC = () => {
    const { printQueue, clearPrintQueue, settings, updatePrintJobStatus } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const t = useTranslations(settings.language.staff);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dragInfoRef = useRef({
        isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false,
    });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragInfoRef.current.isDragging) return;
        const dx = e.clientX - dragInfoRef.current.startX;
        const dy = e.clientY - dragInfoRef.current.startY;
        if (!dragInfoRef.current.hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) dragInfoRef.current.hasMoved = true;
        setPosition({ x: dragInfoRef.current.initialX + dx, y: dragInfoRef.current.initialY + dy });
    }, []);

    const handleMouseUp = useCallback(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (!dragInfoRef.current.hasMoved) setIsOpen(p => !p);
        dragInfoRef.current.isDragging = false;
    }, [handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;
        dragInfoRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y, hasMoved: false };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const pendingCount = (printQueue || []).filter((job: PrintJob) => job.status === 'pending' || job.status === 'error').length;

    return (
        <>
            <div
                className="fixed bottom-6 right-6 z-40"
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            >
                {isOpen && (
                    <div className="absolute bottom-0 right-0 w-80 max-h-[400px] bg-card border border-border rounded-lg shadow-2xl mb-20 flex flex-col animate-fade-in-up">
                        <header className="flex justify-between items-center p-3 border-b border-border shrink-0">
                            <h3 className="font-bold text-foreground">{t('print_queue')}</h3>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsPaused(p => !p)} title={isPaused ? "Resume" : "Pause"}>
                                    {isPaused ? <PlayIcon className="w-5 h-5"/> : <PauseIcon className="w-5 h-5"/>}
                                </Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={clearPrintQueue} title="Clear Queue">
                                    <TrashIcon className="w-5 h-5"/>
                                </Button>
                            </div>
                        </header>
                        <div className="flex-grow overflow-y-auto p-2">
                            {(printQueue || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center p-4">Print queue is empty.</p>
                            ) : (
                                <div className="space-y-2">
                                    {(printQueue || []).map((job: PrintJob) => (
                                        <div key={job.id} className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                                            <div className="shrink-0">{statusIcons[job.status]}</div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-semibold text-foreground">{getJobName(job)}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(job.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <Button 
                    size="icon" 
                    onMouseDown={handleMouseDown}
                    className="w-14 h-14 rounded-full shadow-lg cursor-grab active:cursor-grabbing"
                    aria-label="Toggle Print Queue"
                >
                    <PrinterIcon className="w-7 h-7" />
                    {pendingCount > 0 && <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-sm font-bold text-destructive-foreground">{pendingCount}</span>}
                </Button>
            </div>
            <PrintJobProcessor isPaused={isPaused} />
        </>
    );
};

export default PrintQueueMonitor;