// Global ambient declarations for packages that don't expose types
// correctly when using moduleResolution: "bundler" with tsc 5.5.x

declare module 'lucide-react' {
  import type { FC, SVGProps } from 'react';

  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
  };

  export type LucideIcon = FC<LucideProps>;

  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const AppWindow: LucideIcon;
  export const ArrowDownRight: LucideIcon;
  export const ArrowRightLeft: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const BatteryCharging: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Building2: LucideIcon;
  export const Calendar: LucideIcon;
  export const Camera: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronsLeft: LucideIcon;
  export const ChevronsRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Clock: LucideIcon;
  export const Copy: LucideIcon;
  export const Database: LucideIcon;
  export const Download: LucideIcon;
  export const Edit2: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileText: LucideIcon;
  export const Filter: LucideIcon;
  export const FolderLock: LucideIcon;
  export const Globe: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Home: LucideIcon;
  export const IndianRupee: LucideIcon;
  export const Info: LucideIcon;
  export const Laptop: LucideIcon;
  export const Layers: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Link: LucideIcon;
  export const Loader2: LucideIcon;
  export const Lock: LucideIcon;
  export const LogIn: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const Map: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const PanelLeftClose: LucideIcon;
  export const PanelLeftOpen: LucideIcon;
  export const Pause: LucideIcon;
  export const Pencil: LucideIcon;
  export const PenTool: LucideIcon;
  export const Phone: LucideIcon;
  export const Play: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Share2: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const SkipBack: LucideIcon;
  export const SkipForward: LucideIcon;
  export const Sliders: LucideIcon;
  export const Smile: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Square: LucideIcon;
  export const Star: LucideIcon;
  export const ToggleLeft: LucideIcon;
  export const ToggleRight: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const UserCheck: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Wifi: LucideIcon;
  export const WifiOff: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const Zap: LucideIcon;
}

declare module '@hookform/resolvers/zod' {
  import type { Resolver } from 'react-hook-form';
  import type { ZodType, ZodTypeDef } from 'zod';
  export function zodResolver<T extends ZodType<any, ZodTypeDef, any>>(
    schema: T,
    schemaOptions?: object,
    factoryOptions?: { mode?: 'async' | 'sync' }
  ): Resolver<import('zod').infer<T>>;
}

