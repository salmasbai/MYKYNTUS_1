import React from 'react';
import { ICONS } from '../types';
import { MOCK_TEMPLATES } from '../mockData';

export const TemplateManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Document Templates</h3>
          <p className="text-sm text-slate-500">Create and manage dynamic document templates with variables</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
          <ICONS.PlusCircle className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_TEMPLATES.map((template) => (
          <div key={template.id} className="card-navy p-6 flex flex-col group hover:border-blue-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                <ICONS.Documents className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
              </div>
              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                <ICONS.More className="w-4 h-4" />
              </button>
            </div>
            
            <h4 className="text-lg font-bold text-white mb-1">{template.name}</h4>
            <p className="text-xs text-slate-500 mb-6">Last modified: {template.lastModified}</p>
            
            <div className="space-y-3 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Variables</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map(v => (
                  <span key={v} className="px-2 py-1 bg-navy-800 text-blue-400 text-[10px] font-mono rounded border border-navy-700">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-navy-800 flex items-center justify-between">
              <button className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Preview
              </button>
              <button className="flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                <ICONS.Edit className="w-4 h-4" />
                Edit Template
              </button>
            </div>
          </div>
        ))}

        <button className="card-navy p-6 border-dashed border-2 border-navy-800 flex flex-col items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all min-h-[280px]">
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-4">
            <ICONS.PlusCircle className="w-6 h-6" />
          </div>
          <p className="font-bold">Create New Template</p>
          <p className="text-xs mt-1">Start from scratch or import file</p>
        </button>
      </div>
    </div>
  );
};
