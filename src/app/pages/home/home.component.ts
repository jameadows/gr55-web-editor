import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
              <div class="feature-icon">💾</div>
              <h3>Patch Library</h3>
              <p>Import, organize, and export .syx files</p>
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
            <a routerLink="/midi-explorer" class="btn btn-primary btn-lg">
              Launch MIDI Explorer
              <span class="btn-arrow">→</span>
            </a>
            <p class="cta-note">
              Connect your GR-55 via USB to get started
            </p>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="container">
          <div class="status-box">
            <h2>Development Status</h2>
            <ul class="status-list">
              <li class="status-done">✅ Web MIDI SysEx communication validated</li>
              <li class="status-done">✅ Roland protocol implementation (RQ1/DT1)</li>
              <li class="status-done">✅ MIDI Explorer prototype</li>
              <li class="status-progress">🚧 Angular app framework (current)</li>
              <li class="status-pending">⏳ Parameter address map integration</li>
              <li class="status-pending">⏳ Full patch editor UI</li>
              <li class="status-pending">⏳ OPFS patch library</li>
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

    .btn-primary {
      background: rgba(232, 160, 32, 0.1);
      border: 2px solid #e8a020;
      color: #e8a020;
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
    }

    .btn-primary:hover {
      background: rgba(232, 160, 32, 0.2);
      box-shadow: 0 0 20px rgba(232, 160, 32, 0.3);
      transform: translateY(-2px);
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
    }
  `]
})
export class HomeComponent {
}
