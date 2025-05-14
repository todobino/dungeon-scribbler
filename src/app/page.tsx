import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6">
            <Image src="https://picsum.photos/seed/adventurelogo/100/100" alt="Adventure Architect Logo" width={100} height={100} className="rounded-full" data-ai-hint="fantasy scroll" />
          </div>
          <CardTitle className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary/80">
            {APP_NAME}
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Your All-in-One Co-DM Tool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-lg leading-relaxed">
            Forge epic tales, manage intricate campaigns, and bring your worlds to life with ease.
            {APP_NAME} is designed to be your trusted companion, helping you track everything
            from player characters and cunning NPCs to sprawling maps and thrilling encounters.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
              <Link href="/campaign-management">
                <Zap className="mr-2 h-6 w-6" />
                Enter the Forge
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Ready to craft your next adventure?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
