
"use client";
// This file is deprecated and its content has been moved to features/shared/CombinedToolDrawer.tsx
// It can be deleted after the refactor is confirmed.

import { useState } from "react";
// ... other imports that were specific to this file but are now in CombinedToolDrawer

export function AddFriendlyDrawer({ open, onOpenChange }: {open: boolean, onOpenChange: (open: boolean) => void}) {
  // All logic and UI has been moved to CombinedToolDrawer.tsx
  // This component is now a shell and should be removed.
  if (open) {
    console.warn("AddFriendlyDrawer.tsx is deprecated and its content has been moved to CombinedToolDrawer.tsx. Please update references.");
  }
  return null;
}
