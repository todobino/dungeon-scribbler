

import type { LucideIcon } from 'lucide-react';
import { Users, UserCog, MapIcon, Cog, Wand2, HelpCircle, FileText, Landmark, ShieldQuestion, Library, Shield as ShieldIcon, MapPin as MapPinIcon, ShieldCheck, History, ClipboardList, Edit3, ClipboardCheck, DraftingCompassIcon, Swords, Skull, VenetianMask, Dice5, ListOrdered, BookOpen, Dna, MessageSquare, Star, DraftingCompass, Activity, Link2, User, ArrowUpDown, Store, PlusCircle } from 'lucide-react';

export const APP_NAME = "Adventure Architect";
export const DND5E_API_BASE_URL = "https://www.dnd5eapi.co";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  isAdvanced?: boolean;
  isQualityOfLife?: boolean;
  isGenAI?: boolean;
}

// Toolbar IDs - DEFINE THESE FIRST
export const DICE_ROLLER_TAB_ID = "dice-roller";
export const COMBAT_TRACKER_TAB_ID = "combat-tracker";
export const COMBINED_TOOLS_DRAWER_ID = "combined-tools";
export const MONSTER_MASH_DRAWER_ID = "monster-mash";
export const STATUS_CONDITIONS_DRAWER_ID = "status-conditions";
export const SPELLBOOK_DRAWER_ID = "spellbook";
export const ITEM_SHOP_DRAWER_ID = "item-shop";


// Toolbar items
export const TOOLBAR_ITEMS = [
  { id: DICE_ROLLER_TAB_ID, label: 'Dice Roller', icon: Dice5 },
  { id: COMBAT_TRACKER_TAB_ID, label: 'Combat Tracker', icon: Swords },
  { id: MONSTER_MASH_DRAWER_ID, label: 'Monster Mash', icon: Skull },
  { id: STATUS_CONDITIONS_DRAWER_ID, label: 'Status Conditions', icon: ShieldQuestion },
  { id: SPELLBOOK_DRAWER_ID, label: 'Spellbook', icon: BookOpen },
  { id: ITEM_SHOP_DRAWER_ID, label: 'Item Shop', icon: Store },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Party Manager', href: '/party-manager', icon: User },
  { label: 'NPC Builder', href: '/npc-builder', icon: UserCog, isGenAI: true },
  { label: 'Map Integration', href: '/map-integration', icon: MapIcon },
  { label: 'Random Tables', href: '/random-tables', icon: Dice5, disabled: false },
];

export const STORY_NAV_ITEMS: NavItem[] = [
  { label: 'Adventure Recap', href: '/story-so-far-refactored', icon: History, isGenAI: true, disabled: false },
  { label: 'Next Session Goals', href: '/next-session-goals-refactored', icon: ClipboardList, isGenAI: true, disabled: false },
  { label: 'Encounter Planner', href: '/encounter-planner', icon: Swords },
];

export const WORLD_NAV_ITEMS: NavItem[] = [
  { label: 'Factions', href: '/world/factions', icon: ShieldCheck, disabled: false },
  { label: 'Locations', href: '/world/locations', icon: MapPinIcon, disabled: true },
  { label: 'NPCs List', href: '/world/npcs', icon: Users, disabled: true },
];

export const ADVANCED_NAV_ITEMS: NavItem[] = [
  { label: 'Campaign Wizard', href: '/campaign-wizard', icon: DraftingCompassIcon, isAdvanced: true, isGenAI: true, disabled: false },
  { label: 'Quest Web', href: '/quest-web', icon: Landmark, isAdvanced: true, disabled: true },
  { label: 'Improvisation Asst.', href: '/improvisation-assistant', icon: Wand2, isAdvanced: true, isGenAI: true, disabled: true },
  { label: 'Backstory Integrator', href: '/backstory-integrator', icon: ShieldQuestion, isAdvanced: true, isGenAI: true, disabled: true },
  { label: 'Lore Wiki', href: '/lore-wiki', icon: HelpCircle, isAdvanced: true, disabled: true },
  { label: 'Dialogue Generator', href: '/dialogue-generator', icon: MessageSquare, isAdvanced: true, isGenAI: true, disabled: true },
];


