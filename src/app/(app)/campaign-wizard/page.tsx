
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CAMPAIGN_WIZARD_DRAFT_KEY_PREFIX
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
  technologyLevel: string;
  factionTypes: string;
  powerBalance: string;
  campaignConcept: string; // Added for a general concept
}

type IdeaField = keyof Omit<CampaignWizardFormState, 'name' | 'playerLevelStart' | 'playerLevelEnd' | 'campaignConcept'> | 'campaignConcept';


export default function CampaignWizardPage() {
  const router = useRouter();
  const { addCampaign, activeCampaign } = useCampaign();
  const { toast } = useToast();

  const initialFormState: CampaignWizardFormState = {
    name: "",
    length: CAMPAIGN_LENGTH_OPTIONS[2], // Default to Medium Campaign
    tone: "",
    playerLevelStart: 1,
    playerLevelEnd: 10,
    worldStyle: WORLD_STYLE_OPTIONS[0], // Default to High Fantasy
    regionFocus: "",
    technologyLevel: TECHNOLOGY_LEVEL_OPTIONS[3], // Default to Medieval
    factionTypes: "",
    powerBalance: POWER_BALANCE_OPTIONS[0],
    campaignConcept: "",
  };

  const [formState, setFormState] = useState<CampaignWizardFormState>(initialFormState);
  const [isLoadingIdea, setIsLoadingIdea] = useState<Partial<Record<IdeaField, boolean>>>({});
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  
  const getDraftStorageKey = () => {
    // Using a generic key for now, or could be user-specific if users were a thing
    return `${CAMPAIGN_WIZARD_DRAFT_KEY_PREFIX}current`;
  };

  // Load draft
  useEffect(() => {
    try {
      const draftKey = getDraftStorageKey();
      const storedDraft = localStorage.getItem(draftKey);
      if (storedDraft) {
        setFormState(JSON.parse(storedDraft));
      }
    } catch (error) {
      console.error("Error loading campaign draft:", error);
    }
  }, []);

  // Save draft
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
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };
  
  // Mock AI Idea Generation
  const handleGenerateIdea = async (field: IdeaField) => {
    setIsLoadingIdea(prev => ({ ...prev, [field]: true }));
    // const inputForAI: GenerateCampaignIdeaInput = {
    //   currentName: formState.name,
    //   currentTone: formState.tone,
    //   currentWorldStyle: formState.worldStyle,
    //   currentRegionFocus: formState.regionFocus,
    //   fieldToSuggest: field,
    //   // ... pass other relevant fields from formState
    // };
    try {
      // const result: GenerateCampaignIdeaOutput = await generateCampaignIdea(inputForAI); // Actual AI call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const result = { suggestedValue: `AI generated idea for ${field} based on: ${formState.name || 'new campaign'}, tone: ${formState.tone || 'any'}, style: ${formState.worldStyle || 'any'}.` };

      if (result.suggestedValue) {
        setFormState(prev => ({ ...prev, [field]: result.suggestedValue }));
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
      // Here you might want to save more details from formState to the campaign object
      // For now, just saving the name as per current useCampaign context
      await addCampaign(formState.name.trim()); 
      toast({ title: "Campaign Created!", description: `"${formState.name.trim()}" is ready.` });
      localStorage.removeItem(getDraftStorageKey()); // Clear draft
      router.push("/campaign-management");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({ title: "Failed to Create Campaign", variant: "destructive"});
    }
    setIsCreatingCampaign(false);
  };

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
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col bg-background">
      {/* Header Section */}
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

      {/* Form Section */}
      <div className="flex-grow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"> {/* Increased gap-x */}
              {/* Column 1 */}
              <div className="space-y-6">
                  <div>
                      <Label htmlFor="name" className="text-lg">Campaign Name*</Label>
                      <Input id="name" name="name" value={formState.name} onChange={handleInputChange} placeholder="e.g., The Shadow of the Dragon Lord" className="text-base"/>
                  </div>

                  {renderFieldWithGenerator("campaignConcept", "Overall Campaign Concept", 
                      <Textarea id="campaignConcept" name="campaignConcept" value={formState.campaignConcept} onChange={handleInputChange} placeholder="A brief, 1-2 sentence high-level concept for your campaign. What is it about?" rows={3}/>
                  )}

                  {renderFieldWithGenerator("length", "Length/Commitment",
                      <Select value={formState.length} onValueChange={(value) => handleSelectChange("length", value)}>
                          <SelectTrigger id="length"><SelectValue /></SelectTrigger>
                          <SelectContent>{CAMPAIGN_LENGTH_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                  )}

                  {renderFieldWithGenerator("tone", "Tone", 
                      <Input id="tone" name="tone" value={formState.tone} onChange={handleInputChange} placeholder="e.g., Heroic, Gritty, Humorous, Mysterious" />
                  )}

                  <div>
                      <Label className="block mb-1.5">Player Level Range</Label>
                      <div className="flex items-center gap-4">
                          <div className="flex-1">
                          <Label htmlFor="playerLevelStart" className="text-sm">Start Level</Label>
                          <Input id="playerLevelStart" name="playerLevelStart" type="number" value={formState.playerLevelStart.toString()} onChange={handleNumberInputChange} min="1" max="20"/>
                          </div>
                          <div className="flex-1">
                          <Label htmlFor="playerLevelEnd" className="text-sm">End Level</Label>
                          <Input id="playerLevelEnd" name="playerLevelEnd" type="number" value={formState.playerLevelEnd.toString()} onChange={handleNumberInputChange} min={formState.playerLevelStart} max="20"/>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                  {renderFieldWithGenerator("worldStyle", "World Style",
                      <Select value={formState.worldStyle} onValueChange={(value) => handleSelectChange("worldStyle", value)}>
                          <SelectTrigger id="worldStyle"><SelectValue /></SelectTrigger>
                          <SelectContent>{WORLD_STYLE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                  )}

                  {renderFieldWithGenerator("regionFocus", "Primary Region Focus",
                      <Select value={formState.regionFocus} onValueChange={(value) => handleSelectChange("regionFocus", value)}>
                          <SelectTrigger id="regionFocus" placeholder="Select a primary region type"><SelectValue /></SelectTrigger>
                          <SelectContent>{REGION_FOCUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                  )}
                  
                  {renderFieldWithGenerator("technologyLevel", "Technology Level",
                      <Select value={formState.technologyLevel} onValueChange={(value) => handleSelectChange("technologyLevel", value)}>
                          <SelectTrigger id="technologyLevel"><SelectValue /></SelectTrigger>
                          <SelectContent>{TECHNOLOGY_LEVEL_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                  )}
                  
                  {renderFieldWithGenerator("factionTypes", "Key Faction Archetypes", 
                      <Textarea id="factionTypes" name="factionTypes" value={formState.factionTypes} onChange={handleInputChange} placeholder={FACTION_TYPE_EXAMPLES} rows={3}/>
                  )}

                  {renderFieldWithGenerator("powerBalance", "Power Balance",
                      <Select value={formState.powerBalance} onValueChange={(value) => handleSelectChange("powerBalance", value)}>
                          <SelectTrigger id="powerBalance"><SelectValue /></SelectTrigger>
                          <SelectContent>{POWER_BALANCE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                  )}
              </div>
          </div>
      </div>

      {/* Footer Section */}
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
  );
}
