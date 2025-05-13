"use client";

import type { MapData } from "@/lib/types";
import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MapIcon, Upload, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";


export default function MapIntegrationPage() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [mapName, setMapName] = useState("");
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMapFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMapPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMap = () => {
    if (mapName && mapFile && mapPreview) {
      const newMap: MapData = {
        id: Date.now().toString(),
        name: mapName,
        imageUrl: mapPreview, // In a real app, upload to storage and use URL
      };
      setMaps([...maps, newMap]);
      setMapName("");
      setMapFile(null);
      setMapPreview(null);
      setIsUploadDialogOpen(false);
      toast({ title: "Map Uploaded!", description: `"${newMap.name}" has been added.` });
    } else {
      toast({ title: "Missing Information", description: "Please provide a name and select a map file.", variant: "destructive" });
    }
  };

  const handleDeleteMap = (id: string) => {
    setMaps(maps.filter(map => map.id !== id));
    if(selectedMap?.id === id) setSelectedMap(null);
    toast({ title: "Map Deleted", description: "The map has been removed." });
  };
  
  useEffect(() => {
    const storedMaps = localStorage.getItem("dungeonScribblerMaps");
    if (storedMaps) {
      setMaps(JSON.parse(storedMaps));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dungeonScribblerMaps", JSON.stringify(maps));
  }, [maps]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Map Integration</h1>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" /> Upload New Map
        </Button>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Map</DialogTitle>
            <DialogDescription>Give your map a name and choose an image file.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="mapName">Map Name</Label>
              <Input id="mapName" value={mapName} onChange={(e) => setMapName(e.target.value)} placeholder="e.g., The Whispering Woods" />
            </div>
            <div>
              <Label htmlFor="mapFile">Map Image</Label>
              <Input id="mapFile" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {mapPreview && (
              <div className="mt-2 border rounded-md p-2">
                <p className="text-sm font-medium mb-1">Preview:</p>
                <Image src={mapPreview} alt="Map preview" width={400} height={300} className="rounded-md object-contain max-h-[300px]" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsUploadDialogOpen(false); setMapPreview(null); setMapFile(null); setMapName(""); }}>Cancel</Button>
            <Button onClick={handleUploadMap}><Upload className="mr-2 h-4 w-4"/>Upload Map</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {maps.length === 0 && !selectedMap ? (
         <Card className="text-center py-12">
            <CardHeader>
              <MapIcon className="mx-auto h-16 w-16 text-muted-foreground" />
              <CardTitle className="mt-4">No Maps Uploaded</CardTitle>
              <CardDescription>Visualize your world by uploading your first map.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-5 w-5" /> Upload Your First Map
              </Button>
            </CardContent>
          </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Your Maps</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                {maps.length > 0 ? (
                  <ul className="space-y-2">
                    {maps.map(map => (
                      <li key={map.id} className={`p-2 rounded-md border flex justify-between items-center cursor-pointer hover:bg-muted/50 ${selectedMap?.id === map.id ? 'bg-primary/10 border-primary' : ''}`} onClick={() => setSelectedMap(map)}>
                        <span className="truncate">{map.name}</span>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteMap(map.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No maps uploaded yet.</p>}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-8 lg:col-span-9">
            {selectedMap ? (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedMap.name}</CardTitle>
                  <CardDescription>Interactive map features (drawing, markers, linking) coming soon!</CardDescription>
                </CardHeader>
                <CardContent className="aspect-video relative bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
                  <Image src={selectedMap.imageUrl} alt={selectedMap.name} layout="fill" objectFit="contain" data-ai-hint="fantasy map"/>
                  {/* Placeholder for map interaction tools */}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center text-center py-12 shadow-lg">
                <CardHeader>
                    <MapIcon className="mx-auto h-24 w-24 text-muted-foreground" />
                    <CardTitle className="mt-4 text-2xl">Select a Map</CardTitle>
                    <CardDescription>Choose a map from the list to view it here.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
