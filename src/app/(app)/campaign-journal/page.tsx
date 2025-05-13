"use client";

import type { CampaignNote } from "@/lib/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, BookText, Trash2, Eye, Edit3 } from "lucide-react";
import { format } from 'date-fns';

export default function CampaignJournalPage() {
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<CampaignNote | null>(null);
  const [editingNote, setEditingNote] = useState<CampaignNote | null>(null);

  const [newNoteData, setNewNoteData] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNoteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNote = () => {
    if (newNoteData.title && newNoteData.content) {
      const noteToSave: CampaignNote = {
        id: editingNote ? editingNote.id : Date.now().toString(),
        title: newNoteData.title,
        content: newNoteData.content,
        createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingNote) {
        setNotes(notes.map(n => n.id === editingNote.id ? noteToSave : n));
      } else {
        setNotes([...notes, noteToSave]);
      }
      
      setNewNoteData({ title: "", content: "" });
      setEditingNote(null);
      setIsFormOpen(false);
    }
  };

  const openViewDialog = (note: CampaignNote) => {
    setCurrentNote(note);
    setIsViewOpen(true);
  };

  const openEditDialog = (note: CampaignNote) => {
    setEditingNote(note);
    setNewNoteData({ title: note.title, content: note.content });
    setIsFormOpen(true);
  };
  
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  useEffect(() => {
    const storedNotes = localStorage.getItem("dungeonScribblerNotes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dungeonScribblerNotes", JSON.stringify(notes));
  }, [notes]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaign Journal</h1>
        <Button onClick={() => { setEditingNote(null); setNewNoteData({title: "", content: ""}); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-5 w-5" /> New Journal Entry
        </Button>
      </div>

      {notes.length === 0 ? (
         <Card className="text-center py-12">
            <CardHeader>
              <BookText className="mx-auto h-16 w-16 text-muted-foreground" />
              <CardTitle className="mt-4">Your Journal is Empty</CardTitle>
              <CardDescription>Chronicle your adventures by creating your first journal entry.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => { setEditingNote(null); setNewNoteData({title: "", content: ""}); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-5 w-5" /> Create First Entry
              </Button>
            </CardContent>
          </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((note) => (
            <Card key={note.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl truncate">{note.title}</CardTitle>
                <CardDescription>Last updated: {format(new Date(note.updatedAt), "PPp")}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => openViewDialog(note)} className="flex-1">
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(note)} className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Note Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
            <DialogDescription>{editingNote ? "Update the details of your journal entry." : "Record new events, thoughts, or plot points."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={newNoteData.title} onChange={handleInputChange} placeholder="e.g., The Ambush at Dragon's Pass" />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" value={newNoteData.content} onChange={handleInputChange} placeholder="Describe what happened, important clues, character developments..." rows={10} />
              <p className="text-xs text-muted-foreground mt-1">Nested bullet points and internal linking coming soon.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingNote(null); }}>Cancel</Button>
            <Button onClick={handleSubmitNote}>{editingNote ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Note Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          {currentNote && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{currentNote.title}</DialogTitle>
                <DialogDescription>
                  Created: {format(new Date(currentNote.createdAt), "PPp")} | Updated: {format(new Date(currentNote.updatedAt), "PPp")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[60vh] overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentNote.content}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsViewOpen(false); openEditDialog(currentNote); }}>Edit</Button>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
