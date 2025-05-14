
"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ClipboardList, Zap, Brain, HelpCircle, Edit3, Trash2, ChevronDown, Eye, PlusSquare, ClipboardCheck, Library, Users, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter as UIDialogFooter, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as UIAlertDialogContent, AlertDialogDescription as UIAlertDialogDescription, AlertDialogFooter as UIAlertDialogFooter, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { PlotPoint } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  REFACTORED_GOALS_KEY_PREFIX, 
  REFACTORED_PLOT_POINTS_KEY_PREFIX,
  REFACTORED_CURRENT_SESSION_KEY_PREFIX,
  REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX
} from "@/lib/constants";

interface Goal {
  id: string;
  text: string;
  details?: string;
  generatedIdeas?: GeneratedIdea[];
}

interface GeneratedIdea {
  id: string;
  idea: string;
}

export default function NextSessionGoalsRefactoredPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();
  const { toast } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null);
  const [isGeneratingIdeasForGoal, setIsGeneratingIdeasForGoal] = useState<Record<string, boolean>>({});
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);


  const getCampaignSpecificKey = useCallback((prefix: string) => {
    if (!activeCampaign) return null;
    return `${prefix}${activeCampaign.id}`;
  }, [activeCampaign]);

  // Load goals when activeCampaign changes
  useEffect(() => {
    if (isLoadingCampaigns) return;

    if (!activeCampaign) {
      setGoals([]);
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    const goalsKey = getCampaignSpecificKey(REFACTORED_GOALS_KEY_PREFIX);
    if (goalsKey) {
      try {
        const storedGoals = localStorage.getItem(goalsKey);
        if (storedGoals) {
          setGoals(JSON.parse(storedGoals));
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error("Error loading goals from localStorage:", error);
        setGoals([]); 
      }
    } else {
      setGoals([]);
    }
    setIsLoadingData(false);
  }, [activeCampaign, isLoadingCampaigns, getCampaignSpecificKey]);

  // Save goals when they change
  useEffect(() => {
    if (activeCampaign && !isLoadingData) {
      const goalsKey = getCampaignSpecificKey(REFACTORED_GOALS_KEY_PREFIX);
      if (goalsKey) {
        try {
          localStorage.setItem(goalsKey, JSON.stringify(goals));
        } catch (error) {
          console.error("Error saving goals to localStorage:", error);
        }
      }
    }
  }, [goals, activeCampaign, isLoadingData, getCampaignSpecificKey]);


  const handleOpenAddGoalDialog = () => {
    setNewGoalText("");
    setAddGoalDialogOpen(true);
  };

  const handleAddGoal = () => {
    if (newGoalText.trim() && activeCampaign) {
      const newGoal: Goal = { 
        id: Date.now().toString(), 
        text: newGoalText.trim(), 
        details: "", 
        generatedIdeas: [] 
      };
      setGoals(prev => [...prev, newGoal]);
      setNewGoalText("");
      setAddGoalDialogOpen(false);
      setOpenAccordionItem(newGoal.id); 
      handleToggleEditMode(newGoal.id); // Enter edit mode for the new goal
    }
  };

  const handleDetailsChange = (goalId: string, newDetails: string) => {
    setGoals(prevGoals => 
      prevGoals.map(g => g.id === goalId ? { ...g, details: newDetails } : g)
    );
  };

  const handleToggleEditMode = (goalId: string) => {
    if (editingGoalId === goalId) { 
      setEditingGoalId(null); // If already editing this goal, exit edit mode
    } else { 
      setEditingGoalId(goalId); // Enter edit mode for this goal
      if (openAccordionItem !== goalId) { 
        setOpenAccordionItem(goalId); // Also ensure its accordion item is open
      }
    }
  };

  const handleGenerateIdeas = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || !activeCampaign) return;

    setIsGeneratingIdeasForGoal(prev => ({...prev, [goalId]: true}));
    
    // Mock AI call
    const promptText = `Goal for campaign "${activeCampaign.name}": ${goal.text}\nDetails: ${goal.details || "No specific details provided."}`;
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const mockIdeas: GeneratedIdea[] = [
        { id: `idea-${goalId}-1-${Date.now()}`, idea: `An NPC mentions something related to: "${goal.text.substring(0,20)}..." (considering details).` },
        { id: `idea-${goalId}-2-${Date.now()}`, idea: `A discovered item or clue directly points towards achieving or complicating: "${(goal.details || goal.text).substring(0,30)}..."` },
        { id: `idea-${goalId}-3-${Date.now()}`, idea: `An unexpected event forces the party to react, influencing: "${goal.text}". Relevant detail: "${goal.details?.substring(0,20)}..."`}
    ];
    
    setGoals(prevGoals => prevGoals.map(g => g.id === goalId ? {...g, generatedIdeas: [...(g.generatedIdeas || []), ...mockIdeas]} : g));
    setIsGeneratingIdeasForGoal(prev => ({...prev, [goalId]: false}));
  };
  
  const handleAddIdeaToDetails = (goalId: string, ideaText: string) => {
    setGoals(prevGoals => 
      prevGoals.map(g => {
        if (g.id === goalId) {
          const currentDetails = g.details || "";
          // Add as a new bullet point if details already exist, otherwise just add the text.
          const newDetails = `${currentDetails}${currentDetails ? '\\n' : ''}- ${ideaText}`;
          return { ...g, details: newDetails };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoalToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDeleteId) {
      setGoals(prev => prev.filter(goal => goal.id !== goalToDeleteId));
      if (openAccordionItem === goalToDeleteId) setOpenAccordionItem(null);
      if (editingGoalId === goalToDeleteId) setEditingGoalId(null);
      setGoalToDeleteId(null);
    }
    setIsDeleteConfirmOpen(false);
  };

  const handleAccordionChange = (value: string | string[]) => {
    const newOpenItem = Array.isArray(value) ? value[0] : value;
    setOpenAccordionItem(newOpenItem || null);
    // If the currently editing goal's accordion item is closed, exit edit mode for that goal
    if (editingGoalId && newOpenItem !== editingGoalId) { 
      setEditingGoalId(null); 
    }
  };

  const renderFormattedDetails = (details?: string) => {
    if (!details || details.trim() === "") {
      return <p className="text-sm text-muted-foreground italic">No details added yet. Click <Edit3 className="inline h-3 w-3 align-text-bottom"/> to add some.</p>;
    }
    const lines = details.split('\\n');
    const elements: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentList.push(<li key={`detail-line-${i}`} className="ml-4">{line.substring(2)}</li>);
      } else {
        if (currentList.length > 0) {
          elements.push(<ul key={`ul-details-${elements.length}-${Math.random()}`} className="list-disc list-outside pl-5 space-y-1">{currentList}</ul>);
          currentList = [];
        }
        if (line.trim() !== "") {
          elements.push(<p key={`detail-line-${i}`} className="text-sm">{line}</p>);
        }
      }
    }
    if (currentList.length > 0) {
      elements.push(<ul key={`ul-details-${elements.length}-${Math.random()}`} className="list-disc list-outside pl-5 space-y-1">{currentList}</ul>);
    }
    return <div className="space-y-2">{elements}</div>;
  };

  const handleLogGoalAsCompleted = async (goal: Goal) => {
    if (!activeCampaign) {
      toast({
        title: "No Active Campaign",
        description: "Cannot log goal. Please select an active campaign.",
        variant: "destructive",
      });
      return;
    }

    const plotPointsKey = getCampaignSpecificKey(REFACTORED_PLOT_POINTS_KEY_PREFIX);
    const currentSessionKey = getCampaignSpecificKey(REFACTORED_CURRENT_SESSION_KEY_PREFIX);
    const fullCampaignSummaryKey = getCampaignSpecificKey(REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);

    if (!plotPointsKey || !currentSessionKey || !fullCampaignSummaryKey) {
        toast({title: "Error", description: "Campaign keys are missing for logging.", variant: "destructive"});
        return;
    }
    
    try {
      const storedPlotPoints = localStorage.getItem(plotPointsKey);
      let plotPoints: PlotPoint[] = storedPlotPoints ? JSON.parse(storedPlotPoints) : [];
      
      const storedSessionNumber = localStorage.getItem(currentSessionKey);
      let currentSessionNumber = storedSessionNumber ? parseInt(storedSessionNumber, 10) : 1;
      if (isNaN(currentSessionNumber) || currentSessionNumber < 1) currentSessionNumber = 1;

      const newPlotPoint: PlotPoint = {
        id: Date.now().toString(),
        sessionNumber: currentSessionNumber,
        timestamp: new Date().toISOString(),
        text: `Completed Goal: ${goal.text}${goal.details ? `\\nDetails:\\n${goal.details}` : ''}`,
      };

      plotPoints.push(newPlotPoint);
      plotPoints.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      localStorage.setItem(plotPointsKey, JSON.stringify(plotPoints));
      localStorage.removeItem(fullCampaignSummaryKey); // Invalidate full campaign summary

      toast({
        title: "Goal Logged!",
        description: `"${goal.text.substring(0,30)}..." marked as completed in session ${currentSessionNumber} log (Adventure Recap).`,
      });

    } catch (error) {
      console.error("Error logging goal as completed:", error);
      toast({
        title: "Error Logging Goal",
        description: "Could not log goal as completed. Check console for details.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingCampaigns || isLoadingData) {
    return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>Loading campaign data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to manage its next session goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/campaign-management">
              <Users className="mr-2 h-5 w-5" /> Go to Campaign Management
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><ClipboardList className="mr-3 h-8 w-8 text-primary"/>Next Session Goals for {activeCampaign.name}</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpDialogOpen(true)} aria-label="Help with Next Session Goals">
            <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Planned Plot Beats / Goals</CardTitle>
            <CardDescription>
              Plan your session. Expand goals to view their details, or click the edit icon (<Edit3 className="inline h-3 w-3 align-text-bottom mr-0.5"/>) to modify details, generate ideas, and more.
            </CardDescription>
          </div>
           <Button onClick={handleOpenAddGoalDialog}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add Goal
            </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
             <div className="text-center py-8">
                <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">No goals set for the next session yet.</p>
                <Button onClick={handleOpenAddGoalDialog} className="mt-4">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add First Goal
                </Button>
            </div>
          ) : (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-2"
              value={openAccordionItem || undefined}
              onValueChange={handleAccordionChange}
            >
              {goals.map(goal => (
                <AccordionItem value={goal.id} key={goal.id} className="border rounded-md px-3 bg-card shadow-sm">
                  <div className="flex items-center py-1">
                     <AccordionTrigger className="flex-1 py-2 hover:no-underline justify-start">
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 mr-2 accordion-chevron" />
                        <span className="text-base font-medium text-left flex-1 truncate pr-2">{goal.text}</span>
                    </AccordionTrigger>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleEditMode(goal.id)} className="ml-2 h-8 w-8">
                      {editingGoalId === goal.id ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <AccordionContent className="pt-1 pb-3 space-y-4">
                    {editingGoalId === goal.id ? ( // Full edit mode
                      <>
                        <div>
                          <Label htmlFor={`details-${goal.id}`} className="text-sm font-medium">Details / Description</Label>
                          <Textarea
                            id={`details-${goal.id}`}
                            value={goal.details || ""}
                            onChange={(e) => handleDetailsChange(goal.id, e.target.value)}
                            placeholder="Add bullet points, notes, or scene descriptions..."
                            rows={4}
                            className="mt-1 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                           <Button 
                              onClick={() => handleGenerateIdeas(goal.id)} 
                              variant="outline"
                              size="sm"
                              disabled={isGeneratingIdeasForGoal[goal.id]}
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              {isGeneratingIdeasForGoal[goal.id] ? "Generating Ideas..." : "Generate Interaction Ideas"}
                            </Button>

                          {isGeneratingIdeasForGoal[goal.id] && <p className="text-sm text-muted-foreground animate-pulse">AI is brainstorming...</p>}
                          
                          {goal.generatedIdeas && goal.generatedIdeas.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {goal.generatedIdeas.map(idea => (
                                <div key={idea.id} className="text-sm p-2 rounded-md bg-primary/10 flex justify-between items-center">
                                  <p className="text-primary flex-1">💡 {idea.idea}</p>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-primary hover:bg-primary/20"
                                    onClick={() => handleAddIdeaToDetails(goal.id, idea.idea)}
                                    title="Add idea to details"
                                  >
                                    <PlusSquare className="h-4 w-4"/>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-start gap-2 pt-2 border-t mt-3">
                            <Button onClick={() => handleLogGoalAsCompleted(goal)} variant="outline" size="sm">
                                <ClipboardCheck className="mr-2 h-4 w-4" /> Log as Completed
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Goal
                            </Button>
                        </div>
                      </>
                    ) : ( // Read-only formatted details when expanded but not in edit mode
                      <div className="text-sm py-2">
                        {renderFormattedDetails(goal.details)}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
        {goals.length > 0 && (
            <CardFooter>
                <Button onClick={handleOpenAddGoalDialog}>
                    <PlusCircle className="mr-2 h-5 w-5"/> Add Another Goal
                </Button>
            </CardFooter>
        )}
      </Card>

      <Dialog open={addGoalDialogOpen} onOpenChange={setAddGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal / Plot Beat</DialogTitle>
            <DialogDescription>Enter the main text for your new goal. You can add details later.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-goal-text-dialog">Goal Description</Label>
            <Input 
              id="new-goal-text-dialog" 
              value={newGoalText} 
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="e.g., Investigate the strange occurrences at the old mill."
              className="mt-1"
            />
          </div>
          <UIDialogFooter>
            <Button variant="outline" onClick={() => setAddGoalDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGoal} disabled={!newGoalText.trim()}>Add Goal</Button>
          </UIDialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <UIAlertDialogContent>
          <UIAlertDialogHeader>
            <UIAlertDialogTitle>Are you sure?</UIAlertDialogTitle>
            <UIAlertDialogDescription>
              This action cannot be undone. This will permanently delete the goal and all its details and generated ideas.
            </UIAlertDialogDescription>
          </UIAlertDialogHeader>
          <UIAlertDialogFooter>
            <AlertDialogCancel onClick={() => { setGoalToDeleteId(null); setIsDeleteConfirmOpen(false); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className={buttonVariants({variant: "destructive"})}>Delete Goal</AlertDialogAction>
          </UIAlertDialogFooter>
        </UIAlertDialogContent>
      </AlertDialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>How to Use: Next Session Goals (Refactored)</DialogTitle>
                <DialogDescription>Outline and develop plot beats for upcoming sessions.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-3">
            <div className="text-sm text-muted-foreground space-y-3 py-4">
                <p>1. Click "<PlusCircle className="inline h-4 w-4 align-text-bottom mr-0.5"/> Add Goal" (in the card header or footer) to open a dialog and input a new plot beat or objective.</p>
                <p>2. For each goal in the list:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Click the goal text or the <ChevronDown className="inline h-4 w-4 align-text-bottom accordion-chevron mr-0.5"/> icon (on the left) to expand/collapse and view its formatted details.</li>
                    <li>Click the <Edit3 className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon (on the right) to enter full edit mode for that goal. The icon will change to <Eye className="inline h-4 w-4 align-text-bottom mr-0.5"/>.</li>
                </ul>
                <p>3. When a goal is in <strong className="text-foreground">edit mode</strong> (expanded, and <Eye className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon visible):</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Use the "Details / Description" textarea to add notes, bullet points, or scene descriptions. Changes are auto-saved.</li>
                    <li>Click "<Zap className="inline h-4 w-4 align-text-bottom mr-0.5"/> Generate Interaction Ideas" for AI suggestions based on the goal and its details.</li>
                    <li>Click the <PlusSquare className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon next to a generated idea to append it to the details textarea (auto-saved).</li>
                    <li>Click "<ClipboardCheck className="inline h-4 w-4 align-text-bottom mr-0.5"/> Log as Completed" to add this goal to the "Adventure Recap" log for the current session.</li>
                    <li>Click "<Trash2 className="inline h-4 w-4 align-text-bottom mr-0.5"/> Delete Goal" to remove it (confirmation required).</li>
                </ul>
                <p>4. Click the <Eye className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon (when in edit mode) to return to the read-only formatted view of the details for that goal (it remains expanded).</p>
                <p>5. All goals and their details are saved per campaign to your browser's local storage.</p>
            </div>
            </ScrollArea>
            <UIDialogFooter>
                <DialogClose asChild>
                    <Button>Close</Button>
                </DialogClose>
            </UIDialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

