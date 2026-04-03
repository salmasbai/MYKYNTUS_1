import React, { useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { Activity, CheckCircle2, Save } from 'lucide-react';

export function ActivityInput() {
  const [formData, setFormData] = useState({
    ticketsProcessed: '',
    callsHandled: '',
    issuesResolved: '',
    csatScore: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Activity Input</h1>
          <p className="text-slate-500 mt-1">Submit your operational data for bonus calculation.</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-indigo-900">Current Period: March 2026</h4>
          <p className="text-sm text-indigo-700 mt-1">
            Please ensure all your activity data is submitted before the end of the month. Your performance bonuses will be calculated based on these metrics.
          </p>
        </div>
      </div>

      <PrimeCard title="Operational Metrics">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tickets Processed</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="e.g. 150" 
                required 
                value={formData.ticketsProcessed}
                onChange={e => setFormData({...formData, ticketsProcessed: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Total number of support tickets handled.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Calls Handled</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="e.g. 320" 
                required 
                value={formData.callsHandled}
                onChange={e => setFormData({...formData, callsHandled: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Total inbound and outbound calls.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issues Resolved (First Contact)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="e.g. 120" 
                required 
                value={formData.issuesResolved}
                onChange={e => setFormData({...formData, issuesResolved: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Issues resolved without escalation.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Average CSAT Score</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="5"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="e.g. 4.8" 
                required 
                value={formData.csatScore}
                onChange={e => setFormData({...formData, csatScore: e.target.value})}
              />
              <p className="text-xs text-slate-500 mt-1">Customer satisfaction score (0-5).</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {isSubmitted && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Activity data submitted successfully!
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Submit Data
            </button>
          </div>
        </form>
      </PrimeCard>
    </div>
  );
}
