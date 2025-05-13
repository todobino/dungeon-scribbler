
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Campaign, PlayerCharacter } from '@/lib/types';
import type { DndClass } from '@/lib/constants';

interface CampaignContextType {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  activeCampaignParty: PlayerCharacter[];
  isLoadingCampaigns: boolean;
  isLoadingParty: boolean;
  addCampaign: (name: string) => Promise<Campaign>;
  setActiveCampaignId: (id: string | null) => void;
  addCharacterToActiveCampaign: (characterData: Omit<PlayerCharacter, 'id' | 'class'> & { class: DndClass} ) => Promise<void>;
  deleteCharacterFromActiveCampaign: (characterId: string) => Promise<void>;
  // updateCharacterInActiveCampaign: (character: PlayerCharacter) => Promise<void>; // For future use
  getCampaignById: (id: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const CAMPAIGNS_STORAGE_KEY = 'dungeonScribblerCampaigns';
const ACTIVE_CAMPAIGN_ID_STORAGE_KEY = 'dungeonScribblerActiveCampaignId';
const getPartyStorageKey = (campaignId: string) => `dungeonScribblerCharacters_${campaignId}`;

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignIdState] = useState<string | null>(null);
  const [activeCampaignParty, setActiveCampaignParty] = useState<PlayerCharacter[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isLoadingParty, setIsLoadingParty] = useState(false);

  // Load campaigns and active campaign ID from localStorage
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

  // Save campaigns to localStorage
  useEffect(() => {
    if (!isLoadingCampaigns) {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    }
  }, [campaigns, isLoadingCampaigns]);

  // Save active campaign ID to localStorage
  useEffect(() => {
    if (!isLoadingCampaigns) {
      if (activeCampaignId) {
        localStorage.setItem(ACTIVE_CAMPAIGN_ID_STORAGE_KEY, activeCampaignId);
      } else {
        localStorage.removeItem(ACTIVE_CAMPAIGN_ID_STORAGE_KEY);
      }
    }
  }, [activeCampaignId, isLoadingCampaigns]);

  // Load party for the active campaign
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

  // Save party for the active campaign to localStorage
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
    if (!activeCampaignId) { // Automatically set as active if no campaign is active
      setActiveCampaignIdState(newCampaign.id);
    }
    return newCampaign;
  }, [activeCampaignId]);

  const setActiveCampaignId = useCallback((id: string | null) => {
    setActiveCampaignIdState(id);
  }, []);
  
  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const addCharacterToActiveCampaign = useCallback(async (characterData: Omit<PlayerCharacter, 'id' | 'class'> & { class: DndClass}) => {
    if (!activeCampaignId) {
      console.warn("Cannot add character: No active campaign.");
      return;
    }
    const newCharacter: PlayerCharacter = {
      ...characterData,
      id: Date.now().toString(),
    };
    setActiveCampaignParty(prevParty => [...prevParty, newCharacter]);
  }, [activeCampaignId]);

  const deleteCharacterFromActiveCampaign = useCallback(async (characterId: string) => {
    if (!activeCampaignId) {
      console.warn("Cannot delete character: No active campaign.");
      return;
    }
    setActiveCampaignParty(prevParty => prevParty.filter(char => char.id !== characterId));
  }, [activeCampaignId]);

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
      addCharacterToActiveCampaign,
      deleteCharacterFromActiveCampaign,
      getCampaignById
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
