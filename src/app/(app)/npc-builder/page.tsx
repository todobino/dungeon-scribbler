"use client";

import type { NPC } from "@/lib/types";
import { useState, useEffect } from "react";
import { generateNpc, type GenerateNpcInput, type GenerateNpcOutput } from "@/ai/flows/npc-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, UserCog, Zap, Trash2, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

export default function NpcBuilderPage() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [npcInput, setNpcInput] = useState<GenerateNpcInput>({
    name: "",
    race: "",
    occupation: "",
    setting: "",
    additionalDetails: "",
  });
  const [generatedNpc, setGeneratedNpc] = useState<GenerateNpcOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentNpcToView, setCurrentNpcToView] = useState<NPC | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNpcInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateNpc = async () => {
    if (!npcInput.name || !npcInput.race || !npcInput.occupation || !npcInput.setting) {
      toast({
        title: "Missing Information",
        description: "Please fill in Name, Race, Occupation, and Setting.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setGeneratedNpc(null);
    try {
      const result = await generateNpc(npcInput);
      setGeneratedNpc(result);
      toast({
        title: "NPC Generated!",
        description: `${npcInput.name} has been brought to life.`,
      });
    } catch (error) {
      console.error("Error generating NPC:", error);
      toast({
        title: "Error Generating NPC",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSaveNpc = () => {
    if (generatedNpc && npcInput.name) {
      const newNpc: NPC = {
        id: Date.now().toString(),
        name: npcInput.name,
        race: npcInput.race,
        occupation: npcInput.occupation,
        setting: npcInput.setting,
        description: generatedNpc.description,
        personalityTraits: generatedNpc.personalityTraits,
        backstory: generatedNpc.backstory,
        motivations: generatedNpc.motivations,
      };
      setNpcs(prevNpcs => [...prevNpcs, newNpc]);
      setGeneratedNpc(null); // Clear generated details
      setNpcInput({ name: "", race: "", occupation: "", setting: "", additionalDetails: ""}); // Reset form
      setIsFormDialogOpen(false); // Close dialog
      toast({
        title: "NPC Saved!",
        description: `${newNpc.name} has been added to your collection.`,
      });
    }
  };
  
  useEffect(() => {
    const storedNpcs = localStorage.getItem("dungeonScribblerNpcs");
    if (storedNpcs) {
      setNpcs(JSON.parse(storedNpcs));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dungeonScribblerNpcs", JSON.stringify(npcs));
  }, [npcs]);

  const handleDeleteNpc = (id: string) => {
    setNpcs(npcs.filter(npc => npc.id !== id));
    toast({ title: "NPC Deleted", description: "The NPC has been removed." });
  };

  const openViewDialog = (npc: NPC) => {
    setCurrentNpcToView(npc);
    setIsViewDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NPC Builder</h1>
        <Button onClick={() => {
          setGeneratedNpc(null); // Clear previous generation
          setNpcInput({ name: "", race: "", occupation: "", setting: "", additionalDetails: ""}); // Reset form
          setIsFormDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New NPC
        </Button>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New NPC</DialogTitle>
            <DialogDescription>Define the core attributes and let AI help flesh out the details.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-3">
            <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={npcInput.name} onChange={handleInputChange} placeholder="e.g., Gorok Stonefist" />
                </div>
                <div>
                  <Label htmlFor="race">Race</Label>
                  <Input id="race" name="race" value={npcInput.race} onChange={handleInputChange} placeholder="e.g., Orc, Elf" />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" name="occupation" value={npcInput.occupation} onChange={handleInputChange} placeholder="e.g., Blacksmith, Scholar" />
                </div>
                <div>
                  <Label htmlFor="setting">Setting</Label>
                  <Input id="setting" name="setting" value={npcInput.setting} onChange={handleInputChange} placeholder="e.g., Forgotten Realms, Eberron" />
                </div>
                <div>
                  <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
                  <Textarea id="additionalDetails" name="additionalDetails" value={npcInput.additionalDetails || ''} onChange={handleInputChange} placeholder="e.g., Has a limp, secretly a spy" />
                </div>
                <Button onClick={handleGenerateNpc} disabled={isLoading} className="w-full">
                  <Zap className="mr-2 h-5 w-5" />
                  {isLoading ? "Generating with AI..." : "Generate with AI"}
                </Button>

                {isLoading && (
                  <Card>
                    <CardHeader><CardTitle>Generating...</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                )}

                {generatedNpc && !isLoading && (
                  <Card className="mt-4 bg-secondary/50">
                    <CardHeader>
                      <CardTitle>AI Generated Details for {npcInput.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-primary">Description:</h4>
                        <p className="text-sm whitespace-pre-wrap">{generatedNpc.description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Personality Traits:</h4>
                        <p className="text-sm whitespace-pre-wrap">{generatedNpc.personalityTraits}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Backstory:</h4>
                        <p className="text-sm whitespace-pre-wrap">{generatedNpc.backstory}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Motivations:</h4>
                        <p className="text-sm whitespace-pre-wrap">{generatedNpc.motivations}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSaveNpc} className="w-full"><Save className="mr-2 h-4 w-4"/>Save NPC</Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {npcs.length === 0 && !isFormDialogOpen ? (
        <Card className="text-center py-12">
          <CardHeader>
            <UserCog className="mx-auto h-16 w-16 text-muted-foreground" />
            <CardTitle className="mt-4">No NPCs Created Yet</CardTitle>
            <CardDescription>Start by creating your first Non-Player Character.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsFormDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First NPC
            </Button>
          </CardContent>
        </Card>
      ) : npcs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your NPCs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {npcs.map((npc) => (
              <Card key={npc.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{npc.name}</CardTitle>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mt-2 -mr-2" onClick={() => handleDeleteNpc(npc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                  <CardDescription>{npc.race} {npc.occupation}</CardDescription>
                </CardHeader>
                <CardContent className="h-20 overflow-hidden text-ellipsis">
                  <p className="text-sm text-muted-foreground line-clamp-3">{npc.description || "No description available."}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => openViewDialog(npc)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* View NPC Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentNpcToView?.name}</DialogTitle>
            <DialogDescription>{currentNpcToView?.race} {currentNpcToView?.occupation} - From {currentNpcToView?.setting}</DialogDescription>
          </DialogHeader>
          {currentNpcToView && (
            <ScrollArea className="max-h-[70vh] p-1 pr-3">
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-semibold text-primary">Description:</h4>
                  <p className="text-sm whitespace-pre-wrap">{currentNpcToView.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Personality Traits:</h4>
                  <p className="text-sm whitespace-pre-wrap">{currentNpcToView.personalityTraits}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Backstory:</h4>
                  <p className="text-sm whitespace-pre-wrap">{currentNpcToView.backstory}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Motivations:</h4>
                  <p className="text-sm whitespace-pre-wrap">{currentNpcToView.motivations}</p>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
