


import React from 'react';
import ArrowsUpDownIcon from './icons/ArrowsUpDownIcon';
import SparklesIcon from './icons/SparklesIcon';
import BellAlertIcon from './icons/BellAlertIcon';
import StarIcon from './icons/StarIcon';
import UsersIcon from './icons/UsersIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';

const BIView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-2">Business Intelligence (BI) Features</h2>
      <p className="text-sm text-muted-foreground mb-6">Leverage data to make smarter decisions. Here are some key BI capabilities:</p>

      <div className="space-y-4">
        <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-4 border border-border">
          <div className="bg-background p-2 rounded-lg mt-1 border border-border">
            <ArrowsUpDownIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Customizable Dashboards</h3>
            <p className="text-sm text-muted-foreground">
              Tailor your main Sales Dashboard to fit your needs. Click the 'Customize' button to show, hide, and re-order widgets like 'Sales Trend' and 'Top Selling Items'. Drag and drop widgets to create the view that works best for you.
            </p>
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-4 border border-border">
          <div className="bg-background p-2 rounded-lg mt-1 border border-border">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">AI-Powered Summaries</h3>
            <p className="text-sm text-muted-foreground">
              Many reports, like Menu Performance and Staff Sales, feature an AI-powered analysis at the top. This gives you a quick, actionable summary of the data, highlighting key insights and recommendations without needing to manually dig through numbers.
            </p>
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-4 border border-border">
           <div className="bg-background p-2 rounded-lg mt-1 border border-border">
            <BellAlertIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Proactive Alerts (Pro Feature)</h3>
            <p className="text-sm text-muted-foreground">
              Set up custom alerts to be notified of important events. Get an email or in-app notification for things like critically low stock on an ingredient, an unusual number of order voids by an employee, or when sales goals are met.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Often Overlooked Analytics</h3>
        <div className="space-y-4">
            <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-4 border border-border">
                <div className="bg-background p-2 rounded-lg mt-1 border border-border">
                    <StarIcon className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-foreground">Employee Sales Contest Dashboards</h3>
                    <p className="text-sm text-muted-foreground">
                    Gamify performance by creating dedicated dashboards for sales contests. Track metrics like total sales, upsells, or specific item sales in real-time to motivate staff and foster friendly competition.
                    </p>
                </div>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-4 border border-border">
                <div className="bg-background p-2 rounded-lg mt-1 border border-border">
                    <UsersIcon className="w-8 h-8 text-green-400" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-foreground">Customer Lifetime Value (CLV) Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                    Move beyond single-transaction analysis. Track the total revenue a customer generates over their entire relationship with your business to identify your most valuable patrons and tailor marketing efforts.
                    </p>
                </div>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg flex items-start gap-4 border border-border">
                <div className="bg-background p-2 rounded-lg mt-1 border border-border">
                    <GlobeAltIcon className="w-8 h-8 text-sky-400" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-foreground">Weather-Based Sales Trends</h3>
                    <p className="text-sm text-muted-foreground">
                    Correlate sales data with local weather patterns. Discover if rainy days boost soup sales or if sunny weather increases demand for iced coffee, allowing for more accurate inventory forecasting.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BIView;