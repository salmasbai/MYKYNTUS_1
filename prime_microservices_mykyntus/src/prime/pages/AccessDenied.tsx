export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50">
      <div className="max-w-md text-center bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Accès au module PRIME refusé
        </h1>
        <p className="text-slate-600 mb-4">
          Votre rôle ne permet pas d&apos;accéder au module de gestion des primes.
        </p>
        <p className="text-sm text-slate-500">
          Merci de contacter un administrateur ou le service RH si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      </div>
    </div>
  );
}

