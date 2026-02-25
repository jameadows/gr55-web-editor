import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MidiIoService } from '../../core/midi/midi-io.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="hero-title">
            <span class="title-main">GR-55 Web Editor</span>
            <span class="title-sub">Browser-Based Patch Editor & Librarian</span>
          </h1>
          <p class="hero-description">
            Platform-independent patch editing for the Roland GR-55 Guitar Synthesizer.
            No installation required — runs directly in your browser using Web MIDI.
          </p>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🎸</div>
              <h3>Live Editing</h3>
              <p>Real-time parameter control via USB MIDI</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>All Parameters</h3>
              <p>154 parameters across 8 editing tabs</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🌐</div>
              <h3>Cross-Platform</h3>
              <p>Works on Windows, Mac, and Linux</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🔧</div>
              <h3>No Installation</h3>
              <p>Zero dependencies, runs in Chrome/Edge</p>
            </div>
          </div>

          <div class="cta-section">
            @if (!isConnected()) {
              <button 
                class="btn btn-primary btn-lg" 
                (click)="connectToGR55()"
                [disabled]="isConnecting()">
                @if (isConnecting()) {
                  <span>Connecting...</span>
                } @else {
                  <span>Connect to GR-55</span>
                  <span class="btn-arrow">→</span>
                }
              </button>
              <p class="cta-note">
                Connect your GR-55 via USB to get started
              </p>
              @if (connectionError()) {
                <p class="error-message">{{ connectionError() }}</p>
              }
            } @else {
              <div class="connected-status">
                <div class="status-badge">✅ Connected to GR-55</div>
                <div class="action-buttons">
                  <a routerLink="/editor" class="btn btn-primary btn-lg">
                    Open Patch Editor
                    <span class="btn-arrow">→</span>
                  </a>
                  <button class="btn btn-secondary" (click)="disconnect()">
                    Disconnect
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="container">
          <div class="status-box">
            <h2>Features Available</h2>
            <ul class="status-list">
              <li class="status-done">✅ Real-time MIDI communication</li>
              <li class="status-done">✅ 8 editing tabs (Common, PCM, Modeling, Effects, MFX)</li>
              <li class="status-done">✅ 154 parameters mapped and working</li>
              <li class="status-done">✅ Live parameter editing with instant feedback</li>
              <li class="status-done">✅ Professional UI with progressive disclosure</li>
              <li class="status-done">✅ Full effect control (Delay, Chorus, Reverb, MFX)</li>
            </ul>
          </div>

          <div class="browser-compat">
            <h3>Browser Compatibility</h3>
            <table class="compat-table">
              <thead>
                <tr>
                  <th>Browser</th>
                  <th>Web MIDI</th>
                  <th>SysEx</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr class="compat-ok">
                  <td>Chrome</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>Full support</td>
                </tr>
                <tr class="compat-ok">
                  <td>Edge</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>Full support</td>
                </tr>
                <tr class="compat-warn">
                  <td>Firefox</td>
                  <td>⚠️</td>
                  <td>⚠️</td>
                  <td>Requires flag</td>
                </tr>
                <tr class="compat-no">
                  <td>Safari</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>Not supported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      color: #c8d4c0;
      font-family: 'Courier New', monospace;
    }

    .hero-section {
      padding: 60px 20px;
      background: linear-gradient(180deg, #131715 0%, #0d0f0e 100%);
      border-bottom: 1px solid #1e2820;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-title {
      text-align: center;
      margin-bottom: 24px;
    }

    .title-main {
      display: block;
      font-size: 3rem;
      font-weight: 700;
      color: #e8a020;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .title-sub {
      display: block;
      font-size: 1.1rem;
      color: #6c757d;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }

    .hero-description {
      text-align: center;
      font-size: 1.1rem;
      line-height: 1.7;
      max-width: 700px;
      margin: 0 auto 48px;
      color: #c8d4c0;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .feature-card {
      background: #131715;
      border: 1px solid #1e2820;
      padding: 32px 24px;
      text-align: center;
      transition: all 0.3s;
    }

    .feature-card:hover {
      border-color: #2a3d2e;
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      color: #e8a020;
      font-size: 1.1rem;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .feature-card p {
      color: #c8d4c0;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .cta-section {
      text-align: center;
      padding: 40px 0;
    }

    .btn {
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 14px 32px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: rgba(232, 160, 32, 0.1);
      border: 2px solid #e8a020;
      color: #e8a020;
    }

    .btn-primary:hover:not(:disabled) {
      background: rgba(232, 160, 32, 0.2);
      box-shadow: 0 0 20px rgba(232, 160, 32, 0.3);
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      border: 2px solid #6c757d;
      color: #6c757d;
      margin-left: 16px;
    }

    .btn-secondary:hover {
      border-color: #c8d4c0;
      color: #c8d4c0;
    }

    .btn-arrow {
      font-size: 1.3rem;
      transition: transform 0.2s;
    }

    .btn-primary:hover .btn-arrow {
      transform: translateX(4px);
    }

    .cta-note {
      margin-top: 16px;
      font-size: 0.9rem;
      color: #6c757d;
      letter-spacing: 0.08em;
    }

    .error-message {
      margin-top: 16px;
      color: #e84040;
      font-size: 0.95rem;
    }

    .connected-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .status-badge {
      font-size: 1.3rem;
      color: #3ddc6a;
      font-weight: 600;
      letter-spacing: 0.1em;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .info-section {
      padding: 60px 20px;
      background: #0d0f0e;
    }

    .status-box {
      background: #131715;
      border: 1px solid #1e2820;
      padding: 32px;
      margin-bottom: 40px;
    }

    .status-box h2 {
      color: #e8a020;
      font-size: 1.3rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .status-list {
      list-style: none;
      padding: 0;
    }

    .status-list li {
      padding: 8px 0;
      font-size: 1rem;
      letter-spacing: 0.05em;
    }

    .status-done { color: #3ddc6a; }
    .status-progress { color: #e8a020; }
    .status-pending { color: #6c757d; }

    .browser-compat {
      background: #131715;
      border: 1px solid #1e2820;
      padding: 32px;
    }

    .browser-compat h3 {
      color: #e8a020;
      font-size: 1.1rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .compat-table {
      width: 100%;
      border-collapse: collapse;
    }

    .compat-table th {
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #2a3d2e;
      color: #e8a020;
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .compat-table td {
      padding: 12px;
      border-bottom: 1px solid #1e2820;
    }

    .compat-ok { color: #3ddc6a; }
    .compat-warn { color: #e8a020; }
    .compat-no { color: #e84040; }

    @media (max-width: 768px) {
      .title-main { font-size: 2rem; }
      .title-sub { font-size: 0.9rem; }
      .hero-description { font-size: 1rem; }
      .feature-grid { grid-template-columns: 1fr; }
      .action-buttons { flex-direction: column; width: 100%; }
      .btn-secondary { margin-left: 0; width: 100%; }
    }
  `]
})
export class HomeComponent {
  private midiIo = inject(MidiIoService);
  private router = inject(Router);

  isConnected = this.midiIo.isConnected;
  isConnecting = signal(false);
  connectionError = signal<string | null>(null);

  async connectToGR55() {
    this.isConnecting.set(true);
    this.connectionError.set(null);

    try {
      await this.midiIo.connect();
      // Connection successful - navigate to editor
      setTimeout(() => {
        this.router.navigate(['/editor']);
      }, 500);
    } catch (error: any) {
      console.error('Connection failed:', error);
      this.connectionError.set(
        error.message || 'Failed to connect to GR-55. Make sure it\'s connected via USB and powered on.'
      );
    } finally {
      this.isConnecting.set(false);
    }
  }

  disconnect() {
    this.midiIo.disconnect();
    this.connectionError.set(null);
  }
}
