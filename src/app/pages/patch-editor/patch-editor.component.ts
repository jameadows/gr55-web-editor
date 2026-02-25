/**
 * Patch Editor Component
 * 
 * Main patch editor with tabbed interface for all GR-55 sections.
 * Implements three-tier UX hierarchy: Primary/Secondary/Advanced.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KnobComponent } from '../../shared/components/knob/knob.component';
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { LedComponent } from '../../shared/components/led/led.component';
import { ParameterLabelComponent } from '../../shared/components/parameter-label/parameter-label.component';
import { MidiIoService, Gr55ProtocolService } from '../../core/midi';
import { GR55AddressMap } from '../../data/gr55-address-map';

type TabId = 'common' | 'pcm1' | 'pcm2' | 'modeling' | 'mfx' | 'delay' | 'chorus' | 'reverb' | 'assigns';

interface Tab {
  id: TabId;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-patch-editor',
  standalone: true,
  imports: [
    CommonModule,
    KnobComponent,
    SliderComponent,
    DropdownComponent,
    LedComponent,
    ParameterLabelComponent
  ],
  templateUrl: './patch-editor.component.html',
  styleUrl: './patch-editor.component.css'
})
export class PatchEditorComponent implements OnInit {
  private midiIo = inject(MidiIoService);
  private gr55 = inject(Gr55ProtocolService);
  private router = inject(Router);
  
  // ═══════════════════════════════════════════════════════════
  // CONNECTION STATE
  // ═══════════════════════════════════════════════════════════
  
  isConnected = this.midiIo.isConnected;
  
  // ═══════════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ═══════════════════════════════════════════════════════════
  
  tabs: Tab[] = [
    { id: 'common', label: 'Common' },
    { id: 'pcm1', label: 'PCM Tone 1' },
    { id: 'pcm2', label: 'PCM Tone 2' },
    { id: 'modeling', label: 'Modeling' },
    { id: 'mfx', label: 'MFX' },
    { id: 'delay', label: 'Delay' },
    { id: 'chorus', label: 'Chorus' },
    { id: 'reverb', label: 'Reverb' },
    { id: 'assigns', label: 'Assigns' }
  ];
  
  activeTab = signal<TabId>('common');
  
  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  
  showSecondaryControls = signal(true);
  showAdvancedControls = signal(false);
  
  // ═══════════════════════════════════════════════════════════
  // PATCH PARAMETERS (from GR-55)
  // ═══════════════════════════════════════════════════════════
  
  // Common - Primary
  patchName = signal('—');
  patchAttribute = signal(0); // 0=Guitar, 1=Bass
  patchLevel = signal(100);
  patchTempo = signal(120);
  
  // Common - Secondary
  normalPuLevel = signal(100);
  normalPuMute = signal(false);
  altTuneSwitch = signal(false);
  altTuneType = signal(0);
  
  // Common - Advanced
  userTuneString1 = signal(0);
  userTuneString2 = signal(0);
  userTuneString3 = signal(0);
  userTuneString4 = signal(0);
  userTuneString5 = signal(0);
  userTuneString6 = signal(0);
  gkSet = signal(0);
  guitarOutSource = signal(0);
  effectStructure = signal(0);
  
  // Computed
  mode = computed(() => this.patchAttribute() === 0 ? 'Guitar' : 'Bass');
  
  // Delay
  delaySwitch = signal(false);
  delayType = signal(0);
  delayTime = signal(500);
  delayFeedback = signal(30);
  delayEffectLevel = signal(100);
  
  // Chorus
  chorusSwitch = signal(false);
  chorusType = signal(1);
  chorusRate = signal(50);
  chorusDepth = signal(50);
  chorusEffectLevel = signal(100);
  
  // Reverb
  reverbSwitch = signal(false);
  reverbType = signal(1);
  reverbTime = signal(30);
  reverbHighCut = signal(10);
  reverbEffectLevel = signal(100);
  
  // ═══════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════
  
  ngOnInit() {
    // Check connection
    if (!this.isConnected()) {
      // Redirect to home with message
      this.router.navigate(['/'], { 
        queryParams: { message: 'Please connect to GR-55 first' } 
      });
      return;
    }
    
    // Load current patch parameters
    this.loadPatch();
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ═══════════════════════════════════════════════════════════
  
  selectTab(tabId: TabId) {
    this.activeTab.set(tabId);
  }
  
  toggleSecondary() {
    this.showSecondaryControls.update(v => !v);
  }
  
  toggleAdvanced() {
    this.showAdvancedControls.update(v => !v);
  }
  
  // ═══════════════════════════════════════════════════════════
  // PATCH LOADING
  // ═══════════════════════════════════════════════════════════
  
  loadPatch() {
    // Load Common section parameters
    this.loadCommonParameters();
    
    // Load Effects sections
    this.loadDelayParameters();
    this.loadChorusParameters();
    this.loadReverbParameters();
  }
  
  private loadCommonParameters() {
    const map = GR55AddressMap.patch.common;
    
    // Primary
    this.gr55.readParameter(map.patchName).subscribe({
      next: (v) => this.patchName.set(v),
      error: (e) => console.error('Failed to read patch name:', e)
    });
    
    this.gr55.readParameter(map.patchAttribute).subscribe({
      next: (v) => this.patchAttribute.set(v),
      error: (e) => console.error('Failed to read patch attribute:', e)
    });
    
    this.gr55.readParameter(map.patchLevel).subscribe({
      next: (v) => this.patchLevel.set(v),
      error: (e) => console.error('Failed to read patch level:', e)
    });
    
    this.gr55.readParameter(map.patchTempo).subscribe({
      next: (v) => this.patchTempo.set(v),
      error: (e) => console.error('Failed to read patch tempo:', e)
    });
    
    // Secondary
    this.gr55.readParameter(map.normalPuLevel).subscribe({
      next: (v) => this.normalPuLevel.set(v),
      error: (e) => console.error('Failed to read normal PU level:', e)
    });
    
    this.gr55.readParameter(map.altTuneSwitch).subscribe({
      next: (v) => this.altTuneSwitch.set(v),
      error: (e) => console.error('Failed to read alt tune switch:', e)
    });
    
    this.gr55.readParameter(map.altTuneType).subscribe({
      next: (v) => this.altTuneType.set(v),
      error: (e) => console.error('Failed to read alt tune type:', e)
    });
    
    // Advanced
    this.gr55.readParameter(map.gkSet).subscribe({
      next: (v) => this.gkSet.set(v),
      error: (e) => console.error('Failed to read GK set:', e)
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // PARAMETER CHANGE HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  onPatchNameChange(newName: string) {
    this.patchName.set(newName);
    this.gr55.writeParameter(GR55AddressMap.patch.common.patchName, newName).subscribe({
      error: (e) => {
        console.error('Failed to write patch name:', e);
        this.loadCommonParameters(); // Revert on error
      }
    });
  }
  
  onModeChange(newMode: number) {
    this.patchAttribute.set(newMode);
    this.gr55.writeParameter(GR55AddressMap.patch.common.patchAttribute, newMode).subscribe({
      error: (e) => {
        console.error('Failed to write mode:', e);
        this.loadCommonParameters();
      }
    });
  }
  
  onLevelChange(newLevel: number) {
    this.patchLevel.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.common.patchLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write level:', e);
        this.loadCommonParameters();
      }
    });
  }
  
  onTempoChange(newTempo: number) {
    this.patchTempo.set(newTempo);
    this.gr55.writeParameter(GR55AddressMap.patch.common.patchTempo, newTempo).subscribe({
      error: (e) => {
        console.error('Failed to write tempo:', e);
        this.loadCommonParameters();
      }
    });
  }
  
  onNormalPuLevelChange(newLevel: number) {
    this.normalPuLevel.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.common.normalPuLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write normal PU level:', e);
        this.loadCommonParameters();
      }
    });
  }
  
  onAltTuneSwitchChange(enabled: boolean) {
    this.altTuneSwitch.set(enabled);
    this.gr55.writeParameter(GR55AddressMap.patch.common.altTuneSwitch, enabled).subscribe({
      error: (e) => {
        console.error('Failed to write alt tune switch:', e);
        this.loadCommonParameters();
      }
    });
  }
  
  onAltTuneTypeChange(newType: number) {
    this.altTuneType.set(newType);
    this.gr55.writeParameter(GR55AddressMap.patch.common.altTuneType, newType).subscribe({
      error: (e) => {
        console.error('Failed to write alt tune type:', e);
        this.loadCommonParameters();
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // DELAY SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadDelayParameters() {
    const map = GR55AddressMap.patch.delay;
    
    this.gr55.readParameter(map.delaySwitch).subscribe({
      next: (v) => this.delaySwitch.set(v),
      error: (e) => console.error('Failed to read delay switch:', e)
    });
    
    this.gr55.readParameter(map.delayType).subscribe({
      next: (v) => this.delayType.set(v),
      error: (e) => console.error('Failed to read delay type:', e)
    });
    
    this.gr55.readParameter(map.delayTime).subscribe({
      next: (v) => this.delayTime.set(v),
      error: (e) => console.error('Failed to read delay time:', e)
    });
    
    this.gr55.readParameter(map.delayFeedback).subscribe({
      next: (v) => this.delayFeedback.set(v),
      error: (e) => console.error('Failed to read delay feedback:', e)
    });
    
    this.gr55.readParameter(map.delayEffectLevel).subscribe({
      next: (v) => this.delayEffectLevel.set(v),
      error: (e) => console.error('Failed to read delay level:', e)
    });
  }
  
  onDelaySwitchChange(enabled: boolean) {
    this.delaySwitch.set(enabled);
    this.gr55.writeParameter(GR55AddressMap.patch.delay.delaySwitch, enabled).subscribe({
      error: (e) => {
        console.error('Failed to write delay switch:', e);
        this.loadDelayParameters();
      }
    });
  }
  
  onDelayTypeChange(newType: number) {
    this.delayType.set(newType);
    this.gr55.writeParameter(GR55AddressMap.patch.delay.delayType, newType).subscribe({
      error: (e) => {
        console.error('Failed to write delay type:', e);
        this.loadDelayParameters();
      }
    });
  }
  
  onDelayTimeChange(newTime: number) {
    this.delayTime.set(newTime);
    this.gr55.writeParameter(GR55AddressMap.patch.delay.delayTime, newTime).subscribe({
      error: (e) => {
        console.error('Failed to write delay time:', e);
        this.loadDelayParameters();
      }
    });
  }
  
  onDelayFeedbackChange(newFeedback: number) {
    this.delayFeedback.set(newFeedback);
    this.gr55.writeParameter(GR55AddressMap.patch.delay.delayFeedback, newFeedback).subscribe({
      error: (e) => {
        console.error('Failed to write delay feedback:', e);
        this.loadDelayParameters();
      }
    });
  }
  
  onDelayLevelChange(newLevel: number) {
    this.delayEffectLevel.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.delay.delayEffectLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write delay level:', e);
        this.loadDelayParameters();
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // CHORUS SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadChorusParameters() {
    const map = GR55AddressMap.patch.chorus;
    
    this.gr55.readParameter(map.chorusSwitch).subscribe({
      next: (v) => this.chorusSwitch.set(v),
      error: (e) => console.error('Failed to read chorus switch:', e)
    });
    
    this.gr55.readParameter(map.chorusType).subscribe({
      next: (v) => this.chorusType.set(v),
      error: (e) => console.error('Failed to read chorus type:', e)
    });
    
    this.gr55.readParameter(map.chorusRate).subscribe({
      next: (v) => this.chorusRate.set(v),
      error: (e) => console.error('Failed to read chorus rate:', e)
    });
    
    this.gr55.readParameter(map.chorusDepth).subscribe({
      next: (v) => this.chorusDepth.set(v),
      error: (e) => console.error('Failed to read chorus depth:', e)
    });
    
    this.gr55.readParameter(map.chorusEffectLevel).subscribe({
      next: (v) => this.chorusEffectLevel.set(v),
      error: (e) => console.error('Failed to read chorus level:', e)
    });
  }
  
  onChorusSwitchChange(enabled: boolean) {
    this.chorusSwitch.set(enabled);
    this.gr55.writeParameter(GR55AddressMap.patch.chorus.chorusSwitch, enabled).subscribe({
      error: (e) => {
        console.error('Failed to write chorus switch:', e);
        this.loadChorusParameters();
      }
    });
  }
  
  onChorusTypeChange(newType: number) {
    this.chorusType.set(newType);
    this.gr55.writeParameter(GR55AddressMap.patch.chorus.chorusType, newType).subscribe({
      error: (e) => {
        console.error('Failed to write chorus type:', e);
        this.loadChorusParameters();
      }
    });
  }
  
  onChorusRateChange(newRate: number) {
    this.chorusRate.set(newRate);
    this.gr55.writeParameter(GR55AddressMap.patch.chorus.chorusRate, newRate).subscribe({
      error: (e) => {
        console.error('Failed to write chorus rate:', e);
        this.loadChorusParameters();
      }
    });
  }
  
  onChorusDepthChange(newDepth: number) {
    this.chorusDepth.set(newDepth);
    this.gr55.writeParameter(GR55AddressMap.patch.chorus.chorusDepth, newDepth).subscribe({
      error: (e) => {
        console.error('Failed to write chorus depth:', e);
        this.loadChorusParameters();
      }
    });
  }
  
  onChorusLevelChange(newLevel: number) {
    this.chorusEffectLevel.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.chorus.chorusEffectLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write chorus level:', e);
        this.loadChorusParameters();
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // REVERB SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadReverbParameters() {
    const map = GR55AddressMap.patch.reverb;
    
    this.gr55.readParameter(map.reverbSwitch).subscribe({
      next: (v) => this.reverbSwitch.set(v),
      error: (e) => console.error('Failed to read reverb switch:', e)
    });
    
    this.gr55.readParameter(map.reverbType).subscribe({
      next: (v) => this.reverbType.set(v),
      error: (e) => console.error('Failed to read reverb type:', e)
    });
    
    this.gr55.readParameter(map.reverbTime).subscribe({
      next: (v) => this.reverbTime.set(v),
      error: (e) => console.error('Failed to read reverb time:', e)
    });
    
    this.gr55.readParameter(map.reverbHighCut).subscribe({
      next: (v) => this.reverbHighCut.set(v),
      error: (e) => console.error('Failed to read reverb high cut:', e)
    });
    
    this.gr55.readParameter(map.reverbEffectLevel).subscribe({
      next: (v) => this.reverbEffectLevel.set(v),
      error: (e) => console.error('Failed to read reverb level:', e)
    });
  }
  
  onReverbSwitchChange(enabled: boolean) {
    this.reverbSwitch.set(enabled);
    this.gr55.writeParameter(GR55AddressMap.patch.reverb.reverbSwitch, enabled).subscribe({
      error: (e) => {
        console.error('Failed to write reverb switch:', e);
        this.loadReverbParameters();
      }
    });
  }
  
  onReverbTypeChange(newType: number) {
    this.reverbType.set(newType);
    this.gr55.writeParameter(GR55AddressMap.patch.reverb.reverbType, newType).subscribe({
      error: (e) => {
        console.error('Failed to write reverb type:', e);
        this.loadReverbParameters();
      }
    });
  }
  
  onReverbTimeChange(newTime: number) {
    this.reverbTime.set(newTime);
    this.gr55.writeParameter(GR55AddressMap.patch.reverb.reverbTime, newTime).subscribe({
      error: (e) => {
        console.error('Failed to write reverb time:', e);
        this.loadReverbParameters();
      }
    });
  }
  
  onReverbHighCutChange(newHighCut: number) {
    this.reverbHighCut.set(newHighCut);
    this.gr55.writeParameter(GR55AddressMap.patch.reverb.reverbHighCut, newHighCut).subscribe({
      error: (e) => {
        console.error('Failed to write reverb high cut:', e);
        this.loadReverbParameters();
      }
    });
  }
  
  onReverbLevelChange(newLevel: number) {
    this.reverbEffectLevel.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.reverb.reverbEffectLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write reverb level:', e);
        this.loadReverbParameters();
      }
    });
  }
}
