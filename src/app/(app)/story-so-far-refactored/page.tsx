
"use client";

// Imports remain the same...
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, History, Zap, Brain, ChevronRightSquare, List, AlignLeft, Library, Users, Loader2, Trash2, Edit3, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent as StandardDialogContent, // Aliasing to avoid conflict if other DialogContents are different
  DialogDescription as StandardDialogDescription,
  DialogFooter as StandardDialogFooter,
  DialogHeader as StandardDialogHeader,
  DialogTitle as StandardDialogTitle,
} from "@/components/ui/dialog";
import type { PlotPoint } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import {
  REFACTORED_PLOT_POINTS_KEY_PREFIX,
  REFACTORED_CURRENT_SESSION_KEY_PREFIX,
  REFACTORED_SESSION_SUMMARIES_KEY_PREFIX,
  REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX,
  REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX,
  REFACTORED_SUMMARY_DETAIL_LEVEL_KEY_PREFIX
} from "@/lib/constants";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type SummaryDetailLevel = "brief" | "normal" | "detailed";

export default function StorySoFarRefactoredPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();
  const { toast } = useToast();

  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [newPlotPointText, setNewPlotPointText] = useState("");
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);

  const [sessionSummaries, setSessionSummaries] = useState<Record<number, string>>({});
  const [sessionViewModes, setSessionViewModes] = useState<Record<number, 'summary' | 'details'>>({});
  const [fullCampaignSummary, setFullCampaignSummary] = useState<string | null>(null);

  const [isGeneratingGlobalSummary, setIsGeneratingGlobalSummary] = useState(false);
  const [isGeneratingSessionSummary, setIsGeneratingSessionSummary] = useState<Record<number, boolean>>({});

  const [summaryDetailLevel, setSummaryDetailLevel] = useState<SummaryDetailLevel>("normal");
  
  const [pastPlotPointInput, setPastPlotPointInput] = useState<Record<number, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isAdvanceSessionConfirmOpen, setIsAdvanceSessionConfirmOpen] = useState(false);
  const [isClearLogConfirm1Open, setIsClearLogConfirm1Open] = useState(false);
  const [isClearLogConfirm2Open, setIsClearLogConfirm2Open] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const [editingPlotPoint, setEditingPlotPoint] = useState<PlotPoint | null>(null);
  const [editedPlotPointText, setEditedPlotPointText] = useState("");
  const [isEditPlotPointDialogOpen, setIsEditPlotPointDialogOpen] = useState(false);

  const [plotPointToDeleteId, setPlotPointToDeleteId] = useState<string | null>(null);
  const [isDeletePlotPointConfirmOpen, setIsDeletePlotPointConfirmOpen] = useState(false);


  const getCampaignSpecificKey = useCallback((prefix: string) => {
    if (!activeCampaign) return null;
    return `${prefix}${activeCampaign.id}`;
  }, [activeCampaign]);

  useEffect(() => {
    if (isLoadingCampaigns) {
      setIsLoadingData(true); 
      return;
    }

    if (!activeCampaign) {
      setPlotPoints([]);
      setCurrentSessionNumber(1);
      setSessionSummaries({});
      setSessionViewModes({});
      setFullCampaignSummary(null);
      setSummaryDetailLevel("normal");
      setNewPlotPointText("");
      setPastPlotPointInput({});
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    const keys = {
      plotPoints: getCampaignSpecificKey(REFACTORED_PLOT_POINTS_KEY_PREFIX),
      currentSession: getCampaignSpecificKey(REFACTORED_CURRENT_SESSION_KEY_PREFIX),
      sessionSummaries: getCampaignSpecificKey(REFACTORED_SESSION_SUMMARIES_KEY_PREFIX),
      sessionViewModes: getCampaignSpecificKey(REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX),
      fullCampaignSummary: getCampaignSpecificKey(REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX),
      summaryDetailLevel: getCampaignSpecificKey(REFACTORED_SUMMARY_DETAIL_LEVEL_KEY_PREFIX),
    };

    try {
      const storedPlotPoints = keys.plotPoints ? localStorage.getItem(keys.plotPoints) : null;
      setPlotPoints(storedPlotPoints ? JSON.parse(storedPlotPoints) : []);
    } catch (e) { console.error("Error loading plot points for " + activeCampaign.name, e); setPlotPoints([]); }

    try {
      const storedSession = keys.currentSession ? localStorage.getItem(keys.currentSession) : null;
      const parsedSession = storedSession ? parseInt(storedSession, 10) : 1;
      setCurrentSessionNumber(isNaN(parsedSession) || parsedSession < 1 ? 1 : parsedSession);
    } catch (e) { console.error("Error loading current session for " + activeCampaign.name, e); setCurrentSessionNumber(1); }

    try {
      const storedSummaries = keys.sessionSummaries ? localStorage.getItem(keys.sessionSummaries) : null;
      setSessionSummaries(storedSummaries ? JSON.parse(storedSummaries) : {});
    } catch (e) { console.error("Error loading session summaries for " + activeCampaign.name, e); setSessionSummaries({}); }

    try {
      const storedViewModes = keys.sessionViewModes ? localStorage.getItem(keys.sessionViewModes) : null;
      setSessionViewModes(storedViewModes ? JSON.parse(storedViewModes) : {});
    } catch (e) { console.error("Error loading session view modes for " + activeCampaign.name, e); setSessionViewModes({}); }

    try {
      const storedFullSummary = keys.fullCampaignSummary ? localStorage.getItem(keys.fullCampaignSummary) : null;
      setFullCampaignSummary(storedFullSummary ? JSON.parse(storedFullSummary) : null);
    } catch (e) { console.error("Error loading full campaign summary for " + activeCampaign.name, e); setFullCampaignSummary(null); }

    try {
      const storedDetailLevel = keys.summaryDetailLevel ? localStorage.getItem(keys.summaryDetailLevel) : null;
      setSummaryDetailLevel((storedDetailLevel as SummaryDetailLevel) || "normal");
    } catch (e) { console.error("Error loading summary detail level for " + activeCampaign.name, e); setSummaryDetailLevel("normal"); }

    setNewPlotPointText("");
    setPastPlotPointInput({});
    setIsLoadingData(false);
  }, [activeCampaign, isLoadingCampaigns, getCampaignSpecificKey]);

  useEffect(() => {
    if (!activeCampaign || isLoadingData) return;
    const key = getCampaignSpecificKey(REFACTORED_PLOT_POINTS_KEY_PREFIX);
    if (key) try { localStorage.setItem(key, JSON.stringify(plotPoints)); } catch (e) { console.error("Error saving plot points for " + activeCampaign.name, e); }
  }, [plotPoints, activeCampaign, isLoadingData, getCampaignSpecificKey]);

  useEffect(() => {
    if (!activeCampaign || isLoadingData) return;
    const key = getCampaignSpecificKey(REFACTORED_CURRENT_SESSION_KEY_PREFIX);
    if (key) try { localStorage.setItem(key, currentSessionNumber.toString()); } catch (e) { console.error("Error saving current session for " + activeCampaign.name, e); }
  }, [currentSessionNumber, activeCampaign, isLoadingData, getCampaignSpecificKey]);

  useEffect(() => {
    if (!activeCampaign || isLoadingData) return;
    const key = getCampaignSpecificKey(REFACTORED_SESSION_SUMMARIES_KEY_PREFIX);
    if (key) try { localStorage.setItem(key, JSON.stringify(sessionSummaries)); } catch (e) { console.error("Error saving session summaries for " + activeCampaign.name, e); }
  }, [sessionSummaries, activeCampaign, isLoadingData, getCampaignSpecificKey]);

  useEffect(() => {
    if (!activeCampaign || isLoadingData) return;
    const key = getCampaignSpecificKey(REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX);
    if (key) try { localStorage.setItem(key, JSON.stringify(sessionViewModes)); } catch (e) { console.error("Error saving session view modes for " + activeCampaign.name, e); }
  }, [sessionViewModes, activeCampaign, isLoadingData, getCampaignSpecificKey]);

  useEffect(() => {
    if (!activeCampaign || isLoadingData) return;
    const key = getCampaignSpecificKey(REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);
    if (key) {
      try {
        if (fullCampaignSummary) localStorage.setItem(key, JSON.stringify(fullCampaignSummary));
        else localStorage.removeItem(key);
      } catch (e) { console.error("Error saving full campaign summary for " + activeCampaign.name, e); }
    }
  }, [fullCampaignSummary, activeCampaign, isLoadingData, getCampaignSpecificKey]);

  useEffect(() => {
    if (!activeCampaign || isLoadingData) return;
    const key = getCampaignSpecificKey(REFACTORED_SUMMARY_DETAIL_LEVEL_KEY_PREFIX);
    if (key) try { localStorage.setItem(key, summaryDetailLevel); } catch (e) { console.error("Error saving summary detail level for " + activeCampaign.name, e); }
  }, [summaryDetailLevel, activeCampaign, isLoadingData, getCampaignSpecificKey]);


  const clearFullCampaignSummaryCache = useCallback(() => {
    setFullCampaignSummary(null);
    const fullSummaryKey = getCampaignSpecificKey(REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);
    if (fullSummaryKey) {
        try { localStorage.removeItem(fullSummaryKey); }
        catch (e) { console.error("Error clearing full campaign summary from cache for " + activeCampaign?.name, e); }
    }
  }, [activeCampaign, getCampaignSpecificKey]);

  const handleAddPlotPointToCurrentSession = () => {
    if (newPlotPointText.trim() && activeCampaign) {
      const newPoint: PlotPoint = {
        id: Date.now().toString(),
        sessionNumber: currentSessionNumber,
        timestamp: new Date().toISOString(),
        text: newPlotPointText.trim()
      };
      setPlotPoints(prev => [...prev, newPoint].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      setNewPlotPointText("");
      clearFullCampaignSummaryCache();
    }
  };

  const handleAddPlotPointToPastSession = async (sessionNum: number) => {
    const textToAdd = pastPlotPointInput[sessionNum];
    if (textToAdd && textToAdd.trim() && activeCampaign) {
      const newPoint: PlotPoint = {
        id: Date.now().toString(),
        sessionNumber: sessionNum,
        timestamp: new Date().toISOString(),
        text: textToAdd.trim(),
      };
      setPlotPoints(prev => [...prev, newPoint].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      setPastPlotPointInput(prev => ({ ...prev, [sessionNum]: "" }));
      clearFullCampaignSummaryCache();
      await handleRegenerateSessionSummary(sessionNum);
    }
  };

  const generateSessionSummaryText = async (sessionNumberToSummarize: number, detailLevel: SummaryDetailLevel): Promise<string> => {
    const relevantPlotPoints = plotPoints.filter(p => p.sessionNumber === sessionNumberToSummarize);
    if (relevantPlotPoints.length === 0) {
      return `Session ${sessionNumberToSummarize} - No Recorded Events: This session had no recorded plot points.`;
    }

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    const pointsText = relevantPlotPoints.map(p => p.text).join(' Then, ');

    let mockTitle = "Key Developments";
    if (pointsText) {
      const firstFewWords = pointsText.split(' ').slice(0, 3).join(' ');
      mockTitle = firstFewWords.length > 25 ? firstFewWords.substring(0, 22) + "..." : firstFewWords;
      if (relevantPlotPoints.length > 1 && mockTitle.length < 25) mockTitle += " & More";
    }

    const summaryBody = `Key events for campaign "${activeCampaign?.name || 'N/A'}" (detail: ${detailLevel}) included: ${pointsText.substring(0, 120)}...`;
    return `Session ${sessionNumberToSummarize} - ${mockTitle}: ${summaryBody}`;
  };

  const handleAdvanceSession = async () => {
    if (!activeCampaign) return;
    const currentSessionPlotPoints = plotPoints.filter(p => p.sessionNumber === currentSessionNumber);

    if (currentSessionPlotPoints.length === 0) {
        toast({title: `Cannot End Session ${currentSessionNumber}`, description: "Please log at least one plot point before advancing to the next session.", variant: "destructive"});
        return;
    }

    setIsGeneratingSessionSummary(prev => ({ ...prev, [currentSessionNumber]: true }));
    try {
      const summaryText = await generateSessionSummaryText(currentSessionNumber, summaryDetailLevel);
      setSessionSummaries(prev => ({ ...prev, [currentSessionNumber]: summaryText }));
      setSessionViewModes(prev => ({ ...prev, [currentSessionNumber]: 'summary' }));
    } catch (error) {
      console.error("Error generating summary for session:", currentSessionNumber, error);
    } finally {
      setIsGeneratingSessionSummary(prev => ({ ...prev, [currentSessionNumber]: false }));
    }
    setCurrentSessionNumber(prev => prev + 1);
    clearFullCampaignSummaryCache();
  };

  const handleGenerateFullCampaignSummary = async () => {
    if (!activeCampaign || plotPoints.length === 0) return;
    setIsGeneratingGlobalSummary(true);
    setFullCampaignSummary(null); 
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    const allPlotPointsText = plotPoints.map(p => `S${p.sessionNumber}: ${p.text}`).join('\\n');
    const newSummary = `AI Generated Full Story Summary (Campaign: ${activeCampaign.name}, Detail: ${summaryDetailLevel}): The grand saga, woven from ${plotPoints.length} total plot points, unfolds thusly: ${allPlotPointsText.substring(0, 150)}... An epic indeed!`;
    setFullCampaignSummary(newSummary);
    setIsGeneratingGlobalSummary(false);
  };

  const handleRegenerateSessionSummary = async (sessionNum: number) => {
    if (!activeCampaign) return;
    setIsGeneratingSessionSummary(prev => ({ ...prev, [sessionNum]: true }));
    try {
      const summaryText = await generateSessionSummaryText(sessionNum, summaryDetailLevel);
      setSessionSummaries(prev => ({ ...prev, [sessionNum]: summaryText }));
    } catch (error) {
      console.error("Error re-generating summary for session:", sessionNum, error);
    } finally {
      setIsGeneratingSessionSummary(prev => ({ ...prev, [sessionNum]: false }));
    }
    clearFullCampaignSummaryCache();
  };

  const toggleSessionView = (sessionNum: number) => {
    setSessionViewModes(prev => ({
      ...prev,
      [sessionNum]: (prev[sessionNum] === 'summary' || !prev[sessionNum]) ? 'details' : 'summary'
    }));
  };

  const handleOpenEditPlotPointDialog = (point: PlotPoint) => {
    setEditingPlotPoint(point);
    setEditedPlotPointText(point.text);
    setIsEditPlotPointDialogOpen(true);
  };

  const handleSaveEditedPlotPoint = () => {
    if (editingPlotPoint && editedPlotPointText.trim()) {
      setPlotPoints(prevPlotPoints =>
        prevPlotPoints.map(p =>
          p.id === editingPlotPoint.id ? { ...p, text: editedPlotPointText.trim(), timestamp: new Date().toISOString() } : p
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      );
      clearFullCampaignSummaryCache();
      if (editingPlotPoint.sessionNumber < currentSessionNumber) {
        handleRegenerateSessionSummary(editingPlotPoint.sessionNumber);
      }
    }
    setIsEditPlotPointDialogOpen(false);
    setEditingPlotPoint(null);
  };
  
  const handleOpenDeletePlotPointConfirm = (id: string) => {
    setPlotPointToDeleteId(id);
    setIsDeletePlotPointConfirmOpen(true);
  };

  const handleConfirmDeletePlotPoint = () => {
    if (plotPointToDeleteId) {
      const pointToDelete = plotPoints.find(p => p.id === plotPointToDeleteId);
      setPlotPoints(prev => prev.filter(p => p.id !== plotPointToDeleteId));
      clearFullCampaignSummaryCache();
      if (pointToDelete && pointToDelete.sessionNumber < currentSessionNumber) {
        handleRegenerateSessionSummary(pointToDelete.sessionNumber);
      }
    }
    setIsDeletePlotPointConfirmOpen(false);
    setPlotPointToDeleteId(null);
  };


  const handleFinalClearLog = () => {
    if (!activeCampaign || deleteConfirmInput !== "DELETE") return;

    const plotPointsKey = getCampaignSpecificKey(REFACTORED_PLOT_POINTS_KEY_PREFIX);
    const currentSessionKey = getCampaignSpecificKey(REFACTORED_CURRENT_SESSION_KEY_PREFIX);
    const sessionSummariesKey = getCampaignSpecificKey(REFACTORED_SESSION_SUMMARIES_KEY_PREFIX);
    const sessionViewModesKey = getCampaignSpecificKey(REFACTORED_SESSION_VIEW_MODES_KEY_PREFIX);
    const fullCampaignSummaryKey = getCampaignSpecificKey(REFACTORED_FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);

    try {
      if (plotPointsKey) localStorage.removeItem(plotPointsKey);
      if (currentSessionKey) localStorage.removeItem(currentSessionKey);
      if (sessionSummariesKey) localStorage.removeItem(sessionSummariesKey);
      if (sessionViewModesKey) localStorage.removeItem(sessionViewModesKey);
      if (fullCampaignSummaryKey) localStorage.removeItem(fullCampaignSummaryKey);

      setPlotPoints([]);
      setCurrentSessionNumber(1);
      setSessionSummaries({});
      setSessionViewModes({});
      setFullCampaignSummary(null);
      setPastPlotPointInput({});

      toast({ title: "Campaign Log Cleared!", description: `All plot points and summaries for "${activeCampaign.name}" have been deleted.` });
    } catch (error) {
      console.error("Error clearing campaign log from localStorage:", error);
      toast({ title: "Error Clearing Log", description: "Could not clear all data. Check console.", variant: "destructive" });
    }

    setIsClearLogConfirm2Open(false);
    setDeleteConfirmInput("");
  };


  const renderFormattedPlotPoints = (points: PlotPoint[]) => {
    if (points.length === 0) {
      return <p className="text-sm text-muted-foreground italic py-2">No plot points recorded for this session yet.</p>;
    }
    return (
      <ul className="space-y-3">
        {points.map(point => (
          <li key={point.id} className="p-3 border rounded-md bg-card shadow-sm group">
            <p className="text-sm">{point.text}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">{new Date(point.timestamp).toLocaleString()}</p>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenEditPlotPointDialog(point)}>
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDeletePlotPointConfirm(point.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const allSessionNumbers = Array.from(new Set([
    ...plotPoints.map(p => p.sessionNumber),
    currentSessionNumber
  ])).sort((a, b) => b - a);


  if (isLoadingCampaigns || isLoadingData) {
    return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Loading campaign data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="w-full text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to manage its story.</CardDescription>
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
    <TooltipProvider>
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
        {/* Add Plot Point & AI Tools (Order 1 on mobile, Right column on LG) */}
        <div className="order-1 lg:order-2 lg:col-start-3 lg:row-start-1 space-y-6">
          {/* Add Plot Point Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add Plot Point to Current Session ({currentSessionNumber})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="new-plot-point">Event Description</Label>
                <Textarea
                  id="new-plot-point"
                  value={newPlotPointText}
                  onChange={(e) => setNewPlotPointText(e.target.value)}
                  placeholder="e.g., The party discovered the hidden cultist hideout."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddPlotPointToCurrentSession} disabled={!newPlotPointText.trim()}><PlusCircle className="mr-2 h-5 w-5" />Add to Log</Button>
            </CardFooter>
          </Card>

          {/* AI Story Tools Card */}
          <Card> 
            <CardHeader>
              <CardTitle className="flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" />AI Story Tools</CardTitle>
              <CardDescription>Generate a summary of the entire campaign or adjust detail level for new summaries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="summary-detail-level">Summary Detail Level (for new summaries)</Label>
                <Select
                  value={summaryDetailLevel}
                  onValueChange={(value) => setSummaryDetailLevel(value as SummaryDetailLevel)}
                  disabled={isGeneratingGlobalSummary || Object.values(isGeneratingSessionSummary).some(loading => loading)}
                >
                  <SelectTrigger id="summary-detail-level">
                    <SelectValue placeholder="Select detail level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerateFullCampaignSummary}
                className="w-full"
                disabled={isGeneratingGlobalSummary || plotPoints.length === 0 || Object.values(isGeneratingSessionSummary).some(loading => loading)}
              >
                {isGeneratingGlobalSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Generate Full Summary
              </Button>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setIsClearLogConfirm1Open(true)}
                disabled={plotPoints.length === 0 && Object.keys(sessionSummaries).length === 0 && !fullCampaignSummary && currentSessionNumber === 1}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear Entire Campaign Log
              </Button>
            </CardFooter>
          </Card>

          {/* Conditional Global Summary Card */}
          {isGeneratingGlobalSummary && (
            <Card>
              <CardContent className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <p className="text-muted-foreground">AI is weaving the grand tale with {summaryDetailLevel} detail...</p>
              </CardContent>
            </Card>
          )}

          {fullCampaignSummary && !isGeneratingGlobalSummary && (
            <Card className="bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Generated Full Campaign Summary</CardTitle>
                <CardDescription>Detail Level: {summaryDetailLevel}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{fullCampaignSummary}</p>
              </CardContent>
            </Card>
          )}
        </div>


        {/* Campaign Log (Order 2 on mobile, Left column on LG) */}
        <div className="order-2 lg:order-1 lg:col-span-2 lg:row-span-2 flex flex-col h-full">
          <Card className="flex flex-col flex-grow">
            <CardHeader className="shrink-0 flex flex-row justify-between items-center">
              <CardTitle>Campaign Log</CardTitle>
                <Button
                    onClick={handleAdvanceSession}
                    variant="outline"
                    disabled={isGeneratingSessionSummary[currentSessionNumber] || isGeneratingGlobalSummary || plotPoints.filter(p => p.sessionNumber === currentSessionNumber).length === 0}
                >
                    {isGeneratingSessionSummary[currentSessionNumber] ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Ending Session...</> : <><ChevronRightSquare className="mr-2 h-5 w-5" /> End Session {currentSessionNumber}</>}
                </Button>
            </CardHeader>
            <CardContent className="p-0 flex-grow min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {allSessionNumbers.length === 0 || (allSessionNumbers.length === 1 && allSessionNumbers[0] === currentSessionNumber && plotPoints.filter(p => p.sessionNumber === currentSessionNumber).length === 0) ? (
                      <p className="text-muted-foreground text-center py-4 px-6">No plot points recorded yet for this campaign. Add the first one!</p>
                  ) : (
                      allSessionNumbers.map(sessionNum => {
                      const isCurrentSession = sessionNum === currentSessionNumber;
                      const sessionPoints = plotPoints.filter(p => p.sessionNumber === sessionNum).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                      const viewMode = isCurrentSession ? 'details' : (sessionViewModes[sessionNum] || (sessionPoints.length > 0 ? 'summary' : 'details'));
                      const summaryText = sessionSummaries[sessionNum];
                      const isLoadingThisSessionSummary = isGeneratingSessionSummary[sessionNum];

                      return (
                          <div key={`session-${sessionNum}`} className="border-b pb-4 last:border-b-0">
                          <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-2 px-6 z-10 flex justify-between items-center border-b">
                              <h3 className={`text-xl font-semibold ${isCurrentSession ? 'text-primary' : 'text-foreground'}`}>
                              Session {sessionNum} {isCurrentSession ? '(Current)' : ''}
                              </h3>
                              {!isCurrentSession && (summaryText || sessionPoints.length > 0) && (
                              <Button variant="outline" size="sm" onClick={() => toggleSessionView(sessionNum)} disabled={isLoadingThisSessionSummary}>
                                  {viewMode === 'summary' ? <List className="mr-2 h-4 w-4" /> : <AlignLeft className="mr-2 h-4 w-4" />}
                                  {isLoadingThisSessionSummary ? "Loading..." : (viewMode === 'summary' ? 'View Details' : 'View Summary')}
                              </Button>
                              )}
                          </div>

                          <div className="px-6 pt-2">
                              {isLoadingThisSessionSummary && (
                              <div className="p-3 border rounded-md bg-muted/30 shadow-sm flex items-center justify-center">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  <p className="text-sm text-muted-foreground">Generating summary for Session {sessionNum}...</p>
                              </div>
                              )}

                              {!isLoadingThisSessionSummary && viewMode === 'summary' && summaryText && !isCurrentSession && (
                              <div className="p-3 border rounded-md bg-primary/5 shadow-sm">
                                  <p className="text-sm whitespace-pre-wrap">{summaryText}</p>
                              </div>
                              )}

                              {!isLoadingThisSessionSummary && (viewMode === 'details' || isCurrentSession) && (
                              <div className="space-y-4">
                                  {renderFormattedPlotPoints(sessionPoints)}
                                  {!isCurrentSession && viewMode === 'details' && (
                                  <div className="space-y-4 mt-4 border-t pt-4">
                                      <div>
                                      <h4 className="font-semibold text-sm mb-2">Add Forgotten Event to Session {sessionNum}</h4>
                                      <Textarea
                                          id={`past-plot-point-${sessionNum}`}
                                          value={pastPlotPointInput[sessionNum] || ""}
                                          onChange={(e) => setPastPlotPointInput(prev => ({ ...prev, [sessionNum]: e.target.value }))}
                                          placeholder="e.g., Discovered a forgotten clue..."
                                          rows={2}
                                          className="my-1"
                                      />
                                      <Button
                                          size="sm"
                                          className="mt-1"
                                          onClick={() => handleAddPlotPointToPastSession(sessionNum)}
                                          disabled={!pastPlotPointInput[sessionNum]?.trim()}
                                      >
                                          <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                                      </Button>
                                      </div>
                                      {(summaryText || sessionPoints.length > 0) && (
                                      <div>
                                          <h4 className="font-semibold text-sm mb-2">Session Summary Tools</h4>
                                          <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRegenerateSessionSummary(sessionNum)}
                                          disabled={isLoadingThisSessionSummary || isGeneratingGlobalSummary}
                                          >
                                          <Zap className="mr-2 h-4 w-4" />
                                          {isLoadingThisSessionSummary ? 'Regenerating...' : 'Re-generate Summary'}
                                          </Button>
                                          <p className="text-xs text-muted-foreground mt-1">Uses the global detail level.</p>
                                      </div>
                                      )}
                                  </div>
                                  )}
                              </div>
                              )}
                          </div>
                          </div>
                      );
                      })
                  )}
                  </div>
              </ScrollArea>
              </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Plot Point Dialog */}
      <Dialog open={isEditPlotPointDialogOpen} onOpenChange={setIsEditPlotPointDialogOpen}>
        <StandardDialogContent>
          <StandardDialogHeader>
            <StandardDialogTitle>Edit Plot Point</StandardDialogTitle>
            <StandardDialogDescription>Modify the text for this plot point.</StandardDialogDescription>
          </StandardDialogHeader>
          <div className="py-4">
            <Textarea
              value={editedPlotPointText}
              onChange={(e) => setEditedPlotPointText(e.target.value)}
              rows={4}
            />
          </div>
          <StandardDialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlotPointDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedPlotPoint} disabled={!editedPlotPointText.trim()}>Save Changes</Button>
          </StandardDialogFooter>
        </StandardDialogContent>
      </Dialog>

      {/* Delete Plot Point Confirmation Dialog */}
      <AlertDialog open={isDeletePlotPointConfirmOpen} onOpenChange={setIsDeletePlotPointConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plot Point?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this plot point? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeletePlotPointConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeletePlotPoint} className={buttonVariants({variant: "destructive"})}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Advance Empty Session Confirmation Dialog */}
      <AlertDialog open={isAdvanceSessionConfirmOpen} onOpenChange={setIsAdvanceSessionConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Advance Empty Session?</AlertDialogTitle>
                <AlertDialogDescription>
                    The current session ({currentSessionNumber}) has no plot points. Are you sure you want to advance to the next session?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsAdvanceSessionConfirmOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { 
                  setCurrentSessionNumber(prev => prev + 1);
                  clearFullCampaignSummaryCache();
                  setIsAdvanceSessionConfirmOpen(false);
                }}>Yes, Advance Session</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Log Confirmation Dialog 1 (AlertDialog) */}
      <AlertDialog open={isClearLogConfirm1Open} onOpenChange={setIsClearLogConfirm1Open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete ALL plot points and summaries for the campaign "{activeCampaign?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsClearLogConfirm1Open(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setIsClearLogConfirm1Open(false); setIsClearLogConfirm2Open(true); setDeleteConfirmInput(""); }}
              className={buttonVariants({ variant: "destructive" })}
            >
              Proceed to Final Confirmation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Log Confirmation Dialog 2 (Standard Dialog) */}
      <Dialog open={isClearLogConfirm2Open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setDeleteConfirmInput("");
        }
        setIsClearLogConfirm2Open(isOpen);
      }}>
        <StandardDialogContent>
          <StandardDialogHeader>
            <StandardDialogTitle>Final Confirmation to Delete Log</StandardDialogTitle>
            <StandardDialogDescription>
              To permanently delete the entire Adventure Recap for "{activeCampaign?.name}", please type "DELETE" in the box below.
            </StandardDialogDescription>
          </StandardDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="DELETE"
              className="border-destructive focus-visible:ring-destructive"
            />
          </div>
          <StandardDialogFooter>
            <Button variant="outline" onClick={() => { setIsClearLogConfirm2Open(false); setDeleteConfirmInput(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleFinalClearLog}
              disabled={deleteConfirmInput !== "DELETE"}
            >
              Confirm Deletion
            </Button>
          </StandardDialogFooter>
        </StandardDialogContent>
      </Dialog>

    </div>
    </TooltipProvider>
  );
}

export function AdventureRecapHelpContent() {
  return (
    <>
      <StandardDialogHeader>
        <StandardDialogTitle className="flex items-center">
          <History className="mr-2 h-5 w-5 text-primary" />
          How to Use: Adventure Recap
        </StandardDialogTitle>
        <StandardDialogDescription>
          Track your campaign's progress and generate summaries.
        </StandardDialogDescription>
      </StandardDialogHeader>
      <ScrollArea className="max-h-[60vh] pr-3">
        <div className="text-sm text-muted-foreground space-y-3 py-4">
          <p>
            1. Log key events as "Plot Points" for the{' '}
            <strong className="text-foreground">current session</strong> using the
            input field on the right. Click "Add to Log". You can edit or delete plot points using the icons that appear on hover.
          </p>
          <p>
            2. When a session ends, click "End Session {`{X}`}". You must log at least one plot point to end the session.
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>
                An AI summary will be automatically generated for the completed
                session using the selected detail level and displayed with an
                "episode title" format.
              </li>
            </ul>
          </p>
          <p>
            3. <strong className="text-foreground">Past sessions</strong> default
            to showing their summary. Click "View Details" to see the original
            plot points. From the detail view, you can:
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Hover over a plot point to see Edit and Delete icons.</li>
              <li>
                Add a forgotten event to that past session using the "Add
                Forgotten Event..." input.
              </li>
              <li>
                Click "Re-generate Summary" to update its summary if
                you've added new details or want to change the detail level.
              </li>
            </ul>
          </p>
          <p>
            4. Use the <strong className="text-foreground">AI Story Tools</strong>{' '}
            on the right to:
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>
                Select the "Summary Detail Level" (Brief, Normal, Detailed) for
                all *newly generated* summaries (both session and full
                campaign).
              </li>
              <li>
                Click "Generate Full Summary" for a recap of everything. This
                summary will be cached until new plot points are added or a
                session advances.
              </li>
              <li>
                Click "Clear Entire Campaign Log" to permanently delete all plot
                points and summaries for the current campaign (requires double
                confirmation).
              </li>
            </ul>
          </p>
          <p>
            5. All data is saved per campaign to your browser's local storage.
          </p>
        </div>
      </ScrollArea>
      <StandardDialogFooter>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </StandardDialogFooter>
    </>
  );
}

