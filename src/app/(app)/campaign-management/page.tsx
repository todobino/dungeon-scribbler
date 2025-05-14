
"use client";

import { useState } from "react";
import { useCampaign, type Campaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, CheckCircle, Users, PlusCircle, DraftingCompass } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function CampaignManagementPage() {
  const { campaigns, activeCampaign, setActiveCampaignId, isLoadingCampaigns } = useCampaign();

  if (isLoadingCampaigns) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Campaigns</h1>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Campaigns</h1>
        {/* Button removed from here, "Create New Campaign" will be handled by empty state or wizard link */}
      </div>

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
             <Link href="/party-manager">
                <Button variant="outline" className="mt-4 mr-2">
                    <Users className="mr-2 h-4 w-4" /> Go to Party Manager
                </Button>
            </Link>
             <Link href="/campaign-wizard">
                <Button variant="outline" className="mt-4">
                    <DraftingCompass className="mr-2 h-4 w-4" /> New Campaign Wizard
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
            <ScrollArea className="max-h-[400px]">
              <ul className="space-y-3">
                {campaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <Card 
                        className={`hover:shadow-md transition-shadow cursor-pointer ${activeCampaign?.id === campaign.id ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                        onClick={() => setActiveCampaignId(campaign.id)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <span className="font-medium text-lg">{campaign.name}</span>
                        {activeCampaign?.id === campaign.id ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setActiveCampaignId(campaign.id); }}>
                            Set Active
                          </Button>
                        )}
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
