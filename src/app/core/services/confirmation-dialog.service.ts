/**
 * Confirmation Dialog Service
 * 
 * Provides user confirmation dialogs for destructive actions.
 * Returns promises that resolve based on user choice.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private currentDialog = signal<ConfirmationOptions | null>(null);
  private resolveCallback: ((result: boolean) => void) | null = null;
  
  /**
   * Show confirmation dialog
   */
  async confirm(options: ConfirmationOptions): Promise<boolean> {
    this.currentDialog.set({
      ...options,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel'
    });
    
    return new Promise<boolean>((resolve) => {
      this.resolveCallback = resolve;
    });
  }
  
  /**
   * User clicked confirm
   */
  onConfirm(): void {
    if (this.resolveCallback) {
      this.resolveCallback(true);
      this.close();
    }
  }
  
  /**
   * User clicked cancel
   */
  onCancel(): void {
    if (this.resolveCallback) {
      this.resolveCallback(false);
      this.close();
    }
  }
  
  /**
   * Close dialog
   */
  private close(): void {
    this.currentDialog.set(null);
    this.resolveCallback = null;
  }
  
  /**
   * Get current dialog (for component to display)
   */
  getCurrentDialog() {
    return this.currentDialog;
  }
}
