

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AIReportAnalysis } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface AIReportSummaryProps {
    reportData: any[]; // Use any[] for generic data
    isEnabled: boolean;
}

const AIReportSummary: React.FC<AIReportSummaryProps> = ({ reportData, isEnabled }) => {
    const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reportDataJSON = useMemo(() => JSON.stringify(reportData.slice(0, 20)), [reportData]);

    useEffect(() => {
        if (!isEnabled || reportData.length === 0) {
            setAnalysis(null);
            return;
        }

        const fetchAnalysis = async () => {
            setIsLoading(true);
            setError(null);
            setAnalysis(null);

            try {
                if (!process.env.API_KEY) {
                    throw new Error("API Key not found.");
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const prompt = `Analyze the following menu performance data. The data is sorted by revenue descending. Provide a very brief, high-level summary (1 sentence), one key positive insight (1 sentence), and one actionable recommendation (1 sentence) based on the data. Focus on top and bottom performers. Data: ${reportDataJSON}`;

                const response = await ai.models.generateContent({
                    // FIX: Use recommended model 'gemini-2.5-flash' instead of deprecated 'gemini-1.5-flash'.
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING, description: 'A brief, high-level summary of the report.' },
                                positiveInsight: { type: Type.STRING, description: 'A key positive insight from the data.' },
                                actionableRecommendation: { type: Type.STRING, description: 'An actionable recommendation based on the data.' },
                            },
                            required: ['summary', 'positiveInsight', 'actionableRecommendation']
                        }
                    }
                });
                
                const parsedJson = JSON.parse(response.text) as AIReportAnalysis;
                setAnalysis(parsedJson);

            } catch (err) {
                console.error("AI analysis failed:", err);
                setError("Failed to generate AI analysis.");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchAnalysis, 500);
        return () => clearTimeout(timeoutId);

    }, [reportDataJSON, isEnabled]);

    if (!isEnabled) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="bg-secondary rounded-lg p-4 mb-6 animate-pulse no-print">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-5 h-5" />
                    Generating AI Analysis...
                </h3>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
        );
    }
    
    if (error && !isLoading) {
         return (
             <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 no-print">
                <p className="text-destructive text-sm">{error}</p>
             </div>
         )
    }

    if (!analysis) {
        return null;
    }

    return (
        <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-4 mb-6 no-print">
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6" />
                AI-Powered Analysis
            </h3>
            <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                    <LightBulbIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-foreground">Summary:</strong>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <CheckBadgeIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-foreground">Positive Insight:</strong>
                        <p className="text-muted-foreground">{analysis.positiveInsight}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-foreground">Actionable Recommendation:</strong>
                        <p className="text-muted-foreground">{analysis.actionableRecommendation}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIReportSummary;