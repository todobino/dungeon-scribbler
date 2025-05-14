
import type { LucideIcon } from 'lucide-react';
import { Users, UserCog, BookText, Dice5, MapIcon, LayoutDashboard, Cog, Wand2, HelpCircle, FileText, Landmark, ShieldQuestion, Library, Shield as ShieldIcon, MapPin as MapPinIcon, ShieldCheck, History, ClipboardList } from 'lucide-react';

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
  { label: 'Current Campaign', href: '/campaign-management', icon: Library },
  // Dashboard is removed, Party Manager access is moved.
  // { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, 
  // { label: 'Party Manager', href: '/party-manager', icon: Users },
  { label: 'NPC Builder', href: '/npc-builder', icon: UserCog, isGenAI: true },
  { label: 'Campaign Journal', href: '/campaign-journal', icon: BookText },
  { label: 'Random Tables', href: '/random-tables', icon: Dice5 },
  { label: 'Map Integration', href: '/map-integration', icon: MapIcon },
];

export const STORY_NAV_ITEMS: NavItem[] = [
  { label: 'The Story So Far', href: '/story-so-far', icon: History, isGenAI: true, disabled: false },
  { label: 'Next Session Goals', href: '/next-session-goals', icon: ClipboardList, isGenAI: true, disabled: false },
];

export const WORLD_NAV_ITEMS: NavItem[] = [
  { label: 'Factions', href: '/world/factions', icon: ShieldCheck, disabled: false },
  { label: 'Locations', href: '/world/locations', icon: MapPinIcon, disabled: true },
  { label: 'NPCs List', href: '/world/npcs', icon: Users, disabled: true }, // Renamed to NPCs List for clarity
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

export const DND_CLASSES = [
  "Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", 
  "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
] as const;

export type DndClass = typeof DND_CLASSES[number];

export const PREDEFINED_COLORS = [
  { name: 'Red', value: '#ef4444' }, // red-500
  { name: 'Orange', value: '#f97316' }, // orange-500
  { name: 'Amber', value: '#f59e0b' }, // amber-500
  { name: 'Yellow', value: '#eab308' }, // yellow-500
  { name: 'Lime', value: '#84cc16' }, // lime-500
  { name: 'Green', value: '#22c55e' }, // green-500
  { name: 'Emerald', value: '#10b981' }, // emerald-500
  { name: 'Teal', value: '#14b8a6' }, // teal-500
  { name: 'Cyan', value: '#06b6d4' }, // cyan-500
  { name: 'Sky', value: '#0ea5e9' }, // sky-500
  { name: 'Blue', value: '#3b82f6' }, // blue-500
  { name: 'Indigo', value: '#6366f1' }, // indigo-500
  { name: 'Violet', value: '#8b5cf6' }, // violet-500
  { name: 'Purple', value: '#a855f7' }, // purple-500
  { name: 'Fuchsia', value: '#d946ef' }, // fuchsia-500
  { name: 'Pink', value: '#ec4899' }, // pink-500
  { name: 'Rose', value: '#f43f5e' }, // rose-500
  { name: 'Slate', value: '#64748b' }, // slate-500
] as const;

export type PredefinedColor = typeof PREDEFINED_COLORS[number];

export const FACTION_REPUTATION_SCALE = {
  MIN: -5, // Sworn Enemy
  MAX: 5,  // Sworn Ally
  STEP: 1,
  LABELS: {
    "-5": "Sworn Enemy",
    "-4": "Hostile",
    "-3": "Unfriendly",
    "-2": "Wary",
    "-1": "Disliked",
    "0": "Neutral",
    "1": "Liked",
    "2": "Friendly",
    "3": "Trusted",
    "4": "Allied",
    "5": "Sworn Ally",
  } as Record<string, string>,
};

export const getFactionReputationLabel = (reputation: number): string => {
  return FACTION_REPUTATION_SCALE.LABELS[reputation.toString()] || "Unknown";
};

export const getFactionReputationColorClass = (reputation: number): string => {
  if (reputation <= -3) return "text-destructive";
  if (reputation < 0) return "text-orange-500"; // Using a Tailwind color directly
  if (reputation === 0) return "text-muted-foreground";
  if (reputation < 3) return "text-blue-500"; // Using a Tailwind color directly
  return "text-green-500"; // Using a Tailwind color directly
};

