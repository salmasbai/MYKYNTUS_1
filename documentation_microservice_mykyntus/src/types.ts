import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  History, 
  Users, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Search,
  Bell,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileUp,
  FileEdit,
  Trash2,
  MoreVertical,
  Filter,
  ChevronRight,
  User,
  Building2,
  Calendar,
  Briefcase,
  Layers,
  Lock,
  GitBranch,
  HardDrive,
  Activity,
  ClipboardList,
  Menu,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react';

export type Role = 'Pilote' | 'Coach' | 'Manager' | 'RP' | 'RH' | 'Admin' | 'Audit';

export interface Document {
  id: string;
  name: string;
  type: string;
  dateCreated: string;
  status: 'Generated' | 'Pending' | 'Approved' | 'Rejected';
  employeeName?: string;
  department?: string;
}

export interface Request {
  id: string;
  type: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Generated';
  employeeName: string;
  employeeId?: string;
  reason?: string;
}

export interface Template {
  id: string;
  name: string;
  lastModified: string;
  variables: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  documentName: string;
  user: string;
  timestamp: string;
}

export const ICONS = {
  Dashboard: LayoutDashboard,
  Documents: FileText,
  Request: PlusCircle,
  PlusCircle: PlusCircle,
  History: History,
  Team: Users,
  Management: Settings,
  Audit: ShieldCheck,
  ShieldCheck: ShieldCheck,
  Logout: LogOut,
  Search,
  Bell,
  Download,
  Eye,
  Check: CheckCircle2,
  Clock,
  X: XCircle,
  Upload: FileUp,
  Edit: FileEdit,
  Delete: Trash2,
  More: MoreVertical,
  Filter,
  ChevronRight,
  User,
  Building: Building2,
  Calendar,
  Briefcase,
  Layers,
  Lock,
  GitBranch,
  HardDrive,
  Activity,
  ClipboardList: ClipboardList,
  Config: Settings,
  Types: Layers,
  Permissions: Lock,
  Workflow: GitBranch,
  Storage: HardDrive,
  Logs: Activity,
  Menu,
  ChevronLeft,
  Settings,
  Sun,
  Moon
};
