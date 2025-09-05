import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Order, MenuItem, Employee, AIExecutiveSummary, AISettings } from '../types';
import DocumentChartBarIcon from './icons/DocumentChartBarIcon';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';

const ExecutiveSummaryReport: React.FC<{ orders: Order[], menuItems: MenuItem[], employees: Employee[], startDate: Date, endDate: Date, aiSettings: AISettings }> = ({ orders, menuItems, employees, startDate, endDate, aiSettings }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [summary, setSummary] = useState<AIExecutiveSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dataSignature = useMemo(() => {
        return `${orders.length}-${menuItems.length}-${employees.length}-${startDate.getTime()}-${endDate.getTime()}`;
    }, [orders, menuItems, employees, startDate, endDate]);

    useEffect(() => {
        if (!aiSettings.enableAIFeatures || !aiSettings.enableReportAnalysis || orders.length === 0) {
            setSummary(null);
            setIsLoading(false);
            return;
        }

        const fetchSummary = async () => {
            setIsLoading(true);
            setError(null);
            setSummary(null);

            try {
                const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
                const salesByDay = orders.reduce((acc, o) => {
                    const day = new Date(o.createdAt).toLocaleDateString();
                    // FIX: Ensure arithmetic operation is on numbers (removed redundant Number() cast)
                    acc[day] = (acc[day] || 0) + o.total;
                    return acc;
                }, {} as Record<string, number>);
                const topDayArr = Object.entries(salesByDay).sort((a, b) => b[1] - a[1]);
                const topDay = topDayArr.length > 0 ? topDayArr[0] : null;
                
                const menuPerformance = orders.flatMap(o => o.cart).reduce((acc, item) => {
                    // FIX: Ensure arithmetic operation is on numbers (removed redundant Number() cast)
                    acc[item.menuItem.name] = (acc[item.menuItem.name] || 0) + (item.menuItem.price * item.quantity);
                    return acc;
                }, {} as Record<string, number>);
                const topItems = Object.entries(menuPerformance).sort((a, b) => b[1] - a[1]).slice(0, 3);
                
                const staffPerformance = orders.reduce((acc, o) => {
                    if (o.employeeId) {
                         // FIX: Ensure arithmetic operation is on numbers (removed redundant Number() cast)
                         acc[o.employeeId] = (acc[o.employeeId] || 0) + o.total;
                    }
                    return acc;
                }, {} as Record<string, number>);
                const topStaff = Object.entries(staffPerformance).sort((a,b)=>b[1]-a[1]).slice(0,1).map(([id, sales]) => ({
                    name: employees.find(e => e.id === id)?.name.replace(/\s\(.*\)/, ''),
                    sales
                }));

                const dataForPrompt = {
                    period: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
                    totalRevenue: totalRevenue.toFixed(2),
                    totalOrders: orders.length,
                    topSaleDay: topDay ? { day: topDay[0], amount: Number(topDay[1]).toFixed(2) } : null,
                    bestSellingItems: topItems.map(([name, revenue]) => ({ name, revenue: Number(revenue).toFixed(2) })),
                    topPerformingStaff: topStaff,
                };

                if (!process.env.API_KEY) throw new Error("API Key not found.");
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const prompt = `
                    Generate a concise, scannable executive summary for a restaurant manager based on the following data.
                    Format it like a final A4 report with clear sections.
                    - Data: ${JSON.stringify(dataForPrompt)}
                    - Create a title for the report.
                    - For salesSummary, mention total revenue and the top sales day.
                    - For menuInsights, mention the best-selling item and suggest a potential action, like a combo deal for other items.
                    - For staffPerformance, identify the top performer and suggest a reward.
                    Be brief and professional.
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: 'A title for the report, including the date range.' },
                                salesSummary: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Bullet points for sales summary.' },
                                menuInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Bullet points for menu insights.' },
                                staffPerformance: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Bullet points for staff performance.' },
                            },
                            required: ['title', 'salesSummary', 'menuInsights', 'staffPerformance']
                        }
                    }
                });

                setSummary(JSON.parse(response.text) as AIExecutiveSummary);

            } catch (err) {
                console.error("AI summary failed:", err);
                setError("Failed to generate AI executive summary.");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSummary, 500);
        return () => clearTimeout(timeoutId);

    }, [dataSignature, aiSettings, orders, employees, startDate, endDate]);
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-pulse">
                    <DocumentChartBarIcon className="w-16 h-16 mb-4" />
                    <p className="text-lg">Generating AI Executive Summary...</p>
                </div>
            );
        }

        if (error) {
            return <p className="text-center text-destructive">{error}</p>;
        }
        
        if (!summary) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>{t('noDataSummary')}</p>
                </div>
            );
        }

        const hr = <hr className="border-border my-6" />;
        
        return (
            <div className="font-sans max-w-2xl mx-auto text-foreground">
                <h2 className="text-2xl font-bold text-center text-foreground mb-2">{summary.title}</h2>
                <p className="text-sm text-center text-muted-foreground mb-6">Generated by ordino Pos AI</p>

                {hr}

                <h3 className="text-lg font-bold text-primary mb-3">Sales Summary</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {summary.salesSummary.map((point, i) => <li key={`sales-${i}`}>{point}</li>)}
                </ul>

                {hr}

                <h3 className="text-lg font-bold text-green-500 mb-3">Menu Insights</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {summary.menuInsights.map((point, i) => <li key={`menu-${i}`}>{point}</li>)}
                </ul>

                {hr}

                <h3 className="text-lg font-bold text-amber-500 mb-3">Staff Performance</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {summary.staffPerformance.map((point, i) => <li key={`staff-${i}`}>{point}</li>)}
                </ul>
                
                {hr}
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            {renderContent()}
        </div>
    );
};

export default ExecutiveSummaryReport;