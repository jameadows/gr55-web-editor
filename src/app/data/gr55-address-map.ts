/**
 * GR-55 Address Map
 * 
 * Parameter address definitions for Roland GR-55 Guitar Synthesizer.
 * Structure and methodology adapted from gr55-remote by Moti Zilberman.
 * 
 * Original work: https://github.com/motiz88/gr55-remote
 * © Moti Zilberman (MIT License)
 * 
 * Adaptations © 2025 GR-55 Web Editor Contributors (MIT License)
 * 
 * Changes from original:
 * - Converted from React Native to Angular/Web patterns
 * - Removed hook dependencies
 * - Adapted for Web MIDI API
 * - Added TypeScript strict mode compliance
 * - Organized for Angular service layer
 * 
 * NOTE: This file contains core validated addresses. Expand with full parameter
 * set from gr55-remote's RolandGR55AddressMap.ts for complete coverage.
 */

/**
 * Field definition for a GR-55 parameter
 */
export interface FieldDefinition<T = any> {
  /** 32-bit absolute address (e.g., 0x18000001) */
  address: number;
  
  /** Size in bytes (1-256) */
  size: number;
  
  /** Data type */
  type: 'number' | 'string' | 'enum' | 'boolean';
  
  /** Valid range for numeric types [min, max] */
  range?: [number, number];
  
  /** Enum value labels for enum types */
  enumValues?: string[];
  
  /** Human-readable parameter name */
  label?: string;
  
  /** Help text / description */
  description?: string;
  
  /** Default value */
  defaultValue?: T;
}

/**
 * GR-55 Address Map
 * 
 * Organized by memory sections:
 * - System: Global device settings
 * - Temporary: Edit buffer (current patch being edited)
 * - User: Stored patches in memory
 */
