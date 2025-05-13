export interface PlayerCharacter {
  id: string;
  name: string;
  level: number;
  class: string;
  armorClass: number;
  // Placeholder for abilities, ideally fetched or structured from SRD data
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
  id: string;
  x: number; // percentage
  y: number; // percentage
  noteId?: string; // Link to a campaign note
  description?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  characters: PlayerCharacter[];
  npcs: NPC[];
  notes: CampaignNote[];
  maps: MapData[];
  // other campaign specific data
}
