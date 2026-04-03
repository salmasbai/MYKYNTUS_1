import { useEffect, useState } from 'react';
import { PrimeCard } from '../../components/PrimeCard';
import { AdminPrimeService } from '../../services/admin-prime.service';

export function AdminCalculationEngine() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    AdminPrimeService.getCalculationConfig().then(setConfig);
  }, []);

  if (!config) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div></div>;

  const save = async () => {
    const saved = await AdminPrimeService.saveCalculationConfig(config);
    setConfig(saved);
  };

  return (
    <div className="p-8 space-y-6 bg-navy-950 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Moteur de calcul des primes</h1>
        <p className="text-slate-400 mt-1">Configuration technique de la formule, ponderations et parametres.</p>
      </div>
      <PrimeCard title="Formule de calcul">
        <textarea value={config.formula} onChange={(e) => setConfig({ ...config, formula: e.target.value })} className="w-full h-24 bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200 focus:outline-none" />
      </PrimeCard>
      <PrimeCard title="Ponderations (%)">
        <div className="grid md:grid-cols-3 gap-4">
          <input type="number" value={config.weights.individualPerformance} onChange={(e) => setConfig({ ...config, weights: { ...config.weights, individualPerformance: Number(e.target.value) } })} className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200" />
          <input type="number" value={config.weights.teamPerformance} onChange={(e) => setConfig({ ...config, weights: { ...config.weights, teamPerformance: Number(e.target.value) } })} className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200" />
          <input type="number" value={config.weights.objectives} onChange={(e) => setConfig({ ...config, weights: { ...config.weights, objectives: Number(e.target.value) } })} className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200" />
        </div>
      </PrimeCard>
      <PrimeCard title="Parametres">
        <div className="grid md:grid-cols-3 gap-4">
          <input type="number" value={config.parameters.cap} onChange={(e) => setConfig({ ...config, parameters: { ...config.parameters, cap: Number(e.target.value) } })} className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200" />
          <input type="number" value={config.parameters.minThreshold} onChange={(e) => setConfig({ ...config, parameters: { ...config.parameters, minThreshold: Number(e.target.value) } })} className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200" />
          <input type="number" value={config.parameters.bonus} onChange={(e) => setConfig({ ...config, parameters: { ...config.parameters, bonus: Number(e.target.value) } })} className="bg-navy-900 border border-default rounded-lg px-3 py-2 text-slate-200" />
        </div>
      </PrimeCard>
      <div className="flex justify-end">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium">Enregistrer</button>
      </div>
    </div>
  );
}
