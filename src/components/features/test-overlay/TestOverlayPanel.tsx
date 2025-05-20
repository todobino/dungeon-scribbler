
"use client";

// This file is no longer used and can be deleted.
// The Test Overlay Panel functionality has been removed.

import React from 'react';

export function TestOverlayPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void; }) {
  console.warn("TestOverlayPanel.tsx is deprecated and its functionality has been removed.");
  if (open && typeof onOpenChange === 'function') {
    // To prevent it from staying stuck open if the parent still tries to render it
    onOpenChange(false);
  }
  return null;
}
