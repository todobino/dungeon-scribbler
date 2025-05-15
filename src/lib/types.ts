
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

export interface MonsterDetail extends MonsterSummary {
  size?: string;
  type?: string;
  subtype?: string;
  alignment?: string;
  armor_class?: ArmorClass[] | { value: number; type: string; desc?: string }[];
  hit_points?: number;
  hit_dice?: string;
  hit_points_roll?: string;
  speed?: Speed | string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  proficiencies?: ProficiencyEntry[];
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: { index: string; name: string; url: string }[] | string[] | string;
  senses?: Sense | string;
  languages?: string;
  challenge_rating?: number;
  xp?: number;
  special_abilities?: SpecialAbility[] | string;
  actions?: MonsterAction[] | string;
  legendary_actions?: LegendaryAction[] | string;
  image?: string;
  source?: 'api' | 'homebrew';
  isHomebrew?: boolean;
}


export interface FavoriteMonster {
  index: string;
  name: string;
  cr: number;
  type: string;
  source: 'api' | 'homebrew';
  acValue?: number;
  acType?: string;
  hpValue?: number;
}

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

export interface HomebrewMonsterFormData {
  name: string;
  challenge_rating?: string;
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

export interface ConditionSummary {
  index: string;
  name: string;
  url: string;
}

export interface ConditionDetail {
  index: string;
  name: string;
  desc: string[];
}

export interface SpellSummary {
  index: string;
  name: string;
  url: string;
}

export interface SpellDetail {
  index: string;
  name: string;
  desc: string[] | string; 
  higher_level?: string[] | string; 
  range: string;
  components: string[] | string; 
  material?: string; 
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number; 
  attack_type?: string;
  damage?: {
    damage_type?: {
      index: string;
      name: string;
      url: string;
    };
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  school: {
    index: string;
    name: string;
    url?: string; 
  };
  classes: { 
    index: string;
    name: string;
    url: string;
  }[] | string; 
  subclasses?: { 
    index: string;
    name: string;
    url: string;
  }[] | string; 
  area_of_effect?: {
    type: string;
    size: number;
  };
  dc?: {
    dc_type: {
        index: string;
        name: string;
        url: string;
    };
    dc_success: string;
    desc?: string;
  };
  heal_at_slot_level?: Record<string, string>;
  isHomebrew?: boolean;
  source?: 'api' | 'homebrew';
}

export interface HomebrewSpellFormData {
  name: string;
  level: string; 
  casting_time: string;
  range: string;
  components: string; 
  duration: string;
  concentration: boolean;
  school: string; 
  desc: string; 
  higher_level?: string; 
  classes?: string; 
  subclasses?: string; 
}

export interface EncounterMonster {
  id: string;
  name: string;
  quantity: number;
  cr?: string;
  ac?: string;
  hp?: string;
}

export interface SavedEncounter {
  id: string;
  title: string;
  monsters: EncounterMonster[];
}
