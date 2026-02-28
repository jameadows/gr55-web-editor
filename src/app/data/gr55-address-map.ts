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
      mfxChorusSendLevel: {
        address: 0x18000300,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Chorus Send',
        description: 'MFX send level to Chorus',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'MFX'
      } as FieldDefinition<number>,
      
      mfxDelaySendLevel: {
        address: 0x18000301,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Delay Send',
        description: 'MFX send level to Delay',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'MFX'
      } as FieldDefinition<number>,
      
      mfxReverbSendLevel: {
        address: 0x18000302,
        size: 1,
        type: 'number',
        range: [0, 100],
        label: 'Reverb Send',
        description: 'MFX send level to Reverb',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'MFX'
      } as FieldDefinition<number>,
      
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
          'TREMOLO', 'AUTO PAN', 'SLICER', 'VK ROTARY', 'HEXA-CHORUS',
          'SPACE-D', 'FLANGER', 'STEP FLANGER', 'GUITAR AMP SIM', 'COMPRESSOR',
          'LIMITER', '3TAP PAN DELAY', 'TIME CTRL DELAY', 'LOFI COMPRESS', 'PITCH SHIFTER'
        ],
        label: 'MFX Type',
        description: '20 multi-effect types available',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'MFX'
      } as FieldDefinition<number>,
      
      // TODO: Add all 32 MFX parameters (meanings vary by effect type)
      // These will be added in Phase 6+ with specialized UI per effect
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PCM TONE 1 SECTION (0x18002000-0x18002016)
    // From gr55-remote PatchPCMToneStruct
    // ═══════════════════════════════════════════════════════════════
    
    pcmTone1: {
      toneSelect: {
        address: 0x18002000,
        size: 3, // PCM tone select field (special encoding)
        type: 'number',
        range: [0, 909],
        label: 'PCM Tone Number',
        description: '910 PCM tones available (0-indexed)',
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
        range: [0, 909],
        label: 'PCM Tone Number',
        description: '910 PCM tones available (0-indexed)',
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
    
    // ═══════════════════════════════════════════════════════════════
    // ASSIGNS SECTION (0x18000011, 0x1800010C-0x18000217)
    // CTL Pedal + 8 Assignable Controls
    // ═══════════════════════════════════════════════════════════════
    
    assigns: {
      // CTL Pedal (0x18000011-0x18000023)
      ctlStatus: {
        address: 0x18000011,
        size: 1,
        type: 'boolean',
        label: 'CTL Status',
        description: 'CTL pedal on/off',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      ctlFunction: {
        address: 0x18000012,
        size: 1,
        type: 'enum',
        enumValues: [
          'OFF', 'HOLD', 'TAP TEMPO', 'TONE SW', 'AMP SW', 'MOD SW',
          'MFX SW', 'DELAY SW', 'REVERB SW', 'CHORUS SW',
          'AUDIO PLAYER PLAY/STOP', 'AUDIO PLAYER SONG INC',
          'AUDIO PLAYER SONG DEC', 'AUDIO PLAYER SW', 'V-LINK SW',
          'LED MOMENT', 'LED TOGGLE'
        ],
        label: 'CTL Function',
        description: 'CTL pedal function',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 1-8 (Each has: switch, target, targetMin, targetMax, source, sourceMode)
      assign1Switch: {
        address: 0x1800010C,
        size: 1,
        type: 'boolean',
        label: 'Assign 1 Switch',
        description: 'Assign 1 on/off',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign1Target: {
        address: 0x1800010D,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 1 Target',
        description: 'Parameter to control',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign1TargetMin: {
        address: 0x18000110,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 1 Min',
        description: 'Minimum value',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign1TargetMax: {
        address: 0x18000113,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 1 Max',
        description: 'Maximum value',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign1Source: {
        address: 0x18000116,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 1 Source',
        description: 'Control source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign1SourceMode: {
        address: 0x18000117,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 1 Mode',
        description: 'Source behavior',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 2
      assign2Switch: {
        address: 0x1800011F,
        size: 1,
        type: 'boolean',
        label: 'Assign 2 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign2Target: {
        address: 0x18000120,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 2 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign2TargetMin: {
        address: 0x18000123,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 2 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign2TargetMax: {
        address: 0x18000126,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 2 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign2Source: {
        address: 0x18000129,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 2 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign2SourceMode: {
        address: 0x1800012A,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 2 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 3
      assign3Switch: {
        address: 0x18000132,
        size: 1,
        type: 'boolean',
        label: 'Assign 3 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign3Target: {
        address: 0x18000133,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 3 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign3TargetMin: {
        address: 0x18000136,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 3 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign3TargetMax: {
        address: 0x18000139,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 3 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign3Source: {
        address: 0x1800013C,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 3 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign3SourceMode: {
        address: 0x1800013D,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 3 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 4
      assign4Switch: {
        address: 0x18000145,
        size: 1,
        type: 'boolean',
        label: 'Assign 4 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign4Target: {
        address: 0x18000146,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 4 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign4TargetMin: {
        address: 0x18000149,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 4 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign4TargetMax: {
        address: 0x1800014C,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 4 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign4Source: {
        address: 0x1800014F,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 4 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign4SourceMode: {
        address: 0x18000150,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 4 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 5
      assign5Switch: {
        address: 0x18000158,
        size: 1,
        type: 'boolean',
        label: 'Assign 5 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign5Target: {
        address: 0x18000159,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 5 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign5TargetMin: {
        address: 0x1800015C,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 5 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign5TargetMax: {
        address: 0x1800015F,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 5 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign5Source: {
        address: 0x18000162,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 5 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign5SourceMode: {
        address: 0x18000163,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 5 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 6
      assign6Switch: {
        address: 0x1800016B,
        size: 1,
        type: 'boolean',
        label: 'Assign 6 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign6Target: {
        address: 0x1800016C,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 6 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign6TargetMin: {
        address: 0x1800016F,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 6 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign6TargetMax: {
        address: 0x18000172,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 6 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign6Source: {
        address: 0x18000175,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 6 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign6SourceMode: {
        address: 0x18000176,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 6 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 7
      assign7Switch: {
        address: 0x1800017E,
        size: 1,
        type: 'boolean',
        label: 'Assign 7 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign7Target: {
        address: 0x1800017F,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 7 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign7TargetMin: {
        address: 0x18000182,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 7 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign7TargetMax: {
        address: 0x18000185,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 7 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign7Source: {
        address: 0x18000188,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 7 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign7SourceMode: {
        address: 0x18000189,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 7 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      // ASSIGN 8
      assign8Switch: {
        address: 0x18000211,
        size: 1,
        type: 'boolean',
        label: 'Assign 8 Switch',
        defaultValue: false,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<boolean>,
      
      assign8Target: {
        address: 0x18000212,
        size: 3,
        type: 'number',
        range: [0, 534],
        label: 'Assign 8 Target',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign8TargetMin: {
        address: 0x18000215,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 8 Min',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign8TargetMax: {
        address: 0x18000218,
        size: 3,
        type: 'number',
        range: [0, 16383],
        label: 'Assign 8 Max',
        defaultValue: 16383,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign8Source: {
        address: 0x1800021B,
        size: 1,
        type: 'enum',
        enumValues: ['CC01', 'CC02', 'CC03', 'CC04', 'CC05', 'CC06', 'CC07',
                    'CC08', 'CC09', 'CC10', 'CC11', 'CC12', 'CC13', 'CC14',
                    'CC15', 'CC16', 'CC17', 'CC18', 'CC19', 'CC20', 'CC21',
                    'CC22', 'CC23', 'CC24', 'CC25', 'CC26', 'CC27', 'CC28',
                    'CC29', 'CC30', 'CC31', 'AFTERTOUCH', 'SYS CTRL1', 'SYS CTRL2',
                    'SYS CTRL3', 'SYS CTRL4', 'GK VOL', 'GK S1/S2', 'EXP PEDAL',
                    'EXP SW', 'CTL1', 'CTL2', 'WAVE PEDAL', 'ASSIGN1', 'ASSIGN2',
                    'ASSIGN3', 'ASSIGN4', 'ASSIGN5', 'ASSIGN6', 'ASSIGN7', 'ASSIGN8'],
        label: 'Assign 8 Source',
        defaultValue: 0,
        uiLevel: 'primary',
        category: 'Assigns'
      } as FieldDefinition<number>,
      
      assign8SourceMode: {
        address: 0x1800021C,
        size: 1,
        type: 'enum',
        enumValues: ['MOMENT', 'TOGGLE'],
        label: 'Assign 8 Mode',
        defaultValue: 0,
        uiLevel: 'secondary',
        category: 'Assigns'
      } as FieldDefinition<number>,
    },
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
