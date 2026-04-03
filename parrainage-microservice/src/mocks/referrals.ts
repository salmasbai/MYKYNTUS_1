import { Referral, ReferralTimelineItem } from '../types';

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'REF-001',
    employeeName: 'Alice Martin',
    candidateName: 'Thomas Dupont',
    position: 'Développeur Full-Stack',
    project: 'Portail Collaborateur',
    submittedAt: '2024-03-01',
    status: 'Interview',
    bonusAmount: 2500,
  },
  {
    id: 'REF-002',
    employeeName: 'Alice Martin',
    candidateName: 'Inès Laurent',
    position: 'Product Owner',
    project: 'Digital Factory',
    submittedAt: '2024-02-10',
    status: 'BonusPaid',
    bonusAmount: 3000,
  },
];

export const MOCK_TIMELINE: ReferralTimelineItem[] = [
  { id: 't1', label: 'Parrainage soumis', status: 'done', date: '2024-03-01' },
  { id: 't2', label: 'Revue RH', status: 'done', date: '2024-03-03' },
  { id: 't3', label: 'Entretien', status: 'current', date: '2024-03-10' },
  { id: 't4', label: 'Validation finale', status: 'upcoming' },
  { id: 't5', label: 'Prime versée', status: 'upcoming' },
];

