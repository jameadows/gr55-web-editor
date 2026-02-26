/**
 * Confirmation Dialog Component
 * 
 * Global confirmation dialog for destructive actions.
 * Uses ConfirmationDialogService for state management.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogService } from '../../../core/services/confirmation-dialog.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialog()) {
      <div class="dialog-overlay" (click)="onCancel()">
        <div class="dialog-box" (click)="$event.stopPropagation()">
          <h2>{{ dialog()!.title }}</h2>
          <p>{{ dialog()!.message }}</p>
          
          <div class="dialog-actions">
            <button (click)="onCancel()" class="btn-secondary">
              {{ dialog()!.cancelText || 'Cancel' }}
            </button>
            <button (click)="onConfirm()" 
                    [class.btn-danger]="dialog()!.danger"
                    class="btn-primary">
              {{ dialog()!.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fade-in 0.2s ease-out;
    }
    
    .dialog-box {
      background: var(--surface-color, #1e1e1e);
      border: 2px solid var(--border-color, #333);
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      animation: slide-up 0.2s ease-out;
    }
    
    h2 {
      margin: 0 0 16px 0;
      color: var(--text-color, #fff);
      font-size: 20px;
    }
    
    p {
      margin: 0 0 24px 0;
      color: var(--text-secondary, #ccc);
      line-height: 1.5;
    }
    
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    button {
      padding: 10px 20px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #00d9ff;
      color: #000;
    }
    
    .btn-primary:hover {
      background: #00c0e6;
      transform: translateY(-1px);
    }
    
    .btn-danger {
      background: #ff4444;
      color: #fff;
    }
    
    .btn-danger:hover {
      background: #cc0000;
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: #444;
      color: #fff;
    }
    
    .btn-secondary:hover {
      background: #555;
      transform: translateY(-1px);
    }
    
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes slide-up {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  private confirmDialog = inject(ConfirmationDialogService);
  
  dialog = this.confirmDialog.getCurrentDialog();
  
  onConfirm() {
    this.confirmDialog.onConfirm();
  }
  
  onCancel() {
    this.confirmDialog.onCancel();
  }
}
