/**
 * GR-55 Parameter Metadata
 * 
 * Display metadata for UI components (labels, help text, groupings).
 * This is original work for the GR-55 Web Editor.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { FieldDefinition } from './gr55-address-map';

/**
 * UI metadata for a parameter
 */
export interface ParameterMetadata {
  /** Machine-readable ID */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Short label for compact UI */
  shortLabel?: string;
  
  /** Help text / description */
  help?: string;
  
  /** UI component type */
  componentType: 'knob' | 'slider' | 'dropdown' | 'toggle' | 'button';
  
  /** Section grouping */
  section: string;
  
  /** Tab grouping */
  tab: string;
  
  /** Display order within section */
  order?: number;
  
  /** Units for display (BPM, Hz, %, dB, etc.) */
  units?: string;
  
  /** Value formatter function name */
  formatter?: string;
  
  /** Color coding for UI */
  color?: 'amber' | 'green' | 'cyan' | 'red';
}

/**
 * Parameter metadata registry
 * 
 * Maps field addresses to UI metadata
 */
export const ParameterMetadataMap = new Map<number, ParameterMetadata>([
  // ═══════════════════════════════════════════════════════════════
  // SYSTEM PARAMETERS
  // ═══════════════════════════════════════════════════════════════
  
  [0x01000000, {
    id: 'system.currentPatchNumber',
    label: 'Current Patch',
    shortLabel: 'Patch',
    help: 'Currently selected patch number',
    componentType: 'dropdown',
    section: 'System',
    tab: 'Device',
    formatter: 'patchNumber'
  }],
  
  // ═══════════════════════════════════════════════════════════════
  // PATCH COMMON PARAMETERS
  // ═══════════════════════════════════════════════════════════════
  
  [0x18000000, {
    id: 'patch.common.mode',
    label: 'Guitar/Bass Mode',
    shortLabel: 'Mode',
    help: 'Switch between guitar and bass modeling',
    componentType: 'toggle',
    section: 'Common',
    tab: 'Common',
    order: 1
  }],
  
  [0x18000001, {
    id: 'patch.common.patchName',
    label: 'Patch Name',
    shortLabel: 'Name',
    help: 'Patch name (16 characters maximum)',
    componentType: 'button', // Opens text input dialog
    section: 'Common',
    tab: 'Common',
    order: 2
  }],
  
  [0x18000200, {
    id: 'patch.common.patchLevel',
    label: 'Patch Level',
    shortLabel: 'Level',
    help: 'Overall patch volume',
    componentType: 'knob',
    section: 'Common',
    tab: 'Common',
    order: 3,
    color: 'amber'
  }],
  
  [0x18000208, {
    id: 'patch.common.tempo',
    label: 'Tempo',
    shortLabel: 'BPM',
    help: 'Patch tempo in beats per minute',
    componentType: 'knob',
    section: 'Common',
    tab: 'Common',
    order: 4,
    units: 'BPM',
    color: 'green'
  }],
  
  [0x1800020A, {
    id: 'patch.common.key',
    label: 'Key',
    help: 'Musical key for the patch',
    componentType: 'dropdown',
    section: 'Common',
    tab: 'Common',
    order: 5
  }],
  
  [0x1800020B, {
    id: 'patch.common.beat',
    label: 'Beat',
    help: 'Time signature',
    componentType: 'dropdown',
    section: 'Common',
    tab: 'Common',
    order: 6
  }],
  
  // ═══════════════════════════════════════════════════════════════
  // MFX PARAMETERS
  // ═══════════════════════════════════════════════════════════════
  
  [0x18000600, {
    id: 'patch.mfx.type',
    label: 'MFX Type',
    shortLabel: 'Type',
    help: 'Multi-effects type selection (80+ types)',
    componentType: 'dropdown',
    section: 'MFX',
    tab: 'MFX',
    order: 1,
    color: 'amber'
  }],
  
  // TODO: Add metadata for remaining parameters as they're added to address map
]);

/**
 * Get metadata for a field definition
 */
export function getParameterMetadata(field: FieldDefinition): ParameterMetadata | undefined {
  return ParameterMetadataMap.get(field.address);
}

/**
 * Get all metadata for a tab
 */
export function getMetadataForTab(tab: string): ParameterMetadata[] {
  return Array.from(ParameterMetadataMap.values())
    .filter(m => m.tab === tab)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

/**
 * Get all metadata for a section
 */
export function getMetadataForSection(section: string): ParameterMetadata[] {
  return Array.from(ParameterMetadataMap.values())
    .filter(m => m.section === section)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

/**
 * Value formatters for display
 */
export const ValueFormatters = {
  /**
   * Format patch number as "A1-01" style
   */
  patchNumber(value: number): string {
    // Apply 1752 gap correction
    let num = value;
    if (num > 2047) num -= 1751;
    
    const bank = Math.floor(num / 128);
    const patch = num % 128;
    const bankLetter = String.fromCharCode(65 + Math.floor(bank / 8));
    
    return `${bankLetter}${(bank % 8) + 1}-${String(patch + 1).padStart(2, '0')}`;
  },
  
  /**
   * Format tempo with BPM suffix
   */
  tempo(value: number): string {
    return `${value} BPM`;
  },
  
  /**
   * Format percentage (0-100)
   */
  percentage(value: number): string {
    return `${value}%`;
  },
  
  /**
   * Format decibels
   */
  decibels(value: number): string {
    return `${value > 0 ? '+' : ''}${value} dB`;
  },
  
  /**
   * Format pan (L64-C-63R)
   */
  pan(value: number): string {
    if (value === 0) return 'C';
    if (value < 0) return `L${Math.abs(value)}`;
    return `R${value}`;
  },
  
  /**
   * Format note name from MIDI number
   */
  noteName(value: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(value / 12) - 1;
    const note = notes[value % 12];
    return `${note}${octave}`;
  }
};

/**
 * Tab definitions for patch editor
 */
export interface EditorTab {
  id: string;
  label: string;
  icon?: string;
  order: number;
}

export const EditorTabs: EditorTab[] = [
  { id: 'common', label: 'Common', order: 1 },
  { id: 'pcm1', label: 'PCM Tone 1', order: 2 },
  { id: 'pcm2', label: 'PCM Tone 2', order: 3 },
  { id: 'modeling', label: 'Modeling', order: 4 },
  { id: 'mfx', label: 'MFX', order: 5 },
  { id: 'delay', label: 'Delay', order: 6 },
  { id: 'chorus', label: 'Chorus', order: 7 },
  { id: 'reverb', label: 'Reverb', order: 8 },
  { id: 'assigns', label: 'Assigns', order: 9 }
];
