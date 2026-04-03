import React, { useState } from 'react';
import { ICONS } from '../types';
import { motion } from 'motion/react';

const OTHER_DOC_TYPE = 'Autre';

export const RequestDocument: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [documentType, setDocumentType] = useState('Attestation de travail');
  const [otherDescription, setOtherDescription] = useState('');
  const [otherDescriptionError, setOtherDescriptionError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentType === OTHER_DOC_TYPE) {
      const trimmed = otherDescription.trim();
      if (!trimmed) {
        setOtherDescriptionError(true);
        return;
      }
      setOtherDescriptionError(false);
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-navy p-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
            <ICONS.Request className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Demander un document</h3>
            <p className="text-sm text-slate-500">
              Transmettre une demande aux RH pour des documents administratifs
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Type de document</label>
            <select
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value);
                setOtherDescriptionError(false);
                if (e.target.value !== OTHER_DOC_TYPE) {
                  setOtherDescription('');
                }
              }}
              className="w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 transition-all"
            >
              <option value="Attestation de travail">Attestation de travail</option>
              <option value="Attestation de salaire">Attestation de salaire</option>
              <option value="Certificat d’emploi">Certificat d’emploi</option>
              <option value="Attestation de formation">Attestation de formation</option>
              <option value="Attestation de stage">Attestation de stage</option>
              <option value={OTHER_DOC_TYPE}>{OTHER_DOC_TYPE}</option>
            </select>
          </div>

          {documentType === OTHER_DOC_TYPE && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Description du type de document <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={otherDescription}
                onChange={(e) => {
                  setOtherDescription(e.target.value);
                  if (otherDescriptionError && e.target.value.trim()) {
                    setOtherDescriptionError(false);
                  }
                }}
                required
                aria-invalid={otherDescriptionError}
                placeholder="Précisez le document souhaité"
                className={`w-full bg-navy-800 border rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 transition-all resize-none ${
                  otherDescriptionError ? 'border-red-500/60' : 'border-navy-700'
                }`}
              />
              {otherDescriptionError && (
                <p className="text-xs text-red-400">Ce champ est obligatoire lorsque vous choisissez « Autre ».</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Motif de la demande</label>
            <textarea
              rows={4}
              placeholder="ex. dossier bancaire, visa, etc."
              className="w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Commentaires complémentaires (facultatif)
            </label>
            <input
              type="text"
              className="w-full bg-navy-800 border border-navy-700 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                submitted
                  ? 'bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
              }`}
            >
              {submitted ? (
                <>
                  <ICONS.Check className="w-5 h-5" />
                  Demande envoyée avec succès
                </>
              ) : (
                <>
                  <ICONS.Request className="w-5 h-5" />
                  Envoyer la demande
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-navy p-4 flex items-start gap-3">
          <ICONS.Clock className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Délai de traitement</p>
            <p className="text-xs text-slate-500">
              Les demandes standard sont traitées sous 2 à 3 jours ouvrés.
            </p>
          </div>
        </div>
        <div className="card-navy p-4 flex items-start gap-3">
          <ICONS.ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Signature numérique</p>
            <p className="text-xs text-slate-500">
              Les documents sont signés numériquement et ont valeur légale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
