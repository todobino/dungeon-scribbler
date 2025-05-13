import type { LucideIcon } from 'lucide-react';
import { Users, UserCog, BookText, Dice5, MapIcon, LayoutDashboard, Cog, Wand2, HelpCircle, FileText, Landmark, ShieldQuestion } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  isAdvanced?: boolean;
  isQualityOfLife?: boolean;
  isGenAI?: boolean;
}

export const APP_NAME = "Dungeon Scribbler";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Party Manager', href: '/party-manager', icon: Users },
  { label: 'NPC Builder', href: '/npc-builder', icon: UserCog, isGenAI: true },
  { label: 'Campaign Journal', href: '/campaign-journal', icon: BookText },
  { label: 'Random Tables', href: '/random-tables', icon: Dice5 },
  { label: 'Map Integration', href: '/map-integration', icon: MapIcon },
];

export const ADVANCED_NAV_ITEMS: NavItem[] = [
  { label: 'Quest Web', href: '/quest-web', icon: Landmark, isAdvanced: true, disabled: true },
  { label: 'Improvisation Asst.', href: '/improvisation-assistant', icon: Wand2, isAdvanced: true, isGenAI: true, disabled: true },
  { label: 'Backstory Integrator', href: '/backstory-integrator', icon: ShieldQuestion, isAdvanced: true, isGenAI: true, disabled: true },
  { label: 'Lore Wiki', href: '/lore-wiki', icon: HelpCircle, isAdvanced: true, disabled: true },
  { label: 'Dialogue Generator', href: '/dialogue-generator', icon: FileText, isAdvanced: true, isGenAI: true, disabled: true },
];


export const SETTINGS_NAV_ITEMS: NavItem[] = [
 { label: 'Settings', href: '/settings', icon: Cog, disabled: true },
];
