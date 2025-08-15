
import React from 'react';
import { AIBusyZoneAnalysis } from '../types';
import WandSparklesIcon from './icons/WandSparklesIcon';
import XCircleIcon from './icons/XCircleIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface AIAnalysisPanelProps {
    title: string;
    analysis: AIBusyZoneAnalysis | null;
    isLoading: boolean;
    onClose: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ title, analysis, isLoading, onClose }) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="animate-pulse p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
            )
        }
        if (!analysis) {
             return <p className="text-muted-foreground p-4">No analysis available.</p>;
        }
        
        return (
            <div className="p-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                    <LightBulbIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-foreground">Summary:</strong>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                    </div>
                </div>
                {analysis.positivePoints && (
                    <div className="flex items-start gap-3">
                        <CheckBadgeIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-foreground">Hotspots / Positives:</strong>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {analysis.positivePoints.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
                 {analysis.recommendations && (
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-foreground">Recommendations:</strong>
                             <ul className="list-disc list-inside text-muted-foreground">
                                {analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="absolute top-4 right-4 w-96 bg-popover/80 backdrop-blur-sm rounded-lg shadow-2xl border border-border z-20">
            <div className="p-3 flex justify-between items-center border-b border-border">
                <h3 className="font-bold text-popover-foreground flex items-center gap-2">
                    <WandSparklesIcon className="w-5 h-5 text-primary" />
                    {title}
                </h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default AIAnalysisPanel;
