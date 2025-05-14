
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function DeprecatedNextSessionGoalsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Page Deprecated
          </CardTitle>
          <CardDescription className="text-destructive/90">
            This version of "Next Session Goals" is no longer in use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Please use the new and improved "Next Session Goals" page, which can be found in the sidebar under "Story Tools".
          </p>
          <p>
            If you have important data on this old page, you may need to manually transfer it to the new page.
            The new page uses a different data storage structure.
          </p>
          <Button asChild>
            <Link href="/next-session-goals-refactored">
              Go to New "Next Session Goals" Page <ArrowRight className="ml-2 h-4 w-4"/>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
