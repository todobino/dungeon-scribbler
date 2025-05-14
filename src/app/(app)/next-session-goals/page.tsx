
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ClipboardList, Zap, Brain, LinkIcon as LinkIconLucide } from "lucide-react"; // Renamed LinkIcon to avoid conflict
import { useState } from "react";

interface Goal {
  id: string;
  text: string;
  linkedNoteIds?: string[]; // Placeholder for future linking
}

interface GeneratedIdea {
  id: string;
  idea: string;
}

export default function NextSessionGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[] | null>(null);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals(prev => [...prev, { id: Date.now().toString(), text: newGoal.trim() }]);
      setNewGoal("");
    }
  };

  const handleGenerateIdeas = async () => {
    if (goals.length === 0) {
        // Consider a toast here if you re-enable them
        console.warn("No goals to generate ideas for.");
        return;
    }
    setIsGeneratingIdeas(true);
    setGeneratedIdeas(null);
    // Placeholder for AI call
    const currentGoalsText = goals.map(g => g.text).join("\n- ");
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setGeneratedIdeas([
        { id: "idea1", idea: `Have a mysterious NPC approach the party with a rumor related to: "${goals[0]?.text || 'your primary goal'}"` },
        { id: "idea2", idea: `An old enemy resurfaces, their actions directly hindering: "${goals[1]?.text || 'another key objective'}"` },
        { id: "idea3", idea: `The party discovers a clue that links two of your plot beats: e.g., a letter or item.`}
    ]);
    setIsGeneratingIdeas(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><ClipboardList className="mr-3 h-8 w-8 text-primary"/>Next Session Goals</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Goals List & Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planned Plot Beats / Goals</CardTitle>
              <CardDescription>Outline key objectives and events for the upcoming session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.length === 0 && (
                <p className="text-muted-foreground">No goals set for the next session yet.</p>
              )}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {goals.map(goal => (
                  <div key={goal.id} className="p-3 border rounded-md bg-card shadow-sm">
                    <p className="text-sm">{goal.text}</p>
                    {/* Placeholder for linked notes display */}
                    {goal.linkedNoteIds && goal.linkedNoteIds.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Linked Notes: {goal.linkedNoteIds.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Goal / Plot Beat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="new-goal">Goal Description</Label>
                <Textarea 
                  id="new-goal" 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g., Investigate the strange occurrences at the old mill."
                  rows={3}
                />
              </div>
              {/* Placeholder for linking to other notes */}
              <div>
                <Button variant="outline" size="sm" disabled>
                  <LinkIconLucide className="mr-2 h-4 w-4"/> Link to Notes (Coming Soon)
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddGoal}><PlusCircle className="mr-2 h-5 w-5"/>Add Goal</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: AI Idea Generation */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Brain className="mr-2 h-5 w-5 text-primary"/>AI Idea Generator</CardTitle>
              <CardDescription>Get AI suggestions on how to weave your plot beats into the session.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGenerateIdeas} 
                className="w-full" 
                disabled={isGeneratingIdeas || goals.length === 0}
              >
                <Zap className="mr-2 h-4 w-4" />
                {isGeneratingIdeas ? "Generating..." : "Generate Interaction Ideas"}
              </Button>
            </CardContent>
          </Card>

          {isGeneratingIdeas && (
            <Card>
                <CardContent className="p-4">
                    <p className="text-muted-foreground animate-pulse">AI is brainstorming interaction hooks...</p>
                </CardContent>
            </Card>
          )}

          {generatedIdeas && !isGeneratingIdeas && (
            <Card className="bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Generated Ideas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {generatedIdeas.map(idea => (
                    <p key={idea.id} className="text-sm p-2 border-b border-primary/20 last:border-b-0">💡 {idea.idea}</p>
                ))}
              </CardContent>
            </Card>
          )}
          <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Add your planned plot beats or goals for the next session.</p>
                <p>2. Click "Generate Interaction Ideas" to get AI suggestions on how to introduce these elements to your players.</p>
                <p>3. (Coming Soon) Link goals to specific campaign journal entries or NPC profiles for more context.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
