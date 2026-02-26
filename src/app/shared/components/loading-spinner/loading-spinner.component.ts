/**
 * Loading Spinner Component
 * 
 * Shows a loading indicator with optional message.
 * Can be used inline or as an overlay.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner" [class.overlay]="overlay">
      <div class="spinner"></div>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 24px;
    }
    
    .loading-spinner.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: #00d9ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .loading-message {
      color: #fff;
      font-size: 14px;
      margin: 0;
      text-align: center;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() overlay: boolean = false;
}
