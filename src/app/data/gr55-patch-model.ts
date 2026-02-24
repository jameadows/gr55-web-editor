/**
 * GR-55 Patch Model
 * 
 * TypeScript interfaces for GR-55 patch structure.
 * Structure adapted from gr55-remote by Moti Zilberman.
 * 
 * Original work: https://github.com/motiz88/gr55-remote
 * © Moti Zilberman (MIT License)
 * 
 * Adaptations © 2025 GR-55 Web Editor Contributors (MIT License)
 * 
 * Changes from original:
 * - Converted from React Native types to Angular patterns
 * - Added strict TypeScript types
 * - Organized for Angular service consumption
 */

/**
 * Complete GR-55 Patch
 * 
 * Represents all editable parameters in a single patch.
 * This is the edit buffer (temporary patch) structure.
 */
export interface GR55Patch {
  /** Patch metadata */
  metadata: PatchMetadata;
  
  /** Common patch parameters */
  common: PatchCommon;
  
  /** PCM Tone 1 */
  pcmTone1: PCMTone;
  
  /** PCM Tone 2 */
  pcmTone2: PCMTone;
  
  /** Guitar/Bass modeling */
  modeling: Modeling;
  
  /** Multi-effects */
  mfx: MultiEffects;
  
  /** Delay effect */
  delay: DelayEffect;
  
  /** Chorus effect */
  chorus: ChorusEffect;
  
  /** Reverb effect */
  reverb: ReverbEffect;
  
  /** Assign controllers (1-8) */
  assigns: AssignBlock[];
}

/**
 * Patch metadata (not stored in GR-55, managed by librarian)
 */
export interface PatchMetadata {
  /** Patch number (0-2047) */
  number?: number;
  
  /** Patch name (16 chars max) */
  name: string;
  
  /** Guitar or Bass mode */
  mode: 'guitar' | 'bass';
  
  /** Last modified timestamp */
  modified?: Date;
  
  /** User tags */
  tags?: string[];
  
  /** Favorite flag */
  favorite?: boolean;
  
  /** User notes */
  notes?: string;
}

/**
 * Common patch parameters
 */
export interface PatchCommon {
  /** Patch level (0-200) */
  level: number;
  
  /** Tempo (40-250 BPM) */
  tempo: number;
  
  /** Key (0-11: C-B) */
  key: number;
  
  /** Beat/time signature */
  beat: number;
  
  // TODO: Add more common parameters from gr55-remote:
  // - Solo level
  // - Octave shift
  // - String level balance
  // - etc.
}

/**
 * PCM Tone parameters
 * 
 * The GR-55 has two PCM tone generators that can layer
 * with the modeling tone.
 */
export interface PCMTone {
  /** Tone switch (on/off) */
  switch: boolean;
  
  /** Wave/patch selection */
  wave?: number;
  
  /** Level (0-127) */
  level?: number;
  
  /** Pan (L64-0-63R) */
  pan?: number;
  
  /** Coarse tune (semitones) */
  coarseTune?: number;
  
  /** Fine tune (cents) */
  fineTune?: number;
  
  // TODO: Add full PCM tone parameters from gr55-remote:
  // - Filter section
  // - Amp envelope
  // - LFO
  // - Effects routing
  // - etc.
}

/**
 * Modeling parameters
 * 
 * Guitar or bass modeling section.
 * Parameters differ based on guitar/bass mode.
 */
export interface Modeling {
  /** Modeling switch (on/off) */
  switch: boolean;
  
  /** Model type selection */
  type?: number;
  
  /** Level */
  level?: number;
  
  // TODO: Add full modeling parameters from gr55-remote:
  // Guitar mode: Guitar type, body, pickup position, etc.
  // Bass mode: Bass type, pickup position, etc.
}

/**
 * Multi-Effects (MFX)
 * 
 * The GR-55 has one MFX block with 80+ effect types.
 * Each type has up to 32 parameters with different meanings.
 */
export interface MultiEffects {
  /** MFX switch (on/off) */
  switch: boolean;
  
  /** Effect type (0-79+) */
  type: number;
  
  /** 32 effect parameters */
  parameters: number[];
  
  // Note: Parameter meanings vary by effect type
  // See MFX parameter definitions in separate file
}

/**
 * Delay effect parameters
 */
export interface DelayEffect {
  /** Delay switch (on/off) */
  switch: boolean;
  
  /** Delay type */
  type?: number;
  
  /** Delay time */
  time?: number;
  
  /** Feedback */
  feedback?: number;
  
  /** Effect level */
  level?: number;
  
  // TODO: Add full delay parameters from gr55-remote
}

/**
 * Chorus effect parameters
 */
export interface ChorusEffect {
  /** Chorus switch (on/off) */
  switch: boolean;
  
  /** Chorus type */
  type?: number;
  
  /** Rate */
  rate?: number;
  
  /** Depth */
  depth?: number;
  
  /** Effect level */
  level?: number;
  
  // TODO: Add full chorus parameters from gr55-remote
}

/**
 * Reverb effect parameters
 */
export interface ReverbEffect {
  /** Reverb switch (on/off) */
  switch: boolean;
  
  /** Reverb type */
  type?: number;
  
  /** Time */
  time?: number;
  
  /** Effect level */
  level?: number;
  
  // TODO: Add full reverb parameters from gr55-remote
}

/**
 * Assign block
 * 
 * The GR-55 has 8 assign blocks for MIDI control
 */
export interface AssignBlock {
  /** Assign switch (on/off) */
  switch: boolean;
  
  /** Source (CTL pedal, expression, etc.) */
  source?: number;
  
  /** Target parameter */
  target?: number;
  
  /** Source mode */
  mode?: number;
  
  /** Range min */
  rangeMin?: number;
  
  /** Range max */
  rangeMax?: number;
  
  // TODO: Add full assign parameters from gr55-remote
}

/**
 * Partial patch update
 * 
 * For updating individual parameters without loading entire patch
 */
export type PatchUpdate = Partial<GR55Patch>;

/**
 * Factory function to create default/init patch
 */
export function createDefaultPatch(): GR55Patch {
  return {
    metadata: {
      name: 'INIT PATCH',
      mode: 'guitar',
      modified: new Date()
    },
    common: {
      level: 100,
      tempo: 120,
      key: 0, // C
      beat: 2  // 4/4
    },
    pcmTone1: {
      switch: false,
      level: 100,
      pan: 0
    },
    pcmTone2: {
      switch: false,
      level: 100,
      pan: 0
    },
    modeling: {
      switch: true,
      level: 100
    },
    mfx: {
      switch: false,
      type: 0,
      parameters: new Array(32).fill(0)
    },
    delay: {
      switch: false,
      level: 50
    },
    chorus: {
      switch: false,
      level: 50
    },
    reverb: {
      switch: false,
      level: 50
    },
    assigns: Array.from({ length: 8 }, () => ({
      switch: false
    }))
  };
}

/**
 * Type guard to check if object is a valid GR55Patch
 */
export function isGR55Patch(obj: any): obj is GR55Patch {
  return (
    obj &&
    typeof obj === 'object' &&
    'metadata' in obj &&
    'common' in obj &&
    typeof obj.metadata === 'object' &&
    typeof obj.common === 'object'
  );
}
