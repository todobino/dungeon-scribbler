
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, History, Zap, Brain, ChevronRightSquare, List, AlignLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PlotPoint {
  id: string;
  sessionNumber: number;
  timestamp: string;
  text: string;
}

type SummaryDetailLevel = "brief" | "normal" | "detailed";

const PLOT_POINTS_STORAGE_KEY = "dungeonScribblerPlotPoints";
const CURRENT_SESSION_STORAGE_KEY = "dungeonScribblerCurrentSession";
const SESSION_SUMMARIES_STORAGE_KEY = "dungeonScribblerSessionSummaries";
const SESSION_VIEW_MODES_STORAGE_KEY = "dungeonScribblerSessionViewModes";

export default function StorySoFarPage() {
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [newPlotPointText, setNewPlotPointText] = useState(""); // Renamed for clarity
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);
  
  const [fullCampaignSummary, setFullCampaignSummary] = useState<string | null>(null);
  const [sessionSummaries, setSessionSummaries] = useState<Record<number, string>>({});
  const [sessionViewModes, setSessionViewModes] = useState<Record<number, 'summary' | 'details'>>({});

  const [isGeneratingGlobalSummary, setIsGeneratingGlobalSummary] = useState(false); // For full campaign summary
  const [isGeneratingSpecificSessionSummary, setIsGeneratingSpecificSessionSummary] = useState<Record<number, boolean>>({}); // For specific session regen

  const [summaryDetailLevel, setSummaryDetailLevel] = useState<SummaryDetailLevel>("normal");
  const [isConfirmSessionAdvanceOpen, setIsConfirmSessionAdvanceOpen] = useState(false);
  
  const [pastPlotPointInput, setPastPlotPointInput] = useState<Record<number, string>>({});


  useEffect(() => {
    const storedPlotPoints = localStorage.getItem(PLOT_POINTS_STORAGE_KEY);
    if (storedPlotPoints) setPlotPoints(JSON.parse(storedPlotPoints));
    
    const storedSessionNumber = localStorage.getItem(CURRENT_SESSION_STORAGE_KEY);
    if (storedSessionNumber) setCurrentSessionNumber(parseInt(storedSessionNumber, 10) || 1);
    
    const storedSessionSummaries = localStorage.getItem(SESSION_SUMMARIES_STORAGE_KEY);
    if (storedSessionSummaries) setSessionSummaries(JSON.parse(storedSessionSummaries));

    const storedSessionViewModes = localStorage.getItem(SESSION_VIEW_MODES_STORAGE_KEY);
    if (storedSessionViewModes) setSessionViewModes(JSON.parse(storedSessionViewModes));
  }, []);

  useEffect(() => {
    localStorage.setItem(PLOT_POINTS_STORAGE_KEY, JSON.stringify(plotPoints));
  }, [plotPoints]);

  useEffect(() => {
    localStorage.setItem(CURRENT_SESSION_STORAGE_KEY, currentSessionNumber.toString());
  }, [currentSessionNumber]);

  useEffect(() => {
    localStorage.setItem(SESSION_SUMMARIES_STORAGE_KEY, JSON.stringify(sessionSummaries));
  }, [sessionSummaries]);

  useEffect(() => {
    localStorage.setItem(SESSION_VIEW_MODES_STORAGE_KEY, JSON.stringify(sessionViewModes));
  }, [sessionViewModes]);

  const handleAddPlotPointToCurrentSession = () => {
    if (newPlotPointText.trim()) {
      setPlotPoints(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          sessionNumber: currentSessionNumber, 
          timestamp: new Date().toISOString(), 
          text: newPlotPointText.trim() 
        }
      ]);
      setNewPlotPointText("");
    }
  };
  
  const handleAddPlotPointToPastSession = async (sessionNum: number) => {
    const textToAdd = pastPlotPointInput[sessionNum];
    if (textToAdd && textToAdd.trim()) {
      setPlotPoints(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sessionNumber: sessionNum,
          timestamp: new Date().toISOString(),
          text: textToAdd.trim(),
        }
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())); // Keep chronological within session
      
      setPastPlotPointInput(prev => ({ ...prev, [sessionNum]: "" })); // Clear input
      
      // Re-generate summary for this past session
      await handleRegenerateSessionSummary(sessionNum);
    }
  };

  const generateSessionSummaryText = async (sessionNumberToSummarize: number, detailLevel: SummaryDetailLevel): Promise<string> => {
    const relevantPlotPoints = plotPoints.filter(p => p.sessionNumber === sessionNumberToSummarize);
    if (relevantPlotPoints.length === 0) {
      return `No plot points recorded for Session ${sessionNumberToSummarize}.`;
    }
    // Placeholder for AI call
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return `AI Generated Summary for Session ${sessionNumberToSummarize} (Detail: ${detailLevel}): Key events from ${relevantPlotPoints.length} plot point(s) include... The adventurers ${relevantPlotPoints[0]?.text.substring(0,30)}... and then they ${relevantPlotPoints[relevantPlotPoints.length-1]?.text.substring(0,30)}... [Placeholder for session ${sessionNumberToSummarize}]`;
  };

  const handleStartNextSession = async () => {
    const currentSessionPlotPoints = plotPoints.filter(p => p.sessionNumber === currentSessionNumber);
    if (currentSessionPlotPoints.length > 0) {
      setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [currentSessionNumber]: true }));
      const summaryText = await generateSessionSummaryText(currentSessionNumber, summaryDetailLevel);
      setSessionSummaries(prev => ({ ...prev, [currentSessionNumber]: summaryText }));
      setSessionViewModes(prev => ({ ...prev, [currentSessionNumber]: 'summary' }));
      setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [currentSessionNumber]: false }));
      setCurrentSessionNumber(prev => prev + 1);
      setFullCampaignSummary(null); 
    } else {
      setIsConfirmSessionAdvanceOpen(true);
    }
  };
  
  const handleGenerateFullCampaignSummary = async () => {
    setIsGeneratingGlobalSummary(true);
    setFullCampaignSummary(null);
    const allPlotPointsText = plotPoints.map(p => `S${p.sessionNumber}: ${p.text}`).join('\n');
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setFullCampaignSummary(`AI Generated Full Story Summary (Detail: ${summaryDetailLevel}): Based on ${plotPoints.length} total plot points across all sessions... The grand saga unfolds! [Placeholder Content referring to: ${allPlotPointsText.substring(0,100)}...]`);
    setIsGeneratingGlobalSummary(false);
  };

  const handleRegenerateSessionSummary = async (sessionNum: number) => {
    setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [sessionNum]: true }));
    const summaryText = await generateSessionSummaryText(sessionNum, summaryDetailLevel);
    setSessionSummaries(prev => ({ ...prev, [sessionNum]: summaryText }));
    setIsGeneratingSpecificSessionSummary(prev => ({ ...prev, [sessionNum]: false }));
  };


  const handleConfirmAndAdvanceEmptySession = () => {
    setCurrentSessionNumber(prev => prev + 1);
    setIsConfirmSessionAdvanceOpen(false);
    setFullCampaignSummary(null); 
  };

  const toggleSessionView = (sessionNum: number) => {
    setSessionViewModes(prev => ({
      ...prev,
      [sessionNum]: (prev[sessionNum] === 'summary' || !prev[sessionNum]) ? 'details' : 'summary'
    }));
  };

  const groupedPlotPoints = plotPoints.reduce((acc, point) => {
    (acc[point.sessionNumber] = acc[point.sessionNumber] || []).push(point);
    // Sort points within each session by timestamp when grouping
    acc[point.sessionNumber].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return acc;
  }, {} as Record<number, PlotPoint[]>);

  const sortedSessionNumbers = Object.keys(groupedPlotPoints)
    .map(Number)
    .sort((a, b) => b - a)
    .filter(sessionNum => sessionNum <= currentSessionNumber); 


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><History className="mr-3 h-8 w-8 text-primary"/>The Story So Far</h1>
        <Button onClick={handleStartNextSession} variant="outline" disabled={isGeneratingSpecificSessionSummary[currentSessionNumber] || isGeneratingGlobalSummary}>
          {isGeneratingSpecificSessionSummary[currentSessionNumber] ? 'Generating Summary...' : <><ChevronRightSquare className="mr-2 h-5 w-5"/> Start Session {currentSessionNumber + 1}</>}
        </Button>
      </div>
      <p className="text-muted-foreground">Currently logging events for: <span className="font-semibold text-primary">Session {currentSessionNumber}</span></p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Plot Point Log & Input */}
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
                <p className="text-muted-foreground">No plot points recorded yet. Add the first one above!</p>
              )}
              <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
                 { currentSessionNumber > 0 && (groupedPlotPoints[currentSessionNumber] || []).length === 0 && !sortedSessionNumbers.includes(currentSessionNumber) && (
                     // Handle case where current session is new and has no points yet
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

                            {/* Inject/Regenerate for PAST sessions when in details view */}
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
                                {summaryText && (
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

        {/* Right Column: AI Full Campaign Summarizer */}
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
           <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Log major events for the <span className="font-semibold">current session ({currentSessionNumber})</span>.</p>
                <p>2. Use "Start Session {currentSessionNumber + 1}" to advance. This auto-summarizes the completed session.</p>
                <p>3. Past sessions show summaries. Click "View Details" to see original plot points, add forgotten events, or re-generate their summary.</p>
                <p>4. Use "Generate Full Campaign Summary" for a recap of everything using the selected detail level.</p>
            </CardContent>
          </Card>
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
    </div>
  );
}

