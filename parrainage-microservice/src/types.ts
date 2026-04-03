import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  History,
  Users,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Search,
  Bell,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
  XCircle,
  FileUp,
  Euro,
  Activity,
  Menu,
  ChevronLeft,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';

export type Role = 'Collaborateur' | 'Admin' | 'RH' | 'RP' | 'Manager' | 'Pilote';

export type ReferralStatus = 'Pending' | 'InReview' | 'Interview' | 'Approved' | 'Rejected' | 'BonusPaid';

export interface Referral {
  id: string;
  employeeName: string;
  candidateName: string;
  position: string;
  project?: string;
  submittedAt: string;
  status: ReferralStatus;
  bonusAmount: number;
}

export interface ReferralTimelineItem {
  id: string;
  label: string;
  status: 'done' | 'current' | 'upcoming';
  date?: string;
}

export const ICONS = {
  Dashboard: LayoutDashboard,
  Documents: FileText,
  Request: PlusCircle,
  History,
  Team: Users,
  Settings,
  Audit: ShieldCheck,
  Logout: LogOut,
  Search,
  Bell,
  Check: CheckCircle2,
  Clock,
  Sun,
  Moon,
  X: XCircle,
  Upload: FileUp,
  Euro,
  Activity,
  Menu,
  ChevronLeft,
  ArrowRight,
  Filter,
  User,
  Layers,
};

