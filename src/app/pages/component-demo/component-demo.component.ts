/**
 * Component Demo Page
 * 
 * Demonstrates UI components integrated with GR-55 services.
 * Shows Knob component with live MIDI communication.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '../../shared/components/knob/knob.component';
import { MidiIoService, Gr55ProtocolService } from '../../core/midi';
import { GR55AddressMap } from '../../data/gr55-address-map';

@Component({
  selector: 'app-component-demo',
  standalone: true,
  imports: [CommonModule, KnobComponent],
  template: `
    <div class="demo-container">
      <h1>Component Demo</h1>
      <p class="subtitle">UI Components + MIDI Services Integration</p>
      
      <!-- Connection Status -->
      <div class="status-panel">
        <div class="status-item" [class.active]="isConnected()">
          <span class="status-label">MIDI:</span>
          <span class="status-value">{{ connectionStatus() }}</span>
        </div>
        @if (!isConnected()) {
          <button class="btn-connect" (click)="connect()">Connect to GR-55</button>
        }
      </div>
      
      <!-- Knob Demos -->
      @if (isConnected()) {
        <section class="demo-section">
          <h2>Knob Component</h2>
          <p class="section-desc">
            SVG rotary control with mouse drag. Connected to GR-55 patch parameters.
          </p>
          
          <div class="knobs-grid">
            <!-- Patch Level -->
            <div class="knob-wrapper">
              <app-knob
                [value]="patchLevel()"
                [min]="0"
                [max]="200"
                [label]="'Patch Level'"
                [color]="'amber'"
                [size]="100"
                (valueChange)="onLevelChange($event)">
              </app-knob>
              <div class="knob-info">
                <small>Range: 0-200</small>
                <small>Address: 0x18000200</small>
              </div>
            </div>
            
            <!-- Tempo -->
            <div class="knob-wrapper">
              <app-knob
                [value]="tempo()"
                [min]="40"
                [max]="250"
                [label]="'Tempo'"
                [units]="'BPM'"
                [color]="'green'"
                [size]="100"
                (valueChange)="onTempoChange($event)">
              </app-knob>
              <div class="knob-info">
                <small>Range: 40-250 BPM</small>
                <small>Address: 0x18000208</small>
              </div>
            </div>
            
            <!-- Demo: Non-MIDI Knob -->
            <div class="knob-wrapper">
              <app-knob
                [value]="demoValue()"
                [min]="0"
                [max]="127"
                [label]="'Demo Only'"
                [color]="'cyan'"
                [size]="100"
                (valueChange)="demoValue.set($event)">
              </app-knob>
              <div class="knob-info">
                <small>Local only (no MIDI)</small>
                <small>For testing UI</small>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Current Patch Info -->
        <section class="demo-section">
          <h2>Current Patch</h2>
          <div class="patch-info">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">{{ patchName() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Mode:</span>
              <span class="info-value">{{ mode() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Level:</span>
              <span class="info-value">{{ patchLevel() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tempo:</span>
              <span class="info-value">{{ tempo() }} BPM</span>
            </div>
          </div>
          <button class="btn-refresh" (click)="loadPatchData()">
            ↻ Refresh from GR-55
          </button>
        </section>
        
        <!-- Instructions -->
        <section class="demo-section">
          <h2>How to Use</h2>
          <ul class="instructions">
            <li><strong>Click and drag</strong> up/down to change value</li>
            <li><strong>Mouse wheel</strong> for fine adjustment</li>
            <li><strong>Double-click</strong> to reset to middle value</li>
            <li>Changes are sent to GR-55 in real-time</li>
          </ul>
        </section>
      } @else {
        <div class="connect-prompt">
          <p>Connect your GR-55 via USB and click "Connect to GR-55" to try the components.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #c8d4c0;
      font-family: 'Courier New', monospace;
    }
    
    h1 {
      font-size: 2rem;
      color: #e8a020;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .subtitle {
      color: #6c757d;
      font-size: 0.9rem;
      letter-spacing: 0.1em;
      margin-bottom: 32px;
    }
    
    .status-panel {
      background: #131715;
      border: 1px solid #1e2820;
      padding: 20px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .status-item {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .status-label {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .status-value {
      color: #e84040;
      font-weight: 600;
    }
    
    .status-item.active .status-value {
      color: #3ddc6a;
    }
    
    .btn-connect, .btn-refresh {
      background: rgba(232, 160, 32, 0.1);
      border: 2px solid #e8a020;
      color: #e8a020;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-connect:hover, .btn-refresh:hover {
      background: rgba(232, 160, 32, 0.2);
      box-shadow: 0 0 12px rgba(232, 160, 32, 0.3);
    }
    
    .demo-section {
      margin-bottom: 48px;
    }
    
    .demo-section h2 {
      color: #e8a020;
      font-size: 1.3rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    
    .section-desc {
      color: #c8d4c0;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    
    .knobs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 32px;
      margin-bottom: 32px;
    }
    
    .knob-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: #131715;
      border: 1px solid #1e2820;
      padding: 24px;
    }
    
    .knob-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: center;
    }
    
    .knob-info small {
      font-size: 0.75rem;
      color: #6c757d;
      letter-spacing: 0.05em;
    }
    
    .patch-info {
      background: #131715;
      border: 1px solid #1e2820;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #1e2820;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #6c757d;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
    }
    
    .info-value {
      color: #3ddc6a;
      font-weight: 600;
    }
    
    .instructions {
      background: #131715;
      border: 1px solid #1e2820;
      padding: 20px 20px 20px 40px;
      list-style: disc;
    }
    
    .instructions li {
      padding: 6px 0;
      line-height: 1.6;
    }
    
    .instructions strong {
      color: #e8a020;
    }
    
    .connect-prompt {
      background: #131715;
      border: 2px solid #1e2820;
      padding: 60px 40px;
      text-align: center;
      color: #6c757d;
      font-size: 1.1rem;
    }
  `]
})
export class ComponentDemoComponent implements OnInit {
  private midiIo = inject(MidiIoService);
  private gr55 = inject(Gr55ProtocolService);
  
  // Connection state
  isConnected = this.midiIo.isConnected;
  connectionStatus = this.midiIo.connectionState;
  
  // Patch parameters (from GR-55)
  patchName = signal('—');
  mode = signal('—');
  patchLevel = signal(100);
  tempo = signal(120);
  
  // Demo value (local only, no MIDI)
  demoValue = signal(64);
  
  ngOnInit() {
    // Auto-load patch data if already connected
    if (this.isConnected()) {
      this.loadPatchData();
    }
  }
  
  async connect() {
    try {
      await this.midiIo.requestAccess();
      // Auto-selects GR-55 ports
      this.loadPatchData();
    } catch (error) {
      console.error('MIDI connection failed:', error);
      alert('Failed to connect to MIDI. Make sure your GR-55 is connected via USB.');
    }
  }
  
  loadPatchData() {
    // Read patch name
    this.gr55.getPatchName().subscribe({
      next: (name) => this.patchName.set(name),
      error: (err) => console.error('Failed to read patch name:', err)
    });
    
    // Read mode
    this.gr55.getMode().subscribe({
      next: (m) => this.mode.set(m.toUpperCase()),
      error: (err) => console.error('Failed to read mode:', err)
    });
    
    // Read patch level
    this.gr55.readParameter(GR55AddressMap.patch.common.patchLevel).subscribe({
      next: (level) => this.patchLevel.set(level),
      error: (err) => console.error('Failed to read level:', err)
    });
    
    // Read tempo
    this.gr55.getTempo().subscribe({
      next: (bpm) => this.tempo.set(bpm),
      error: (err) => console.error('Failed to read tempo:', err)
    });
  }
  
  onLevelChange(newLevel: number) {
    // Optimistic update
    this.patchLevel.set(newLevel);
    
    // Write to GR-55
    this.gr55.writeParameter(GR55AddressMap.patch.common.patchLevel, newLevel).subscribe({
      error: (err) => {
        console.error('Failed to write level:', err);
        // Revert on error
        this.gr55.readParameter(GR55AddressMap.patch.common.patchLevel)
          .subscribe(level => this.patchLevel.set(level));
      }
    });
  }
  
  onTempoChange(newTempo: number) {
    // Optimistic update
    this.tempo.set(newTempo);
    
    // Write to GR-55
    this.gr55.setTempo(newTempo).subscribe({
      error: (err) => {
        console.error('Failed to write tempo:', err);
        // Revert on error
        this.gr55.getTempo()
          .subscribe(bpm => this.tempo.set(bpm));
      }
    });
  }
}
