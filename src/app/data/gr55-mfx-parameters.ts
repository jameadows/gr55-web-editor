/**
 * GR-55 MFX Parameter Definitions
 *
 * Each of the 20 MFX types has its own set of up to 32 parameters.
 * The 32 parameter slots live at addresses 0x18000306–0x18000325 (sequential, 1 byte each).
 * The meaning of each slot varies by the selected MFX type.
 *
 * Sources:
 *   - Roland GR-55 Owner's Manual (parameter guide sections)
 *   - Roland GR-55 MIDI Implementation
 *   - gr55-remote RolandGR55AddressMap.ts
 */

export interface MfxParamDef {
  slot: number;          // 0-based index into the 32 param slots
  label: string;
  type: 'number' | 'enum' | 'boolean';
  range?: [number, number];
  enumValues?: string[];
  defaultValue: number;
  unit?: string;
  description?: string;
  /** If true, slot+1 is a "sync note" variant and this slot is the raw rate (0–100) */
  hasSyncVariant?: boolean;
}

export interface MfxTypeDef {
  typeIndex: number;     // 0-based index matching mfxType address value
  name: string;
  params: MfxParamDef[];
}

// ──────────────────────────────────────────────────────────────────────
// Shared note-value enum used by rate-sync parameters
// ──────────────────────────────────────────────────────────────────────
const NOTE_VALUES = [
  '1/16', '1/8T', '1/16.', '1/8', '1/4T', '1/8.', '1/4', '1/2T',
  '1/4.', '1/2', '1/1T', '1/2.', '1/1', '2/1T', '1/1.', '2/1'
];

const WAVE_SHAPES_4 = ['TRI', 'SQU', 'SINE', 'SAW'];
const WAVE_SHAPES_5 = ['TRI', 'SQU', 'SINE', 'SAW', 'RND'];

// ──────────────────────────────────────────────────────────────────────
// 20 MFX Type Definitions
// ──────────────────────────────────────────────────────────────────────

