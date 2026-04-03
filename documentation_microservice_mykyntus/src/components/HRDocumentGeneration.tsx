import React from 'react';
import { ICONS, Role } from '../types';

export const HRDocumentGeneration: React.FC<{ role: Role }> = ({ role }) => {
  const canGenerate = role === 'RH' || role === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Document Generation</h3>
          <p className="text-sm text-slate-500">Manually generate documents for employees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-navy p-6 space-y-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Generation Form</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Select Employee</label>
              <select className="w-full bg-navy-800 border border-navy-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500">
                <option>Alice Johnson (Engineering)</option>
                <option>Bob Smith (Sales)</option>
                <option>Charlie Brown (HR)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Select Template</label>
              <select className="w-full bg-navy-800 border border-navy-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500">
                <option>Standard Work Certificate</option>
                <option>Salary Certificate (English)</option>
                <option>Employment Contract V2</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Effective Date</label>
              <input type="date" className="w-full bg-navy-800 border border-navy-700 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
            </div>
            <button
              type="button"
              disabled={!canGenerate}
              title={!canGenerate ? 'Accès refusé' : undefined}
              className={`w-full py-3 font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 ${
                canGenerate
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ICONS.Edit className="w-4 h-4" />
              {canGenerate ? 'Preview & Generate' : 'Accès refusé'}
            </button>
          </div>
        </div>

        <div className="card-navy p-6 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 border-navy-800">
          <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center">
            <ICONS.Eye className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h4 className="text-slate-300 font-medium">Document Preview</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Fill out the form to see a live preview of the generated document</p>
          </div>
        </div>
      </div>
    </div>
  );
};