export const GR55AddressMap = {
  
  // ═══════════════════════════════════════════════════════════════
  // SYSTEM AREA
  // ═══════════════════════════════════════════════════════════════
  
  system: {
    /**
     * Current patch number (0-2047, with 1752 gap quirk)
     * Address: 0x01000000
     */
    currentPatchNumber: {
      address: 0x01000000,
      size: 2,
      type: 'number',
      range: [0, 2047],
      label: 'Current Patch Number',
      description: 'Active patch number (note: 1752 gap after patch 296)'
    } as FieldDefinition<number>,
    
    // TODO: Expand with system settings from gr55-remote:
    // - MIDI settings
    // - Global tuning
    // - USB audio settings
    // - etc.
  },
  
  // ═══════════════════════════════════════════════════════════════
  // TEMPORARY PATCH (Edit Buffer) - Base: 0x18000000
  // ═══════════════════════════════════════════════════════════════
  
  patch: {
    
    // ─────────────────────────────────────────────────────────────
    // Common Parameters (0x18000000 - 0x180002FF)
    // ─────────────────────────────────────────────────────────────
    
    common: {
      /**
       * Guitar/Bass mode selection
       * Address: 0x18000000
       */
      mode: {
        address: 0x18000000,
        size: 1,
        type: 'enum',
        enumValues: ['Guitar', 'Bass'],
        label: 'Guitar/Bass Mode',
        defaultValue: 0
      } as FieldDefinition<number>,
      
      /**
       * Patch name (16 ASCII characters)
       * Address: 0x18000001
       * Note: Response includes 1 dummy byte at END (byte 16)
       */
      patchName: {
        address: 0x18000001,
        size: 17, // 16 name bytes + 1 dummy at end
        type: 'string',
        label: 'Patch Name',
        description: 'Patch name (16 characters max)',
        defaultValue: 'INIT PATCH'
      } as FieldDefinition<string>,
      
      /**
       * Patch level (volume)
       * Address: 0x18000200
       */
      patchLevel: {
        address: 0x18000200,
        size: 1,
        type: 'number',
        range: [0, 200],
        label: 'Patch Level',
        description: 'Overall patch volume',
        defaultValue: 100
      } as FieldDefinition<number>,
      
      /**
       * Tempo (stored as 2 nibbles)
       * Address: 0x18000208
       * Decode: tempo = byte[0] * 16 + byte[1]
       */
      tempo: {
        address: 0x18000208,
        size: 2,
        type: 'number',
        range: [40, 250],
        label: 'Tempo',
        description: 'Patch tempo (BPM)',
        defaultValue: 120
      } as FieldDefinition<number>,
      
      /**
       * Key
       * Address: 0x1800020A
       */
      key: {
        address: 0x1800020A,
        size: 1,
        type: 'enum',
        enumValues: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
        label: 'Key',
        defaultValue: 0
      } as FieldDefinition<number>,
      
      /**
       * Beat (time signature)
       * Address: 0x1800020B
       */
      beat: {
        address: 0x1800020B,
        size: 1,
        type: 'enum',
        enumValues: ['2/4', '3/4', '4/4', '5/4', '6/4', '7/4', '3/8', '6/8', '9/8', '12/8'],
        label: 'Beat',
        defaultValue: 2 // 4/4
      } as FieldDefinition<number>,
      
      // TODO: Add more common parameters from gr55-remote:
      // - Solo level
      // - Octave shift
      // - String level balance
      // - etc.
    },
    
    // ─────────────────────────────────────────────────────────────
    // PCM Tone 1 (0x18000300 - 0x180003FF)
    // ─────────────────────────────────────────────────────────────
    
    pcmTone1: {
      // TODO: Extract full PCM Tone 1 parameters from gr55-remote
      // Should include:
      // - Wave selection
      // - Pitch
      // - Filter
      // - Amp envelope
      // - LFO
      // - etc.
      
      _placeholder: {
        address: 0x18000300,
        size: 1,
        type: 'number',
        label: 'PCM Tone 1 (TODO)',
        description: 'Expand from gr55-remote RolandGR55AddressMap.ts'
      } as FieldDefinition<number>
    },
    
    // ─────────────────────────────────────────────────────────────
    // PCM Tone 2 (0x18000400 - 0x180004FF)
    // ─────────────────────────────────────────────────────────────
    
    pcmTone2: {
      // TODO: Extract full PCM Tone 2 parameters from gr55-remote
      
      _placeholder: {
        address: 0x18000400,
        size: 1,
        type: 'number',
        label: 'PCM Tone 2 (TODO)',
        description: 'Expand from gr55-remote'
      } as FieldDefinition<number>
    },
    
    // ─────────────────────────────────────────────────────────────
    // Modeling (0x18000500 - 0x180005FF)
    // ─────────────────────────────────────────────────────────────
    
    modeling: {
      // TODO: Extract modeling parameters from gr55-remote
      // Guitar/Bass modeling section
      
      _placeholder: {
        address: 0x18000500,
        size: 1,
        type: 'number',
        label: 'Modeling (TODO)',
        description: 'Expand from gr55-remote'
      } as FieldDefinition<number>
    },
    
    // ─────────────────────────────────────────────────────────────
    // MFX (Multi-Effects) (0x18000600 - 0x180006FF)
    // ─────────────────────────────────────────────────────────────
    
    mfx: {
      /**
       * MFX Type (80+ effect types)
       * Address: 0x18000600
       */
      type: {
        address: 0x18000600,
        size: 1,
        type: 'enum',
        enumValues: [
          'Equalizer', 'Spectrum', 'Enhancer', 'Humanizer', 
          'Overdrive', 'Distortion', 'Compressor', 'Limiter', 
          'Gate', 'Delay', 'Chorus', 'Flanger', 
          'Phaser', 'Tremolo', 'Auto Pan', 'Slicer', 
          'Rotary', 'VK Rotary', 'Hexa Chorus', 'Tremolo Chorus',
          'Stereo Chorus', 'Space D', '3D Chorus', 'Stereo Delay',
          'Mod Delay', '3 Tap Delay', '4 Tap Delay', 'Tm Ctrl Delay',
          'Reverb', 'Gated Reverb', '2x2 Chorus', 'Sub Delay'
          // Note: GR-55 has 80+ MFX types total
          // TODO: Complete list from gr55-remote
        ],
        label: 'MFX Type',
        description: 'Multi-effects type selection'
      } as FieldDefinition<number>,
      
      // TODO: Add MFX parameters (32 parameters per type)
      // Each MFX type has different parameter meanings
      // See gr55-remote for complete parameter definitions
    },
    
    // ─────────────────────────────────────────────────────────────
    // Delay (0x18000700 - 0x180007FF)
    // ─────────────────────────────────────────────────────────────
    
    delay: {
      // TODO: Extract delay parameters from gr55-remote
      
      _placeholder: {
        address: 0x18000700,
        size: 1,
        type: 'number',
        label: 'Delay (TODO)'
      } as FieldDefinition<number>
    },
    
    // ─────────────────────────────────────────────────────────────
    // Chorus (0x18000800 - 0x180008FF)
    // ─────────────────────────────────────────────────────────────
    
    chorus: {
      // TODO: Extract chorus parameters from gr55-remote
      
      _placeholder: {
        address: 0x18000800,
        size: 1,
        type: 'number',
        label: 'Chorus (TODO)'
      } as FieldDefinition<number>
    },
    
    // ─────────────────────────────────────────────────────────────
    // Reverb (0x18000900 - 0x180009FF)
    // ─────────────────────────────────────────────────────────────
    
    reverb: {
      // TODO: Extract reverb parameters from gr55-remote
      
      _placeholder: {
        address: 0x18000900,
        size: 1,
        type: 'number',
        label: 'Reverb (TODO)'
      } as FieldDefinition<number>
    },
    
    // ─────────────────────────────────────────────────────────────
    // Assign 1-8 (0x18001000 - 0x180017FF)
    // ─────────────────────────────────────────────────────────────
    
    assign1: {
      // Each assign is 8 bytes
      // Address: 0x18001000
      
      _placeholder: {
        address: 0x18001000,
        size: 8,
        type: 'number',
        label: 'Assign 1 (TODO)'
      } as FieldDefinition<number>
    },
    
    // TODO: Add assigns 2-8 (each at +0x0100 offset)
  },
  
  // ═══════════════════════════════════════════════════════════════
  // USER PATCHES (Stored Memory) - Base: 0x20000000
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Calculate address for stored patch
   * 
   * Note: Patches 297+ require adding 1751 (the "1752 gap quirk")
   * 
   * @param patchNumber Patch number (0-2047)
   * @returns Base address for patch
   */
  getUserPatchAddress(patchNumber: number): number {
    // Apply 1752 gap for patches 297+
    const adjusted = patchNumber > 296 ? patchNumber + 1751 : patchNumber;
    
    const bank = Math.floor(adjusted / 128);
    const patch = adjusted % 128;
    
    const baseAddr = 0x20000000;
    const offset = (bank * 0x01000000) + (patch * 0x10000);
    
    return baseAddr + offset;
  }
  
} as const;

/**
 * Type helper for extracting field value type
 */
export type FieldValue<T extends FieldDefinition> = 
  T extends FieldDefinition<infer V> ? V : never;

/**
 * Helper to get all fields as a flat array
 * Useful for iteration
 */
export function getAllFields(): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  
  function collectFields(obj: any) {
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        if ('address' in value && 'size' in value && 'type' in value) {
          fields.push(value as FieldDefinition);
        } else {
          collectFields(value);
        }
      }
    }
  }
  
  collectFields(GR55AddressMap);
  return fields;
}

/**
 * Find field by address
 */
export function findFieldByAddress(address: number): FieldDefinition | undefined {
  return getAllFields().find(f => f.address === address);
}
