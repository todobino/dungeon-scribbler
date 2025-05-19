
// Removed: import type { DndClass } from './constants'; // DndClass is no longer defined in constants

export interface PlayerCharacter {
  id: string;
  name: string;
  level: number;
  class: string;
  armorClass: number;
  race: string;
  subclass?: string;
  initiativeModifier?: number;
  color?: string;
  imageUrl?: string; // Added for character portrait
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
  activeParty?: PlayerCharacter[];
  defaultStartingLevel?: number;
}

export interface CharacterFormData {
  name: string;
  level: number;
  class: string;
  race: string;
  subclass?: string;
  armorClass: number;
  initiativeModifier?: number;
  color?: string;
  imageUrl?: string; // Added for character portrait
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
  tempHp?: number;
  initiativeModifier?: number;
  monsterIndex?: string;
  cr?: string;
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
  source?: 'api' | 'homebrew';
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
  damage_vulnerabilities?: string[] | string;
  damage_resistances?: string[] | string;
  damage_immunities?: string[] | string;
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
  isQuickRoll?: boolean;
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
  initiativeModifier?: number;
  monsterIndex?: string;
}

export interface SavedEncounter {
  id: string;
  title: string;
  monsters: EncounterMonster[];
}

// Simple type for API list items (like races, classes, subclasses)
export interface ApiListItem {
  index: string;
  name: string;
  url: string;
}

// New types for D&D Class Data
export interface ClassFeatureDetail {
  name: string;
  description: string;
}

export interface LevelBasedFeature {
  level: number;
  features: ClassFeatureDetail[];
}

export interface SubclassDetail {
  name: string;
  source: string;
  features: LevelBasedFeature[];
}

export interface ClassDetail {
  class: string;
  source: string;
  hit_die: string;
  primary_abilities: string[];
  saving_throws: string[];
  armor_proficiencies: string[];
  weapon_proficiencies: string[];
  tools: string[];
  base_class_features: LevelBasedFeature[];
  subclasses: SubclassDetail[];
}

// Item Shop Types
export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  cost?: string; // e.g., "10 gp", "5 sp"
  type?: string; // e.g., Potion, Weapon, Armor
  rarity?: string; // e.g., Common, Uncommon, Rare
  // Add other properties as needed, like weight, damage, AC, etc.
}
