
"use client";
// This file is deprecated and its content has been moved to features/combat-tracker/CombatTrackerDrawer.tsx
// It can be deleted after the refactor is confirmed.

import React from "react";

export function CombinedToolDrawer({ open, onOpenChange }: {open: boolean, onOpenChange: (open: boolean) => void}) {
  if (open) {
    console.warn("CombinedToolDrawer.tsx is deprecated and its content has been moved to CombatTrackerDrawer.tsx. Please update references and delete this file.");
  }
  return null;
}

    