export const SETTINGS_NAV_ITEMS: NavItem[] = [
 { label: 'Settings', href: '/settings', icon: Cog, disabled: true },
];


export const PREDEFINED_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#64748b' },
] as const;

export type PredefinedColor = typeof PREDEFINED_COLORS[number];

export const FACTION_REPUTATION_SCALE = {
  MIN: -5,
  MAX: 5,
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
  if (reputation < 0) return "text-orange-500";
  if (reputation === 0) return "text-muted-foreground";
  if (reputation < 3) return "text-blue-500";
  return "text-green-500";
};

export interface CampaignOption {
  value: string;
  description: string;
}

export const CAMPAIGN_LENGTH_OPTIONS: CampaignOption[] = [
  { value: "One-Shot", description: "A complete adventure designed to be played in a single session (typically 2-4 hours)." },
  { value: "Short Arc (2-5 Sessions)", description: "A brief storyline or mini-campaign that resolves over a few sessions." },
  { value: "Medium Campaign (6-15 Sessions)", description: "A more substantial adventure with character development and a multi-faceted plot." },
  { value: "Long Campaign (16+ Sessions)", description: "An epic journey spanning many levels and significant in-game time, often with world-altering consequences." },
  { value: "Open-Ended/Sandbox", description: "A campaign focused on player agency and exploration, with no predefined endpoint." }
];

export const CAMPAIGN_TONE_OPTIONS = ["Heroic Fantasy", "Dark Fantasy/Grimdark", "Lighthearted/Comedic", "Intrigue/Political", "Mystery/Horror", "Exploration/Discovery", "Action/Adventure"];

export const WORLD_STYLE_OPTIONS: CampaignOption[] = [
  { value: "High Fantasy", description: "A world brimming with magic, mythical creatures, and epic heroism. Think Lord of the Rings or Dungeons & Dragons' Forgotten Realms." },
  { value: "Low Magic", description: "Magic is rare, subtle, or dangerous. Mundane solutions are common. Think Game of Thrones or The Witcher (books)." },
  { value: "Sword & Sorcery", description: "Focuses on personal heroism, dangerous magic, and often morally ambiguous protagonists. Think Conan the Barbarian." },
  { value: "Steampunk", description: "A world powered by steam technology and clockwork, often with Victorian aesthetics and fantastical inventions." },
  { value: "Post-Apocalyptic", description: "A setting after a cataclysmic event, where survivors navigate a changed and often hazardous world. Think Mad Max or Fallout." },
  { value: "Urban Fantasy", description: "Magic and the supernatural exist hidden within a modern, contemporary urban setting. Think The Dresden Files." },
  { value: "Sci-Fi Fantasy", description: "Blends elements of science fiction (spaceships, advanced tech) with fantasy tropes (magic, mythical races). Think Star Wars or Shadowrun." }
];

export const REGION_FOCUS_OPTIONS: CampaignOption[] = [
  { value: "Frontier Wilderness", description: "Uncharted territories, dangerous wilds, sparse settlements, focus on exploration and survival." },
  { value: "Bustling Imperial City", description: "A vast metropolis, center of power, trade, and intrigue. Opportunities for urban adventure and politics." },
  { value: "Floating Archipelago", description: "A chain of islands, possibly in the sky or sea, emphasizing travel, naval encounters, and unique island cultures." },
  { value: "Ancient Desert Kingdom", description: "Vast deserts, hidden oases, ancient ruins, and cultures adapted to harsh environments." },
  { value: "Frozen Icy North", description: "Harsh, cold climates, survival challenges, isolated communities, and creatures adapted to the frost." },
  { value: "Fae-Touched Woods", description: "An enchanted forest where the veil to the Feywild is thin, full of strange creatures and unpredictable magic." },
  { value: "Underground Society", description: "Civilizations that dwell beneath the earth's surface, such as dwarves, drow, or other subterranean races." },
  { value: "Planar Crossroads", description: "A location where different planes of existence intersect, leading to diverse encounters and planar travel." }
];

