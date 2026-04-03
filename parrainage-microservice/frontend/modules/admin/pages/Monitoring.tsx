import React from 'react';
import { DataTable } from '../../../shared/components/DataTable';

interface LogRow {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  source: string;
  message: string;
  timestamp: string;
}

const MOCK_LOGS: LogRow[] = [
  {
    id: 'L1',
    level: 'ERROR',
    source: 'parrainage-service',
    message: 'Timeout lors de la récupération des primes.',
    timestamp: '2024-03-10 10:12',
  },
  {
    id: 'L2',
    level: 'WARN',
    source: 'api-gateway',
    message: 'Latence élevée sur le flux RH.',
    timestamp: '2024-03-10 09:52',
  },
  {
    id: 'L3',
    level: 'INFO',
    source: 'parrainage-service',
    message: 'Synchronisation quotidienne terminée.',
    timestamp: '2024-03-10 02:00',
  },
];

export const Monitoring: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-50">Surveillance technique</h2>
      <DataTable<LogRow>
        columns={[
          { key: 'timestamp', header: 'Date' },
          { key: 'level', header: 'Niveau' },
          { key: 'source', header: 'Source' },
          { key: 'message', header: 'Message' },
        ]}
        data={MOCK_LOGS}
      />
    </div>
  );
};

