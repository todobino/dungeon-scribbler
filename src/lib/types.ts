
import type { DndClass } from './constants';

export interface PlayerCharacter {
  id: string;
  name: string;
  level: number;
  class: DndClass;
  armorClass: number;
  race: string; 
  initiativeModifier?: number; 
  color?: string;
  abilities?: string[]; 
  racialTraits?: string[];
}

export interface NPC {
  id: string;
  name: string;
  race?: string;
  occupation?: string;
  setting?: string;
  description?: string;
  personalityTraits?: string;
  backstory?: string;
  motivations?: string;
  linkedQuestIds?: string[];
  linkedRegionIds?: string[];
  linkedFactionIds?: string[];
}

export interface CampaignNote {
  id: string;
  title: string;
  content: string; 
  createdAt: string; 
  updatedAt: string; 
  linkedNpcIds?: string[];
  linkedLocationIds?: string[];
}

export interface RandomTableOption {
  id: string;
  value: string;
  weight?: number; 
}

export interface RandomTable {
  id: string;
  name: string;
  description?: string;
  options: RandomTableOption[];
}

export interface MapData {
  id: string;
  name: string;
  imageUrl: string; 
  markers?: MapMarker[];
}

export interface MapMarker {
  id:string;
  x: number; 
  y: number; 
  noteId?: string; 
  description?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
}

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  type: 'player' | 'enemy';
  color?: string; 
  playerId?: string; 
  ac?: number;      
  hp?: number;      
  currentHp?: number; 
}

export interface Faction {
  id: string;
  campaignId: string; 
  name: string;
  goals: string; 
  reputation: number; 
  notes?: string;
  leader?: string;
  headquarters?: string;
  allies?: string; 
  enemies?: string; 
  lieutenant?: string;
  philosophy?: string;
  supportingCast?: string; 
  introductionScene?: string;
}

export interface Location {
  id: string;
  campaignId: string; 
  name: string;
  description?: string;
  mapId?: string; 
  factionId?: string; 
  notes?: string;
}

export interface PlotPoint {
  id: string;
  sessionNumber: number; 
  timestamp: string;
  text: string;
}

// Types for D&D 5e API Monster Data
export interface MonsterSummary {
  index: string;
  name: string;
  url: string;
}

export interface MonsterSummaryWithCR {
  index: string;
  name: string;
  cr?: number;     
  type?: string;   
  url?: string; 
  source?: 'api' | 'homebrew'; // To distinguish API monsters from homebrew
}


export interface ArmorClass {
  type: string;
  value: number;
  desc?: string;
}

export interface Speed {
  walk?: string;
  fly?: string;
  swim?: string;
  burrow?: string;
  climb?: string;
}

export interface Sense {
  darkvision?: string;
  passive_perception: number;
  [key: string]: string | number | undefined; 
}

export interface ProficiencyEntry {
  value: number;
  proficiency: {
    index: string;
    name: string;
    url: string;
  };
}

export interface SpecialAbility {
  name: string;
  desc: string;
  dc?: {
    dc_type: { index: string; name: string; url: string };
    dc_value: number;
    success_type: string;
  };
  usage?: {
    type: string;
    times?: number;
    dice?: string;
    min_value?: number;
  };
}

export interface ActionDamage {
  damage_dice?: string;
  damage_type?: {
    index: string;
    name: string;
    url: string;
  };
}

export interface MonsterAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: ActionDamage[];
  dc?: {
    dc_type: { index: string; name: string; url: string };
    dc_value: number;
    success_type: string;
  };
  usage?: {
    type: string;
    times?: number;
    dice?: string;
    min_value?: number;
  };
}

export interface LegendaryAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: ActionDamage[];
}

