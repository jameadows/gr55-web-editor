/**
 * Keyboard Shortcut Service
 * 
 * Centralized keyboard shortcut handling for the application.
 * Supports cross-platform shortcuts (Ctrl on Windows/Linux, Cmd on Mac).
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutService {
  private shortcuts = new Map<string, Shortcut>();
  private enabled = signal(true);
  
  constructor(private router: Router) {
    this.initializeGlobalListener();
  }
  
  /**
   * Register a keyboard shortcut
   */
  register(id: string, shortcut: Shortcut): void {
    this.shortcuts.set(id, shortcut);
  }
  
  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
  }
  
  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }
  
  /**
   * Enable/disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled.set(enabled);
  }
  
  /**
   * Initialize global keyboard listener
   */
  private initializeGlobalListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.enabled()) return;
      
      // Skip if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable) {
        return;
      }
      
      // Find matching shortcut
      for (const [id, shortcut] of this.shortcuts.entries()) {
        if (this.matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    });
  }
  
  /**
   * Check if event matches shortcut
   */
  private matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;
    
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      (shortcut.ctrl ? modifierKey : !modifierKey) &&
      (shortcut.shift ? event.shiftKey : !event.shiftKey) &&
      (shortcut.alt ? event.altKey : !event.altKey)
    );
  }
  
  /**
   * Get human-readable shortcut string
   */
  getShortcutString(shortcut: Shortcut): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const parts: string[] = [];
    
    if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
    if (shortcut.shift) parts.push('⇧');
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(isMac ? '' : '+');
  }
}
