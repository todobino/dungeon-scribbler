
"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ClipboardList, Zap, Brain, HelpCircle, Edit3, Trash2, ChevronDown, Eye, PlusSquare, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter as UIDialogFooter, DialogClose } from "@/components/ui/dialog"; // Renamed DialogFooter to UIDialogFooter
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent as UIAlertDialogContent, AlertDialogDescription as UIAlertDialogDescription, AlertDialogFooter as UIAlertDialogFooter, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { PlotPoint } from "@/lib/types";
import { 
  GOALS_STORAGE_KEY,
  PLOT_POINTS_STORAGE_KEY,
  CURRENT_SESSION_STORAGE_KEY,
  FULL_CAMPAIGN_SUMMARY_STORAGE_KEY
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

export default function NextSessionGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingDetails, setEditingDetails] = useState<string>(""); 
  
  const [openAccordionItem, setOpenAccordionItem] = useState<string | null>(null);

  const [isGeneratingIdeasForGoal, setIsGeneratingIdeasForGoal] = useState<Record<string, boolean>>({});
  
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error("Error loading goals from localStorage:", error);
      setGoals([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error("Error saving goals to localStorage:", error);
    }
  }, [goals]);


  const handleOpenAddGoalDialog = () => {
    setNewGoalText("");
    setAddGoalDialogOpen(true);
  };

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      const newGoal: Goal = { 
        id: Date.now().toString(), 
        text: newGoalText.trim(), 
        details: "", 
        generatedIdeas: [] 
      };
      setGoals(prev => [...prev, newGoal]);
      setNewGoalText("");
      setAddGoalDialogOpen(false);
      setOpenAccordionItem(newGoal.id); // Optionally open the new goal
      setEditingGoalId(newGoal.id); // Optionally enter edit mode for the new goal
      setEditingDetails("");
    }
  };

  const handleDetailsChange = (goalId: string, newDetails: string) => {
    setGoals(prevGoals => 
      prevGoals.map(g => g.id === goalId ? { ...g, details: newDetails } : g)
    );
  };

  const handleToggleEditMode = (goalId: string) => {
    if (editingGoalId === goalId) { // If currently editing this goal, toggle to view mode
      setEditingGoalId(null);
      // Details are auto-saved, so no explicit save needed here
    } else { // If not editing this goal, or editing another, switch to edit this one
      const goal = goals.find(g => g.id === goalId);
      setEditingDetails(goal?.details || "");
      setEditingGoalId(goalId);
      if (openAccordionItem !== goalId) { // Ensure it's open if we start editing
        setOpenAccordionItem(goalId);
      }
    }
  };

  const handleGenerateIdeas = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setIsGeneratingIdeasForGoal(prev => ({...prev, [goalId]: true}));
    
    // Placeholder for AI call
    const promptText = `Goal: ${goal.text}\nDetails: ${goal.details || "No specific details provided."}`;
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const mockIdeas: GeneratedIdea[] = [
        { id: `idea-${goalId}-1`, idea: `A character directly mentions something related to: "${goal.text.substring(0,20)}..." based on details.` },
        { id: `idea-${goalId}-2`, idea: `An event occurs that complicates or advances the goal: "${(goal.details || goal.text).substring(0,30)}..."` },
        { id: `idea-${goalId}-3`, idea: `A discovery is made linked to: "${goal.text}". Consider using details: "${goal.details?.substring(0,20)}..."`}
    ];
    
    setGoals(prevGoals => prevGoals.map(g => g.id === goalId ? {...g, generatedIdeas: mockIdeas} : g));
    setIsGeneratingIdeasForGoal(prev => ({...prev, [goalId]: false}));
  };
  
  const handleAddIdeaToDetails = (goalId: string, ideaText: string) => {
    setGoals(prevGoals => 
      prevGoals.map(g => {
        if (g.id === goalId) {
          const currentDetails = g.details || "";
          const newDetails = `${currentDetails}${currentDetails ? '\n' : ''}- ${ideaText}`;
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
    if (editingGoalId && newOpenItem !== editingGoalId) { // If opening a different item or closing current editing one
      setEditingGoalId(null); // Exit edit mode for the previous one
    }
  };

  const renderFormattedDetails = (details?: string) => {
    if (!details || details.trim() === "") {
      return <p className="text-sm text-muted-foreground italic">No details added yet. Click <Edit3 className="inline h-3 w-3 align-text-bottom"/> to add some.</p>;
    }
    const lines = details.split('\n');
    const elements = [];
    let currentList: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentList.push(<li key={i} className="ml-4">{line.substring(2)}</li>);
      } else {
        if (currentList.length > 0) {
          elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-outside pl-5 space-y-1">{currentList}</ul>);
          currentList = [];
        }
        if (line.trim() !== "") {
          elements.push(<p key={i} className="text-sm">{line}</p>);
        }
      }
    }
    if (currentList.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-outside pl-5 space-y-1">{currentList}</ul>);
    }
    return <div className="space-y-2">{elements}</div>;
  };

  const handleLogGoalAsCompleted = async (goal: Goal) => {
    try {
      const storedPlotPoints = localStorage.getItem(PLOT_POINTS_STORAGE_KEY);
      let plotPoints: PlotPoint[] = storedPlotPoints ? JSON.parse(storedPlotPoints) : [];
      
      const storedSessionNumber = localStorage.getItem(CURRENT_SESSION_STORAGE_KEY);
      let currentSessionNumber = storedSessionNumber ? parseInt(storedSessionNumber, 10) : 1;
      if (isNaN(currentSessionNumber)) currentSessionNumber = 1;


      const newPlotPoint: PlotPoint = {
        id: Date.now().toString(),
        sessionNumber: currentSessionNumber,
        timestamp: new Date().toISOString(),
        text: `Completed Goal: ${goal.text}${goal.details ? `\nDetails: ${goal.details}` : ''}`,
      };

      plotPoints.push(newPlotPoint);
      plotPoints.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      localStorage.setItem(PLOT_POINTS_STORAGE_KEY, JSON.stringify(plotPoints));
      localStorage.removeItem(FULL_CAMPAIGN_SUMMARY_STORAGE_KEY); // Invalidate full summary

      toast({
        title: "Goal Logged!",
        description: `"${goal.text}" marked as completed in session ${currentSessionNumber} log.`,
      });

    } catch (error) {
      console.error("Error logging goal as completed:", error);
      toast({
        title: "Error",
        description: "Could not log goal. Check console for details.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><ClipboardList className="mr-3 h-8 w-8 text-primary"/>Next Session Goals</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsHelpDialogOpen(true)} aria-label="Help with Next Session Goals">
            <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Planned Plot Beats / Goals</CardTitle>
            <CardDescription>
              Plan your session. Click a goal to view details, or <Edit3 className="inline h-3 w-3 align-text-bottom mr-0.5"/> to edit and generate ideas.
            </CardDescription>
          </div>
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
                  <div className="flex items-center">
                    <AccordionTrigger className="flex-1 py-3 hover:no-underline">
                        <div className="flex items-center w-full">
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 mr-2 accordion-chevron" />
                            <span className="text-base font-medium text-left flex-1 truncate pr-2">{goal.text}</span>
                        </div>
                    </AccordionTrigger>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleEditMode(goal.id)} className="ml-2 h-8 w-8">
                      {editingGoalId === goal.id ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <AccordionContent className="pt-1 pb-3 space-y-4">
                    {editingGoalId === goal.id ? (
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
                    ) : (
                      // Read-only view of details
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
              This action cannot be undone. This will permanently delete the goal and all its details.
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
                <DialogTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>How to Use: Next Session Goals</DialogTitle>
                <UIDialogDescription>Outline and develop plot beats for upcoming sessions.</UIDialogDescription>
            </DialogHeader>
            <div className="text-sm text-muted-foreground space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <p>1. Click "<PlusCircle className="inline h-4 w-4 align-text-bottom mr-0.5"/> Add Goal" to input a new plot beat or objective.</p>
                <p>2. For each goal in the list:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Click the goal text or the <ChevronDown className="inline h-4 w-4 align-text-bottom accordion-chevron"/> icon to expand/collapse and view its formatted details.</li>
                    <li>Click the <Edit3 className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon to enter edit mode. The icon will change to <Eye className="inline h-4 w-4 align-text-bottom mr-0.5"/>.</li>
                </ul>
                <p>3. When a goal is in <strong className="text-foreground">edit mode</strong> (expanded, and <Eye className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon visible):</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Use the "Details / Description" textarea to add notes, bullet points, or scene descriptions. Changes are auto-saved.</li>
                    <li>Click "<Zap className="inline h-4 w-4 align-text-bottom mr-0.5"/> Generate Interaction Ideas" for AI suggestions based on the goal and its details.</li>
                    <li>Click the <PlusSquare className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon next to a generated idea to append it to the details textarea.</li>
                    <li>Click "<ClipboardCheck className="inline h-4 w-4 align-text-bottom mr-0.5"/> Log as Completed" to add this goal to the "Story So Far" log for the current session.</li>
                    <li>Click "<Trash2 className="inline h-4 w-4 align-text-bottom mr-0.5"/> Delete Goal" to remove it (confirmation required).</li>
                </ul>
                <p>4. Click the <Eye className="inline h-4 w-4 align-text-bottom mr-0.5"/> icon (when in edit mode) to return to the read-only formatted view of the details for that goal.</p>
            </div>
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

