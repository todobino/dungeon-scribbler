import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { ArrowRight, Zap } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const coreFeatures = NAV_ITEMS.filter(item => item.href !== '/dashboard');

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-3xl font-bold">Welcome to Dungeon Scribbler!</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Your central hub for managing campaigns and crafting adventures.
            </CardDescription>
          </div>
          <Zap className="h-12 w-12 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Navigate through your tools using the sidebar. Here are some quick links to get you started:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreFeatures.map((item) => (
              <Card key={item.href} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">{item.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 h-12 overflow-hidden">
                    {
                      item.label === 'Party Manager' ? 'Track player characters, levels, classes, and abilities.' :
                      item.label === 'NPC Builder' ? 'Create and manage non-player characters with AI assistance.' :
                      item.label === 'Campaign Journal' ? 'Keep detailed session notes and campaign logs.' :
                      item.label === 'Random Tables' ? 'Use pre-built or custom tables for random events.' :
                      item.label === 'Map Integration' ? 'Upload and manage maps for your campaigns.' :
                      'Access this feature to enhance your game.'
                    }
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={item.href}>
                      Go to {item.label} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>An overview of your campaign assets (coming soon).</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <Image src="https://picsum.photos/seed/statsplaceholder/600/300" alt="Stats placeholder" width={600} height={300} className="rounded-lg mx-auto" data-ai-hint="fantasy chart"/>
          <p className="mt-4">Campaign statistics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
