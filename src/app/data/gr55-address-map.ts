/**
 * GR-55 Complete Address Map
 * 
 * Full parameter definitions for Roland GR-55 Guitar Synthesizer.
 * Extracted from gr55-remote by Moti Zilberman with UX hierarchy.
 * 
 * Original work: https://github.com/motiz88/gr55-remote
 * © Moti Zilberman (MIT License)
 * 
 * Adaptations © 2025 GR-55 Web Editor Contributors (MIT License)
 * 
 * UX Philosophy:
 * - Primary controls: Most-used parameters (Level, Tempo, Mode, etc.)
 * - Secondary controls: Common adjustments (Tuning, CTL/EXP settings)
 * - Advanced controls: Deep editing (per-string tuning, MIDI, V-Link)
 * 
 * Each parameter includes:
 * - uiLevel: 'primary' | 'secondary' | 'advanced'
 * - category: Logical grouping for UI organization
 */

/**
 * Field definition with UX metadata
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
  
  // === UX METADATA ===
  
  /** UI visibility level */
  uiLevel?: 'primary' | 'secondary' | 'advanced';
  
  /** Logical category for grouping */
  category?: string;
  
  /** Display units */
  units?: string;
  
  /** Value formatter function name */
  formatter?: string;
  
  /** Encoded offset for values (e.g., -20dB stored as 0) */
  encodedOffset?: number;
}

/**
 * Convert pack7 address to absolute address
 * gr55-remote uses pack7() which packs 7-bit values
 * Base for temporary patch: 0x18000000
 */
function pack7ToAddress(packed: number, base: number = 0x18000000): number {
  return base + packed;
}

/**
 * GR-55 Complete Address Map
 */
