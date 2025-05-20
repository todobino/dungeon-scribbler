
"use client"; // Add this directive

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6">
            <Image src="https://placehold.co/100x100.png" alt="Adventure Architect Logo" width={100} height={100} className="rounded-full" data-ai-hint="fantasy scroll" />
          </div>
          <CardTitle className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary/80">
            {APP_NAME}
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Your All-in-One Co-DM Tool!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-lg leading-relaxed">
            Forge epic tales, manage intricate campaigns, and bring your worlds to life with ease.
            {APP_NAME} is designed to be your trusted companion, helping you track everything
            from player characters and cunning NPC's to sprawling maps and thrilling encounters.
          </p>
          
          <div className="pt-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground/80">User Account</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => alert("Login functionality not yet implemented.")}>
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => alert("Sign Up functionality not yet implemented.")}>
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              (User accounts are coming soon to save your campaigns online!)
            </p>
          </div>

          <div className="flex justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
              <Link href="/campaign-management">
                <Zap className="mr-2 h-6 w-6" />
                Enter the Forge
              </Link>
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
