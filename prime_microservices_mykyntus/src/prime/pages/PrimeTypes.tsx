import React, { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeTable } from '../components/PrimeTable';
import { PrimeFilterBar } from '../components/PrimeFilterBar';
import { PrimeModal } from '../components/PrimeModal';
import { PrimeService } from '../services/prime.service';
import { PrimeType, Department } from '../models';
import { Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PrimeTypes() {
  const [types, setTypes] = useState<PrimeType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      PrimeService.getPrimeTypes(),
      PrimeService.getDepartments()
    ]).then(([typesData, deptsData]) => {
      setTypes(typesData);
      setDepartments(deptsData);
      setLoading(false);
    });
  }, []);

  const filteredTypes = types.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? t.departmentId === deptFilter : true;
    return matchesSearch && matchesDept;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    // In a real app, this would call PrimeService.addPrimeType
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-8 space-y-6 bg-app">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Prime Types</h1>
          <p className="text-muted mt-1">Manage bonus categories and definitions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Prime Type
        </button>
      </div>

      <PrimeFilterBar 
        onSearch={setSearch}
        filters={[
          {
            name: 'Department',
            value: deptFilter,
            onChange: setDeptFilter,
            options: departments.map(d => ({ label: d.name, value: d.id }))
          }
        ]}
      />

      <PrimeCard className="p-0">
        <PrimeTable<PrimeType>
          data={filteredTypes}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Name',
              cell: (item) => (
                <div>
                  <div className="font-medium text-primary">{item.name}</div>
                  <div className="text-xs text-muted mt-0.5">{item.description}</div>
                </div>
              )
            },
            {
              header: 'Category',
              cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-card border border-default text-primary">
                  {item.type}
                </span>
              )
            },
            {
              header: 'Department',
              cell: (item) => getDeptName(item.departmentId)
            },
            {
              header: 'Status',
              cell: (item) => (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  item.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" : "bg-card border border-default text-muted"
                )}>
                  {item.status}
                </span>
              )
            },
            {
              header: 'Actions',
              className: 'text-right',
              cell: (item) => (
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 text-muted hover:text-blue-500 hover:bg-blue-600/10 rounded-md transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {item.status === 'Active' ? (
                    <button className="p-1.5 text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors" title="Disable">
                      <PowerOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-1.5 text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors" title="Enable">
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
        />
      </PrimeCard>

      <PrimeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Prime Type"
      >
        <form onSubmit={handleAddType} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Name</label>
            <input type="text" className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-input text-primary placeholder:text-muted" placeholder="e.g. Performance Bonus" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Category</label>
            <select className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-input text-primary" required>
              <option value="">Select a category</option>
              <option value="Performance">Performance</option>
              <option value="Quality">Quality</option>
              <option value="Attendance">Attendance</option>
              <option value="Exceptional">Exceptional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Department</label>
            <select className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-input text-primary" required>
              <option value="">Select a department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-input text-primary placeholder:text-muted" rows={3} placeholder="Brief description of this bonus type..."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-primary hover:bg-app rounded-lg font-medium transition-colors border border-default">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
              Save Prime Type
            </button>
          </div>
        </form>
      </PrimeModal>
    </div>
  );
}