// This interface can be used for both API-fetched and homebrew monsters.
// For homebrew, some fields might be optional or simplified.
export interface MonsterDetail extends MonsterSummary {
  size?: string;
  type?: string;
  subtype?: string;
  alignment?: string;
  armor_class?: ArmorClass[] | { value: number; type: string; desc?: string }[]; // Allow simpler AC input for homebrew
  hit_points?: number;
  hit_dice?: string;
  hit_points_roll?: string; // Keep for API, optional for homebrew
  speed?: Speed | string; // Allow string input for homebrew speed
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  proficiencies?: ProficiencyEntry[]; // Complex, may be simplified to text for homebrew
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: { index: string; name: string; url: string }[] | string[]; // Allow string array for homebrew
  senses?: Sense | string; // Allow string input for homebrew
  languages?: string;
  challenge_rating?: number; 
  xp?: number;
  special_abilities?: SpecialAbility[] | string; // Allow simplified string for homebrew
  actions?: MonsterAction[] | string; // Allow simplified string for homebrew
  legendary_actions?: LegendaryAction[] | string; // Allow simplified string for homebrew
  image?: string; 
  source?: 'api' | 'homebrew'; // Important for distinguishing
  isHomebrew?: boolean; // Alternative way to flag
}


export interface FavoriteMonster {
  index: string; // Can be API index or homebrew ID
  name: string;
  cr: number; 
  type: string;
  source: 'api' | 'homebrew';
}

// For Dice Roller Log in CombinedToolDrawer and RightDockedToolbar
export interface RollLogEntry {
  id: string;
  inputText: string;
  resultText: string;
  detailText: string;
  isAdvantage?: boolean;
  isDisadvantage?: boolean;
  rolls?: number[];
  chosenRoll?: number;
  discardedRoll?: number;
  modifier?: number;
  sides?: number;
  isRolling?: boolean;
}

// Simplified Homebrew Monster input form state
export interface HomebrewMonsterFormData {
  name: string;
  challenge_rating?: string; // Input as string, then parse
  type?: string;
  size?: string;
  armor_class_value?: string;
  armor_class_type?: string;
  hit_points_value?: string;
  hit_points_dice?: string;
  speed?: string;
  str?: string;
  dex?: string;
  con?: string;
  int?: string;
  wis?: string;
  cha?: string;
  special_abilities_text?: string;
  actions_text?: string;
  legendary_actions_text?: string;
  image_url?: string;
  alignment?: string;
  languages?: string;
  senses_text?: string;
  damage_vulnerabilities_text?: string;
  damage_resistances_text?: string;
  damage_immunities_text?: string;
  condition_immunities_text?: string;
}

// For Status Conditions Drawer
export interface ConditionSummary {
  index: string;
  name: string;
  url: string;
}

export interface ConditionDetail {
  index: string;
  name: string;
  desc: string[]; // API returns description as an array of strings
}

// For Spellbook Drawer
export interface SpellSummary {
  index: string;
  name: string;
  url: string;
}

export interface SpellDetail {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[]; // e.g., ["V", "S", "M"]
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number; // 0 for cantrips
  attack_type?: string; // e.g., "ranged"
  damage?: {
    damage_type?: {
      index: string;
      name: string;
      url: string;
    };
    // Damage at slot level for scaling spells like Fireball
    damage_at_slot_level?: Record<string, string>; // e.g., {"3": "8d6", "4": "9d6"}
    // Damage at character level for scaling cantrips
    damage_at_character_level?: Record<string, string>; // e.g., {"1": "1d10", "5": "2d10"}
  };
  school: {
    index: string;
    name: string; // e.g., "Evocation"
    url: string;
  };
  classes: {
    index: string;
    name: string;
    url: string;
  }[];
  subclasses?: {
    index: string;
    name: string;
    url: string;
  }[];
  area_of_effect?: {
    type: string; // e.g., "sphere"
    size: number; // e.g., 20 (feet)
  };
  dc?: {
    dc_type: {
        index: string;
        name: string;
        url: string;
    };
    dc_success: string; // e.g. "half"
    desc?: string;
  };
  heal_at_slot_level?: Record<string, string>; // e.g. {"1": "1d4+MOD"}
}
