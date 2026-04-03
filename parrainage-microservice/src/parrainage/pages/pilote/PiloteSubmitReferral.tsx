import React, { useState } from 'react';
import { FileUp, ArrowRight } from 'lucide-react';
import { ReferralService } from '../../services/ReferralService';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

export const PiloteSubmitReferral: React.FC = () => {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    position: '',
    project: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    ReferralService.submitReferral({
      referrerId: user.id,
      referrerName: user.name,
      candidateName: form.candidateName,
      candidateEmail: form.candidateEmail,
      candidatePhone: form.candidatePhone,
      position: form.position,
      project: form.project || undefined,
      notes: form.notes || undefined,
    });
    setDone(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Soumettre un parrainage
          </h2>
          <p className="text-sm text-slate-500">
            Recommandez un talent pour rejoindre l'équipe.
          </p>
        </div>
      </div>

      {done && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Parrainage soumis avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
        <div className="card-navy p-4 lg:col-span-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Nom du candidat</label>
              <input
                required
                className="w-full rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                placeholder="Ex : Thomas Dupont"
                value={form.candidateName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, candidateName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">E-mail du candidat</label>
              <input
                required
                type="email"
                className="w-full rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                placeholder="Ex : thomas.dupont@example.com"
                value={form.candidateEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, candidateEmail: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Téléphone</label>
              <input
                required
                className="w-full rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                placeholder="+33 6 ..."
                value={form.candidatePhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, candidatePhone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Poste ciblé</label>
              <input
                required
                className="w-full rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                placeholder="Ex : Développeur Full-Stack Senior"
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Projet / contexte</label>
            <input
              className="w-full rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              placeholder="Ex : Portail Collaborateur, Digital Factory..."
              value={form.project}
              onChange={(e) =>
                setForm((f) => ({ ...f, project: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">
              Notes / commentaires
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-navy-800 bg-navy-900 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              placeholder="Partagez les points forts, la motivation du candidat, le contexte..."
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-navy p-4 flex flex-col gap-3">
            <p className="text-xs font-medium text-slate-400">
              CV du candidat (PDF, DOCX)
            </p>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-navy-800 bg-navy-900/60 px-4 py-6 text-center">
              <FileUp className="h-6 w-6 text-soft-blue mb-1" />
              <p className="text-xs text-slate-300">
                Glissez-déposez le CV ici ou{' '}
                <span className="text-soft-blue font-medium">
                  sélectionnez un fichier
                </span>
              </p>
              <p className="text-[11px] text-slate-500">
                Taille maximale 10 Mo • 1 fichier
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={done}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-60"
          >
            Soumettre le parrainage
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="card-navy p-3 text-[11px] text-slate-400 space-y-1">
            <p className="font-medium text-slate-200">
              Rappel des règles du programme
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Le candidat ne doit pas déjà être en process actif.</li>
              <li>
                La prime est versée après validation de la période d'essai.
              </li>
              <li>
                Les informations partagées doivent être exactes et complètes.
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};