export const GR55AddressMap = {
  
  // ═══════════════════════════════════════════════════════════════
  // SYSTEM AREA (0x01000000)
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
      description: 'Active patch number (note: 1752 gap after patch 296)',
      uiLevel: 'primary',
      category: 'System'
    } as FieldDefinition<number>,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PATCH - COMMON SECTION (0x18000000)
  // Complete extraction from gr55-remote
  // ═══════════════════════════════════════════════════════════════
  
  patch: {
    common: {
      
      // ─── PRIMARY CONTROLS (Most-used parameters) ─────────────
      
      /**
       * Guitar/Bass mode
       * Address: 0x18000000 (pack7 0x000000)
       */
      patchAttribute: {
        address: 0x18000000,
        size: 1,
        type: 'enum',
        enumValues: ['GUITAR', 'BASS'],
        label: 'Guitar/Bass Mode',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'General'
      } as FieldDefinition<number>,
      
      /**
       * Patch name (16 ASCII characters)
       * Address: 0x18000001 (pack7 0x000001)
       * Note: Response includes 1 dummy byte at END (byte 16)
       */
      patchName: {
        address: 0x18000001,
        size: 17, // 16 name bytes + 1 dummy at end
        type: 'string',
        label: 'Patch Name',
        description: 'Patch name (16 characters max)',
        defaultValue: 'INIT PATCH',
        uiLevel: 'primary',
        category: 'General'
      } as FieldDefinition<string>,
      
      /**
       * Patch level (0-100, stored as 0-200 in 2 bytes)
       * Address: 0x18000230 (pack7 0x000230)
       */
      patchLevel: {
        address: 0x18000230,
        size: 2, // USplit8Field uses 2 bytes
        type: 'number',
        range: [0, 100],
        label: 'Patch Level',
        description: 'Overall patch volume',
        defaultValue: 100,
        uiLevel: 'primary',
        category: 'General'
      } as FieldDefinition<number>,
      
      /**
       * Patch tempo (20-250 BPM, stored as 2 bytes)
       * Address: 0x1800023C (pack7 0x00023C)
       */
      patchTempo: {
        address: 0x1800023C,
        size: 2, // USplit8Field
        type: 'number',
        range: [20, 250],
        label: 'Tempo',
        description: 'Patch tempo (BPM)',
        defaultValue: 120,
        units: 'BPM',
        uiLevel: 'primary',
        category: 'General'
      } as FieldDefinition<number>,
      
      // ─── SECONDARY CONTROLS (Common adjustments) ─────────────
      
      /**
       * Normal PU (pickup) level
       * Address: 0x18000233 (pack7 0x000233)
       */
      normalPuLevel: {
        address: 0x18000233,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Normal PU Level',
        description: 'Normal pickup level',
        defaultValue: 100,
        uiLevel: 'secondary',
        category: 'Levels'
      } as FieldDefinition<number>,
      
      /**
       * Normal PU mute (inverted: 0=ON, 1=OFF)
       * Address: 0x18000232 (pack7 0x000232)
       */
      normalPuMute: {
        address: 0x18000232,
        size: 1,
        type: 'boolean',
        label: 'Normal PU Mute',
        description: 'Mute normal pickup (inverted)',
        defaultValue: false,
        uiLevel: 'secondary',
        category: 'Levels'
      } as FieldDefinition<boolean>,
      
      /**
       * Alternate tuning switch
       * Address: 0x18000234 (pack7 0x000234)
       */
      altTuneSwitch: {
        address: 0x18000234,
        size: 1,
        type: 'boolean',
        label: 'Alt Tune Switch',
        description: 'Enable alternate tuning',
        defaultValue: false,
        uiLevel: 'secondary',
        category: 'Tuning'
      } as FieldDefinition<boolean>,
      
      /**
       * Alternate tuning type
       * Address: 0x18000235 (pack7 0x000235)
       */
      altTuneType: {
        address: 0x18000235,
        size: 1,
        type: 'enum',
        enumValues: [
          'OPEN-D', 'OPEN-E', 'OPEN-G', 'OPEN-A', 'DROP-D', 'D-MODAL',
          '-1 STEP', '-2 STEP', 'BARITONE', 'NASHVL', '-1 OCT', '+1 OCT', 'USER'
        ],
        label: 'Alt Tune Type',
        description: 'Alternate tuning preset',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      // ─── ADVANCED CONTROLS (Deep editing) ────────────────────
      
      /**
       * User tune shift string 1 (-24 to +24 semitones)
       * Address: 0x18000236 (pack7 0x000236)
       */
      userTuneShiftString1: {
        address: 0x18000236,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'User Tune String 1',
        description: 'Custom tuning for string 1',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'advanced',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      userTuneShiftString2: {
        address: 0x18000237,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'User Tune String 2',
        encodedOffset: 64,
        uiLevel: 'advanced',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      userTuneShiftString3: {
        address: 0x18000238,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'User Tune String 3',
        encodedOffset: 64,
        uiLevel: 'advanced',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      userTuneShiftString4: {
        address: 0x18000239,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'User Tune String 4',
        encodedOffset: 64,
        uiLevel: 'advanced',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      userTuneShiftString5: {
        address: 0x1800023A,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'User Tune String 5',
        encodedOffset: 64,
        uiLevel: 'advanced',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      userTuneShiftString6: {
        address: 0x1800023B,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'User Tune String 6',
        encodedOffset: 64,
        uiLevel: 'advanced',
        category: 'Tuning'
      } as FieldDefinition<number>,
      
      /**
       * GK Set selection
       * Address: 0x18000224 (pack7 0x000224)
       */
      gkSet: {
        address: 0x18000224,
        size: 1,
        type: 'enum',
        enumValues: ['SYSTEM', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        label: 'GK SET',
        description: 'GK pickup setting selection',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'GK Settings'
      } as FieldDefinition<number>,
      
      /**
       * Guitar output source routing
       * Address: 0x18000225 (pack7 0x000225)
       */
      guitarOutSource: {
        address: 0x18000225,
        size: 1,
        type: 'enum',
        enumValues: ['OFF', 'NORMAL PU', 'MODELING', 'BOTH'],
        label: 'Guitar Out Source',
        description: 'Signal routing to guitar output jack',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Routing'
      } as FieldDefinition<number>,
      
      /**
       * Effect structure type
       * Address: 0x1800022C (pack7 0x00022C)
       */
      effectStructure: {
        address: 0x1800022C,
        size: 1,
        type: 'enum',
        enumValues: ['1', '2'],
        label: 'Effect Structure',
        description: 'Effect signal routing structure',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Routing'
      } as FieldDefinition<number>,
      
      /**
       * Line select for modeling tone
       * Address: 0x1800022D (pack7 0x00022D)
       */
      lineSelectModel: {
        address: 0x1800022D,
        size: 1,
        type: 'enum',
        enumValues: ['OUT', 'MIX'],
        label: 'Line Select Model',
        description: 'Line output routing for modeling tone',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Routing'
      } as FieldDefinition<number>,
      
      /**
       * Line select for normal PU
       * Address: 0x1800022E (pack7 0x00022E)
       */
      lineSelectNormalPU: {
        address: 0x1800022E,
        size: 1,
        type: 'enum',
        enumValues: ['OUT', 'MIX'],
        label: 'Line Select Normal PU',
        description: 'Line output routing for normal pickup',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Routing'
      } as FieldDefinition<number>,
      
      // ─── BYPASS EFFECTS SEND LEVELS (Advanced) ───────────────
      
      bypassChorusSendLevel: {
        address: 0x1800023E,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Bypass Chorus Send',
        description: 'Chorus send level when bypassed',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Effects Send'
      } as FieldDefinition<number>,
      
      bypassDelaySendLevel: {
        address: 0x1800023F,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Bypass Delay Send',
        description: 'Delay send level when bypassed',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Effects Send'
      } as FieldDefinition<number>,
      
      bypassReverbSendLevel: {
        address: 0x18000240,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Bypass Reverb Send',
        description: 'Reverb send level when bypassed',
        defaultValue: 0,
        uiLevel: 'advanced',
        category: 'Effects Send'
      } as FieldDefinition<number>,
      
      // TODO: Add CTL pedal parameters (0x18000011-0x1800001E)
      // TODO: Add EXP pedal parameters (0x1800001F-0x18000036, 0x18000036-0x1800004D)
      // TODO: Add GK S1/S2 switch parameters (0x18000072-0x1800007F, etc.)
      // TODO: Add V-Link parameters (0x18000226-0x1800022B)
      // TODO: Add EXP/GK MOD control min/max (0x18000242-0x18000247)
    },
    
    // ═══════════════════════════════════════════════════════════════
    // MFX SECTION (0x18000300) - Placeholder for now
    // Will expand with all 80+ MFX types and parameters
    // ═══════════════════════════════════════════════════════════════
    
    mfx: {
      mfxSwitch: {
        address: 0x18000304,
        size: 1,
        type: 'boolean',
        label: 'MFX Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'MFX'
      } as FieldDefinition<boolean>,
      
      mfxType: {
        address: 0x18000305,
        size: 1,
        type: 'enum',
        enumValues: [
          'EQ', 'SUPER FILTER', 'PHASER', 'STEP PHASER', 'RING MODULATOR',
          // TODO: Add all 80+ MFX types from gr55-remote
        ],
        label: 'MFX Type',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'MFX'
      } as FieldDefinition<number>,
      
      // TODO: Add MFX send levels (chorus, delay, reverb)
      // TODO: Add all 32 MFX parameters (meanings vary by type)
    },
    
    // TODO: Add remaining sections
    
    // ═══════════════════════════════════════════════════════════════
    // PCM TONE 1 SECTION (0x18002000-0x18002016)
    // From gr55-remote PatchPCMToneStruct
    // ═══════════════════════════════════════════════════════════════
    
    pcmTone1: {
      toneSelect: {
        address: 0x18002000,
        size: 3, // PCM tone select field (special encoding)
        type: 'number',
        range: [0, 895],
        label: 'PCM Tone Number',
        description: '896 PCM tones available',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'PCM Tone 1'
      } as FieldDefinition<number>,
      
      muteSwitch: {
        address: 0x18002003,
        size: 1,
        type: 'boolean',
        label: 'Mute Switch',
        description: 'Mute PCM Tone 1 (inverted: 0=ON, 1=OFF)',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'PCM Tone 1'
      } as FieldDefinition<boolean>,
      
      partLevel: {
        address: 0x18002004,
        size: 1,
        type: 'number',
        range: [0, 127],
        label: 'Level',
        defaultValue: 127,
        uiLevel: 'primary',
        category: 'PCM Tone 1'
      } as FieldDefinition<number>,
      
      partOctaveShift: {
        address: 0x18002005,
        size: 1,
        type: 'number',
        range: [-3, 3],
        label: 'Octave Shift',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 1'
      } as FieldDefinition<number>,
      
      partPan: {
        address: 0x18002009,
        size: 1,
        type: 'number',
        range: [0, 127], // 0=L64, 64=CENTER, 127=R63
        label: 'Pan',
        defaultValue: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 1'
      } as FieldDefinition<number>,
      
      partCoarseTune: {
        address: 0x1800200A,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'Coarse Tune',
        description: 'Coarse pitch adjustment (semitones)',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 1'
      } as FieldDefinition<number>,
      
      partFineTune: {
        address: 0x1800200B,
        size: 1,
        type: 'number',
        range: [-50, 50],
        label: 'Fine Tune',
        description: 'Fine pitch adjustment (cents)',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 1'
      } as FieldDefinition<number>,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PCM TONE 2 SECTION (0x18002100-0x18002116)
    // Same structure as PCM Tone 1, different base address
    // ═══════════════════════════════════════════════════════════════
    
    pcmTone2: {
      toneSelect: {
        address: 0x18002100,
        size: 3,
        type: 'number',
        range: [0, 895],
        label: 'PCM Tone Number',
        description: '896 PCM tones available',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'PCM Tone 2'
      } as FieldDefinition<number>,
      
      muteSwitch: {
        address: 0x18002103,
        size: 1,
        type: 'boolean',
        label: 'Mute Switch',
        description: 'Mute PCM Tone 2 (inverted: 0=ON, 1=OFF)',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'PCM Tone 2'
      } as FieldDefinition<boolean>,
      
      partLevel: {
        address: 0x18002104,
        size: 1,
        type: 'number',
        range: [0, 127],
        label: 'Level',
        defaultValue: 127,
        uiLevel: 'primary',
        category: 'PCM Tone 2'
      } as FieldDefinition<number>,
      
      partOctaveShift: {
        address: 0x18002105,
        size: 1,
        type: 'number',
        range: [-3, 3],
        label: 'Octave Shift',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 2'
      } as FieldDefinition<number>,
      
      partPan: {
        address: 0x18002109,
        size: 1,
        type: 'number',
        range: [0, 127],
        label: 'Pan',
        defaultValue: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 2'
      } as FieldDefinition<number>,
      
      partCoarseTune: {
        address: 0x1800210A,
        size: 1,
        type: 'number',
        range: [-24, 24],
        label: 'Coarse Tune',
        description: 'Coarse pitch adjustment (semitones)',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 2'
      } as FieldDefinition<number>,
      
      partFineTune: {
        address: 0x1800210B,
        size: 1,
        type: 'number',
        range: [-50, 50],
        label: 'Fine Tune',
        description: 'Fine pitch adjustment (cents)',
        defaultValue: 0,
        encodedOffset: 64,
        uiLevel: 'secondary',
        category: 'PCM Tone 2'
      } as FieldDefinition<number>,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // MODELING TONE SECTION (0x18001000-0x1800100A)
    // From gr55-remote PatchModelingToneStruct
    // Note: Category and tone number fields depend on guitar/bass mode
    // ═══════════════════════════════════════════════════════════════
    
    modeling: {
      toneCategoryGuitar: {
        address: 0x18001000,
        size: 1,
        type: 'enum',
        enumValues: ['E.GTR', 'AC', 'E.BASS', 'SYNTH'],
        label: 'Category (Guitar Mode)',
        description: 'Modeling category when in Guitar mode',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberEGtrGuitar: {
        address: 0x18001001,
        size: 1,
        type: 'enum',
        enumValues: ['CLA-ST', 'MOD-ST', 'H&H-ST', 'TE', 'LP', 'P-90', 'LIPS', 'RICK', '335', 'L4'],
        label: 'E.GTR Type',
        description: 'Electric guitar model (when category = E.GTR)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberAcGuitar: {
        address: 0x18001002,
        size: 1,
        type: 'enum',
        enumValues: ['STEEL', 'NYLON', 'SITAR', 'BANJO', 'RESO'],
        label: 'Acoustic Type',
        description: 'Acoustic model (when category = AC)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberEBassGuitar: {
        address: 0x18001003,
        size: 1,
        type: 'enum',
        enumValues: ['JB', 'PB'],
        label: 'E.BASS Type',
        description: 'Bass model in guitar mode (when category = E.BASS)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberSynthGuitar: {
        address: 0x18001004,
        size: 1,
        type: 'enum',
        enumValues: ['ANALOG GR', 'WAVE SYNTH', 'FILTER BASS', 'CRYSTAL', 'ORGAN', 'BRASS'],
        label: 'Synth Type',
        description: 'Synth model (when category = SYNTH)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneCategoryBass: {
        address: 0x18001005,
        size: 1,
        type: 'enum',
        enumValues: ['E.BASS', 'SYNTH', 'E.GTR'],
        label: 'Category (Bass Mode)',
        description: 'Modeling category when in Bass mode',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberEBassBass: {
        address: 0x18001006,
        size: 1,
        type: 'enum',
        enumValues: ['VINT JB', 'JB', 'VINT PB', 'PB', 'M-MAN', 'RICK', 'T-BIRD', 'ACTIVE', 'VIOLIN'],
        label: 'E.BASS Type',
        description: 'Bass model in bass mode (when category = E.BASS)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberEGtrBass: {
        address: 0x18001007,
        size: 1,
        type: 'enum',
        enumValues: ['ST', 'LP'],
        label: 'E.GTR Type',
        description: 'Guitar model in bass mode (when category = E.GTR)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      toneNumberSynthBass: {
        address: 0x18001008,
        size: 1,
        type: 'enum',
        enumValues: ['ANALOG GR', 'WAVE SYNTH', 'FILTER BASS', 'CRYSTAL', 'ORGAN', 'BRASS'],
        label: 'Synth Type',
        description: 'Synth model in bass mode (when category = SYNTH)',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      level: {
        address: 0x18001009,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Level',
        defaultValue: 100,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<number>,
      
      muteSwitch: {
        address: 0x1800100A,
        size: 1,
        type: 'boolean',
        label: 'Mute Switch',
        description: 'Mute modeling tone (inverted: 0=ON, 1=OFF)',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Modeling'
      } as FieldDefinition<boolean>,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // DELAY SECTION (0x18000605-0x1800060B)
    // From gr55-remote sendsAndEq section
    // ═══════════════════════════════════════════════════════════════
    
    delay: {
      delaySwitch: {
        address: 0x18000605,
        size: 1,
        type: 'boolean',
        label: 'Delay Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Delay'
      } as FieldDefinition<boolean>,
      
      delayType: {
        address: 0x18000606,
        size: 1,
        type: 'enum',
        enumValues: ['SINGLE', 'PAN', 'REVERSE', 'ANALOG', 'TAPE', 'MODULATE', 'HICUT'],
        label: 'Delay Type',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Delay'
      } as FieldDefinition<number>,
      
      delayTime: {
        address: 0x18000607,
        size: 2, // USplit12Field
        type: 'number',
        range: [0, 3413],
        label: 'Delay Time',
        description: 'Delay time (0-3400ms, or note values)',
        defaultValue: 500,
        uiLevel: 'secondary',
        category: 'Delay'
      } as FieldDefinition<number>,
      
      delayFeedback: {
        address: 0x1800060A,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Delay Feedback',
        defaultValue: 30,
        uiLevel: 'secondary',
        category: 'Delay'
      } as FieldDefinition<number>,
      
      delayEffectLevel: {
        address: 0x1800060B,
        size: 1,
        type: 'number',
        range: [0, 120],
        label: 'Delay Level',
        defaultValue: 100,
        uiLevel: 'secondary',
        category: 'Delay'
      } as FieldDefinition<number>,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CHORUS SECTION (0x18000600-0x18000604)
    // From gr55-remote sendsAndEq section
    // ═══════════════════════════════════════════════════════════════
    
    chorus: {
      chorusSwitch: {
        address: 0x18000600,
        size: 1,
        type: 'boolean',
        label: 'Chorus Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Chorus'
      } as FieldDefinition<boolean>,
      
      chorusType: {
        address: 0x18000601,
        size: 1,
        type: 'enum',
        enumValues: ['MONO', 'STEREO', 'MONO MILD', 'STEREO MILD'],
        label: 'Chorus Type',
        defaultValue: 1,
        uiLevel: 'primary',
        category: 'Chorus'
      } as FieldDefinition<number>,
      
      chorusRate: {
        address: 0x18000602,
        size: 1,
        type: 'number',
        range: [0, 113],
        label: 'Chorus Rate',
        description: 'Chorus rate (0-100, or note values)',
        defaultValue: 50,
        uiLevel: 'secondary',
        category: 'Chorus'
      } as FieldDefinition<number>,
      
      chorusDepth: {
        address: 0x18000603,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Chorus Depth',
        defaultValue: 50,
        uiLevel: 'secondary',
        category: 'Chorus'
      } as FieldDefinition<number>,
      
      chorusEffectLevel: {
        address: 0x18000604,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Chorus Level',
        defaultValue: 100,
        uiLevel: 'secondary',
        category: 'Chorus'
      } as FieldDefinition<number>,
    },
    
    // ═══════════════════════════════════════════════════════════════
    // REVERB SECTION (0x1800060C-0x18000610)
    // From gr55-remote sendsAndEq section
    // ═══════════════════════════════════════════════════════════════
    
    reverb: {
      reverbSwitch: {
        address: 0x1800060C,
        size: 1,
        type: 'boolean',
        label: 'Reverb Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Reverb'
      } as FieldDefinition<boolean>,
      
      reverbType: {
        address: 0x1800060D,
        size: 1,
        type: 'enum',
        enumValues: ['AMBIENCE', 'ROOM', 'HALL1', 'HALL2', 'PLATE'],
        label: 'Reverb Type',
        defaultValue: 1,
        uiLevel: 'primary',
        category: 'Reverb'
      } as FieldDefinition<number>,
      
      reverbTime: {
        address: 0x1800060E,
        size: 1,
        type: 'number',
        range: [1, 100], // 0.1-10.0s (stored as 1-100)
        label: 'Reverb Time',
        description: 'Reverb time (0.1-10.0 seconds)',
        defaultValue: 30,
        units: 's',
        uiLevel: 'secondary',
        category: 'Reverb'
      } as FieldDefinition<number>,
      
      reverbHighCut: {
        address: 0x1800060F,
        size: 1,
        type: 'enum',
        enumValues: ['700', '1000', '1400', '2000', '3000', '4000', '5000', '6300', '8000', '11000', 'FLAT'],
        label: 'Reverb High Cut',
        description: 'High frequency cutoff',
        defaultValue: 10, // FLAT
        units: 'Hz',
        uiLevel: 'secondary',
        category: 'Reverb'
      } as FieldDefinition<number>,
      
      reverbEffectLevel: {
        address: 0x18000610,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Reverb Level',
        defaultValue: 100,
        uiLevel: 'secondary',
        category: 'Reverb'
      } as FieldDefinition<number>,
    },
    
    // assigns: {...}
  },
  
  // ═══════════════════════════════════════════════════════════════
  // USER PATCHES (Stored Memory) - Base: 0x20000000
  // ═══════════════════════════════════════════════════════════════
  
  getUserPatchAddress(patchNumber: number): number {
    const adjusted = patchNumber > 296 ? patchNumber + 1751 : patchNumber;
    const bank = Math.floor(adjusted / 128);
    const patch = adjusted % 128;
    const baseAddr = 0x20000000;
    const offset = (bank * 0x01000000) + (patch * 0x10000);
    return baseAddr + offset;
  }
  
} as const;

/**
 * Helper functions
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

export function getFieldsByUILevel(level: 'primary' | 'secondary' | 'advanced'): FieldDefinition[] {
  return getAllFields().filter(f => f.uiLevel === level);
}

export function getFieldsByCategory(category: string): FieldDefinition[] {
  return getAllFields().filter(f => f.category === category);
}

export function findFieldByAddress(address: number): FieldDefinition | undefined {
  return getAllFields().find(f => f.address === address);
}
