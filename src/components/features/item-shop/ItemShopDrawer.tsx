
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Store, ChevronRight, Search, PlusCircle, PackageOpen, Tag, FileText, DollarSign, Filter, X, Star } from "lucide-react";
import { ITEM_SHOP_STORAGE_KEY, ITEM_TYPES } from "@/lib/constants";
import type { ShopItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ItemShopDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialNewItemFormData: Omit<ShopItem, 'id'> = {
  name: "",
  description: "",
  cost: "",
  type: ITEM_TYPES[0], // Default to the first type
  rarity: "",
};

export function ItemShopDrawer({ open, onOpenChange }: ItemShopDrawerProps) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ShopItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("");

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemFormData, setNewItemFormData] = useState<Omit<ShopItem, 'id'>>(initialNewItemFormData);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ShopItem | null>(null);
  const { toast } = useToast();

  // Load items from localStorage
  useEffect(() => {
    setIsLoadingItems(true);
    try {
      const storedItems = localStorage.getItem(ITEM_SHOP_STORAGE_KEY);
      if (storedItems) {
        setShopItems(JSON.parse(storedItems));
      } else {
        setShopItems([]);
      }
    } catch (error) {
      console.error("Error loading items from localStorage:", error);
      setShopItems([]);
    }
    setIsLoadingItems(false);
  }, []);

  // Save items to localStorage
  useEffect(() => {
    if (!isLoadingItems) {
      try {
        localStorage.setItem(ITEM_SHOP_STORAGE_KEY, JSON.stringify(shopItems));
      } catch (error) {
        console.error("Error saving items to localStorage:", error);
      }
    }
  }, [shopItems, isLoadingItems]);

  // Filter items
  useEffect(() => {
    let itemsToFilter = [...shopItems];
    if (searchTerm) {
      itemsToFilter = itemsToFilter.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedTypeFilter) { // This condition correctly handles selectedTypeFilter === "" (no filter)
      itemsToFilter = itemsToFilter.filter(item => item.type === selectedTypeFilter);
    }
    setFilteredItems(itemsToFilter.sort((a, b) => a.name.localeCompare(b.name)));
  }, [shopItems, searchTerm, selectedTypeFilter]);

  const handleNewItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItemFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewItemSelectChange = (name: keyof Omit<ShopItem, 'id'>, value: string) => {
    setNewItemFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!newItemFormData.name.trim()) {
      toast({ title: "Item Name Required", description: "Please enter a name for the item.", variant: "destructive" });
      return;
    }
    const newItem: ShopItem = {
      id: Date.now().toString(),
      ...newItemFormData,
      name: newItemFormData.name.trim(),
    };
    setShopItems(prev => [...prev, newItem]);
    setNewItemFormData(initialNewItemFormData);
    setIsAddItemDialogOpen(false);
    toast({ title: "Item Added", description: `"${newItem.name}" has been added to the shop.` });
  };

  const handleItemClick = (item: ShopItem) => {
    setSelectedItemForDetail(item);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[380px] sm:w-[500px] flex flex-col p-0 overflow-hidden"
          hideCloseButton={true}
        >
          <div className="flex flex-col h-full pr-8">
            <SheetHeader className="p-4 border-b bg-primary text-primary-foreground flex-shrink-0 flex flex-row justify-between items-center">
              <SheetTitle className="flex items-center text-xl text-primary-foreground">
                <Store className="mr-2 h-6 w-6" /> Item Shop
              </SheetTitle>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => setIsAddItemDialogOpen(true)}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </SheetHeader>

            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search items by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8 border-border focus-visible:ring-primary"
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <Label htmlFor="item-type-filter" className="sr-only">Filter by Type</Label>
                <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                  <SelectTrigger id="item-type-filter" className="w-full">
                    <SelectValue placeholder="Filter by Type (All)" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Removed: <SelectItem value="">All Types</SelectItem> */}
                    {ITEM_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">
              {isLoadingItems ? (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-muted-foreground">Loading items...</p>
                </div>
              ) : selectedItemForDetail ? (
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-primary">{selectedItemForDetail.name}</h3>
                      <Button variant="outline" size="sm" onClick={() => setSelectedItemForDetail(null)}>
                        <Filter className="mr-1 h-3 w-3" /> Back to List
                      </Button>
                    </div>
                    <p className="text-sm"><strong className="text-muted-foreground">Cost:</strong> {selectedItemForDetail.cost || "N/A"}</p>
                    <p className="text-sm"><strong className="text-muted-foreground">Type:</strong> {selectedItemForDetail.type || "N/A"}</p>
                    {selectedItemForDetail.rarity && <p className="text-sm"><strong className="text-muted-foreground">Rarity:</strong> {selectedItemForDetail.rarity}</p>}
                    <div>
                      <strong className="text-muted-foreground text-sm">Description:</strong>
                      <p className="text-sm whitespace-pre-wrap mt-1">{selectedItemForDetail.description || "No description available."}</p>
                    </div>
                  </div>
                </ScrollArea>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <PackageOpen className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {shopItems.length === 0 ? "No items in the shop yet." : "No items match your search/filter."}
                  </p>
                  {shopItems.length === 0 && (
                    <Button variant="link" onClick={() => setIsAddItemDialogOpen(true)} className="mt-1">Add the first item!</Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <ul className="divide-y divide-border">
                    {filteredItems.map((item) => (
                      <li
                        key={item.id}
                        className="p-3 hover:bg-accent/50 cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">{item.cost || "N/A"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-0 right-0 h-full w-8 bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center cursor-pointer z-[60]"
            aria-label="Close Item Shop Drawer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </SheetContent>
      </Sheet>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Shop Item</DialogTitle>
            <DialogDescription>Fill in the details for the new item.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="itemName" className="flex items-center gap-1"><PackageOpen className="h-4 w-4"/>Name*</Label>
                <Input id="itemName" name="name" value={newItemFormData.name} onChange={handleNewItemInputChange} />
              </div>
              <div>
                <Label htmlFor="itemCost" className="flex items-center gap-1"><DollarSign className="h-4 w-4"/>Cost</Label>
                <Input id="itemCost" name="cost" value={newItemFormData.cost || ""} onChange={handleNewItemInputChange} placeholder="e.g., 10 gp, 25 sp" />
              </div>
              <div>
                <Label htmlFor="itemType" className="flex items-center gap-1"><Tag className="h-4 w-4"/>Type</Label>
                <Select name="type" value={newItemFormData.type} onValueChange={(value) => handleNewItemSelectChange("type", value || ITEM_TYPES[0])}>
                  <SelectTrigger id="itemType">
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="itemRarity" className="flex items-center gap-1"><Star className="h-4 w-4"/>Rarity (Optional)</Label>
                <Input id="itemRarity" name="rarity" value={newItemFormData.rarity || ""} onChange={handleNewItemInputChange} placeholder="e.g., Common, Rare" />
              </div>
              <div>
                <Label htmlFor="itemDescription" className="flex items-center gap-1"><FileText className="h-4 w-4"/>Description</Label>
                <Textarea id="itemDescription" name="description" value={newItemFormData.description || ""} onChange={handleNewItemInputChange} rows={3} />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddItemDialogOpen(false); setNewItemFormData(initialNewItemFormData); }}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
