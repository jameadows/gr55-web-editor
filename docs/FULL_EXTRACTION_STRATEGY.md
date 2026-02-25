# Full GR-55 Parameter Extraction & UX Design

## Status: IN PROGRESS

### Completed ✅
- [x] Common Section: PRIMARY controls (Mode, Name, Level, Tempo)
- [x] Common Section: SECONDARY controls (Alt Tuning, Normal PU)
- [x] Common Section: ADVANCED controls (Per-string tuning, Routing, Bypass sends)
- [x] UX hierarchy system implemented
- [x] Helper functions (getFieldsByUILevel, getFieldsByCategory)

### In Progress 🔄
- [ ] Common Section: CTL pedal parameters (17 params)
- [ ] Common Section: EXP pedal parameters (2 groups × 23 params each)
- [ ] Common Section: GK switches (S1, S2)
- [ ] Common Section: V-Link parameters
- [ ] Common Section: Assign blocks (8 × ~19 params)

### To Do 📋
- [ ] MFX: All 80+ effect types
- [ ] MFX: All 32 parameters per type
- [ ] PCM Tone 1: Complete (~60 params)
- [ ] PCM Tone 2: Complete (~60 params)
- [ ] Modeling: Guitar/Bass parameters (~50 params)
- [ ] Delay: Complete (~15 params)
- [ ] Chorus: Complete (~15 params)
- [ ] Reverb: Complete (~15 params)

---

## UX Design Philosophy

### Three-Tier Hierarchy

**1. PRIMARY** - Quick Edit Panel  
Most-used parameters visible by default.  
Goal: 80% of edits done here.

Examples:
- Patch Level, Tempo, Mode
- MFX Type, MFX On/Off
- PCM Tone selection
- Effect On/Off switches

**2. SECONDARY** - Common Adjustments  
One click away, organized in expandable sections.  
Goal: Cover the next 15% of use cases.

Examples:
- Alt Tuning type
- CTL/EXP pedal assignments
- Normal PU level
- Effect send levels

**3. ADVANCED** - Deep Editing  
Collapsible "Advanced" sections within tabs.  
Goal: Complete access without cluttering.

Examples:
- Per-string tuning offsets
- V-Link settings
- Routing options
- Modulation control ranges

---

## Extraction Methodology

### From gr55-remote Format

```typescript
// gr55-remote format
patchLevel: new FieldDefinition(
  pack7(0x0230),
  "Patch Level",
  new USplit8Field(0, 100)
)
```

### To Our Format

```typescript
// Our format with UX metadata
patchLevel: {
  address: 0x18000230,  // pack7(0x0230) + 0x18000000
  size: 2,               // USplit8Field uses 2 bytes
  type: 'number',
  range: [0, 100],
  label: 'Patch Level',
  description: 'Overall patch volume',
  defaultValue: 100,
  uiLevel: 'primary',    // ← UX classification
  category: 'General'    // ← Logical grouping
} as FieldDefinition<number>
```

### Address Conversion

gr55-remote uses `pack7()` for relative addresses:
- Base for temporary patch: `0x18000000`
- Formula: `absolute = 0x18000000 + pack7(relative)`

Example:
- `pack7(0x0230)` → `0x18000230`
- `pack7(0x000001)` → `0x18000001`

### Field Type Mapping

| gr55-remote | Our Type | Size | Notes |
|-------------|----------|------|-------|
| `UByteField(min, max)` | `number` | 1 | Single byte |
| `USplit8Field(min, max)` | `number` | 2 | Two bytes |
| `USplit12Field(min, max)` | `number` | 2 | Two bytes |
| `BooleanField(a, b)` | `enum` | 1 | Two options |
| `booleanField` | `boolean` | 1 | On/Off |
| `enumField([...])` | `enum` | 1 | Multiple options |
| `AsciiStringField(len)` | `string` | len | ASCII text |

### Encoded Offsets

Some fields have encoded offsets (stored value ≠ displayed value):

```typescript
// Example: -20dB to +20dB stored as 0-40
gain20dBField = new UByteField(-20, 20, {
  encodedOffset: 20  // Add 20 to stored value
})

// Our format:
{
  range: [-20, 20],
  encodedOffset: 20
}
```

---

## UI Organization Strategy

### Tab Structure

```
┌─ Common ─────────────────────────────┐
│ PRIMARY (always visible)             │
│ ┌─────┐ ┌─────┐ ┌─────┐             │
│ │Level│ │Tempo│ │Mode │             │
│ └─────┘ └─────┘ └─────┘             │
│                                       │
│ ▼ SECONDARY (expandable sections)    │
│ └─ Tuning                            │
│    Alt Tune: [Dropdown]              │
│                                       │
│ ▼ ADVANCED (collapsible)             │
│ └─ Per-String Tuning                 │
│    String 1: [Slider] -24 to +24     │
│    String 2: [Slider]                │
│    ...                               │
└───────────────────────────────────────┘
```

### Progressive Disclosure

1. **Default View:** PRIMARY controls only
2. **Click section header:** Expand SECONDARY
3. **Click "Advanced":** Show ADVANCED
4. **Saved preference:** Remember user's expansion state

### Category Grouping

Parameters grouped by logical function:
- **General:** Mode, Name, Level, Tempo
- **Tuning:** Alt Tune, Per-string shifts
- **Levels:** Patch Level, Normal PU, PCM Tone levels
- **Routing:** Guitar Out Source, Line Select, Effect Structure
- **GK Settings:** GK Set, GK switches
- **Effects Send:** Bypass send levels
- **Control:** CTL pedal, EXP pedal, Assigns

---

## Next Steps

### Phase 4A: Build UI Framework
1. Create expandable section component
2. Build Basic/Advanced toggle
3. Implement category grouping
4. Add collapse/expand persistence

### Phase 4B: Complete Common Tab
Use the extracted Common parameters to build a full-featured Common editor demonstrating the UX hierarchy.

### Phase 5: Systematic Extraction
Go section by section:
1. MFX (most complex - 80+ effects)
2. PCM Tones (2 × ~60 params each)
3. Modeling (~50 params)
4. Effects (Delay, Chorus, Reverb)
5. Assigns (8 blocks)
6. CTL/EXP (remaining params)

---

## Extraction Checklist Template

For each section, extract:
- [ ] All field definitions from gr55-remote
- [ ] Convert addresses (pack7 → absolute)
- [ ] Map field types
- [ ] Add UX level (primary/secondary/advanced)
- [ ] Add category grouping
- [ ] Add descriptions
- [ ] Test with MIDI Explorer
- [ ] Document any quirks

---

## File Locations

- **Address Map:** `src/app/data/gr55-address-map.ts`
- **gr55-remote Clone:** `/tmp/gr55-remote/RolandGR55AddressMap.ts`
- **This Doc:** `docs/FULL_EXTRACTION_STRATEGY.md`

---

**Current State:** Common section has ~25 parameters extracted with UX hierarchy. Ready to build Phase 4 with complete Common tab, then continue extraction incrementally during Phase 5.
