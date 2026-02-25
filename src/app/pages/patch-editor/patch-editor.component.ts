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
  
  // PCM Tone 1
  pcm1ToneSelect = signal(0);
  pcm1MuteSwitch = signal(false);
  pcm1Level = signal(127);
  pcm1OctaveShift = signal(0);
  pcm1Pan = signal(64);
  pcm1CoarseTune = signal(0);
  pcm1FineTune = signal(0);
  
  // PCM Tone 2
  pcm2ToneSelect = signal(0);
  pcm2MuteSwitch = signal(false);
  pcm2Level = signal(127);
  pcm2OctaveShift = signal(0);
  pcm2Pan = signal(64);
  pcm2CoarseTune = signal(0);
  pcm2FineTune = signal(0);
  
  // Modeling
  modelingCategoryGuitar = signal(0);
  modelingToneEGtrGuitar = signal(0);
  modelingToneAcGuitar = signal(0);
  modelingToneEBassGuitar = signal(0);
  modelingToneSynthGuitar = signal(0);
  modelingCategoryBass = signal(0);
  modelingToneEBassBass = signal(0);
  modelingToneEGtrBass = signal(0);
  modelingToneSynthBass = signal(0);
  modelingLevel = signal(100);
  modelingMuteSwitch = signal(false);
  
  // MFX
  mfxSwitch = signal(false);
  mfxType = signal(0);
  mfxChorusSend = signal(0);
  mfxDelaySend = signal(0);
  mfxReverbSend = signal(0);
  
  // Computed - active modeling category and tone based on guitar/bass mode
  activeModelingCategory = computed(() => {
    return this.patchAttribute() === 0 ? this.modelingCategoryGuitar() : this.modelingCategoryBass();
  });
  
  activeModelingTone = computed(() => {
    const isGuitar = this.patchAttribute() === 0;
    const category = isGuitar ? this.modelingCategoryGuitar() : this.modelingCategoryBass();
    
    if (isGuitar) {
      switch (category) {
        case 0: return this.modelingToneEGtrGuitar(); // E.GTR
        case 1: return this.modelingToneAcGuitar(); // AC
        case 2: return this.modelingToneEBassGuitar(); // E.BASS
        case 3: return this.modelingToneSynthGuitar(); // SYNTH
        default: return 0;
      }
    } else {
      switch (category) {
        case 0: return this.modelingToneEBassBass(); // E.BASS
        case 1: return this.modelingToneSynthBass(); // SYNTH
        case 2: return this.modelingToneEGtrBass(); // E.GTR
        default: return 0;
      }
    }
  });
  
  // Category options based on guitar/bass mode
  modelingCategoryOptions = computed(() => {
    return this.patchAttribute() === 0 
      ? ['E.GTR', 'AC', 'E.BASS', 'SYNTH']
      : ['E.BASS', 'SYNTH', 'E.GTR'];
  });
  
  // Tone options based on selected category and guitar/bass mode
  modelingToneOptions = computed(() => {
    const isGuitar = this.patchAttribute() === 0;
    const category = isGuitar ? this.modelingCategoryGuitar() : this.modelingCategoryBass();
    
    if (isGuitar) {
      switch (category) {
        case 0: return ['CLA-ST', 'MOD-ST', 'H&H-ST', 'TE', 'LP', 'P-90', 'LIPS', 'RICK', '335', 'L4'];
        case 1: return ['STEEL', 'NYLON', 'SITAR', 'BANJO', 'RESO'];
        case 2: return ['JB', 'PB'];
        case 3: return ['ANALOG GR', 'WAVE SYNTH', 'FILTER BASS', 'CRYSTAL', 'ORGAN', 'BRASS'];
        default: return [];
      }
    } else {
      switch (category) {
        case 0: return ['VINT JB', 'JB', 'VINT PB', 'PB', 'M-MAN', 'RICK', 'T-BIRD', 'ACTIVE', 'VIOLIN'];
        case 1: return ['ANALOG GR', 'WAVE SYNTH', 'FILTER BASS', 'CRYSTAL', 'ORGAN', 'BRASS'];
        case 2: return ['ST', 'LP'];
        default: return [];
      }
    }
  });
  
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
    
    // Load PCM Tone sections
    this.loadPcm1Parameters();
    this.loadPcm2Parameters();
    
    // Load Modeling section
    this.loadModelingParameters();
    
    // Load MFX section
    this.loadMfxParameters();
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
  
  // ═══════════════════════════════════════════════════════════
  // PCM TONE 1 SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadPcm1Parameters() {
    const map = GR55AddressMap.patch.pcmTone1;
    
    this.gr55.readParameter(map.toneSelect).subscribe({
      next: (v) => this.pcm1ToneSelect.set(v),
      error: (e) => console.error('Failed to read PCM1 tone select:', e)
    });
    
    this.gr55.readParameter(map.muteSwitch).subscribe({
      next: (v) => this.pcm1MuteSwitch.set(v),
      error: (e) => console.error('Failed to read PCM1 mute:', e)
    });
    
    this.gr55.readParameter(map.partLevel).subscribe({
      next: (v) => this.pcm1Level.set(v),
      error: (e) => console.error('Failed to read PCM1 level:', e)
    });
    
    this.gr55.readParameter(map.partOctaveShift).subscribe({
      next: (v) => this.pcm1OctaveShift.set(v),
      error: (e) => console.error('Failed to read PCM1 octave:', e)
    });
    
    this.gr55.readParameter(map.partPan).subscribe({
      next: (v) => this.pcm1Pan.set(v),
      error: (e) => console.error('Failed to read PCM1 pan:', e)
    });
    
    this.gr55.readParameter(map.partCoarseTune).subscribe({
      next: (v) => this.pcm1CoarseTune.set(v),
      error: (e) => console.error('Failed to read PCM1 coarse tune:', e)
    });
    
    this.gr55.readParameter(map.partFineTune).subscribe({
      next: (v) => this.pcm1FineTune.set(v),
      error: (e) => console.error('Failed to read PCM1 fine tune:', e)
    });
  }
  
  onPcm1ToneSelectChange(newTone: number) {
    this.pcm1ToneSelect.set(newTone);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.toneSelect, newTone).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 tone select:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  onPcm1MuteChange(muted: boolean) {
    this.pcm1MuteSwitch.set(muted);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.muteSwitch, muted).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 mute:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  onPcm1LevelChange(newLevel: number) {
    this.pcm1Level.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.partLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 level:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  onPcm1OctaveChange(newOctave: number) {
    this.pcm1OctaveShift.set(newOctave);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.partOctaveShift, newOctave).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 octave:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  onPcm1PanChange(newPan: number) {
    this.pcm1Pan.set(newPan);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.partPan, newPan).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 pan:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  onPcm1CoarseTuneChange(newTune: number) {
    this.pcm1CoarseTune.set(newTune);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.partCoarseTune, newTune).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 coarse tune:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  onPcm1FineTuneChange(newTune: number) {
    this.pcm1FineTune.set(newTune);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone1.partFineTune, newTune).subscribe({
      error: (e) => {
        console.error('Failed to write PCM1 fine tune:', e);
        this.loadPcm1Parameters();
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // PCM TONE 2 SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadPcm2Parameters() {
    const map = GR55AddressMap.patch.pcmTone2;
    
    this.gr55.readParameter(map.toneSelect).subscribe({
      next: (v) => this.pcm2ToneSelect.set(v),
      error: (e) => console.error('Failed to read PCM2 tone select:', e)
    });
    
    this.gr55.readParameter(map.muteSwitch).subscribe({
      next: (v) => this.pcm2MuteSwitch.set(v),
      error: (e) => console.error('Failed to read PCM2 mute:', e)
    });
    
    this.gr55.readParameter(map.partLevel).subscribe({
      next: (v) => this.pcm2Level.set(v),
      error: (e) => console.error('Failed to read PCM2 level:', e)
    });
    
    this.gr55.readParameter(map.partOctaveShift).subscribe({
      next: (v) => this.pcm2OctaveShift.set(v),
      error: (e) => console.error('Failed to read PCM2 octave:', e)
    });
    
    this.gr55.readParameter(map.partPan).subscribe({
      next: (v) => this.pcm2Pan.set(v),
      error: (e) => console.error('Failed to read PCM2 pan:', e)
    });
    
    this.gr55.readParameter(map.partCoarseTune).subscribe({
      next: (v) => this.pcm2CoarseTune.set(v),
      error: (e) => console.error('Failed to read PCM2 coarse tune:', e)
    });
    
    this.gr55.readParameter(map.partFineTune).subscribe({
      next: (v) => this.pcm2FineTune.set(v),
      error: (e) => console.error('Failed to read PCM2 fine tune:', e)
    });
  }
  
  onPcm2ToneSelectChange(newTone: number) {
    this.pcm2ToneSelect.set(newTone);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.toneSelect, newTone).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 tone select:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  onPcm2MuteChange(muted: boolean) {
    this.pcm2MuteSwitch.set(muted);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.muteSwitch, muted).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 mute:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  onPcm2LevelChange(newLevel: number) {
    this.pcm2Level.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.partLevel, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 level:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  onPcm2OctaveChange(newOctave: number) {
    this.pcm2OctaveShift.set(newOctave);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.partOctaveShift, newOctave).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 octave:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  onPcm2PanChange(newPan: number) {
    this.pcm2Pan.set(newPan);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.partPan, newPan).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 pan:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  onPcm2CoarseTuneChange(newTune: number) {
    this.pcm2CoarseTune.set(newTune);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.partCoarseTune, newTune).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 coarse tune:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  onPcm2FineTuneChange(newTune: number) {
    this.pcm2FineTune.set(newTune);
    this.gr55.writeParameter(GR55AddressMap.patch.pcmTone2.partFineTune, newTune).subscribe({
      error: (e) => {
        console.error('Failed to write PCM2 fine tune:', e);
        this.loadPcm2Parameters();
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // MODELING SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadModelingParameters() {
    const map = GR55AddressMap.patch.modeling;
    
    // Load all category and tone fields (active ones determined by guitar/bass mode)
    this.gr55.readParameter(map.toneCategoryGuitar).subscribe({
      next: (v) => this.modelingCategoryGuitar.set(v),
      error: (e) => console.error('Failed to read modeling category (guitar):', e)
    });
    
    this.gr55.readParameter(map.toneNumberEGtrGuitar).subscribe({
      next: (v) => this.modelingToneEGtrGuitar.set(v),
      error: (e) => console.error('Failed to read modeling tone E.GTR (guitar):', e)
    });
    
    this.gr55.readParameter(map.toneNumberAcGuitar).subscribe({
      next: (v) => this.modelingToneAcGuitar.set(v),
      error: (e) => console.error('Failed to read modeling tone AC:', e)
    });
    
    this.gr55.readParameter(map.toneNumberEBassGuitar).subscribe({
      next: (v) => this.modelingToneEBassGuitar.set(v),
      error: (e) => console.error('Failed to read modeling tone E.BASS (guitar):', e)
    });
    
    this.gr55.readParameter(map.toneNumberSynthGuitar).subscribe({
      next: (v) => this.modelingToneSynthGuitar.set(v),
      error: (e) => console.error('Failed to read modeling tone SYNTH (guitar):', e)
    });
    
    this.gr55.readParameter(map.toneCategoryBass).subscribe({
      next: (v) => this.modelingCategoryBass.set(v),
      error: (e) => console.error('Failed to read modeling category (bass):', e)
    });
    
    this.gr55.readParameter(map.toneNumberEBassBass).subscribe({
      next: (v) => this.modelingToneEBassBass.set(v),
      error: (e) => console.error('Failed to read modeling tone E.BASS (bass):', e)
    });
    
    this.gr55.readParameter(map.toneNumberEGtrBass).subscribe({
      next: (v) => this.modelingToneEGtrBass.set(v),
      error: (e) => console.error('Failed to read modeling tone E.GTR (bass):', e)
    });
    
    this.gr55.readParameter(map.toneNumberSynthBass).subscribe({
      next: (v) => this.modelingToneSynthBass.set(v),
      error: (e) => console.error('Failed to read modeling tone SYNTH (bass):', e)
    });
    
    this.gr55.readParameter(map.level).subscribe({
      next: (v) => this.modelingLevel.set(v),
      error: (e) => console.error('Failed to read modeling level:', e)
    });
    
    this.gr55.readParameter(map.muteSwitch).subscribe({
      next: (v) => this.modelingMuteSwitch.set(v),
      error: (e) => console.error('Failed to read modeling mute:', e)
    });
  }
  
  onModelingCategoryChange(newCategory: number) {
    const map = GR55AddressMap.patch.modeling;
    const isGuitar = this.patchAttribute() === 0;
    
    if (isGuitar) {
      this.modelingCategoryGuitar.set(newCategory);
      this.gr55.writeParameter(map.toneCategoryGuitar, newCategory).subscribe({
        error: (e) => {
          console.error('Failed to write modeling category (guitar):', e);
          this.loadModelingParameters();
        }
      });
    } else {
      this.modelingCategoryBass.set(newCategory);
      this.gr55.writeParameter(map.toneCategoryBass, newCategory).subscribe({
        error: (e) => {
          console.error('Failed to write modeling category (bass):', e);
          this.loadModelingParameters();
        }
      });
    }
  }
  
  onModelingToneChange(newTone: number) {
    const map = GR55AddressMap.patch.modeling;
    const isGuitar = this.patchAttribute() === 0;
    const category = isGuitar ? this.modelingCategoryGuitar() : this.modelingCategoryBass();
    
    if (isGuitar) {
      switch (category) {
        case 0: // E.GTR
          this.modelingToneEGtrGuitar.set(newTone);
          this.gr55.writeParameter(map.toneNumberEGtrGuitar, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone E.GTR:', e);
              this.loadModelingParameters();
            }
          });
          break;
        case 1: // AC
          this.modelingToneAcGuitar.set(newTone);
          this.gr55.writeParameter(map.toneNumberAcGuitar, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone AC:', e);
              this.loadModelingParameters();
            }
          });
          break;
        case 2: // E.BASS
          this.modelingToneEBassGuitar.set(newTone);
          this.gr55.writeParameter(map.toneNumberEBassGuitar, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone E.BASS (guitar):', e);
              this.loadModelingParameters();
            }
          });
          break;
        case 3: // SYNTH
          this.modelingToneSynthGuitar.set(newTone);
          this.gr55.writeParameter(map.toneNumberSynthGuitar, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone SYNTH (guitar):', e);
              this.loadModelingParameters();
            }
          });
          break;
      }
    } else {
      switch (category) {
        case 0: // E.BASS
          this.modelingToneEBassBass.set(newTone);
          this.gr55.writeParameter(map.toneNumberEBassBass, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone E.BASS (bass):', e);
              this.loadModelingParameters();
            }
          });
          break;
        case 1: // SYNTH
          this.modelingToneSynthBass.set(newTone);
          this.gr55.writeParameter(map.toneNumberSynthBass, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone SYNTH (bass):', e);
              this.loadModelingParameters();
            }
          });
          break;
        case 2: // E.GTR
          this.modelingToneEGtrBass.set(newTone);
          this.gr55.writeParameter(map.toneNumberEGtrBass, newTone).subscribe({
            error: (e) => {
              console.error('Failed to write modeling tone E.GTR (bass):', e);
              this.loadModelingParameters();
            }
          });
          break;
      }
    }
  }
  
  onModelingMuteChange(muted: boolean) {
    this.modelingMuteSwitch.set(muted);
    this.gr55.writeParameter(GR55AddressMap.patch.modeling.muteSwitch, muted).subscribe({
      error: (e) => {
        console.error('Failed to write modeling mute:', e);
        this.loadModelingParameters();
      }
    });
  }
  
  onModelingLevelChange(newLevel: number) {
    this.modelingLevel.set(newLevel);
    this.gr55.writeParameter(GR55AddressMap.patch.modeling.level, newLevel).subscribe({
      error: (e) => {
        console.error('Failed to write modeling level:', e);
        this.loadModelingParameters();
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // MFX SECTION
  // ═══════════════════════════════════════════════════════════
  
  private loadMfxParameters() {
    const map = GR55AddressMap.patch.mfx;
    
    this.gr55.readParameter(map.mfxSwitch).subscribe({
      next: (v) => this.mfxSwitch.set(v),
      error: (e) => console.error('Failed to read MFX switch:', e)
    });
    
    this.gr55.readParameter(map.mfxType).subscribe({
      next: (v) => this.mfxType.set(v),
      error: (e) => console.error('Failed to read MFX type:', e)
    });
    
    this.gr55.readParameter(map.mfxChorusSendLevel).subscribe({
      next: (v) => this.mfxChorusSend.set(v),
      error: (e) => console.error('Failed to read MFX chorus send:', e)
    });
    
    this.gr55.readParameter(map.mfxDelaySendLevel).subscribe({
      next: (v) => this.mfxDelaySend.set(v),
      error: (e) => console.error('Failed to read MFX delay send:', e)
    });
    
    this.gr55.readParameter(map.mfxReverbSendLevel).subscribe({
      next: (v) => this.mfxReverbSend.set(v),
      error: (e) => console.error('Failed to read MFX reverb send:', e)
    });
  }
  
  onMfxSwitchChange(enabled: boolean) {
    this.mfxSwitch.set(enabled);
    this.gr55.writeParameter(GR55AddressMap.patch.mfx.mfxSwitch, enabled).subscribe({
      error: (e) => {
        console.error('Failed to write MFX switch:', e);
        this.loadMfxParameters();
      }
    });
  }
  
  onMfxTypeChange(newType: number) {
    this.mfxType.set(newType);
    this.gr55.writeParameter(GR55AddressMap.patch.mfx.mfxType, newType).subscribe({
      error: (e) => {
        console.error('Failed to write MFX type:', e);
        this.loadMfxParameters();
      }
    });
  }
  
  onMfxChorusSendChange(newSend: number) {
    this.mfxChorusSend.set(newSend);
    this.gr55.writeParameter(GR55AddressMap.patch.mfx.mfxChorusSendLevel, newSend).subscribe({
      error: (e) => {
        console.error('Failed to write MFX chorus send:', e);
        this.loadMfxParameters();
      }
    });
  }
  
  onMfxDelaySendChange(newSend: number) {
    this.mfxDelaySend.set(newSend);
    this.gr55.writeParameter(GR55AddressMap.patch.mfx.mfxDelaySendLevel, newSend).subscribe({
      error: (e) => {
        console.error('Failed to write MFX delay send:', e);
        this.loadMfxParameters();
      }
    });
  }
  
  onMfxReverbSendChange(newSend: number) {
    this.mfxReverbSend.set(newSend);
    this.gr55.writeParameter(GR55AddressMap.patch.mfx.mfxReverbSendLevel, newSend).subscribe({
      error: (e) => {
        console.error('Failed to write MFX reverb send:', e);
        this.loadMfxParameters();
      }
    });
  }
}
