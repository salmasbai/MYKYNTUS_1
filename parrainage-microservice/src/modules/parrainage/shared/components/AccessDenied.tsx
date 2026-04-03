import React from 'react';

interface AccessDeniedProps {
  message?: string;
  backTo?: { to: string; label: string };
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = 'Accès refusé. Cette section est réservée aux rôles Admin et RH.',
  backTo = { to: '/parrainage/pilote/dashboard', label: 'Retour au tableau de bord' },
}) => (
  <section className="flex-1 flex items-center justify-center p-8">
    <div className="card-navy p-10 max-w-md text-center space-y-4">
      <h2 className="text-xl font-semibold text-red-200">Accès refusé</h2>
      <p className="text-sm text-slate-400">{message}</p>
      {backTo && (
        <span className="inline-block text-sm text-soft-blue font-medium">
          {backTo.label}
        </span>
      )}
    </div>
  </section>
);