export const GR55_MFX_TYPES: MfxTypeDef[] = [

  // ── 0: EQ ────────────────────────────────────────────────────────────
  {
    typeIndex: 0,
    name: 'EQ',
    params: [
      { slot: 0,  label: 'Low Freq',    type: 'enum',   enumValues: ['200Hz', '400Hz'],                                        defaultValue: 0, description: 'Low band frequency' },
      { slot: 1,  label: 'Low Gain',    type: 'number', range: [0, 30], defaultValue: 15, unit: 'dB', description: 'Low band gain (−15 to +15 dB, center=15)' },
      { slot: 2,  label: 'Mid1 Freq',   type: 'number', range: [0, 127], defaultValue: 64, description: '200–8000 Hz' },
      { slot: 3,  label: 'Mid1 Gain',   type: 'number', range: [0, 30], defaultValue: 15, unit: 'dB', description: '−15 to +15 dB, center=15' },
      { slot: 4,  label: 'Mid1 Q',      type: 'number', range: [0, 127], defaultValue: 64, description: '0.5–16 bandwidth' },
      { slot: 5,  label: 'Mid2 Freq',   type: 'number', range: [0, 127], defaultValue: 64, description: '200–8000 Hz' },
      { slot: 6,  label: 'Mid2 Gain',   type: 'number', range: [0, 30], defaultValue: 15, unit: 'dB' },
      { slot: 7,  label: 'Mid2 Q',      type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 8,  label: 'High Freq',   type: 'enum',   enumValues: ['2kHz', '4kHz', '8kHz'],                                 defaultValue: 1 },
      { slot: 9,  label: 'High Gain',   type: 'number', range: [0, 30], defaultValue: 15, unit: 'dB' },
      { slot: 10, label: 'Level',       type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 1: SUPER FILTER ──────────────────────────────────────────────────
  {
    typeIndex: 1,
    name: 'SUPER FILTER',
    params: [
      { slot: 0,  label: 'Filter Type',     type: 'enum',   enumValues: ['LPF', 'BPF', 'HPF', 'NOTCH'],  defaultValue: 0 },
      { slot: 1,  label: 'Filter Slope',    type: 'enum',   enumValues: ['-12dB', '-24dB', '-36dB'],      defaultValue: 1 },
      { slot: 2,  label: 'Cutoff',          type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 3,  label: 'Resonance',       type: 'number', range: [0, 127], defaultValue: 0 },
      { slot: 4,  label: 'Filter Gain',     type: 'number', range: [0, 12],  defaultValue: 0 },
      { slot: 5,  label: 'Mod Switch',      type: 'boolean', defaultValue: 0 },
      { slot: 6,  label: 'Mod Wave',        type: 'enum',   enumValues: ['TRI', 'SINE', 'SAW'],           defaultValue: 0 },
      { slot: 7,  label: 'Rate Sync',       type: 'boolean', defaultValue: 0 },
      { slot: 8,  label: 'Rate',            type: 'number', range: [0, 100], defaultValue: 50 },
      { slot: 9,  label: 'Rate Note',       type: 'enum',   enumValues: NOTE_VALUES,                       defaultValue: 6 },
      { slot: 10, label: 'Depth',           type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 11, label: 'Attack',          type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 12, label: 'Level',           type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 2: PHASER ─────────────────────────────────────────────────────────
  {
    typeIndex: 2,
    name: 'PHASER',
    params: [
      { slot: 0,  label: 'Mode',       type: 'enum',   enumValues: ['4-STAGE', '8-STAGE', '12-STAGE'],   defaultValue: 1 },
      { slot: 1,  label: 'Manual',     type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 2,  label: 'Rate Sync',  type: 'boolean', defaultValue: 0 },
      { slot: 3,  label: 'Rate',       type: 'number', range: [0, 100], defaultValue: 50 },
      { slot: 4,  label: 'Rate Note',  type: 'enum',   enumValues: NOTE_VALUES,                           defaultValue: 6 },
      { slot: 5,  label: 'Depth',      type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 6,  label: 'Resonance',  type: 'number', range: [0, 127], defaultValue: 0 },
      { slot: 7,  label: 'Mix',        type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 8,  label: 'Low Gain',   type: 'number', range: [0, 30], defaultValue: 15, unit: 'dB' },
      { slot: 9,  label: 'High Gain',  type: 'number', range: [0, 30], defaultValue: 15, unit: 'dB' },
      { slot: 10, label: 'Level',      type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 3: STEP PHASER ────────────────────────────────────────────────────
  {
    typeIndex: 3,
    name: 'STEP PHASER',
    params: [
      { slot: 0,  label: 'Mode',            type: 'enum',    enumValues: ['4-STAGE', '8-STAGE', '12-STAGE'], defaultValue: 1 },
      { slot: 1,  label: 'Manual',          type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 2,  label: 'Rate Sync',       type: 'boolean', defaultValue: 0 },
      { slot: 3,  label: 'Rate',            type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 4,  label: 'Rate Note',       type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 5,  label: 'Depth',           type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 6,  label: 'Resonance',       type: 'number',  range: [0, 127], defaultValue: 0 },
      { slot: 7,  label: 'Step Rate Sync',  type: 'boolean', defaultValue: 0 },
      { slot: 8,  label: 'Step Rate',       type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 9,  label: 'Step Note',       type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 10, label: 'Mix',             type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 11, label: 'Low Gain',        type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 12, label: 'High Gain',       type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 13, label: 'Level',           type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 4: RING MODULATOR ─────────────────────────────────────────────────
  {
    typeIndex: 4,
    name: 'RING MODULATOR',
    params: [
      { slot: 0,  label: 'Frequency',    type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 1,  label: 'Sensitivity',  type: 'number',  range: [0, 127], defaultValue: 0 },
      { slot: 2,  label: 'Polarity',     type: 'enum',    enumValues: ['-', '+'], defaultValue: 0 },
      { slot: 3,  label: 'Low Gain',     type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 4,  label: 'High Gain',    type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 5,  label: 'Balance',      type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 6,  label: 'Level',        type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 5: TREMOLO ────────────────────────────────────────────────────────
  {
    typeIndex: 5,
    name: 'TREMOLO',
    params: [
      { slot: 0,  label: 'Wave Shape',  type: 'enum',    enumValues: WAVE_SHAPES_4, defaultValue: 0 },
      { slot: 1,  label: 'Rate Sync',   type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Rate',        type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',   type: 'enum',    enumValues: NOTE_VALUES,   defaultValue: 6 },
      { slot: 4,  label: 'Depth',       type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Low Gain',    type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 6,  label: 'High Gain',   type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 7,  label: 'Level',       type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 6: AUTO PAN ───────────────────────────────────────────────────────
  {
    typeIndex: 6,
    name: 'AUTO PAN',
    params: [
      { slot: 0,  label: 'Wave Shape',  type: 'enum',    enumValues: WAVE_SHAPES_5, defaultValue: 0 },
      { slot: 1,  label: 'Rate Sync',   type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Rate',        type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',   type: 'enum',    enumValues: NOTE_VALUES,   defaultValue: 6 },
      { slot: 4,  label: 'Depth',       type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Low Gain',    type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 6,  label: 'High Gain',   type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 7,  label: 'Level',       type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 7: SLICER ─────────────────────────────────────────────────────────
  {
    typeIndex: 7,
    name: 'SLICER',
    params: [
      { slot: 0,  label: 'Pattern',     type: 'number',  range: [1, 20],  defaultValue: 1, description: 'Rhythm pattern 1–20' },
      { slot: 1,  label: 'Rate Sync',   type: 'boolean', defaultValue: 1 },
      { slot: 2,  label: 'Rate',        type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',   type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 4,  label: 'Trigger Sens', type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Attack',      type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 6,  label: 'Input Sync',  type: 'boolean', defaultValue: 0 },
      { slot: 7,  label: 'Mode',        type: 'enum',    enumValues: ['LEGATO', 'SLASH'], defaultValue: 0 },
      { slot: 8,  label: 'Shuffle',     type: 'number',  range: [0, 127], defaultValue: 0 },
      { slot: 9,  label: 'Level',       type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 8: VK ROTARY ──────────────────────────────────────────────────────
  {
    typeIndex: 8,
    name: 'VK ROTARY',
    params: [
      { slot: 0,  label: 'Speed Ctrl',        type: 'enum',   enumValues: ['SLOW', 'FAST'], defaultValue: 0 },
      { slot: 1,  label: 'Brake',             type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Woofer Slow Spd',   type: 'number', range: [0, 100], defaultValue: 20 },
      { slot: 3,  label: 'Woofer Fast Spd',   type: 'number', range: [0, 100], defaultValue: 80 },
      { slot: 4,  label: 'Woofer Accel',      type: 'number', range: [0, 15],  defaultValue: 8 },
      { slot: 5,  label: 'Woofer Level',      type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 6,  label: 'Tweeter Slow Spd',  type: 'number', range: [0, 100], defaultValue: 20 },
      { slot: 7,  label: 'Tweeter Fast Spd',  type: 'number', range: [0, 100], defaultValue: 80 },
      { slot: 8,  label: 'Tweeter Accel',     type: 'number', range: [0, 15],  defaultValue: 8 },
      { slot: 9,  label: 'Tweeter Level',     type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 10, label: 'Separation',        type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 11, label: 'Low Gain',          type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 12, label: 'High Gain',         type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 13, label: 'Level',             type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 9: HEXA-CHORUS ────────────────────────────────────────────────────
  {
    typeIndex: 9,
    name: 'HEXA-CHORUS',
    params: [
      { slot: 0,  label: 'Pre Delay',      type: 'number',  range: [0, 100], defaultValue: 0, unit: 'ms', description: '0.0–100.0 ms' },
      { slot: 1,  label: 'Rate Sync',      type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Rate',           type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',      type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 4,  label: 'Depth',          type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Pre Dly Dev',    type: 'number',  range: [0, 127], defaultValue: 0, description: 'Pre delay deviation' },
      { slot: 6,  label: 'Depth Dev',      type: 'number',  range: [0, 126], defaultValue: 63, description: '−63 to +63, center=63' },
      { slot: 7,  label: 'Pan Dev',        type: 'number',  range: [0, 126], defaultValue: 63, description: '−63 to +63, center=63' },
      { slot: 8,  label: 'Balance',        type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 9,  label: 'Low Gain',       type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 10, label: 'High Gain',      type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 11, label: 'Level',          type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 10: SPACE-D ───────────────────────────────────────────────────────
  {
    typeIndex: 10,
    name: 'SPACE-D',
    params: [
      { slot: 0,  label: 'Pre Delay',   type: 'number',  range: [0, 100], defaultValue: 0, unit: 'ms' },
      { slot: 1,  label: 'Rate Sync',   type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Rate',        type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',   type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 4,  label: 'Depth',       type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Phase',       type: 'number',  range: [0, 180], defaultValue: 90, unit: '°' },
      { slot: 6,  label: 'Low Gain',    type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 7,  label: 'High Gain',   type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 8,  label: 'Balance',     type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 9,  label: 'Level',       type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 11: FLANGER ───────────────────────────────────────────────────────
  {
    typeIndex: 11,
    name: 'FLANGER',
    params: [
      { slot: 0,  label: 'Manual',      type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 1,  label: 'Rate Sync',   type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Rate',        type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',   type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 4,  label: 'Depth',       type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Resonance',   type: 'number',  range: [0, 127], defaultValue: 0 },
      { slot: 6,  label: 'Mix',         type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 7,  label: 'Low Gain',    type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 8,  label: 'High Gain',   type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 9,  label: 'Level',       type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 12: STEP FLANGER ──────────────────────────────────────────────────
  {
    typeIndex: 12,
    name: 'STEP FLANGER',
    params: [
      { slot: 0,  label: 'Manual',          type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 1,  label: 'Rate Sync',       type: 'boolean', defaultValue: 0 },
      { slot: 2,  label: 'Rate',            type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 3,  label: 'Rate Note',       type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 4,  label: 'Depth',           type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Resonance',       type: 'number',  range: [0, 127], defaultValue: 0 },
      { slot: 6,  label: 'Step Rate Sync',  type: 'boolean', defaultValue: 0 },
      { slot: 7,  label: 'Step Rate',       type: 'number',  range: [0, 100], defaultValue: 50 },
      { slot: 8,  label: 'Step Note',       type: 'enum',    enumValues: NOTE_VALUES, defaultValue: 6 },
      { slot: 9,  label: 'Mix',             type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 10, label: 'Low Gain',        type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 11, label: 'High Gain',       type: 'number',  range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 12, label: 'Level',           type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 13: GUITAR AMP SIM ────────────────────────────────────────────────
  {
    typeIndex: 13,
    name: 'GUITAR AMP SIM',
    params: [
      { slot: 0,  label: 'Pre Amp Type',    type: 'enum',    enumValues: ['JC-120', 'CLEAN TWIN', 'MATCH DRIVE', 'BG LEAD', 'MS1959 I', 'MS1959 II', 'R-FIER VIN', 'R-FIER MOD'], defaultValue: 0 },
      { slot: 1,  label: 'Gain',            type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 2,  label: 'Bass',            type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 3,  label: 'Middle',          type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 4,  label: 'Treble',          type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Presence',        type: 'number',  range: [0, 127], defaultValue: 64 },
      { slot: 6,  label: 'Bright',          type: 'boolean', defaultValue: 0 },
      { slot: 7,  label: 'Output Level',    type: 'number',  range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 14: COMPRESSOR ────────────────────────────────────────────────────
  {
    typeIndex: 14,
    name: 'COMPRESSOR',
    params: [
      { slot: 0,  label: 'Attack',      type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 1,  label: 'Release',     type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 2,  label: 'Threshold',   type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 3,  label: 'Ratio',       type: 'enum',   enumValues: ['1.5:1', '2:1', '4:1', '8:1', '16:1', '∞:1'], defaultValue: 2 },
      { slot: 4,  label: 'Output Gain', type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 5,  label: 'Knee',        type: 'enum',   enumValues: ['HARD', 'SOFT'], defaultValue: 0 },
      { slot: 6,  label: 'Low Gain',    type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 7,  label: 'High Gain',   type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 8,  label: 'Level',       type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 15: LIMITER ───────────────────────────────────────────────────────
  {
    typeIndex: 15,
    name: 'LIMITER',
    params: [
      { slot: 0,  label: 'Release',     type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 1,  label: 'Threshold',   type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 2,  label: 'Ratio',       type: 'enum',   enumValues: ['1.5:1', '2:1', '4:1', '8:1', '16:1', '∞:1'], defaultValue: 5 },
      { slot: 3,  label: 'Output Gain', type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 4,  label: 'Low Gain',    type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 5,  label: 'High Gain',   type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 6,  label: 'Level',       type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 16: 3TAP PAN DELAY ────────────────────────────────────────────────
  {
    typeIndex: 16,
    name: '3TAP PAN DELAY',
    params: [
      { slot: 0,  label: 'Delay L',     type: 'number', range: [0, 2000], defaultValue: 250, unit: 'ms' },
      { slot: 1,  label: 'Delay R',     type: 'number', range: [0, 2000], defaultValue: 500, unit: 'ms' },
      { slot: 2,  label: 'Delay C',     type: 'number', range: [0, 2000], defaultValue: 750, unit: 'ms' },
      { slot: 3,  label: 'Level L',     type: 'number', range: [0, 127], defaultValue: 100 },
      { slot: 4,  label: 'Level R',     type: 'number', range: [0, 127], defaultValue: 100 },
      { slot: 5,  label: 'Level C',     type: 'number', range: [0, 127], defaultValue: 100 },
      { slot: 6,  label: 'Feedback',    type: 'number', range: [0, 127], defaultValue: 0 },
      { slot: 7,  label: 'HF Damp',     type: 'number', range: [0, 127], defaultValue: 64, description: '200–8000 Hz' },
      { slot: 8,  label: 'Tap Sync',    type: 'boolean', defaultValue: 0 },
      { slot: 9,  label: 'Low Gain',    type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 10, label: 'High Gain',   type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 11, label: 'Balance',     type: 'number', range: [0, 100], defaultValue: 50 },
      { slot: 12, label: 'Level',       type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 17: TIME CTRL DELAY ───────────────────────────────────────────────
  {
    typeIndex: 17,
    name: 'TIME CTRL DELAY',
    params: [
      { slot: 0,  label: 'Delay Time',    type: 'number', range: [0, 2700], defaultValue: 300, unit: 'ms' },
      { slot: 1,  label: 'Acceleration',  type: 'number', range: [0, 127],  defaultValue: 64 },
      { slot: 2,  label: 'Feedback',      type: 'number', range: [0, 127],  defaultValue: 0 },
      { slot: 3,  label: 'HF Damp',       type: 'number', range: [0, 127],  defaultValue: 64, description: '200–8000 Hz' },
      { slot: 4,  label: 'Low Gain',      type: 'number', range: [0, 30],   defaultValue: 15, unit: 'dB' },
      { slot: 5,  label: 'High Gain',     type: 'number', range: [0, 30],   defaultValue: 15, unit: 'dB' },
      { slot: 6,  label: 'Balance',       type: 'number', range: [0, 100],  defaultValue: 50 },
      { slot: 7,  label: 'Level',         type: 'number', range: [0, 127],  defaultValue: 64 },
    ]
  },

  // ── 18: LOFI COMPRESS ─────────────────────────────────────────────────
  {
    typeIndex: 18,
    name: 'LOFI COMPRESS',
    params: [
      { slot: 0,  label: 'Pre Filter',        type: 'enum',   enumValues: ['OFF', 'LPF', 'HPF'], defaultValue: 0 },
      { slot: 1,  label: 'Lo-Fi Type',        type: 'enum',   enumValues: ['FOLD BACK', 'BIT CRUSH'], defaultValue: 0 },
      { slot: 2,  label: 'Post Filter',       type: 'enum',   enumValues: ['OFF', 'LPF', 'HPF'], defaultValue: 0 },
      { slot: 3,  label: 'Post Filter Cutoff', type: 'number', range: [0, 127], defaultValue: 64 },
      { slot: 4,  label: 'Low Gain',          type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 5,  label: 'High Gain',         type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 6,  label: 'Balance',           type: 'number', range: [0, 100], defaultValue: 50 },
      { slot: 7,  label: 'Level',             type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

  // ── 19: PITCH SHIFTER ─────────────────────────────────────────────────
  {
    typeIndex: 19,
    name: 'PITCH SHIFTER',
    params: [
      { slot: 0,  label: 'Voice',         type: 'enum',   enumValues: ['1', '2'], defaultValue: 0 },
      { slot: 1,  label: 'Pitch Shift 1', type: 'number', range: [0, 48],  defaultValue: 24, description: '−24 to +24 semitones, center=24' },
      { slot: 2,  label: 'Fine Tune 1',   type: 'number', range: [0, 200], defaultValue: 100, description: '−100 to +100 cents, center=100' },
      { slot: 3,  label: 'Pitch Shift 2', type: 'number', range: [0, 48],  defaultValue: 24 },
      { slot: 4,  label: 'Fine Tune 2',   type: 'number', range: [0, 200], defaultValue: 100 },
      { slot: 5,  label: 'Feedback',      type: 'number', range: [0, 127], defaultValue: 0 },
      { slot: 6,  label: 'Low Gain',      type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 7,  label: 'High Gain',     type: 'number', range: [0, 30],  defaultValue: 15, unit: 'dB' },
      { slot: 8,  label: 'Balance',       type: 'number', range: [0, 100], defaultValue: 50 },
      { slot: 9,  label: 'Level',         type: 'number', range: [0, 127], defaultValue: 64 },
    ]
  },

];

/** Quick lookup by typeIndex */
export const MFX_TYPE_BY_INDEX: Map<number, MfxTypeDef> =
  new Map(GR55_MFX_TYPES.map(t => [t.typeIndex, t]));

/**
 * Base address for MFX parameter slot 0.
 * Slots are sequential: slot N lives at MFX_PARAM_BASE + N.
 */
export const MFX_PARAM_BASE_ADDRESS = 0x18000306;

/** Convert slot index (0-based) to absolute SysEx address */
export function mfxParamAddress(slot: number): number {
  return MFX_PARAM_BASE_ADDRESS + slot;
}
