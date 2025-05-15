
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";
import { useCampaign } from "@/contexts/campaign-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Library, Users } from "lucide-react";

export default function EncounterPlannerPage() {
  const { activeCampaign, isLoadingCampaigns } = useCampaign();

  if (isLoadingCampaigns) {
    return <div className="text-center p-10">Loading campaign data...</div>;
  }

  if (!activeCampaign) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <Library className="mx-auto h-16 w-16 text-muted-foreground" />
          <CardTitle className="mt-4">No Active Campaign</CardTitle>
          <CardDescription>Please select or create a campaign to plan encounters.</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Swords className="mr-3 h-7 w-7 text-primary" />
            Encounter Planner for {activeCampaign.name}
          </CardTitle>
          <CardDescription>
            Design and balance your combat encounters, manage monster groups, and track initiative.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Full encounter planning features are coming soon! This will include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Adding monsters from Monster Mash or homebrew creations.</li>
            <li>Calculating encounter difficulty based on party level and monster CR.</li>
            <li>Saving and loading encounter templates.</li>
            <li>Generating terrain and environmental effects.</li>
            <li>Quickly sending encounters to the Combat Tracker.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
