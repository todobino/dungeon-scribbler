import type { DndClass } from './constants';

export interface PlayerCharacter {
  id: string;
  name: string;
  level: number;
  class: DndClass;
  armorClass: number;
  race: string; 
  initiativeModifier?: number; // Added for initiative bonus
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
  color?: string; // For player characters
  playerId?: string; // To link back to PlayerCharacter if needed
  ac?: number;      // Armor Class
  hp?: number;      // Max Hit Points
  currentHp?: number; // Current Hit Points
}

