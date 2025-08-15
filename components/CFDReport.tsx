

import React, { useMemo } from 'react';
import { Order } from '../types';
import TvIcon from './icons/TvIcon';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/Card';

interface CFDReportProps {
    orders: Order[];
}

const CFDReport: React.FC<CFDReportProps> = ({ orders }) => {

    const reportData = useMemo(() => {
        const completedOrders = (orders || []).filter(o => o.status === 'completed' || o.status === 'delivered' || o.status === 'out-for-delivery');
        const ordersWithEstimates = completedOrders.filter(o => o.estimatedWaitTime && o.completedAt);
        
        if (ordersWithEstimates.length === 0) {
            return { avgEstimatedMins: 0, avgActualMins: 0, accuracy: 0, ordersCount: 0 };
        }

        let totalEstimatedMins = 0;
        let totalActualMins = 0;
        
        ordersWithEstimates.forEach(o => {
            const estimateMatch = o.estimatedWaitTime!.match(/(\d+)/g);
            if (estimateMatch) {
                const estimateValues = estimateMatch.map(Number);
                const avgEstimate = estimateValues.reduce((sum, val) => sum + val, 0) / estimateValues.length;
                totalEstimatedMins += avgEstimate;
            }
            
            const actualMins = (o.completedAt! - o.createdAt) / 60000;
            totalActualMins += actualMins;
        });
        
        const count = ordersWithEstimates.length;
        const avgEstimatedMins = totalEstimatedMins / count;
        const avgActualMins = totalActualMins / count;
        const accuracy = avgEstimatedMins > 0 ? (1 - Math.abs(avgActualMins - avgEstimatedMins) / avgEstimatedMins) * 100 : 0;

        return {
            avgEstimatedMins,
            avgActualMins,
            accuracy,
            ordersCount: count,
        };
    }, [orders]);

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <TvIcon className="w-8 h-8"/>
                Customer-Facing Display Performance
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Analyze the performance and accuracy of CFD features.</p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader><CardDescription>Avg. AI Estimated Wait Time</CardDescription><CardTitle>{reportData.avgEstimatedMins.toFixed(1)} min</CardTitle></CardHeader>
                </Card>
                 <Card>
                    <CardHeader><CardDescription>Avg. Actual Kitchen Time</CardDescription><CardTitle>{reportData.avgActualMins.toFixed(1)} min</CardTitle></CardHeader>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardDescription>Wait Time Accuracy</CardDescription>
                        <CardTitle className={reportData.accuracy > 85 ? 'text-green-500' : 'text-yellow-500'}>
                            {reportData.accuracy.toFixed(1)}%
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {reportData.ordersCount === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                    <p>No completed orders with wait time estimates in this period.</p>
                </div>
            )}
        </div>
    );
};

export default CFDReport;
