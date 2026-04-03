import React, { useState } from 'react';
import { Department, PrimeType } from '../models';
import { Plus, Trash2 } from 'lucide-react';

interface PrimeRuleBuilderProps {
  types: PrimeType[];
  departments: Department[];
  onSave: (rule: any) => void;
  onCancel: () => void;
}

export function PrimeRuleBuilder({ types, departments, onSave, onCancel }: PrimeRuleBuilderProps) {
  const [rule, setRule] = useState({
    primeTypeId: '',
    departmentId: '',
    conditionField: '',
    conditionType: '>',
    targetValue: '',
    calculationMethod: 'Fixed',
    amount: '',
    period: 'Monthly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(rule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Prime Type</label>
          <select 
            className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-app text-primary" 
            required
            value={rule.primeTypeId}
            onChange={e => setRule({...rule, primeTypeId: e.target.value})}
          >
            <option value="">Select a type</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Department</label>
          <select 
            className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-app text-primary"
            value={rule.departmentId}
            onChange={e => setRule({...rule, departmentId: e.target.value})}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-app p-4 rounded-xl border border-default space-y-4">
        <h4 className="text-sm font-semibold text-primary">Condition</h4>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full sm:w-1/3">
            <select 
              className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-card text-primary"
              required
              value={rule.conditionField}
              onChange={e => setRule({...rule, conditionField: e.target.value})}
            >
              <option value="">Select Field</option>
              <option value="tickets_resolved">Tickets Resolved</option>
              <option value="csat_score">CSAT Score</option>
              <option value="errors">Errors</option>
              <option value="attendance_rate">Attendance Rate</option>
            </select>
          </div>
          <div className="w-full sm:w-1/4">
            <select 
              className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-card text-primary"
              required
              value={rule.conditionType}
              onChange={e => setRule({...rule, conditionType: e.target.value})}
            >
              <option value=">">Greater than (&gt;)</option>
              <option value="<">Less than (&lt;)</option>
              <option value=">=">Greater or equal (&gt;=)</option>
              <option value="<=">Less or equal (&lt;=)</option>
              <option value="==">Equals (==)</option>
            </select>
          </div>
          <div className="w-full sm:w-1/3">
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-card text-primary placeholder:text-muted" 
              placeholder="Target value" 
              required 
              value={rule.targetValue}
              onChange={e => setRule({...rule, targetValue: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-app p-4 rounded-xl border border-default space-y-4">
        <h4 className="text-sm font-semibold text-primary">Reward</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Method</label>
            <select 
              className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-card text-primary"
              required
              value={rule.calculationMethod}
              onChange={e => setRule({...rule, calculationMethod: e.target.value})}
            >
              <option value="Fixed">Fixed Amount</option>
              <option value="Percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Amount / %</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-card text-primary placeholder:text-muted" 
              placeholder="e.g. 300" 
              required 
              value={rule.amount}
              onChange={e => setRule({...rule, amount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Period</label>
            <select 
              className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-card text-primary"
              required
              value={rule.period}
              onChange={e => setRule({...rule, period: e.target.value})}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-primary hover:bg-app rounded-lg font-medium transition-colors border border-default">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
          Save Rule
        </button>
      </div>
    </form>
  );
}