export const TECHNOLOGY_LEVEL_OPTIONS: CampaignOption[] = [
  { value: "Stone Age", description: "Primitive tools, hunter-gatherer societies, early shamanism." },
  { value: "Bronze Age", description: "Emergence of city-states, early metalworking, chariots, mythic heroes." },
  { value: "Iron Age/Classical", description: "Empires, organized armies, philosophy, early republics. Think Ancient Rome or Greece." },
  { value: "Medieval", description: "Feudalism, castles, knights, widespread use of iron weapons and armor. Common D&D setting." },
  { value: "Renaissance", description: "Rebirth of art and science, early firearms, exploration, burgeoning merchant class." },
  { value: "Industrial Revolution/Steampunk", description: "Factories, steam power, early mass production, clockwork mechanisms alongside emerging social change." },
  { value: "Magitech", description: "Magic and technology are intertwined, with spells powering devices or technology enhancing magic." },
  { value: "Modern", description: "Roughly equivalent to present-day Earth technology." },
  { value: "Futuristic/Spacefaring", description: "Advanced technologies, space travel, cybernetics, potentially interstellar societies." }
];

export const FACTION_TYPE_EXAMPLES = "e.g., Thieves' guilds, noble houses, religious orders, mages' circles, merchant consortiums, revolutionary groups, ancient cults, foreign powers, monstrous hordes.";

export const POWER_BALANCE_OPTIONS: CampaignOption[] = [
  { value: "One Dominant Power", description: "A single empire, kingdom, or organization holds significant control over the known world or region." },
  { value: "Cold War (Two Superpowers)", description: "Two major powers vie for influence, often through proxy conflicts, espionage, and an arms race." },
  { value: "Multiple Competing Powers", description: "Several factions or nations of roughly equal strength constantly shift alliances and compete for dominance." },
  { value: "Chaotic Free-for-All", description: "No central authority, widespread lawlessness, and many small groups or warlords fighting for scraps." },
  { value: "Hidden Powers Manipulating Events", description: "Secret societies, ancient evils, or celestial beings pull the strings from behind the scenes." },
  { value: "Power Vacuum", description: "A recent collapse of authority has left a void, with various groups scrambling to fill it." }
];

export const SHARED_DATA_PREFIX = "adventureArchitect_";

export const CAMPAIGNS_STORAGE_KEY = `${SHARED_DATA_PREFIX}Campaigns`;
export const ACTIVE_CAMPAIGN_ID_STORAGE_KEY = `${SHARED_DATA_PREFIX}ActiveCampaignId`;

// Campaign-specific prefixes
export const PARTY_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}Party_`;
export const FACTIONS_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}Factions_`;
export const LOCATIONS_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}Locations_`;
export const MAPS_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}Maps_`;
export const JOURNAL_NOTES_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}JournalNotes_`;
export const ENCOUNTER_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}CurrentEncounter_`;
export const SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX = `${SHARED_DATA_PREFIX}SavedEncounters_`;

// Adventure Recap Page Keys (Refactored)
export const REFACTORED_PLOT_POINTS_KEY_PREFIX = `${SHARED_DATA_PREFIX}AdventureRecap_PlotPoints_`;
export const REFACTORED_CURRENT_SESSION_KEY_PREFIX = `${SHARED_DATA_PREFIX}AdventureRecap_CurrentSession_`;
export const REFACTORED_SESSION_SUMMARIES_KEY_PREFIX = `${SHARED_DATA_PREFIX}AdventureRecap_SessionSummaries_`;
export const REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX = `${SHARED_DATA_PREFIX}AdventureRecap_SessionViewModes_`;
export const REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX = `${SHARED_DATA_PREFIX}AdventureRecap_FullCampaignSummary_`;
export const REFACTORED_SUMMARY_DETAIL_LEVEL_KEY_PREFIX = `${SHARED_DATA_PREFIX}AdventureRecap_SummaryDetailLevel_`;

