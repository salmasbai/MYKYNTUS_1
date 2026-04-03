import React, { useState, useMemo } from 'react';
import { useReferrals } from '../../hooks/useReferrals';
import { TeamTable, buildTeamMembersFromReferrals } from '../../components/TeamTable';
import { useAuth } from '../../../../frontend/app/hooks/useAuth';

export const PMTeamMembers: React.FC = () => {
  const { user } = useAuth();
  const projectId = user?.projectId ?? user?.departmentId ?? 'proj-1';
  const { referrals, loading } = useReferrals(projectId);
  const [search, setSearch] = useState('');

  const members = useMemo(() => {
    const list = buildTeamMembersFromReferrals(referrals);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.projectName.toLowerCase().includes(q),
    );
  }, [referrals, search]);

  return (
    <section className="flex-1 space-y-6">
      <p className="text-sm text-slate-500 max-w-3xl">
        Parrainages et taux de succès par collaborateur.
      </p>

      <TeamTable
        members={members}
        loading={loading}
        onSearch={setSearch}
      />
    </section>
  );
};
