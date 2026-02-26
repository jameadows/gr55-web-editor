import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ConfirmationDialogComponent],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">
          <span class="brand-text">GR-55</span>
          <span class="brand-sub">Web Editor</span>
        </a>
        <button 
          class="navbar-toggler" 
          type="button" 
          (click)="navbarCollapsed = !navbarCollapsed"
          [attr.aria-expanded]="!navbarCollapsed">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [class.show]="!navbarCollapsed">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                (click)="navbarCollapsed = true">
                Home
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/editor" 
                routerLinkActive="active"
                (click)="navbarCollapsed = true">
                Editor
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/library" 
                routerLinkActive="active"
                (click)="navbarCollapsed = true">
                Library
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/demo" 
                routerLinkActive="active"
                (click)="navbarCollapsed = true">
                Demo
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/midi-explorer" 
                routerLinkActive="active"
                (click)="navbarCollapsed = true">
                MIDI Explorer
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
    
    <!-- Global confirmation dialog -->
    <app-confirmation-dialog></app-confirmation-dialog>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0d0f0e;
    }

    .navbar {
      border-bottom: 1px solid #1e2820;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .navbar-brand {
      font-family: 'Courier New', monospace;
      letter-spacing: 0.1em;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .brand-text {
      font-size: 1.3rem;
      font-weight: 700;
      color: #e8a020;
      text-transform: uppercase;
    }

    .brand-sub {
      font-size: 0.85rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }

    .nav-link {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.5rem 1rem !important;
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: #e8a020 !important;
    }

    .nav-link.active {
      color: #e8a020 !important;
      background: rgba(232, 160, 32, 0.1);
    }

    main {
      min-height: calc(100vh - 56px);
    }
  `]
})
export class AppComponent {
  navbarCollapsed = true;
}
