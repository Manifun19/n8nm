import {
  BellRing,
  Camera,
  CircleHelp,
  FileText,
  FolderLock,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Settings,
  ImageDown,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { NavIcon as NavIconId } from '@/config/navigation';

const ICONS: Record<NavIconId, LucideIcon> = {
  dashboard: LayoutDashboard,
  applications: ScrollText,
  exams: GraduationCap,
  profile: UserRound,
  documents: FolderLock,
  photoSignature: Camera,
  pdfTools: FileText,
  screenshots: ImageDown,
  notifications: BellRing,
  settings: Settings,
  help: CircleHelp,
};

export function NavIcon({ id, className }: { id: NavIconId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon aria-hidden className={className} />;
}
