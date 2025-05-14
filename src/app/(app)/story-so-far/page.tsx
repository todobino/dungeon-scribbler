
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, History, Zap, Brain, ChevronRightSquare, List, AlignLeft, HelpCircle, Library } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent as UIDialogContent, DialogDescription as UIDialogDescription, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogFooter as UIDialogFooter } from "@/components/ui/dialog";
import type { PlotPoint } from "@/lib/types";
import { useCampaign } from "@/contexts/campaign-context";
import { 
  PLOT_POINTS_KEY_PREFIX,
  CURRENT_SESSION_KEY_PREFIX,
  SESSION_SUMMARIES_KEY_PREFIX,
  SESSION_VIEW_MODES_KEY_PREFIX,
  FULL_CAMPAIGN_SUMMARY_KEY_PREFIX,
  SUMMARY_DETAIL_LEVEL_KEY_PREFIX
} from "@/lib/constants";


type SummaryDetailLevel = "brief" | "normal" | "detailed";

export default function StorySoFarPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();

  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [newPlotPointText, setNewPlotPointText] = useState("");
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);
  
  const [fullCampaignSummary, setFullCampaignSummary] = useState<string | null>(null);
  const [sessionSummaries, setSessionSummaries] = useState<Record<number, string>>({});
  const [sessionViewModes, setSessionViewModes] = useState<Record<number, 'summary' | 'details'>>({});

  const [isGeneratingGlobalSummary, setIsGeneratingGlobalSummary] = useState(false);
  const [isGeneratingSpecificSessionSummary, setIsGeneratingSpecificSessionSummary] = useState<Record<number, boolean>>({});

  const [summaryDetailLevel, setSummaryDetailLevel] = useState<SummaryDetailLevel>("normal");
  const [isConfirmSessionAdvanceOpen, setIsConfirmSessionAdvanceOpen] = useState(false);
  
  const [pastPlotPointInput, setPastPlotPointInput] = useState<Record<number, string>>({});
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const getCampaignSpecificKey = (prefix: string) => {
    if (!activeCampaign) return null;
    return `${prefix}${activeCampaign.id}`;
  };

  // Load data when activeCampaign changes
  useEffect(() => {
    if (!activeCampaign) {
      setPlotPoints([]);
      setCurrentSessionNumber(1);
      setSessionSummaries({});
      setSessionViewModes({});
      setFullCampaignSummary(null);
      setSummaryDetailLevel("normal");
      return;
    }

    const plotPointsKey = getCampaignSpecificKey(PLOT_POINTS_KEY_PREFIX);
    const currentSessionKey = getCampaignSpecificKey(CURRENT_SESSION_KEY_PREFIX);
    const sessionSummariesKey = getCampaignSpecificKey(SESSION_SUMMARIES_KEY_PREFIX);
    const sessionViewModesKey = getCampaignSpecificKey(SESSION_VIEW_MODES_KEY_PREFIX);
    const fullCampaignSummaryKey = getCampaignSpecificKey(FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);
    const summaryDetailLevelKey = getCampaignSpecificKey(SUMMARY_DETAIL_LEVEL_KEY_PREFIX);

    if (!plotPointsKey) return; // Should not happen if activeCampaign is present

    try {
      const storedPlotPoints = localStorage.getItem(plotPointsKey);
      if (storedPlotPoints) setPlotPoints(JSON.parse(storedPlotPoints));
      else setPlotPoints([]);
    } catch (error) {
      console.error("Error loading plot points from localStorage:", error);
      setPlotPoints([]);
    }
    
    try {
      const storedSessionNumber = localStorage.getItem(currentSessionKey!);
      if (storedSessionNumber) setCurrentSessionNumber(parseInt(storedSessionNumber, 10) || 1);
      else setCurrentSessionNumber(1);
    } catch (error) {
      console.error("Error loading current session number from localStorage:", error);
      setCurrentSessionNumber(1);
    }
    
    try {
      const storedSessionSummaries = localStorage.getItem(sessionSummariesKey!);
      if (storedSessionSummaries) setSessionSummaries(JSON.parse(storedSessionSummaries));
      else setSessionSummaries({});
    } catch (error) {
      console.error("Error loading session summaries from localStorage:", error);
      setSessionSummaries({});
    }

    try {
      const storedSessionViewModes = localStorage.getItem(sessionViewModesKey!);
      if (storedSessionViewModes) setSessionViewModes(JSON.parse(storedSessionViewModes));
      else setSessionViewModes({});
    } catch (error) {
      console.error("Error loading session view modes from localStorage:", error);
      setSessionViewModes({});
    }

    try {
      const storedFullSummary = localStorage.getItem(fullCampaignSummaryKey!);
      if (storedFullSummary) setFullCampaignSummary(JSON.parse(storedFullSummary));
      else setFullCampaignSummary(null);
    } catch (error) {
      console.error("Error loading full campaign summary from localStorage:", error);
      setFullCampaignSummary(null);
    }
    
    try {
      const storedDetailLevel = localStorage.getItem(summaryDetailLevelKey!);
      if (storedDetailLevel) setSummaryDetailLevel(storedDetailLevel as SummaryDetailLevel);
      else setSummaryDetailLevel("normal");
    } catch (error) {
      console.error("Error loading summary detail level from localStorage:", error);
      setSummaryDetailLevel("normal");
    }

  }, [activeCampaign]);

  // Save plotPoints
  useEffect(() => {
    if (activeCampaign) {
      const plotPointsKey = getCampaignSpecificKey(PLOT_POINTS_KEY_PREFIX);
      if (plotPointsKey) {
        try {
          localStorage.setItem(plotPointsKey, JSON.stringify(plotPoints));
        } catch (error) {
          console.error("Error saving plot points to localStorage:", error);
        }
      }
    }
  }, [plotPoints, activeCampaign]);

  // Save currentSessionNumber
  useEffect(() => {
    if (activeCampaign) {
      const currentSessionKey = getCampaignSpecificKey(CURRENT_SESSION_KEY_PREFIX);
      if (currentSessionKey) {
        try {
          localStorage.setItem(currentSessionKey, currentSessionNumber.toString());
        } catch (error) {
          console.error("Error saving current session number to localStorage:", error);
        }
      }
    }
  }, [currentSessionNumber, activeCampaign]);

  // Save sessionSummaries
  useEffect(() => {
    if (activeCampaign) {
      const sessionSummariesKey = getCampaignSpecificKey(SESSION_SUMMARIES_KEY_PREFIX);
      if (sessionSummariesKey) {
        try {
          localStorage.setItem(sessionSummariesKey, JSON.stringify(sessionSummaries));
        } catch (error) {
          console.error("Error saving session summaries to localStorage:", error);
        }
      }
    }
  }, [sessionSummaries, activeCampaign]);

  // Save sessionViewModes
  useEffect(() => {
    if (activeCampaign) {
      const sessionViewModesKey = getCampaignSpecificKey(SESSION_VIEW_MODES_KEY_PREFIX);
      if (sessionViewModesKey) {
        try {
          localStorage.setItem(sessionViewModesKey, JSON.stringify(sessionViewModes));
        } catch (error) {
          console.error("Error saving session view modes to localStorage:", error);
        }
      }
    }
  }, [sessionViewModes, activeCampaign]);

  // Save fullCampaignSummary
  useEffect(() => {
    if (activeCampaign) {
      const fullCampaignSummaryKey = getCampaignSpecificKey(FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);
      if (fullCampaignSummaryKey) {
        try {
          if (fullCampaignSummary) {
            localStorage.setItem(fullCampaignSummaryKey, JSON.stringify(fullCampaignSummary));
          } else {
            localStorage.removeItem(fullCampaignSummaryKey);
          }
        } catch (error) {
          console.error("Error saving full campaign summary to localStorage:", error);
        }
      }
    }
  }, [fullCampaignSummary, activeCampaign]);

  // Save summaryDetailLevel
  useEffect(() => {
    if (activeCampaign) {
      const summaryDetailLevelKey = getCampaignSpecificKey(SUMMARY_DETAIL_LEVEL_KEY_PREFIX);
      if (summaryDetailLevelKey) {
        try {
          localStorage.setItem(summaryDetailLevelKey, summaryDetailLevel);
        } catch (error) {
          console.error("Error saving summary detail level to localStorage:", error);
        }
      }
    }
  }, [summaryDetailLevel, activeCampaign]);


  const clearFullCampaignSummaryCache = () => {
    if (activeCampaign) {
      const key = getCampaignSpecificKey(FULL_CAMPAIGN_SUMMARY_KEY_PREFIX);
      if (key) localStorage.removeItem(key);
    }
    setFullCampaignSummary(null);
  };

  const handleAddPlotPointToCurrentSession = () => {
    if (newPlotPointText.trim() && activeCampaign) {
      setPlotPoints(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          sessionNumber: currentSessionNumber, 
          timestamp: new Date().toISOString(), 
          text: newPlotPointText.trim() 
        }
      ].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      setNewPlotPointText("");
      clearFullCampaignSummaryCache();
    }
  };
  
  const handleAddPlotPointToPastSession = async (sessionNum: number) => {
    const textToAdd = pastPlotPointInput[sessionNum];
    if (textToAdd && textToAdd.trim() && activeCampaign) {
      setPlotPoints(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sessionNumber: sessionNum,
          timestamp: new Date().toISOString(),
          text: textToAdd.trim(),
        }
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      
      setPastPlotPointInput(prev => ({ ...prev, [sessionNum]: "" }));
      clearFullCampaignSummaryCache();
      await handleRegenerateSessionSummary(sessionNum);
    }
  };

  const generateSessionSummaryText = async (sessionNumberToSummarize: number, detailLevel: SummaryDetailLevel): Promise<string> => {
    const relevantPlotPoints = plotPoints.filter(p => p.sessionNumber === sessionNumberToSummarize);
    if (relevantPlotPoints.length === 0) {
      return `No plot points recorded for Session ${sessionNumberToSummarize}.`;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return `AI Generated Summary for Session ${sessionNumberToSummarize} (Campaign: ${activeCampaign?.name || 'N/A'}, Detail: ${detailLevel}): Key events from ${relevantPlotPoints.length} plot point(s) include... The adventurers ${relevantPlotPoints[0]?.text.substring(0,30)}... and then they ${relevantPlotPoints[relevantPlotPoints.length-1]?.text.substring(0,30)}... [Placeholder for session ${sessionNumberToSummarize}]`;
  };

  const handleStartNextSession = async () => {
    if (!activeCampaign) return;
    const currentSessionPlotPoints = plotPoints.filter(p => p.sessionNumber === currentSessionNumber);
    if (currentSessionPlotPoints.length > 0) {
      setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [currentSessionNumber]: true }));
      const summaryText = await generateSessionSummaryText(currentSessionNumber, summaryDetailLevel);
      setSessionSummaries(prev => ({ ...prev, [currentSessionNumber]: summaryText }));
      setSessionViewModes(prev => ({ ...prev, [currentSessionNumber]: 'summary' }));
      setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [currentSessionNumber]: false }));
      setCurrentSessionNumber(prev => prev + 1);
      clearFullCampaignSummaryCache();
    } else {
      setIsConfirmSessionAdvanceOpen(true);
    }
  };
  
  const handleGenerateFullCampaignSummary = async () => {
    if (!activeCampaign) return;
    setIsGeneratingGlobalSummary(true);
    setFullCampaignSummary(null); 
    const allPlotPointsText = plotPoints.map(p => `S${p.sessionNumber}: ${p.text}`).join('\\n');
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    const newSummary = `AI Generated Full Story Summary (Campaign: ${activeCampaign.name}, Detail: ${summaryDetailLevel}): Based on ${plotPoints.length} total plot points across all sessions... The grand saga unfolds! [Placeholder Content referring to: ${allPlotPointsText.substring(0,100)}...]`;
    setFullCampaignSummary(newSummary);
    setIsGeneratingGlobalSummary(false);
  };

  const handleRegenerateSessionSummary = async (sessionNum: number) => {
    if (!activeCampaign) return;
    setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [sessionNum]: true }));
    const summaryText = await generateSessionSummaryText(sessionNum, summaryDetailLevel);
    setSessionSummaries(prev => ({ ...prev, [sessionNum]: summaryText }));
    clearFullCampaignSummaryCache(); 
    setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [sessionNum]: false }));
  };


  const handleConfirmAndAdvanceEmptySession = () => {
    if (!activeCampaign) return;
    setCurrentSessionNumber(prev => prev + 1);
    setIsConfirmSessionAdvanceOpen(false);
    clearFullCampaignSummaryCache();
  };

  const toggleSessionView = (sessionNum: number) => {
    setSessionViewModes(prev => ({
      ...prev,
      [sessionNum]: (prev[sessionNum] === 'summary' || !prev[sessionNum]) ? 'details' : 'summary'
    }));
  };

  const groupedPlotPoints = plotPoints.reduce((acc, point) => {
    (acc[point.sessionNumber] = acc[point.sessionNumber] || []).push(point);
    acc[point.sessionNumber].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return acc;
  }, {} as Record<number, PlotPoint[]>);

  const sortedSessionNumbers = Object.keys(groupedPlotPoints)
    .map(Number)
    .sort((a, b) => b - a) 
    .filter(sessionNum => sessionNum <= currentSessionNumber +1); 


  if (isLoadingCampaigns) {
    return <div className="text-center p-10">Loading campaign data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><History className="mr-3 h-8 w-8 text-primary"/>The Story So Far: {activeCampaign.name}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleStartNextSession} variant="outline" disabled={isGeneratingSpecificSessionSummary[currentSessionNumber] || isGeneratingGlobalSummary}>
            {isGeneratingSpecificSessionSummary[currentSessionNumber] ? 'Generating Summary...' : <><ChevronRightSquare className="mr-2 h-5 w-5"/> Start Session {currentSessionNumber + 1}</>}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsHelpDialogOpen(true)} aria-label="Help with Story So Far">
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">Currently logging events for: <span className="font-semibold text-primary">Session {currentSessionNumber}</span></p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Add New Plot Point for Session {currentSessionNumber}</CardTitle>
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
              <Button onClick={handleAddPlotPointToCurrentSession}><PlusCircle className="mr-2 h-5 w-5"/>Add to Log (Session {currentSessionNumber})</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Log</CardTitle>
              <CardDescription>A chronological log of key events. Most recent sessions appear first. Past sessions default to summary view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plotPoints.length === 0 && (
                <p className="text-muted-foreground">No plot points recorded yet for this campaign. Add the first one above!</p>
              )}
              <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
                 { currentSessionNumber > 0 && (groupedPlotPoints[currentSessionNumber] || []).length === 0 && !Object.keys(groupedPlotPoints).map(Number).includes(currentSessionNumber) && (
                      <div key={`session-${currentSessionNumber}-current-empty`}>
                        <div className="flex justify-between items-center mb-2 sticky top-0 bg-card py-1 z-10 border-b">
                            <h3 className="text-lg font-semibold text-primary">Session {currentSessionNumber} (Current)</h3>
                        </div>
                         <p className="text-sm text-muted-foreground italic px-1">No plot points recorded for this session yet.</p>
                      </div>
                 )}

                 {sortedSessionNumbers.map(sessionNum => {
                    const isCurrentSession = sessionNum === currentSessionNumber;
                    const viewMode = isCurrentSession ? 'details' : (sessionViewModes[sessionNum] || 'summary');
                    const summaryText = sessionSummaries[sessionNum];
                    const isLoadingThisSessionSummary = isGeneratingSpecificSessionSummary[sessionNum];

                    if (sessionNum > currentSessionNumber) return null; 

                    return (
                      <div key={`session-${sessionNum}`}>
                        <div className="flex justify-between items-center mb-2 sticky top-0 bg-card py-1 z-10 border-b">
                          <h3 className={`text-lg font-semibold ${isCurrentSession ? 'text-primary' : ''}`}>
                            Session {sessionNum} {isCurrentSession ? '(Current)' : ''}
                          </h3>
                          {!isCurrentSession && (summaryText || (groupedPlotPoints[sessionNum] || []).length > 0) && (
                            <Button variant="outline" size="sm" onClick={() => toggleSessionView(sessionNum)} disabled={isLoadingThisSessionSummary}>
                              {viewMode === 'summary' ? <List className="mr-2 h-4 w-4"/> : <AlignLeft className="mr-2 h-4 w-4"/>}
                              {viewMode === 'summary' ? 'View Details' : 'View Summary'}
                            </Button>
                          )}
                        </div>

                        {isLoadingThisSessionSummary && (
                            <div className="p-3 border rounded-md bg-muted/30 shadow-sm">
                                <p className="text-sm text-muted-foreground animate-pulse">Generating summary for Session {sessionNum}...</p>
                            </div>
                        )}

                        {!isLoadingThisSessionSummary && viewMode === 'summary' && summaryText && !isCurrentSession && (
                          <div className="p-3 border rounded-md bg-primary/5 shadow-sm">
                            <p className="text-sm whitespace-pre-wrap">{summaryText}</p>
                          </div>
                        )}

                        {(!isLoadingThisSessionSummary && (viewMode === 'details' || (isCurrentSession && (groupedPlotPoints[sessionNum] || []).length > 0))) && (
                          <div className="space-y-3">
                            {(groupedPlotPoints[sessionNum] || []).map(point => (
                              <div key={point.id} className="p-3 border rounded-md bg-muted/30 shadow-sm">
                                <p className="text-sm">{point.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(point.timestamp).toLocaleString()}</p>
                              </div>
                            ))}
                            {(groupedPlotPoints[sessionNum] || []).length === 0 && isCurrentSession && (
                                <p className="text-sm text-muted-foreground italic px-1">No plot points recorded for this session yet.</p>
                            )}
                            {(groupedPlotPoints[sessionNum] || []).length === 0 && !isCurrentSession && !summaryText && (
                                <p className="text-sm text-muted-foreground italic px-1">No plot points recorded for this session, and no summary generated yet.</p>
                            )}

                            {!isCurrentSession && viewMode === 'details' && (
                              <Card className="mt-4 p-4 space-y-3 bg-card border-dashed">
                                <div>
                                  <Label htmlFor={`past-plot-point-${sessionNum}`}>Add Event to Session {sessionNum}</Label>
                                  <Textarea 
                                    id={`past-plot-point-${sessionNum}`}
                                    value={pastPlotPointInput[sessionNum] || ""}
                                    onChange={(e) => setPastPlotPointInput(prev => ({ ...prev, [sessionNum]: e.target.value }))}
                                    placeholder="e.g., Discovered a forgotten clue..."
                                    rows={2}
                                  />
                                  <Button 
                                    size="sm" 
                                    className="mt-2" 
                                    onClick={() => handleAddPlotPointToPastSession(sessionNum)}
                                    disabled={!pastPlotPointInput[sessionNum]?.trim()}
                                  >
                                    <PlusCircle className="mr-2 h-4 w-4"/> Add Event
                                  </Button>
                                </div>
                                {(summaryText || (groupedPlotPoints[sessionNum] || []).length > 0) && ( 
                                  <div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleRegenerateSessionSummary(sessionNum)}
                                      disabled={isLoadingThisSessionSummary || isGeneratingGlobalSummary}
                                    >
                                      <Zap className="mr-2 h-4 w-4"/> 
                                      { isLoadingThisSessionSummary ? 'Regenerating...' : 'Re-generate Summary for Session ' + sessionNum }
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1">Uses the global detail level from the right panel.</p>
                                  </div>
                                )}
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Brain className="mr-2 h-5 w-5 text-primary"/>AI Story Tools</CardTitle>
              <CardDescription>Generate a summary of the entire campaign or adjust detail level for new summaries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="summary-detail-level">Summary Detail Level (for new summaries)</Label>
                <Select 
                    value={summaryDetailLevel} 
                    onValueChange={(value) => setSummaryDetailLevel(value as SummaryDetailLevel)} 
                    disabled={isGeneratingGlobalSummary || Object.values(isGeneratingSpecificSessionSummary).some(loading => loading)}
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
                disabled={isGeneratingGlobalSummary || plotPoints.length === 0 || Object.values(isGeneratingSpecificSessionSummary).some(loading => loading)}
              >
                <Zap className="mr-2 h-4 w-4" />
                {isGeneratingGlobalSummary ? "Generating Full Summary..." : "Generate Full Campaign Summary"}
              </Button>
            </CardContent>
          </Card>

          {isGeneratingGlobalSummary && (
            <Card>
                <CardContent className="p-4">
                    <p className="text-muted-foreground animate-pulse">AI is weaving the grand tale with {summaryDetailLevel} detail...</p>
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
      </div>

      <AlertDialog open={isConfirmSessionAdvanceOpen} onOpenChange={setIsConfirmSessionAdvanceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Session Advance</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't added any plot points for Session {currentSessionNumber}. 
              Are you sure you want to start Session {currentSessionNumber + 1}? No summary will be generated for the current empty session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmSessionAdvanceOpen(false)}>Stay on Session {currentSessionNumber}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAndAdvanceEmptySession}>Yes, Start Session {currentSessionNumber + 1}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <UIDialogContent className="max-w-lg">
            <UIDialogHeader>
                <UIDialogTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>How to Use: The Story So Far</UIDialogTitle>
                <UIDialogDescription>Track your campaign's progress and generate summaries.</UIDialogDescription>
            </UIDialogHeader>
            <div className="text-sm text-muted-foreground space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <p>1. Log key events as "Plot Points" for the <strong className="text-foreground">current session ({currentSessionNumber})</strong> using the input field.</p>
                <p>2. When a session ends, click "<ChevronRightSquare className="inline h-4 w-4 align-text-bottom mr-0.5"/> Start Session {currentSessionNumber + 1}". If the completed session had plot points, an AI summary will be automatically generated for it using the selected detail level.</p>
                <p>3. Past sessions default to showing their summary. Click "<List className="inline h-4 w-4 align-text-bottom mr-0.5"/> View Details" to see the original plot points. From the detail view, you can:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Add a forgotten event to that past session using the "Add Event to Session X" input.</li>
                    <li>Click "<Zap className="inline h-4 w-4 align-text-bottom mr-0.5"/> Re-generate Summary" to update its summary if you've added new details or want to change the detail level.</li>
                </ul>
                <p>4. Use "<Zap className="inline h-4 w-4 align-text-bottom mr-0.5"/> Generate Full Campaign Summary" in the right panel for a recap of everything, also using the selected detail level.</p>
            </div>
            <UIDialogFooter>
                <DialogClose asChild>
                    <Button>Close</Button>
                </DialogClose>
            </UIDialogFooter>
        </UIDialogContent>
      </Dialog>
    </div>
  );
}

