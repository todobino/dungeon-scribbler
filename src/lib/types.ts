
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
  [key: string]: string | number | undefined; // For other senses like blindsight, tremorsense, etc.
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
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: ArmorClass[];
  hit_points: number;
  hit_dice: string;
  hit_points_roll: string;
  speed: Speed;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: ProficiencyEntry[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: { index: string; name: string; url: string }[];
  senses: Sense;
  languages: string;
  challenge_rating: number;
  xp: number;
  special_abilities?: SpecialAbility[];
  actions?: MonsterAction[];
  legendary_actions?: LegendaryAction[];
  image?: string; // e.g. /api/images/monsters/aboleth.png - need to prepend base URL
}

export interface FavoriteMonster {
  index: string;
  name: string;
  cr: number;
  type: string;
}
