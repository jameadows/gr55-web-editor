# GR-55 Data Models

This directory contains the GR-55 parameter definitions and data models.

## Files

### `gr55-address-map.ts`
**Parameter address definitions**

Maps GR-55 parameters to their MIDI addresses. Each parameter includes:
- 32-bit absolute address
- Size in bytes
- Data type (number, string, enum, boolean)
- Valid range or enum values
- Display label and description

**Attribution:** Structure adapted from gr55-remote by Moti Zilberman (MIT License)

**Status:** Core parameters validated. Expand with full parameter set from gr55-remote (see `docs/EXPANDING_PARAMETERS.md`).

### `gr55-patch-model.ts`
**TypeScript interfaces for patch structure**

Defines the complete structure of a GR-55 patch:
- `GR55Patch` - Complete patch interface
- `PatchCommon` - Common parameters
- `PCMTone` - PCM tone parameters
- `Modeling` - Modeling parameters
- `MultiEffects` - MFX parameters
- `DelayEffect`, `ChorusEffect`, `ReverbEffect` - Effect parameters
- `AssignBlock` - Assignment controllers

Includes factory functions:
- `createDefaultPatch()` - Create init patch
- `isGR55Patch()` - Type guard

**Attribution:** Structure adapted from gr55-remote (MIT License)

### `parameter-metadata.ts`
**UI display metadata**

Maps parameters to UI presentation data:
- Display labels (full and short)
- Help text
- Component type (knob, slider, dropdown, toggle)
- Section and tab grouping
- Value formatters
- Color coding

**Original work** for GR-55 Web Editor.

## Usage

### In Services
```typescript
import { GR55AddressMap, FieldDefinition } from '@app/data/gr55-address-map';

// Read patch level
const levelField = GR55AddressMap.patch.common.patchLevel;
await this.gr55Protocol.readParameter(levelField);
```

### In Components
```typescript
import { GR55Patch, createDefaultPatch } from '@app/data/gr55-patch-model';
import { getParameterMetadata } from '@app/data/parameter-metadata';

// Create new patch
const patch = createDefaultPatch();

// Get metadata for display
const levelField = GR55AddressMap.patch.common.patchLevel;
const metadata = getParameterMetadata(levelField);
console.log(metadata.label); // "Patch Level"
```

## Expanding the Parameter Map

See `docs/EXPANDING_PARAMETERS.md` for guide on adding the full ~1500 parameter set from gr55-remote.

Current coverage:
- ✅ System parameters (patch number)
- ✅ Common parameters (name, level, tempo, key, beat)
- ✅ MFX type selector
- ⏳ PCM Tone 1 (placeholder)
- ⏳ PCM Tone 2 (placeholder)
- ⏳ Modeling (placeholder)
- ⏳ MFX parameters (placeholder)
- ⏳ Delay (placeholder)
- ⏳ Chorus (placeholder)
- ⏳ Reverb (placeholder)
- ⏳ Assigns (placeholder)

## Attribution

Parameter mappings adapted from **gr55-remote** by Moti Zilberman:
- Repository: https://github.com/motiz88/gr55-remote
- License: MIT
- See [CREDITS.md](../../../CREDITS.md) for full attribution
