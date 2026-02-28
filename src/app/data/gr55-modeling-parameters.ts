/**
 * GR-55 Modeling Tone Deep Parameters
 *
 * Addresses derived from the motiz88/gr55-remote RolandGR55AddressMap.ts (MIT licence).
 * Base address: 0x18001000 (modelingTone struct in patch memory)
 *
 * Structure:
 *   0x0000–0x000A  Common: category, tone, level, mute
 *   0x000B–0x002D  Common deep: string levels, pitch, 12-STR, NS
 *   0x002E–0x0072  Guitar-mode model params
 *   0x0110–0x0145  Bass-mode model params
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ModelingParamDef {
  address: number;
  label: string;
  type: 'number' | 'enum' | 'boolean';
  range?: [number, number];
  enumValues?: readonly string[];
  defaultValue: number;
  unit?: string;
  encodedOffset?: number; // for signed values: displayed = raw - encodedOffset
  group?: string;         // optional section header hint
}

export interface ModelingModelDef {
  name: string;
  params: ModelingParamDef[];
}

// ─────────────────────────────────────────────────────────────
// Base address
// ─────────────────────────────────────────────────────────────

const BASE = 0x18001000;
const addr = (offset: number) => BASE + offset;

// ─────────────────────────────────────────────────────────────
// COMMON deep parameters (shared by all models, all modes)
// ─────────────────────────────────────────────────────────────

export const COMMON_PARAMS: ModelingParamDef[] = [
  // String levels
  { address: addr(0x000B), label: 'String 1 Level', type: 'number', range: [0, 100], defaultValue: 100, group: 'String Levels' },
  { address: addr(0x000C), label: 'String 2 Level', type: 'number', range: [0, 100], defaultValue: 100, group: 'String Levels' },
  { address: addr(0x000D), label: 'String 3 Level', type: 'number', range: [0, 100], defaultValue: 100, group: 'String Levels' },
  { address: addr(0x000E), label: 'String 4 Level', type: 'number', range: [0, 100], defaultValue: 100, group: 'String Levels' },
  { address: addr(0x000F), label: 'String 5 Level', type: 'number', range: [0, 100], defaultValue: 100, group: 'String Levels' },
  { address: addr(0x0010), label: 'String 6 Level', type: 'number', range: [0, 100], defaultValue: 100, group: 'String Levels' },
  // Pitch
  { address: addr(0x0011), label: 'Pitch Shift', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: 'Pitch' },
  { address: addr(0x0012), label: 'Pitch Fine',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: 'Pitch' },
  // Noise Suppressor
  { address: addr(0x002B), label: 'NS Switch',    type: 'boolean', defaultValue: 0, group: 'Noise Suppressor' },
  { address: addr(0x002C), label: 'NS Threshold', type: 'number', range: [0, 100], defaultValue: 0, group: 'Noise Suppressor' },
  { address: addr(0x002D), label: 'NS Release',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Noise Suppressor' },
];

export const TWELVE_STR_PARAMS: ModelingParamDef[] = [
  { address: addr(0x001D), label: '12-STR Switch',       type: 'boolean', defaultValue: 0, group: '12-String' },
  { address: addr(0x001E), label: '12-STR Direct Level', type: 'number', range: [0, 100], defaultValue: 100, group: '12-String' },
  { address: addr(0x001F), label: 'Shift Str 1', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: '12-String' },
  { address: addr(0x0020), label: 'Fine Str 1',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: '12-String' },
  { address: addr(0x0021), label: 'Shift Str 2', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: '12-String' },
  { address: addr(0x0022), label: 'Fine Str 2',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: '12-String' },
  { address: addr(0x0023), label: 'Shift Str 3', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: '12-String' },
  { address: addr(0x0024), label: 'Fine Str 3',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: '12-String' },
  { address: addr(0x0025), label: 'Shift Str 4', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: '12-String' },
  { address: addr(0x0026), label: 'Fine Str 4',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: '12-String' },
  { address: addr(0x0027), label: 'Shift Str 5', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: '12-String' },
  { address: addr(0x0028), label: 'Fine Str 5',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: '12-String' },
  { address: addr(0x0029), label: 'Shift Str 6', type: 'number', range: [0, 48], defaultValue: 24, encodedOffset: 24, unit: 'st', group: '12-String' },
  { address: addr(0x002A), label: 'Fine Str 6',  type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: '12-String' },
];

// ─────────────────────────────────────────────────────────────
// GUITAR MODE — E.GTR model params (0x002E–0x0032)
// ─────────────────────────────────────────────────────────────

const EGTR_PICKUP5: ModelingParamDef = {
  address: addr(0x002F), label: 'Pickup',
  type: 'enum', enumValues: ['REAR', 'R+C', 'R+F', 'C+F', 'FRONT'] as const,
  defaultValue: 0, group: 'Pickup',
};
const EGTR_PICKUP3: ModelingParamDef = {
  address: addr(0x002E), label: 'Pickup',
  type: 'enum', enumValues: ['REAR', 'R+F', 'FRONT'] as const,
  defaultValue: 0, group: 'Pickup',
};
const EGTR_PICKUP_LIPS: ModelingParamDef = {
  address: addr(0x0030), label: 'Pickup',
  type: 'enum', enumValues: ['REAR', 'R+C', 'CENTER', 'C+F', 'FRONT', 'ALL'] as const,
  defaultValue: 0, group: 'Pickup',
};
const EGTR_VOLUME: ModelingParamDef = {
  address: addr(0x0031), label: 'Volume', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup',
};
const EGTR_TONE: ModelingParamDef = {
  address: addr(0x0032), label: 'Tone', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup',
};

// ─────────────────────────────────────────────────────────────
// GUITAR MODE — AC model params (0x0033–0x0046)
// ─────────────────────────────────────────────────────────────

const STEEL_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0033), label: 'Body Type', type: 'enum', enumValues: ['MA28', 'TRP-0', 'GB45', 'GB SML', 'GLD40'] as const, defaultValue: 0, group: 'Body' },
  { address: addr(0x0034), label: 'Body',      type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0035), label: 'Tone',      type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, group: 'Body' },
];
const NYLON_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0036), label: 'Body',   type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0037), label: 'Attack', type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0038), label: 'Tone',   type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, group: 'Body' },
];
const SITAR_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0039), label: 'Pickup',       type: 'enum', enumValues: ['FRONT', 'R+F', 'REAR', 'PIEZO'] as const, defaultValue: 0, group: 'Pickup' },
  { address: addr(0x003A), label: 'Sens',          type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x003B), label: 'Body',          type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x003C), label: 'Color',         type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x003D), label: 'Decay',         type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x003E), label: 'Buzz',          type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x003F), label: 'Attack Level',  type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0040), label: 'Tone',          type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, group: 'Body' },
];
const BANJO_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0041), label: 'Attack',    type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0042), label: 'Resonance', type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0043), label: 'Tone',      type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, group: 'Body' },
];
const RESO_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0044), label: 'Sustain',   type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0045), label: 'Resonance', type: 'number', range: [0, 100], defaultValue: 50, group: 'Body' },
  { address: addr(0x0046), label: 'Tone',      type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, group: 'Body' },
];

// ─────────────────────────────────────────────────────────────
// GUITAR MODE — E.BASS params (0x0047–0x004A)
// ─────────────────────────────────────────────────────────────

const EBASS_GTR_DUAL: ModelingParamDef[] = [
  { address: addr(0x0047), label: 'Rear Vol',  type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0048), label: 'Front Vol', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0049), label: 'Volume',    type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x004A), label: 'Tone',      type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
];
const EBASS_GTR_SINGLE: ModelingParamDef[] = [
  { address: addr(0x0049), label: 'Volume', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x004A), label: 'Tone',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
];

// ─────────────────────────────────────────────────────────────
// GUITAR MODE — SYNTH model params
// ─────────────────────────────────────────────────────────────

const GR300_PARAMS: ModelingParamDef[] = [
  { address: addr(0x004B), label: 'Mode',         type: 'enum', enumValues: ['VCO', 'V+D', 'DIST'] as const, defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x004C), label: 'Comp',         type: 'boolean', defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x004D), label: 'Cutoff',       type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x004E), label: 'Resonance',    type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x004F), label: 'Env Mod',      type: 'enum', enumValues: ['OFF', 'ON', 'INV'] as const, defaultValue: 0, group: 'Filter' },
  { address: addr(0x0050), label: 'Env Mod Sens', type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0051), label: 'Env Attack',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x0052), label: 'Pitch SW',     type: 'enum', enumValues: ['OFF', 'A', 'B'] as const, defaultValue: 0, group: 'Pitch Shift' },
  { address: addr(0x0053), label: 'Pitch A',      type: 'number', range: [0, 24], defaultValue: 12, encodedOffset: 12, unit: 'st', group: 'Pitch Shift' },
  { address: addr(0x0054), label: 'Pitch A Fine', type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: 'Pitch Shift' },
  { address: addr(0x0055), label: 'Pitch B',      type: 'number', range: [0, 24], defaultValue: 12, encodedOffset: 12, unit: 'st', group: 'Pitch Shift' },
  { address: addr(0x0056), label: 'Pitch B Fine', type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: 'Pitch Shift' },
  { address: addr(0x0057), label: 'Duet',         type: 'boolean', defaultValue: 0, group: 'Pitch Shift' },
  { address: addr(0x0058), label: 'Sweep SW',     type: 'boolean', defaultValue: 0, group: 'Sweep' },
  { address: addr(0x0059), label: 'Sweep Rise',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Sweep' },
  { address: addr(0x005A), label: 'Sweep Fall',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Sweep' },
  { address: addr(0x005B), label: 'Vibrato SW',   type: 'boolean', defaultValue: 0, group: 'Vibrato' },
  { address: addr(0x005C), label: 'Vibrato Rate', type: 'number', range: [0, 100], defaultValue: 50, group: 'Vibrato' },
  { address: addr(0x005D), label: 'Vibrato Depth',type: 'number', range: [0, 100], defaultValue: 0, group: 'Vibrato' },
];
const WAVE_SYNTH_PARAMS: ModelingParamDef[] = [
  { address: addr(0x005E), label: 'Type',  type: 'enum', enumValues: ['SAW', 'SQUARE'] as const, defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x005F), label: 'Color', type: 'number', range: [0, 100], defaultValue: 50, group: 'Oscillator' },
];
const FILTER_BASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0060), label: 'Cutoff',       type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0061), label: 'Resonance',    type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x0062), label: 'Filter Decay', type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0063), label: 'Touch Sens',   type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0064), label: 'Color',        type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
];
const CRYSTAL_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0065), label: 'Attack Length', type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x0066), label: 'Mod Tune',      type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x0067), label: 'Mod Depth',     type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x0068), label: 'Attack Level',  type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x0069), label: 'Body Level',    type: 'number', range: [0, 100], defaultValue: 100, group: 'Attack' },
  { address: addr(0x006A), label: 'Sustain',       type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
];
const ORGAN_PARAMS: ModelingParamDef[] = [
  { address: addr(0x006B), label: 'Feet 16',  type: 'number', range: [0, 100], defaultValue: 100, group: 'Oscillator' },
  { address: addr(0x006C), label: 'Feet 8',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Oscillator' },
  { address: addr(0x006D), label: 'Feet 4',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x006E), label: 'Sustain',  type: 'number', range: [0, 100], defaultValue: 50, group: 'Oscillator' },
];
const BRASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x006F), label: 'Cutoff',    type: 'number', range: [0, 100], defaultValue: 80, group: 'Filter' },
  { address: addr(0x0070), label: 'Resonance', type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x0071), label: 'Touch Sens',type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0072), label: 'Sustain',   type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
];

// ─────────────────────────────────────────────────────────────
// BASS MODE — E.GTR params (0x0110–0x0113)
// ─────────────────────────────────────────────────────────────

const EGTR_BASS5: ModelingParamDef[] = [
  { address: addr(0x0111), label: 'Pickup', type: 'enum', enumValues: ['REAR', 'R+C', 'CENTER', 'C+F', 'FRONT'] as const, defaultValue: 0, group: 'Pickup' },
  { address: addr(0x0112), label: 'Volume', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0113), label: 'Tone',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
];
const EGTR_BASS3: ModelingParamDef[] = [
  { address: addr(0x0110), label: 'Pickup', type: 'enum', enumValues: ['REAR', 'R+F', 'FRONT'] as const, defaultValue: 0, group: 'Pickup' },
  { address: addr(0x0112), label: 'Volume', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0113), label: 'Tone',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
];

// ─────────────────────────────────────────────────────────────
// BASS MODE — E.BASS params (0x0114–0x0121)
// ─────────────────────────────────────────────────────────────

const EBASS_JB: ModelingParamDef[] = [
  { address: addr(0x0114), label: 'Rear Vol',  type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0115), label: 'Front Vol', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0116), label: 'Volume',    type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0117), label: 'Tone',      type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
];
const EBASS_PB: ModelingParamDef[] = [
  { address: addr(0x0116), label: 'Volume', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0117), label: 'Tone',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
];
const EBASS_MMAN: ModelingParamDef[] = [
  { address: addr(0x0118), label: 'Treble', type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, group: 'EQ' },
  { address: addr(0x0119), label: 'Bass',   type: 'number', range: [0, 100], defaultValue: 50, group: 'EQ' },
  { address: addr(0x0116), label: 'Volume', type: 'number', range: [0, 100], defaultValue: 100, group: 'EQ' },
];
const EBASS_RICK: ModelingParamDef[] = [
  { address: addr(0x0114), label: 'Rear Vol',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0115), label: 'Front Vol',  type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x011C), label: 'Rear Tone',  type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x011D), label: 'Front Tone', type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0116), label: 'Volume',     type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x011E), label: 'Pickup Sel', type: 'enum', enumValues: ['REAR', 'R+F', 'FRONT'] as const, defaultValue: 0, group: 'Pickup' },
];
const EBASS_ACTIVE: ModelingParamDef[] = [
  { address: addr(0x0114), label: 'Rear Vol',    type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0115), label: 'Front Vol',   type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x011A), label: 'Treble',      type: 'number', range: [0, 100], defaultValue: 100, group: 'EQ' },
  { address: addr(0x011B), label: 'Bass',        type: 'number', range: [0, 100], defaultValue: 100, group: 'EQ' },
  { address: addr(0x0116), label: 'Volume',      type: 'number', range: [0, 100], defaultValue: 100, group: 'EQ' },
];
const EBASS_VIOLIN: ModelingParamDef[] = [
  { address: addr(0x0114), label: 'Rear Vol',     type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0115), label: 'Front Vol',    type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x0116), label: 'Volume',       type: 'number', range: [0, 100], defaultValue: 100, group: 'Pickup' },
  { address: addr(0x011F), label: 'Treble On',    type: 'boolean', defaultValue: 1, group: 'Pickup' },
  { address: addr(0x0120), label: 'Bass On',      type: 'boolean', defaultValue: 1, group: 'Pickup' },
  { address: addr(0x0121), label: 'Rhythm/Solo',  type: 'enum', enumValues: ['RHYTHM', 'SOLO'] as const, defaultValue: 0, group: 'Pickup' },
];

// ─────────────────────────────────────────────────────────────
// BASS MODE — SYNTH model params (same logical structure, different addresses)
// ─────────────────────────────────────────────────────────────

const GR300_BASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0122), label: 'Mode',         type: 'enum', enumValues: ['VCO', 'V+D', 'DIST'] as const, defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x0123), label: 'Comp',         type: 'boolean', defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x0124), label: 'Cutoff',       type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0125), label: 'Resonance',    type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x0126), label: 'Env Mod',      type: 'enum', enumValues: ['OFF', 'ON', 'INV'] as const, defaultValue: 0, group: 'Filter' },
  { address: addr(0x0127), label: 'Env Mod Sens', type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0128), label: 'Env Attack',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x0129), label: 'Pitch SW',     type: 'enum', enumValues: ['OFF', 'A', 'B'] as const, defaultValue: 0, group: 'Pitch Shift' },
  { address: addr(0x012A), label: 'Pitch A',      type: 'number', range: [0, 24], defaultValue: 12, encodedOffset: 12, unit: 'st', group: 'Pitch Shift' },
  { address: addr(0x012B), label: 'Pitch A Fine', type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: 'Pitch Shift' },
  { address: addr(0x012C), label: 'Pitch B',      type: 'number', range: [0, 24], defaultValue: 12, encodedOffset: 12, unit: 'st', group: 'Pitch Shift' },
  { address: addr(0x012D), label: 'Pitch B Fine', type: 'number', range: [0, 100], defaultValue: 50, encodedOffset: 50, unit: 'c', group: 'Pitch Shift' },
  { address: addr(0x012E), label: 'Duet',         type: 'boolean', defaultValue: 0, group: 'Pitch Shift' },
  { address: addr(0x012F), label: 'Sweep SW',     type: 'boolean', defaultValue: 0, group: 'Sweep' },
  { address: addr(0x0130), label: 'Sweep Rise',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Sweep' },
  { address: addr(0x0131), label: 'Sweep Fall',   type: 'number', range: [0, 100], defaultValue: 0, group: 'Sweep' },
  { address: addr(0x0132), label: 'Vibrato SW',   type: 'boolean', defaultValue: 0, group: 'Vibrato' },
  { address: addr(0x0133), label: 'Vibrato Rate', type: 'number', range: [0, 100], defaultValue: 50, group: 'Vibrato' },
  { address: addr(0x0134), label: 'Vibrato Depth',type: 'number', range: [0, 100], defaultValue: 0, group: 'Vibrato' },
];
const WAVE_SYNTH_BASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0135), label: 'Type',  type: 'enum', enumValues: ['SAW', 'SQUARE'] as const, defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x0136), label: 'Color', type: 'number', range: [0, 100], defaultValue: 50, group: 'Oscillator' },
];
const FILTER_BASS_BASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0137), label: 'Cutoff',       type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x0138), label: 'Resonance',    type: 'number', range: [0, 100], defaultValue: 0, group: 'Filter' },
  { address: addr(0x0139), label: 'Filter Decay', type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x013A), label: 'Touch Sens',   type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
  { address: addr(0x013B), label: 'Color',        type: 'number', range: [0, 100], defaultValue: 50, group: 'Filter' },
];
const CRYSTAL_BASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x013C), label: 'Attack Length', type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x013D), label: 'Mod Tune',      type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x013E), label: 'Mod Depth',     type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x013F), label: 'Attack Level',  type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
  { address: addr(0x0140), label: 'Body Level',    type: 'number', range: [0, 100], defaultValue: 100, group: 'Attack' },
  { address: addr(0x0141), label: 'Sustain',       type: 'number', range: [0, 100], defaultValue: 50, group: 'Attack' },
];
const ORGAN_BASS_PARAMS: ModelingParamDef[] = [
  { address: addr(0x0142), label: 'Feet 16', type: 'number', range: [0, 100], defaultValue: 100, group: 'Oscillator' },
  { address: addr(0x0143), label: 'Feet 8',  type: 'number', range: [0, 100], defaultValue: 100, group: 'Oscillator' },
  { address: addr(0x0144), label: 'Feet 4',  type: 'number', range: [0, 100], defaultValue: 0, group: 'Oscillator' },
  { address: addr(0x0145), label: 'Sustain', type: 'number', range: [0, 100], defaultValue: 50, group: 'Oscillator' },
];

// ─────────────────────────────────────────────────────────────
// MODEL DEFINITIONS
// ─────────────────────────────────────────────────────────────

// Guitar mode: E.GTR (category 0), tones 0–9
const GUITAR_EGTR_MODELS: ModelingModelDef[] = [
  { name: 'CLA-ST',  params: [EGTR_PICKUP5, EGTR_VOLUME, EGTR_TONE] },
  { name: 'MOD-ST',  params: [EGTR_PICKUP5, EGTR_VOLUME, EGTR_TONE] },
  { name: 'H&H-ST',  params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
  { name: 'TE',      params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
  { name: 'LP',      params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
  { name: 'P-90',    params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
  { name: 'LIPS',    params: [EGTR_PICKUP_LIPS, EGTR_VOLUME, EGTR_TONE] },
  { name: 'RICK',    params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
  { name: '335',     params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
  { name: 'L4',      params: [EGTR_PICKUP3, EGTR_VOLUME, EGTR_TONE] },
];

// Guitar mode: AC (category 1), tones 0–4
const GUITAR_AC_MODELS: ModelingModelDef[] = [
  { name: 'STEEL', params: STEEL_PARAMS },
  { name: 'NYLON', params: NYLON_PARAMS },
  { name: 'SITAR', params: SITAR_PARAMS },
  { name: 'BANJO', params: BANJO_PARAMS },
  { name: 'RESO',  params: RESO_PARAMS  },
];

// Guitar mode: E.BASS (category 2), tones 0–1
const GUITAR_EBASS_MODELS: ModelingModelDef[] = [
  { name: 'JB', params: EBASS_GTR_DUAL },
  { name: 'PB', params: EBASS_GTR_SINGLE },
];

// Guitar mode: SYNTH (category 3), tones 0–5
const GUITAR_SYNTH_MODELS: ModelingModelDef[] = [
  { name: 'ANALOG GR',   params: GR300_PARAMS },
  { name: 'WAVE SYNTH',  params: WAVE_SYNTH_PARAMS },
  { name: 'FILTER BASS', params: FILTER_BASS_PARAMS },
  { name: 'CRYSTAL',     params: CRYSTAL_PARAMS },
  { name: 'ORGAN',       params: ORGAN_PARAMS },
  { name: 'BRASS',       params: BRASS_PARAMS },
];

// Bass mode: E.BASS (category 0), tones 0–8
const BASS_EBASS_MODELS: ModelingModelDef[] = [
  { name: 'VINT JB',  params: EBASS_JB },
  { name: 'JB',       params: EBASS_JB },
  { name: 'VINT PB',  params: EBASS_PB },
  { name: 'PB',       params: EBASS_PB },
  { name: 'M-MAN',    params: EBASS_MMAN },
  { name: 'RICK',     params: EBASS_RICK },
  { name: 'T-BIRD',   params: EBASS_JB },
  { name: 'ACTIVE',   params: EBASS_ACTIVE },
  { name: 'VIOLIN',   params: EBASS_VIOLIN },
];

// Bass mode: SYNTH (category 1), tones 0–5
const BASS_SYNTH_MODELS: ModelingModelDef[] = [
  { name: 'ANALOG GR',   params: GR300_BASS_PARAMS },
  { name: 'WAVE SYNTH',  params: WAVE_SYNTH_BASS_PARAMS },
  { name: 'FILTER BASS', params: FILTER_BASS_BASS_PARAMS },
  { name: 'CRYSTAL',     params: CRYSTAL_BASS_PARAMS },
  { name: 'ORGAN',       params: ORGAN_BASS_PARAMS },
  { name: 'BRASS',       params: [] }, // Brass not available in bass mode
];

// Bass mode: E.GTR (category 2), tones 0–1
const BASS_EGTR_MODELS: ModelingModelDef[] = [
  { name: 'ST', params: EGTR_BASS5 },
  { name: 'LP', params: EGTR_BASS3 },
];

// ─────────────────────────────────────────────────────────────
// Lookup tables
// ─────────────────────────────────────────────────────────────

// Guitar categories: 0=E.GTR 1=AC 2=E.BASS 3=SYNTH
const GUITAR_CATEGORIES: ModelingModelDef[][] = [
  GUITAR_EGTR_MODELS,
  GUITAR_AC_MODELS,
  GUITAR_EBASS_MODELS,
  GUITAR_SYNTH_MODELS,
];

// Bass categories: 0=E.BASS 1=SYNTH 2=E.GTR
const BASS_CATEGORIES: ModelingModelDef[][] = [
  BASS_EBASS_MODELS,
  BASS_SYNTH_MODELS,
  BASS_EGTR_MODELS,
];

/**
 * Returns the model-specific params for the given mode/category/tone.
 * Returns empty array if the combination is out of range.
 */
export function getModelDef(
  isGuitar: boolean,
  categoryIndex: number,
  toneIndex: number
): ModelingModelDef | null {
  const cats = isGuitar ? GUITAR_CATEGORIES : BASS_CATEGORIES;
  const models = cats[categoryIndex];
  if (!models) return null;
  return models[toneIndex] ?? null;
}

/**
 * Determines whether 12-STR parameters are applicable.
 * 12-STR is NOT available for E.BASS category (in any mode) or bass-mode E.GTR.
 */
export function has12String(isGuitar: boolean, categoryIndex: number): boolean {
  if (!isGuitar) return false;          // Not available in bass mode at all
  return categoryIndex !== 2;           // Not available for E.BASS
}
