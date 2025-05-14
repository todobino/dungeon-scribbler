
import type { LucideIcon } from 'lucide-react';
import { Users, UserCog, BookText, Dice5, MapIcon, LayoutDashboard, Cog, Wand2, HelpCircle, FileText, Landmark, ShieldQuestion, Library, Shield as ShieldIcon, MapPin as MapPinIcon, ShieldCheck, History, ClipboardList, Edit3, ClipboardCheck, DraftingCompass } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  isAdvanced?: boolean;
  isQualityOfLife?: boolean;
  isGenAI?: boolean;
}

export const APP_NAME = "Adventure Architect";

export const NAV_ITEMS: NavItem[] = [
  { label: 'Current Campaign', href: '/campaign-management', icon: Library },
  { label: 'NPC Builder', href: '/npc-builder', icon: UserCog, isGenAI: true },
  { label: 'Campaign Journal', href: '/campaign-journal', icon: BookText },
  { label: 'Random Tables', href: '/random-tables', icon: Dice5 },
  { label: 'Map Integration', href: '/map-integration', icon: MapIcon },
];

export const STORY_NAV_ITEMS: NavItem[] = [
  { label: 'Adventure Recap', href: '/story-so-far-refactored', icon: History, isGenAI: true, disabled: false },
  { label: 'Next Session Goals', href: '/next-session-goals-refactored', icon: ClipboardList, isGenAI: true, disabled: false },
];

export const WORLD_NAV_ITEMS: NavItem[] = [
  { label: 'Factions', href: '/world/factions', icon: ShieldCheck, disabled: false },
  { label: 'Locations', href: '/world/locations', icon: MapPinIcon, disabled: true },
  { label: 'NPCs List', href: '/world/npcs', icon: Users, disabled: true },
];

export const ADVANCED_NAV_ITEMS: NavItem[] = [
  { label: 'Campaign Wizard', href: '/campaign-wizard', icon: DraftingCompass, isAdvanced: true, isGenAI: true, disabled: false },
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

// CAMPAIGN WIZARD OPTIONS
export const CAMPAIGN_LENGTH_OPTIONS = ["One-Shot", "Short Arc (2-5 Sessions)", "Medium Campaign (6-15 Sessions)", "Long Campaign (16+ Sessions)", "Open-Ended/Sandbox"];
export const CAMPAIGN_TONE_OPTIONS = ["Heroic Fantasy", "Dark Fantasy/Grimdark", "Lighthearted/Comedic", "Intrigue/Political", "Mystery/Horror", "Exploration/Discovery", "Action/Adventure"];
export const WORLD_STYLE_OPTIONS = ["High Fantasy", "Low Magic", "Sword & Sorcery", "Steampunk", "Post-Apocalyptic", "Urban Fantasy", "Sci-Fi Fantasy"];
export const REGION_FOCUS_OPTIONS = ["Frontier Wilderness", "Bustling Imperial City", "Floating Archipelago", "Ancient Desert Kingdom", "Frozen Icy North", "Fae-Touched Woods", "Underground Society", "Planar Crossroads"];
export const TECHNOLOGY_LEVEL_OPTIONS = ["Stone Age", "Bronze Age", "Iron Age/Classical", "Medieval", "Renaissance", "Industrial Revolution/Steampunk", "Magitech", "Modern", "Futuristic/Spacefaring"];
export const FACTION_TYPE_EXAMPLES = "e.g., Thieves' guilds, noble houses, religious orders, mages' circles, merchant consortiums, revolutionary groups, ancient cults, foreign powers, monstrous hordes.";
export const POWER_BALANCE_OPTIONS = ["One Dominant Power", "Cold War (Two Superpowers)", "Multiple Competing Powers", "Chaotic Free-for-All", "Hidden Powers Manipulating Events", "Power Vacuum"];


// Storage Key Prefixes & Names
const SHARED_PREFIX = "adventureArchitect_"; // Changed from "dungeonScribbler"

// Campaign Context Storage Keys
export const CAMPAIGNS_STORAGE_KEY = `${SHARED_PREFIX}Campaigns`;
export const ACTIVE_CAMPAIGN_ID_STORAGE_KEY = `${SHARED_PREFIX}ActiveCampaignId`;
export const PARTY_STORAGE_KEY_PREFIX = `${SHARED_PREFIX}Characters_`;

// Factions Page Keys
export const FACTIONS_STORAGE_KEY_PREFIX = `${SHARED_PREFIX}Factions_`;
export const LOCATIONS_STORAGE_KEY_PREFIX = `${SHARED_PREFIX}Locations_`;

// Global NPC List Key
export const NPCS_STORAGE_KEY = `${SHARED_PREFIX}Npcs`; 

// Campaign Journal Page Key
export const JOURNAL_NOTES_STORAGE_KEY_PREFIX = `${SHARED_PREFIX}Notes_`;

// Map Integration Page Key
export const MAPS_STORAGE_KEY_PREFIX = `${SHARED_PREFIX}Maps_`;

// Adventure Recap (Refactored Story So Far) Page Keys
export const REFACTORED_PLOT_POINTS_KEY_PREFIX = `${SHARED_PREFIX}RefactoredPlotPoints_`;
export const REFACTORED_CURRENT_SESSION_KEY_PREFIX = `${SHARED_PREFIX}RefactoredCurrentSession_`;
export const REFACTORED_SESSION_SUMMARIES_KEY_PREFIX = `${SHARED_PREFIX}RefactoredSessionSummaries_`;
export const REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX = `${SHARED_PREFIX}RefactoredSessionViewModes_`;
export const REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX = `${SHARED_PREFIX}RefactoredFullCampaignSummary_`;
export const REFACTORED_SUMMARY_DETAIL_LEVEL_KEY_PREFIX = `${SHARED_PREFIX}RefactoredSummaryDetailLevel_`;

// Next Session Goals (Refactored) Page Keys
export const REFACTORED_GOALS_KEY_PREFIX = `${SHARED_PREFIX}RefactoredGoals_`;

// Campaign Wizard Page Key (if needed for drafts, though often transient)
export const CAMPAIGN_WIZARD_DRAFT_KEY_PREFIX = `${SHARED_PREFIX}CampaignWizardDraft_`;
