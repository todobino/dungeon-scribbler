
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { DraftingCompass, Wand2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { 
  CAMPAIGN_LENGTH_OPTIONS, 
  CAMPAIGN_TONE_OPTIONS, 
  WORLD_STYLE_OPTIONS, 
  REGION_FOCUS_OPTIONS, 
  TECHNOLOGY_LEVEL_OPTIONS, 
  FACTION_TYPE_EXAMPLES, 
  POWER_BALANCE_OPTIONS,
  CAMPAIGN_WIZARD_DRAFT_KEY_PREFIX,
  type CampaignOption
} from "@/lib/constants";
// import { generateCampaignIdea, type GenerateCampaignIdeaInput, type GenerateCampaignIdeaOutput } from "@/ai/flows/campaign-wizard-flow"; // Placeholder for actual AI flow

interface CampaignWizardFormState {
  name: string;
  length: string;
  tone: string;
  playerLevelStart: number;
  playerLevelEnd: number;
  worldStyle: string;
  regionFocus: string;
  customRegionFocus?: string; // Added for "Other" option
  technologyLevel: string;
  factionTypes: string;
  powerBalance: string;
  campaignConcept: string;
}

type IdeaField = "campaignConcept" | "factionTypes";


export default function CampaignWizardPage() {
  const router = useRouter();
  const { addCampaign } = useCampaign();
  const { toast } = useToast();

  const initialFormState: CampaignWizardFormState = {
    name: "",
    length: "", 
    tone: "",
    playerLevelStart: 1,
    playerLevelEnd: 10,
    worldStyle: "", 
    regionFocus: "", 
    customRegionFocus: "",
    technologyLevel: "", 
    factionTypes: "",
    powerBalance: "", 
    campaignConcept: "",
  };

  const [formState, setFormState] = useState<CampaignWizardFormState>(initialFormState);
  const [isLoadingIdea, setIsLoadingIdea] = useState<Partial<Record<IdeaField, boolean>>>({});
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  
  const getDraftStorageKey = () => {
    // Ensure there's always a draft key, even if it's just a default one.
    // This avoids issues if activeCampaign is temporarily null during initialization.
    return `${CAMPAIGN_WIZARD_DRAFT_KEY_PREFIX}current`;
  };

  useEffect(() => {
    try {
      const draftKey = getDraftStorageKey();
      const storedDraft = localStorage.getItem(draftKey);
      if (storedDraft) {
        const parsedDraft = JSON.parse(storedDraft);
        // Ensure customRegionFocus defaults to empty string if not in draft
        setFormState({ ...initialFormState, ...parsedDraft, customRegionFocus: parsedDraft.customRegionFocus || "" });
      } else {
        setFormState(initialFormState);
      }
    } catch (error) {
      console.error("Error loading campaign draft:", error);
      setFormState(initialFormState); // Reset to initial if error
    }
  }, []); // Empty dependency array: run only on mount

  useEffect(() => {
    try {
      const draftKey = getDraftStorageKey();
      localStorage.setItem(draftKey, JSON.stringify(formState));
    } catch (error) {
      console.error("Error saving campaign draft:", error);
    }
  }, [formState]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof CampaignWizardFormState, value: string) => {
    setFormState(prev => {
        const newState = { ...prev, [name]: value };
        if (name === "regionFocus" && value !== "Other") {
            newState.customRegionFocus = ""; // Clear custom input if "Other" is not selected
        }
        return newState;
    });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };
  
  const handleGenerateIdea = async (field: IdeaField) => {
    setIsLoadingIdea(prev => ({ ...prev, [field]: true }));
    // const inputForAI: GenerateCampaignIdeaInput = { /* ... */ }; // Actual AI input
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      let suggestion = `AI generated idea for ${field} based on current form values.`;
      if (field === "factionTypes") {
        suggestion = "The Shadow Syndicate, The Sunstone Order, The Clockwork Artisans";
      } else if (field === "campaignConcept" && formState.name) {
        suggestion = `The players must unravel the mystery of the \"${formState.name}\" before it's too late.`;
      } else if (field === "campaignConcept") {
        suggestion = "A classic tale of heroes rising against an encroaching darkness.";
      }

      if (suggestion) {
        if (field === "campaignConcept" || field === "factionTypes") {
             setFormState(prev => ({ ...prev, [field]: suggestion }));
        }
        toast({ title: `Idea Generated for ${field.replace(/([A-Z])/g, ' $1')}`});
      } else {
        toast({ title: "AI couldn't generate an idea", description: "Try adding more details to other fields.", variant: "destructive" });
      }
    } catch (error) {
      console.error(`Error generating idea for ${field}:`, error);
      toast({ title: "Generation Error", description: "Something went wrong while generating ideas.", variant: "destructive" });
    }
    setIsLoadingIdea(prev => ({ ...prev, [field]: false }));
  };


  const handleCreateCampaign = async () => {
    if (!formState.name.trim()) {
      toast({ title: "Campaign Name Required", description: "Please enter a name for your campaign.", variant: "destructive" });
      return;
    }
    setIsCreatingCampaign(true);
    try {
      await addCampaign(formState.name.trim()); 
      toast({ title: "Campaign Created!", description: `"${formState.name.trim()}" is ready.` });
      const draftKey = getDraftStorageKey();
      localStorage.removeItem(draftKey); 
      router.push("/campaign-management");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({ title: "Failed to Create Campaign", variant: "destructive"});
    }
    setIsCreatingCampaign(false);
  };

  const renderSelectWithTooltips = (
    id: keyof CampaignWizardFormState,
    label: string,
    options: CampaignOption[],
    placeholder: string,
    description?: string
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <Select value={formState[id] as string} onValueChange={(value) => handleSelectChange(id, value || "")}>
        <SelectTrigger id={id} className="text-base">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <Tooltip key={opt.value} delayDuration={100}>
              <TooltipTrigger asChild>
                <SelectItem value={opt.value}>{opt.value}</SelectItem>
              </TooltipTrigger>
              <TooltipContent side="right" align="start" className="max-w-xs z-[60]">
                <p>{opt.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  
  const renderFieldWithGenerator = (
    id: IdeaField, 
    label: string, 
    children: React.ReactNode,
    description?: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleGenerateIdea(id)} 
            disabled={isLoadingIdea[id]}
            className="text-xs"
        >
          {isLoadingIdea[id] ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Wand2 className="h-3 w-3 mr-1" />}
          Suggest
        </Button>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  );

  return (
    <TooltipProvider>
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col bg-background">
      <div className="pb-6 mb-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <DraftingCompass className="mr-3 h-8 w-8 text-primary"/>
            Campaign Creation Wizard
          </h1>
          <Button variant="outline" asChild>
            <Link href="/campaign-management"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Campaigns</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">Craft the foundations of your new adventure. Use the "Suggest" buttons for AI-powered inspiration!</p>
      </div>

      <div className="flex-grow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                  <div>
                      <Label htmlFor="name" className="text-lg">Campaign Name*</Label>
                      <Input id="name" name="name" value={formState.name} onChange={handleInputChange} placeholder="e.g., The Shadow of the Dragon Lord" className="text-base"/>
                  </div>

                  {renderFieldWithGenerator("campaignConcept", "Overall Campaign Concept", 
                      <Textarea id="campaignConcept" name="campaignConcept" value={formState.campaignConcept} onChange={handleInputChange} placeholder="A brief, 1-2 sentence high-level concept for your campaign. What is it about?" rows={3} className="text-base"/>
                  )}

                  <div className="space-y-1.5">
                      <Label htmlFor="length">Length/Commitment</Label>
                      <Select value={formState.length} onValueChange={(value) => handleSelectChange("length", value || "")}>
                          <SelectTrigger id="length" className="text-base"><SelectValue placeholder="Select length/commitment"/></SelectTrigger>
                          <SelectContent>
                            {CAMPAIGN_LENGTH_OPTIONS.map(opt => (
                                <Tooltip key={opt.value} delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <SelectItem value={opt.value}>{opt.value}</SelectItem>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start" className="max-w-xs z-[60]">
                                        <p>{opt.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                          </SelectContent>
                      </Select>
                  </div>
                
                  <div className="space-y-1.5">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={formState.tone} onValueChange={(value) => handleSelectChange("tone", value || "")}>
                        <SelectTrigger id="tone" className="text-base"><SelectValue placeholder="Select a tone"/></SelectTrigger>
                        <SelectContent>
                        {CAMPAIGN_TONE_OPTIONS.map(opt => (
                            <Tooltip key={opt.value} delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <SelectItem value={opt.value}>{opt.value}</SelectItem>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="max-w-xs z-[60]">
                                    <p>{opt.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        </SelectContent>
                    </Select>
                  </div>

                  <div>
                      <Label className="block mb-1.5">Player Level Range</Label>
                      <div className="flex items-center gap-4">
                          <div className="flex-1">
                          <Label htmlFor="playerLevelStart" className="text-sm">Start Level</Label>
                          <Input id="playerLevelStart" name="playerLevelStart" type="number" value={formState.playerLevelStart.toString()} onChange={handleNumberInputChange} min="1" max="20" className="text-base"/>
                          </div>
                          <div className="flex-1">
                          <Label htmlFor="playerLevelEnd" className="text-sm">End Level</Label>
                          <Input id="playerLevelEnd" name="playerLevelEnd" type="number" value={formState.playerLevelEnd.toString()} onChange={handleNumberInputChange} min={formState.playerLevelStart} max="20" className="text-base"/>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  {renderSelectWithTooltips("worldStyle", "World Style", WORLD_STYLE_OPTIONS, "Select a world style")}
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="regionFocus">Primary Region Focus</Label>
                    <Select value={formState.regionFocus} onValueChange={(value) => handleSelectChange("regionFocus", value || "")}>
                        <SelectTrigger id="regionFocus" className="text-base"><SelectValue placeholder="Select a primary region type"/></SelectTrigger>
                        <SelectContent>
                        {REGION_FOCUS_OPTIONS.map(opt => (
                            <Tooltip key={opt.value} delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <SelectItem value={opt.value}>{opt.value}</SelectItem>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="max-w-xs z-[60]">
                                    <p>{opt.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        </SelectContent>
                    </Select>
                    {formState.regionFocus === "Other" && (
                        <div className="mt-2">
                            <Label htmlFor="customRegionFocus">Custom Region Focus</Label>
                            <Input 
                                id="customRegionFocus" 
                                name="customRegionFocus" 
                                value={formState.customRegionFocus || ""} 
                                onChange={handleInputChange} 
                                placeholder="Describe your custom region"
                                className="text-base mt-1"
                            />
                        </div>
                    )}
                  </div>

                  {renderSelectWithTooltips("technologyLevel", "Technology Level", TECHNOLOGY_LEVEL_OPTIONS, "Select a technology level")}
                  
                  {renderFieldWithGenerator("factionTypes", "Key Faction Archetypes", 
                      <Textarea id="factionTypes" name="factionTypes" value={formState.factionTypes} onChange={handleInputChange} placeholder={FACTION_TYPE_EXAMPLES} rows={3} className="text-base"/>
                  )}

                  {renderSelectWithTooltips("powerBalance", "Power Balance", POWER_BALANCE_OPTIONS, "Select power balance")}
              </div>
          </div>
      </div>

      <div className="pt-6 mt-auto border-t border-border">
        <Button 
          onClick={handleCreateCampaign} 
          disabled={!formState.name.trim() || isCreatingCampaign} 
          size="lg"
          className="w-full md:w-auto"
        >
          {isCreatingCampaign ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <DraftingCompass className="mr-2 h-5 w-5"/>}
          {isCreatingCampaign ? "Creating Campaign..." : "Create Campaign"}
        </Button>
      </div>
    </div>
    </TooltipProvider>
  );
}