// Next Session Goals (Refactored) Page Keys
export const REFACTORED_GOALS_KEY_PREFIX = `${SHARED_DATA_PREFIX}NextSessionGoals_RefactoredGoals_`;

// Campaign Wizard Draft
export const CAMPAIGN_WIZARD_DRAFT_KEY_PREFIX = `${SHARED_DATA_PREFIX}CampaignWizardDraft_`;

// Global NPC list (not campaign-specific)
export const NPCS_STORAGE_KEY = `${SHARED_DATA_PREFIX}Npcs_Global`;

// Monster Mash Feature Keys
export const MONSTER_MASH_FAVORITES_STORAGE_KEY = `${SHARED_DATA_PREFIX}MonsterMash_Favorites`;
export const MONSTER_MASH_FULL_INDEX_STORAGE_KEY = `${SHARED_DATA_PREFIX}MonsterMash_FullIndexWithCR`;
export const MONSTER_MASH_HOMEBREW_STORAGE_KEY = `${SHARED_DATA_PREFIX}MonsterMash_Homebrew`;

// Spellbook Feature Key
export const SPELLBOOK_HOMEBREW_STORAGE_KEY = `${SHARED_DATA_PREFIX}Spellbook_Homebrew`;

// Item Shop Feature Key
export const ITEM_SHOP_STORAGE_KEY = `${SHARED_DATA_PREFIX}ItemShop_GlobalItems`;
export const ITEM_TYPES: string[] = [
  "Potion", "Scroll", "Wand", "Rod", "Staff", "Weapon", "Armor", "Shield", 
  "Ring", "Amulet", "Cloak", "Boots", "Gloves", "Helm", "Wondrous Item", 
  "Adventuring Gear", "Tool", "Treasure", "Mount", "Vehicle", "Other"
];


// Monster Mash Homebrew Form Options
export const MONSTER_TYPES: string[] = [
  "Aberration", "Beast", "Celestial", "Construct", "Dragon", "Elemental",
  "Fey", "Fiend", "Giant", "Humanoid", "Monstrosity", "Ooze", "Plant", "Undead", "Other"
];

export const MONSTER_SIZES: string[] = [
  "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"
];

export const MONSTER_AC_TYPES: string[] = [
  "Natural Armor", "Plate Armor", "Leather Armor", "Hide Armor", "Chain Mail", "Scale Mail", "Shield", "Mage Armor", "Unarmored Defense", "Other"
];

export const MONSTER_ALIGNMENTS: string[] = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil",
  "Unaligned", "Any Alignment", "Varies", "Any Non-Good", "Any Non-Lawful", "Any Non-Chaotic", "Any Non-Evil"
];

// Spellbook Homebrew Form Options
export const SPELL_SCHOOLS: string[] = [
    "Abjuration", "Conjuration", "Divination", "Enchantment",
    "Evocation", "Illusion", "Necromancy", "Transmutation"
];

// List of all campaign-specific local storage key prefixes for easy cleanup
export const CAMPAIGN_SPECIFIC_STORAGE_KEY_PREFIXES = [
  PARTY_STORAGE_KEY_PREFIX,
  FACTIONS_STORAGE_KEY_PREFIX,
  LOCATIONS_STORAGE_KEY_PREFIX,
  MAPS_STORAGE_KEY_PREFIX,
  JOURNAL_NOTES_STORAGE_KEY_PREFIX,
  ENCOUNTER_STORAGE_KEY_PREFIX,
  SAVED_ENCOUNTERS_STORAGE_KEY_PREFIX,
  REFACTORED_PLOT_POINTS_KEY_PREFIX,
  REFACTORED_CURRENT_SESSION_KEY_PREFIX,
  REFACTORED_SESSION_SUMMARIES_KEY_PREFIX,
  REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX,
  REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX,
  REFACTORED_SUMMARY_DETAIL_LEVEL_KEY_PREFIX,
  REFACTORED_GOALS_KEY_PREFIX,
];

    
