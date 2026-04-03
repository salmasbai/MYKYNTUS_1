import { useEffect, useState } from 'react';
import { PrimeCard } from '../components/PrimeCard';
import { PrimeService } from '../services/prime.service';
import { Department } from '../models';
import { Settings, Users, Building2, Network, FolderTree } from 'lucide-react';

export function PrimeConfiguration() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PrimeService.getDepartments().then(data => {
      setDepartments(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuration</h1>
          <p className="text-slate-500 mt-1">Manage organizational structure and system settings.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Settings className="w-4 h-4" />
          System Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <PrimeCard title="Organization Structure" description="Current active departments">
            <div className="space-y-4">
              {departments.map(dept => (
                <div key={dept.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{dept.name}</h4>
                      <p className="text-xs text-slate-500">{dept.poles.length} Pôles</p>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Add Department
              </button>
            </div>
          </PrimeCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <PrimeCard title="Structure Details" description="Operations Department">
            <div className="space-y-6">
              {departments[0]?.poles.map(pole => (
                <div key={pole.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-slate-900">{pole.name}</h3>
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Edit Pôle</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pole.cells.map(cell => (
                      <div key={cell.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Network className="w-4 h-4 text-emerald-500" />
                          <h4 className="font-medium text-slate-800">{cell.name}</h4>
                        </div>
                        <div className="space-y-2 pl-6 border-l-2 border-slate-100">
                          {cell.teams.map(team => (
                            <div key={team.id} className="flex items-center gap-2 text-sm text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {team.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PrimeCard>
        </div>
      </div>
    </div>
  );
}
