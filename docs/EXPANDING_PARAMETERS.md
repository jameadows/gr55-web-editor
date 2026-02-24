# Expanding the Parameter Map

## Current Status

Phase 1 has created the **foundation** for the parameter map with:

✅ Core validated addresses (patch number, name, mode, level, tempo, etc.)  
✅ Type system and field definitions  
✅ Proper attribution to gr55-remote  
✅ Helper functions (getUserPatchAddress, getAllFields, etc.)

**What's missing:** The full ~1500 parameters from all sections (PCM tones, modeling, MFX parameters, effects, assigns, etc.)

## How to Expand

### Step 1: Clone gr55-remote

```bash
cd ~/projects
git clone https://github.com/motiz88/gr55-remote.git
```

### Step 2: Locate Parameter Definitions

Key files in gr55-remote:
- `src/RolandGR55AddressMap.ts` - Main parameter map
- `src/RolandGR55PatchMap.ts` - Patch structure
- `src/RolandDataTransfer.ts` - Field definitions

### Step 3: Extract Parameters by Section

Open `src/RolandGR55AddressMap.ts` in gr55-remote and find sections:

**Example: PCM Tone 1 Section**

In gr55-remote, you'll see something like:
```typescript
// gr55-remote format (React Native)
export const PCM_TONE_1_WAVE = field(
  RolandGR55SysExConfig.temporaryPatch,
  [0x03, 0x00],
  1,
  { type: "enum", values: ["PIANO", "E.PIANO", ...] }
);
```

Convert to our format:
```typescript
// Our format (Angular)
pcmTone1: {
  wave: {
    address: 0x18000300,  // temporaryPatch base (0x18000000) + [0x03, 0x00]
    size: 1,
    type: 'enum',
    enumValues: ['PIANO', 'E.PIANO', ...],
    label: 'PCM Tone 1 Wave',
    description: 'Wave/patch selection'
  } as FieldDefinition<number>,
  
  // Continue with other PCM Tone 1 parameters...
}
```

### Step 4: Address Calculation

gr55-remote uses relative addresses. Convert to absolute:

```
Base Address: 0x18000000 (temporaryPatch)
Relative:     [0x03, 0x00]
Absolute:     0x18000300

Formula: 0x18000000 + (byte1 << 8) + byte2
```

### Step 5: Type Mapping

| gr55-remote | Our Format |
|-------------|------------|
| `type: "number"` | `type: 'number'` |
| `type: "string"` | `type: 'string'` |
| `type: "enum"` | `type: 'enum'` |
| `type: "boolean"` | `type: 'boolean'` |

### Step 6: Replace Placeholders

In `gr55-address-map.ts`, find placeholders like:

```typescript
pcmTone1: {
  _placeholder: {
    address: 0x18000300,
    size: 1,
    type: 'number',
    label: 'PCM Tone 1 (TODO)'
  }
}
```

Replace with full parameter set:

```typescript
pcmTone1: {
  switch: {
    address: 0x18000300,
    size: 1,
    type: 'boolean',
    label: 'PCM Tone 1 Switch'
  } as FieldDefinition<boolean>,
  
  wave: {
    address: 0x18000301,
    size: 1,
    type: 'enum',
    enumValues: ['PIANO', 'E.PIANO', /* ... */],
    label: 'Wave'
  } as FieldDefinition<number>,
  
  level: {
    address: 0x18000302,
    size: 1,
    type: 'number',
    range: [0, 127],
    label: 'Level'
  } as FieldDefinition<number>,
  
  // ... continue with all PCM Tone 1 parameters
}
```

## Sections to Expand (in order)

### Priority 1: Most Used
1. **Common** - Already has core parameters, add:
   - Solo level
   - Octave shift
   - String level balance
   - Alt tuning

2. **MFX** - Critical section:
   - 32 parameters per effect type
   - Different parameter meanings per type
   - 80+ effect types total

### Priority 2: Sound Generation
3. **PCM Tone 1** - Complete parameter set
4. **PCM Tone 2** - Complete parameter set  
5. **Modeling** - Guitar/Bass modeling parameters

### Priority 3: Effects
6. **Delay** - All delay parameters
7. **Chorus** - All chorus parameters
8. **Reverb** - All reverb parameters

### Priority 4: Control
9. **Assigns 1-8** - Assignment controller blocks

## MFX Special Case

The MFX section is complex because each effect type has different parameter meanings.

**In gr55-remote:**
```typescript
// MFX parameters vary by type
export const MFX_PARAM_1 = field(...);
// Meaning depends on MFX type selected
```

**Our approach:**
```typescript
mfx: {
  type: { /* MFX type selector */ },
  
  // Generic parameter storage
  param1: { address: 0x18000601, size: 1, type: 'number' },
  param2: { address: 0x18000602, size: 1, type: 'number' },
  // ... params 1-32
  
  // Type-specific metadata in parameter-metadata.ts
}
```

Then in `parameter-metadata.ts`, map parameter meanings by MFX type.

## Validation

After adding parameters, test with MIDI Explorer:

1. Query each new address
2. Verify data size matches
3. Check value ranges
4. Confirm enum values

Example test:
```typescript
// In MIDI Explorer, query PCM Tone 1 wave
// Address: 0x18000301, Size: 1
// Expected: 0-255 (wave number)
```

## Iterative Approach (Recommended)

Don't try to add all 1500 parameters at once!

**Week 1:** Common + MFX type
**Week 2:** PCM Tone 1
**Week 3:** PCM Tone 2 + Modeling
**Week 4:** Delay + Chorus + Reverb
**Week 5:** Assigns

Test each section thoroughly before moving to next.

## When You're Done

Update the file header comment:
```typescript
/**
 * GR-55 Address Map
 * 
 * Complete parameter address definitions for Roland GR-55.
 * Adapted from gr55-remote by Moti Zilberman.
 * 
 * Status: COMPLETE (~1500 parameters)
 * Last updated: [date]
 */
```

Remove `_placeholder` entries and the TODO comments.

## Need Help?

If you get stuck extracting parameters:

1. Share the gr55-remote code snippet
2. I'll help convert it to our format
3. Explain any confusing patterns

The initial setup (Phase 1) is done. Expanding is just:
1. Read gr55-remote parameter
2. Convert to our format
3. Add to appropriate section
4. Test with MIDI Explorer
5. Repeat!
