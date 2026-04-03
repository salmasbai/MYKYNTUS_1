import React, { useState } from 'react';
import { ICONS, Role } from '../types';
import { MOCK_DOCUMENTS } from '../mockData';
import { Badge } from './Badge';
import { filterByEmployeeScope } from '../lib/documentationFilters';

export const MyDocuments: React.FC<{ role: Role }> = ({ role }) => {
  const [search, setSearch] = useState('');

  const scopedDocs = filterByEmployeeScope(MOCK_DOCUMENTS, role);
  const filteredDocs = scopedDocs.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filter by name or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 border border-navy-800 rounded-lg text-sm text-slate-300 hover:bg-navy-800 transition-all">
            <ICONS.Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-500 transition-all">
            <ICONS.Download className="w-4 h-4" />
            Download All
          </button>
        </div>
      </div>

      <div className="card-navy overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-800/50 border-b border-navy-800">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Document Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-navy-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center group-hover:bg-navy-700 transition-colors">
                      <ICONS.Documents className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{doc.name}</p>
                      <p className="text-xs text-slate-500">PDF • 1.2 MB</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-400">{doc.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{doc.dateCreated}</td>
                <td className="px-6 py-4">
                  <Badge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all" title="View">
                      <ICONS.Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Download">
                      <ICONS.Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-navy-700 rounded-lg transition-all">
                      <ICONS.More className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDocs.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ICONS.Search className="w-8 h-8 text-slate-600" />
            </div>
            <h4 className="text-slate-300 font-medium">No documents found</h4>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
