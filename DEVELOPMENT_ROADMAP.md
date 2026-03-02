# GR-55 Web Editor — Development Roadmap

_Last updated: 2026-03-02_

---

## Current Status: Alpha — Core Editing Works

The app is functional end-to-end. A patch can be loaded from the GR-55, all major
sections can be read and written, and changes are reflected on the hardware in real time.

---

## What's Done

### Infrastructure
- [x] Web MIDI connection (device select, port management, reconnect)
- [x] Roland SysEx protocol — RQ1 read, DT1 write, checksum
- [x] Serial read queue — one outstanding RQ1 at a time, 5s timeout, error recovery
- [x] `gr55-address-map.ts` — full parameter definitions for all major sections
- [x] `gr55-protocol.service.ts` — typed read/write with encode/decode pipeline
- [x] Field types: `number`, `boolean`, `enum`, `string`, `nibble` (USplit12), `tone-select`
- [x] MIDI Explorer diagnostic tool — address scanner, probe presets, CSV export

### Address Map (empirically verified + cross-referenced with gr55-remote)
- [x] Common — patch name, level, tempo, alt tune
- [x] PCM Tone 1 & 2 — tone select, mute, level, octave, pan, tune, portamento
- [x] Modeling — category, tone (guitar/bass), mute, level
- [x] Sends & EQ — chorus, delay (nibble time), reverb, EQ (all in 0x0600 block)
- [x] MFX — type, switch, send levels, parameter blocks
- [x] Assigns — 8 assign blocks (source, target, range, curve)

### Patch Editor UI
- [x] Tabbed layout — Common, PCM1, PCM2, Modeling, MFX, Assigns
- [x] PCM tone picker — category → tone two-level select, reads/writes correctly
- [x] PCM mute LED toggle — correct address (offset +3), inverted logic
- [x] Modeling category/tone dropdowns — persist across tab switches
- [x] Deep editors — MFX (80+ types), Modeling (per-type parameters), PCM
- [x] Knob, LED, dropdown shared components
- [x] Patch load/save (read from GR-55 on connect, write slot dialog)

### Key Bugs Fixed
- [x] Effects addresses: all in 0x0600 block, not separate pages
- [x] Delay time: 3-byte USplit12 (nibble) field — bulk read only
- [x] PCM toneSelect: 3-byte big-endian, encoded as `pack7(0x580000) + index`
- [x] Byte order: `push` not `unshift` in multi-byte encode loop
- [x] Dropdown `[selected]` on options (not `[value]` on select) — persists on tab switch
- [x] PCM muteSwitch at offset +3 (byte +2 is toneSelect's third byte)

---

## Known Issues / In Testing

### Deep Edit — Needs Verification
- [ ] MFX parameter blocks — addresses and value ranges need hardware verification
- [ ] Modeling deep edit parameters — per-type params may have address errors
- [ ] PCM deep edit (string levels, vibrato, etc.) — not yet validated

### Address Map Gaps
- [ ] PCM toneSelect: drum kit tones use `pack7(0x560000)` base, not implemented
- [ ] `portamentoTime` at offset +0x0D uses `USplit8Field` (2-byte nibble) — not a field type yet
- [ ] Modeling offset struct (0x18003000) — patch-level overrides not implemented
- [ ] String 1–6 levels in PCM tone struct — not in UI

### UX
- [ ] No unsaved-changes indicator
- [ ] Patch name editing (field exists, no edit widget)
- [ ] Alt tune type/value not editable
- [ ] Modeling LED label always says "On" (same bug as PCM before fix — needs same fix)

---

## Next Up (Priority Order)

### 1. Deep Edit Validation
Work through MFX and Modeling deep editors with hardware to confirm parameters
read and write correctly. Use gr55-remote `RolandGR55AddressMap.ts` as the
authoritative reference before any guessing — it has all offsets and field types.

### 2. Patch Library (OPFS)
- Read all 198 onboard patches by iterating patch slots
- Store in Origin Private File System
- Browse, name, tag, reorder

### 3. SysEx Bulk Import/Export
- Export current patch as `.syx` file
- Import `.syx` file and write to GR-55 or library
- Batch export all patches

### 4. Remaining Parameters
- Patch name editing widget
- Alt tune controls
- Assign deep edit UI improvements

---

## Reference

**gr55-remote** (`motiz88/gr55-remote`) is the authoritative source for all
GR-55 addresses, field types, and encoding. Check it first before any guessing
or empirical scanning. Key files:

- `RolandGR55AddressMap.ts` — all field definitions with offsets and types
- `RolandAddressMap.ts` — field type classes (USplit8, USplit12, UIntBE, etc.)
- `RolandGR55ToneMap.ts` — PCM tone list and encoding offset table (`pack7(0x580000)`)
- `RolandSysExProtocol.ts` — `pack7` / `unpack7` utilities

**pack7(0x002000) = 0x1000** — the patch PCM1 struct lives at patch_base + 0x1000,
where patch_base = 0x18001000 (making PCM1 absolute = 0x18002000, confirmed by scan).
