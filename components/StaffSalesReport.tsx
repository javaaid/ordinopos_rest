
import React, { useMemo, useState, useEffect } from 'react';
import { Order, Employee, AIReportAnalysis, Location, AISettings } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import SparklesIcon from './icons/SparklesIcon';
import StarIcon from './icons/StarIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import LightBulbIcon from './icons/LightBulbIcon';

interface StaffStat {
    id: string;
    name: string;
    totalSales: number;
    upsellCount: number;
    locationId: string;
}

const AIStaffAnalysis: React.FC<{ reportData: StaffStat[], isEnabled: boolean }> = ({ reportData, isEnabled }) => {
    const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const dataSignature = useMemo(() => JSON.stringify(reportData.slice(0, 5)), [reportData]);

    useEffect(() => {
        if (!isEnabled || reportData.length < 1) {
            setAnalysis(null);
            return;
        }

        const fetchAnalysis = async () => {
            setIsLoading(true);
            setAnalysis(null);
            try {
                if (!process.env.API_KEY) throw new Error("API Key not found.");
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const topPerformer = reportData[0];
                const lowerPerformer = reportData.length > 1 ? reportData[reportData.length - 1] : topPerformer;

                const prompt = `
                    Analyze the following staff sales performance data for a restaurant manager.
                    Data is sorted by total sales. An "upsell" is an order with customizations.
                    - Top Performer: ${topPerformer.name} with $${topPerformer.totalSales.toFixed(0)} sales and ${topPerformer.upsellCount} upsells.
                    - Lower Performer: ${lowerPerformer.name} with $${lowerPerformer.totalSales.toFixed(0)} sales and ${lowerPerformer.upsellCount} upsells.
                    
                    Provide a brief summary (1 sentence), identify the top performer to reward (positiveInsight), and suggest a training opportunity (actionableRecommendation).
                    Example for positiveInsight: "Reward ${topPerformer.name} for leading sales and driving upsells."
                    Example for actionableRecommendation: "Offer ${lowerPerformer.name} coaching on upselling techniques to boost performance."
                `;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING, description: "Brief summary of team performance." },
                                positiveInsight: { type: Type.STRING, description: "The top performer to reward." },
                                actionableRecommendation: { type: Type.STRING, description: "A training opportunity." }
                            },
                            required: ['summary', 'positiveInsight', 'actionableRecommendation']
                        }
                    }
                });
                
                const parsedJson = JSON.parse(response.text) as AIReportAnalysis;
                setAnalysis(parsedJson);

            } catch (error) {
                console.error("AI staff analysis failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchAnalysis, 500);
        return () => clearTimeout(timeoutId);
    }, [dataSignature, isEnabled, reportData]);
    
    if (!isEnabled) return null;

    if (isLoading) {
        return <div className="no-print bg-secondary rounded-lg p-4 mb-6 animate-pulse">... Generating AI Insights ...</div>;
    }

    if (!analysis) return null;

    return (
        <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-4 mb-6 no-print">
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6" />
                AI-Powered Performance Review
            </h3>
            <div className="space-y-3 text-sm">
                 <div className="flex items-start gap-3">
                    <LightBulbIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div><strong className="text-foreground">Summary:</strong><p className="text-muted-foreground">{analysis.summary}</p></div>
                </div>
                <div className="flex items-start gap-3">
                    <StarIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div><strong className="text-foreground">Top Performer:</strong><p className="text-muted-foreground">{analysis.positiveInsight}</p></div>
                </div>
                 <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div><strong className="text-foreground">Training Opportunity:</strong><p className="text-muted-foreground">{analysis.actionableRecommendation}</p></div>
                </div>
            </div>
        </div>
    );
};


const StaffSalesReport: React.FC<{ orders: Order[], employees: Employee[], locations: Location[], currentLocationId: string, aiSettings: AISettings }> = ({ orders, employees, locations, currentLocationId, aiSettings }) => {
    
    const reportData = useMemo<StaffStat[]>(() => {
        const employeeMap = new Map<string, StaffStat>();
        const validOrders = (orders || []).filter(o => o.status !== 'refunded');

        (employees || []).forEach(emp => {
            employeeMap.set(emp.id, {
                id: emp.id,
                name: emp.name.replace(/\s\(.*\)/, ''),
                totalSales: 0,
                upsellCount: 0,
                locationId: emp.locationId,
            });
        });

        validOrders.forEach(order => {
            if (order.employeeId) {
                const stat = employeeMap.get(order.employeeId);
                if (stat) {
                    stat.totalSales += order.total;
                    const hasModifiers = order.cart.some(item => item.selectedModifiers.length > 0);
                    if (hasModifiers) {
                        stat.upsellCount += 1;
                    }
                }
            }
        });
        
        return Array.from(employeeMap.values()).sort((a,b) => b.totalSales - a.totalSales);
    }, [orders, employees]);

    const isAllLocationsView = currentLocationId === 'all_locations';
    
    return (
        <div className="w-full">
            <AIStaffAnalysis reportData={reportData} isEnabled={aiSettings.enableAIFeatures && aiSettings.enableReportAnalysis} />
            
            <div className="bg-card rounded-lg overflow-hidden border border-border">
                <ul className="divide-y divide-border">
                     <li className="p-4 flex items-center justify-between font-bold text-xs text-muted-foreground uppercase tracking-wider bg-muted/50">
                        <span className="pl-12">Employee</span>
                        <div className="flex items-center gap-8 text-right">
                             {isAllLocationsView && <span className="w-24 text-center">Location</span>}
                             <span className="w-28 text-center">Total Sales</span>
                             <span className="w-20 text-center">Upsells</span>
                        </div>
                    </li>
                    {reportData.map((empStat, index) => {
                        const employee = (employees || []).find(e => e.id === empStat.id);
                        return (
                            <li key={empStat.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground font-bold">{index + 1}</span>
                                    <img src={employee?.avatar} alt={empStat.name} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-semibold text-foreground">{empStat.name}</span>
                                </div>
                                <div className="flex items-center gap-8 text-right font-mono">
                                    {isAllLocationsView && <span className="w-24 text-center text-sm text-muted-foreground">{(locations || []).find(l => l.id === empStat.locationId)?.name}</span>}
                                    <span className="w-28 text-center text-lg font-bold text-green-600 dark:text-green-500">${empStat.totalSales.toFixed(2)}</span>
                                    <span className="w-20 text-center text-muted-foreground">{empStat.upsellCount}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default StaffSalesReport;
