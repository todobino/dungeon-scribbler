
"use client";

import { useState } from "react";
import { useCampaign, type Campaign } from "@/contexts/campaign-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as UIAlertDialogDescription, AlertDialogFooter as UIAlertDialogFooter, AlertDialogHeader as UIAlertDialogHeader, AlertDialogTitle as UIAlertDialogTitle } from "@/components/ui/alert-dialog";
import { Library, CheckCircle, Users, PlusCircle, DraftingCompass, Trash2, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CampaignManagementPage() {
  const { campaigns, activeCampaign, setActiveCampaignId, isLoadingCampaigns, deleteCampaign } = useCampaign();
  const { toast } = useToast();

  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isDeleteConfirm1Open, setIsDeleteConfirm1Open] = useState(false);
  const [isDeleteConfirm2Open, setIsDeleteConfirm2Open] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const handleOpenDeleteDialog1 = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteConfirm1Open(true);
  };

  const handleConfirmDelete1 = () => {
    setIsDeleteConfirm1Open(false);
    setIsDeleteConfirm2Open(true);
    setDeleteConfirmInput(""); 
  };

  const handleFinalDelete = async () => {
    if (campaignToDelete && deleteConfirmInput === "DELETE") {
      try {
        await deleteCampaign(campaignToDelete.id);
        toast({ title: "Campaign Deleted", description: `"${campaignToDelete.name}" and all its data have been removed.` });
      } catch (error) {
        console.error("Error deleting campaign:", error);
        toast({ title: "Error Deleting Campaign", description: "Could not remove the campaign.", variant: "destructive" });
      }
    } else if (deleteConfirmInput !== "DELETE") {
      toast({ title: "Incorrect Confirmation", description: "Please type DELETE to confirm.", variant: "destructive" });
      return; 
    }
    setIsDeleteConfirm2Open(false);
    setCampaignToDelete(null);
    setDeleteConfirmInput("");
  };

  if (isLoadingCampaigns) {
    return (
      <div className="space-y-6 w-full p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading campaigns...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while your campaign data is being loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 lg:p-8">
      {activeCampaign && (
        <Card className="bg-primary/10 border-primary shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                <CardTitle className="text-primary">Current Active Campaign</CardTitle>
            </div>
            <CardDescription>This is the campaign you are currently working on. All features like Party Manager, NPC Builder, etc., will use data from this campaign.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{activeCampaign.name}</p>
             <Link href="/party-manager" passHref>
                <Button variant="outline" className="mt-4 mr-2">
                    <Users className="mr-2 h-4 w-4" /> Go to Party Manager
                </Button>
            </Link>
             <Link href="/story-so-far-refactored" passHref>
                <Button variant="outline" className="mt-4">
                    <History className="mr-2 h-4 w-4" /> View Adventure Recap
                </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>Select a campaign to make it active, or create a new one using the Campaign Wizard.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Library className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">You haven't created any campaigns yet.</p>
              <Button asChild className="mt-4">
                <Link href="/campaign-wizard">
                  <DraftingCompass className="mr-2 h-5 w-5" /> Create Your First Campaign (Wizard)
                </Link>
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[calc(100vh-20rem)]"> {/* Adjusted max-h for better scroll */}
              <ul className="space-y-3">
                {campaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <Card 
                        className={`hover:shadow-md transition-shadow cursor-pointer ${activeCampaign?.id === campaign.id ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                        onClick={() => setActiveCampaignId(campaign.id)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <span className="font-medium text-lg">{campaign.name}</span>
                        <div className="flex items-center gap-2">
                          {activeCampaign?.id === campaign.id ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveCampaignId(campaign.id); }}>
                              Set Active
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog1(campaign); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
           {campaigns.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link href="/campaign-wizard">
                  <DraftingCompass className="mr-2 h-5 w-5" /> Create Another Campaign (Wizard)
                </Link>
              </Button>
            </div>
           )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog 1 */}
      <AlertDialog open={isDeleteConfirm1Open} onOpenChange={setIsDeleteConfirm1Open}>
        <UIAlertDialogContent>
          <UIAlertDialogHeader>
            <UIAlertDialogTitle>Delete Campaign "{campaignToDelete?.name}"?</UIAlertDialogTitle>
            <UIAlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign and ALL associated data (characters, NPCs, factions, adventure logs, maps, encounters, etc.).
            </UIAlertDialogDescription>
          </UIAlertDialogHeader>
          <UIAlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteConfirm1Open(false); setCampaignToDelete(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete1}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </UIAlertDialogFooter>
        </UIAlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog 2 (Type DELETE) */}
      <Dialog open={isDeleteConfirm2Open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCampaignToDelete(null);
          setDeleteConfirmInput("");
        }
        setIsDeleteConfirm2Open(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion of "{campaignToDelete?.name}"</DialogTitle>
            <DialogDescription>
              To permanently delete this campaign and all its data, please type "DELETE" in the box below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="DELETE"
              className="border-destructive focus-visible:ring-destructive"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteConfirm2Open(false); setCampaignToDelete(null); setDeleteConfirmInput(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleFinalDelete}
              disabled={deleteConfirmInput !== "DELETE"}
            >
              Confirm Permanent Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Small helper, can be in a badge component file if reused
function Badge({ variant = 'default', children }: { variant?: 'default' | 'secondary', children: React.ReactNode }) {
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${variant === 'default' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
      {children}
    </span>
  );
}
