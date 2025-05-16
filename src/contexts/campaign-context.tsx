
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Campaign, PlayerCharacter } from '@/lib/types';
import type { DndClass } from '@/lib/constants';
import { 
  CAMPAIGNS_STORAGE_KEY, 
  ACTIVE_CAMPAIGN_ID_STORAGE_KEY, 
  PARTY_STORAGE_KEY_PREFIX,
  CAMPAIGN_SPECIFIC_STORAGE_KEY_PREFIXES
} from '@/lib/constants';


export type CharacterFormData = Omit<PlayerCharacter, 'id' | 'abilities' | 'racialTraits'>;


interface CampaignContextType {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  activeCampaignParty: PlayerCharacter[];
  isLoadingCampaigns: boolean;
  isLoadingParty: boolean;
  addCampaign: (name: string) => Promise<Campaign>;
  setActiveCampaignId: (id: string | null) => void;
  deleteCampaign: (campaignId: string) => Promise<void>;
  addCharacterToActiveCampaign: (characterData: CharacterFormData) => Promise<void>;
  updateCharacterInActiveCampaign: (character: PlayerCharacter) => Promise<void>;
  deleteCharacterFromActiveCampaign: (characterId: string) => Promise<void>;
  incrementPartyLevel: () => Promise<void>;
  setPartyLevel: (targetLevel: number) => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
  encounterUpdateKey: number;
  notifyEncounterUpdate: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const getPartyStorageKey = (campaignId: string) => `${PARTY_STORAGE_KEY_PREFIX}${campaignId}`;

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignIdState] = useState<string | null>(null);
  const [activeCampaignParty, setActiveCampaignParty] = useState<PlayerCharacter[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isLoadingParty, setIsLoadingParty] = useState(false);
  const [encounterUpdateKey, setEncounterUpdateKey] = useState(0);

  useEffect(() => {
    try {
      const storedCampaigns = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (storedCampaigns) {
        setCampaigns(JSON.parse(storedCampaigns));
      }
      const storedActiveId = localStorage.getItem(ACTIVE_CAMPAIGN_ID_STORAGE_KEY);
      if (storedActiveId) {
        setActiveCampaignIdState(storedActiveId);
      }
    } catch (error) {
      console.error("Failed to load campaign data from localStorage", error);
    }
    setIsLoadingCampaigns(false);
  }, []);

  useEffect(() => {
    if (!isLoadingCampaigns) {
      try {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
      } catch (error) {
        console.error("Error saving campaigns to localStorage", error);
      }
    }
  }, [campaigns, isLoadingCampaigns]);

  useEffect(() => {
    if (!isLoadingCampaigns) {
      if (activeCampaignId) {
        try {
          localStorage.setItem(ACTIVE_CAMPAIGN_ID_STORAGE_KEY, activeCampaignId);
        } catch (error) {
          console.error("Error saving active campaign ID to localStorage", error);
        }
      } else {
        try {
          localStorage.removeItem(ACTIVE_CAMPAIGN_ID_STORAGE_KEY);
        } catch (error) {
          console.error("Error removing active campaign ID from localStorage", error);
        }
      }
    }
  }, [activeCampaignId, isLoadingCampaigns]);

  useEffect(() => {
    if (activeCampaignId) {
      setIsLoadingParty(true);
      try {
        const partyKey = getPartyStorageKey(activeCampaignId);
        const storedParty = localStorage.getItem(partyKey);
        if (storedParty) {
          setActiveCampaignParty(JSON.parse(storedParty));
        } else {
          setActiveCampaignParty([]);
        }
      } catch (error) {
        console.error(`Failed to load party for campaign ${activeCampaignId}`, error);
        setActiveCampaignParty([]);
      }
      setIsLoadingParty(false);
    } else {
      setActiveCampaignParty([]);
    }
  }, [activeCampaignId]);

  useEffect(() => {
    if (activeCampaignId && !isLoadingParty) {
      try {
        const partyKey = getPartyStorageKey(activeCampaignId);
        localStorage.setItem(partyKey, JSON.stringify(activeCampaignParty));
      } catch (error) {
        console.error(`Failed to save party for campaign ${activeCampaignId}`, error);
      }
    }
  }, [activeCampaignParty, activeCampaignId, isLoadingParty]);


  const addCampaign = useCallback(async (name: string) => {
    const newCampaign: Campaign = { id: Date.now().toString(), name };
    setCampaigns(prev => [...prev, newCampaign]);
    if (!activeCampaignId) { 
      setActiveCampaignIdState(newCampaign.id);
    }
    return newCampaign;
  }, [activeCampaignId]);

  const setActiveCampaignId = useCallback((id: string | null) => {
    setActiveCampaignIdState(id);
  }, []);
  
  const deleteCampaign = useCallback(async (campaignIdToDelete: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignIdToDelete));
    
    CAMPAIGN_SPECIFIC_STORAGE_KEY_PREFIXES.forEach(prefix => {
      try {
        localStorage.removeItem(`${prefix}${campaignIdToDelete}`);
      } catch (error) {
        console.error(`Error removing ${prefix}${campaignIdToDelete} from localStorage:`, error);
      }
    });
    try {
    } catch (error) {
       console.error(`Error removing draft for campaign ${campaignIdToDelete} from localStorage:`, error);
    }

    if (activeCampaignId === campaignIdToDelete) {
      setActiveCampaignIdState(campaigns.length > 1 ? campaigns.find(c => c.id !== campaignIdToDelete)?.id || null : null);
    }
  }, [activeCampaignId, campaigns]);


  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const addCharacterToActiveCampaign = useCallback(async (characterData: CharacterFormData) => {
    if (!activeCampaignId) {
      console.warn("Cannot add character: No active campaign.");
      return;
    }
    const newCharacter: PlayerCharacter = {
      ...characterData,
      id: Date.now().toString(),
      initiativeModifier: characterData.initiativeModifier || 0, 
    };
    setActiveCampaignParty(prevParty => [...prevParty, newCharacter]);
  }, [activeCampaignId]);

  const updateCharacterInActiveCampaign = useCallback(async (updatedCharacter: PlayerCharacter) => {
    if (!activeCampaignId) {
      console.warn("Cannot update character: No active campaign.");
      return;
    }
    setActiveCampaignParty(prevParty => 
      prevParty.map(char => char.id === updatedCharacter.id ? {...updatedCharacter, initiativeModifier: updatedCharacter.initiativeModifier || 0} : char)
    );
  }, [activeCampaignId]);

  const deleteCharacterFromActiveCampaign = useCallback(async (characterId: string) => {
    if (!activeCampaignId) {
      console.warn("Cannot delete character: No active campaign.");
      return;
    }
    setActiveCampaignParty(prevParty => prevParty.filter(char => char.id !== characterId));
  }, [activeCampaignId]);

  const incrementPartyLevel = useCallback(async () => {
    if (!activeCampaignId) {
      console.warn("Cannot level up party: No active campaign.");
      return;
    }
    setActiveCampaignParty(prevParty => 
      prevParty.map(char => ({ ...char, level: char.level + 1 }))
    );
  }, [activeCampaignId]);

  const setPartyLevel = useCallback(async (targetLevel: number) => {
    if (!activeCampaignId) {
      console.warn("Cannot set party level: No active campaign.");
      return;
    }
    if (targetLevel <= 0) {
      console.warn("Cannot set party level: Target level must be positive.");
      return;
    }
    setActiveCampaignParty(prevParty => 
      prevParty.map(char => ({ ...char, level: targetLevel }))
    );
  }, [activeCampaignId]);

  const notifyEncounterUpdate = useCallback(() => {
    setEncounterUpdateKey(prevKey => prevKey + 1);
  }, []);

  const activeCampaign = activeCampaignId ? campaigns.find(c => c.id === activeCampaignId) || null : null;

  return (
    <CampaignContext.Provider value={{ 
      campaigns, 
      activeCampaign, 
      activeCampaignParty,
      isLoadingCampaigns,
      isLoadingParty, 
      addCampaign, 
      setActiveCampaignId,
      deleteCampaign,
      addCharacterToActiveCampaign,
      updateCharacterInActiveCampaign,
      deleteCharacterFromActiveCampaign,
      incrementPartyLevel,
      setPartyLevel,
      getCampaignById,
      encounterUpdateKey,
      notifyEncounterUpdate
    }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
