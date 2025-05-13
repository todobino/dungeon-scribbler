import type { DndClass } from './constants';

export interface PlayerCharacter {
  id: string;
  name: string;
  level: number;
  class: DndClass;
  armorClass: number;
  color?: string; // Added color property
  // Placeholder for abilities, ideally fetched or structured from SRD data
  abilities?: string[]; 
  racialTraits?: string[];
  // race?: string; // Optional: Add if form collects race
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
  // Links to other entities
  linkedQuestIds?: string[];
  linkedRegionIds?: string[];
  linkedFactionIds?: string[];
}

export interface CampaignNote {
  id: string;
  title: string;
  content: string; // For simplicity, string. Rich text/nested bullets are complex.
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Links to other entities
  linkedNpcIds?: string[];
  linkedLocationIds?: string[];
}

export interface RandomTableOption {
  id: string;
  value: string;
  weight?: number; // Optional weight for an option
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
  imageUrl: string; // URL of the uploaded map image
  // Markers and linked notes would go here in a more advanced version
  markers?: MapMarker[];
}

export interface MapMarker {
  id:string;
  x: number; // percentage
  y: number; // percentage
  noteId?: string; // Link to a campaign note
  description?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  // Data for each feature will be associated with the campaign
  // For now, these are not directly on the Campaign object but stored
  // in localStorage keyed by campaign ID.
  // characters: PlayerCharacter[];
  // npcs: NPC[];
  // notes: CampaignNote[];
  // maps: MapData[];
}

