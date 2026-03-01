# GR-55 Web Editor — Complete Feature Roadmap
## Path to "End All Be All"

**Current Version:** v1.8 (working label)
**Last Updated:** March 1, 2026
**Repo:** https://github.com/jameadows/gr55-web-editor

---

## Actual Current State

### ✅ What's Shipped (as of last commit)

#### Editor — 10 Tabs

| Tab | Status | Notes |
|-----|--------|-------|
| Common | ✅ | Patch name, level, tempo, tuning, attribute, GK set, normal PU level |
| PCM Tone 1 | ✅ | Tone select, level, pan, octave, mute, tuning + deep editor |
| PCM Tone 2 | ✅ | Same as PCM 1 + deep editor |
| Modeling | ✅ | 40+ model types, level, pan, tuning, mute + per-model deep editor |
| MFX | ✅ | Type, switch, sends, rate-sync + full deep params for all 20 effect types |
| Delay | ✅ | Type, time, feedback, HF damp, level |
| Chorus | ✅ | Type, rate, depth, level, balance |
| Reverb | ✅ | Type, time, HF damp, level, balance |
| EQ | ✅ | 5-band parametric + EZ Character |
| Assigns | ✅ | CTL + ASSIGN 1–8: Switch, Source, Mode, Target (535 named/searchable), Min, Max |

#### Patch Write / Save
- Quick Save (Ctrl+S): writes edit buffer → current slot, no dialog, success/error flash on button
- **Write to…** button: slot picker modal — all 297 slots (U01-1 → U99-3), searchable, rename on write
- Slot badge in header shows active slot

#### OPFS Patch Library (v1.5)
- Local browser storage, survives reload, works offline
- Import from GR-55 hardware (single or bulk all 297)
- Import .syx / .json snapshot files
- Export to GR-55 hardware slots (single or bulk)
- Export to .syx / .json files
- Search, filter, notes, tags

#### Assigns Tab — Complete
- All 8 assigns + CTL
- Per-assign: Switch | Source | Mode (MOMENT/TOGGLE) | Target (named, searchable) | Min knob | Max knob
- Compact table layout with column headers
- Info box explains Mode semantics and inverted Min/Max

#### Core Infrastructure
- Angular 21, TypeScript strict mode, signals throughout
- Web MIDI API — RQ1/DT1 Roland SysEx, serial read queue, inter-message pacing
- 201 mapped address fields
- Components: Knob, Slider, Dropdown, LED, ParameterLabel, LoadingSpinner, AssignTargetSelect, PatchWriteDialog
- Services: OPFS library, import, export, confirmation dialog, keyboard shortcuts

---

## Known Regressions 🔴 — Fix Before Adding Features

Identified during manual testing. Document specific issues here as found.
Next session is dedicated to regressions only.

---

## Remaining Work — Priority Order

### 1. 🔴 Fix Regressions — NEXT SESSION
See regressions section above.

### 2. CTL Pedal Parity — 1–2 hrs
CTL has Switch + Function only. Missing: Target, TargetMin, TargetMax, SourceMode.
Assigns 1–8 are complete — CTL should match exactly.

### 3. ACT Range (Lo/Hi) per Assign — 2–3 hrs
Not in address map yet. `actRangeLo` / `actRangeHi` (0–127) define which slice of
the source's travel activates the assign. Needed for advanced footswitch routing.
16 new address map entries + signals + UI controls in each assign row.

### 4. System Settings Tab — 3–4 hrs
Entirely missing. Separate address space (0x01000000).
- Master tuning, MIDI Rx/Tx channel, program change, bank select
- USB audio routing, sync source, soft thru
- CTL/EXP pedal curve, LCD contrast, auto-off
- ~30–40 parameters total

### 5. PCM Deep Editor Completeness — 1 session
Current deep editor covers Tone Offset Struct but is missing:
- TVA envelope (Attack, Decay, Sustain, Release, Velocity Sens)
- TVF envelope stages
- LFO waveform, fade, delay, pitch/filter/amp/pan depth

### 6. User Documentation Refresh — 1 session (save for last)
Both quick-start.md and README need updating:
- Assigns tab (named targets, Mode, editable Min/Max)
- Write-to-Slot dialog
- OPFS library workflows
- Deep editors
- Browser compatibility (Safari Web MIDI still unsupported — fix the docs)

---

## Future / Advanced

- **A/B Comparison** — two patches side by side, highlight diffs, merge
- **Batch operations** — copy parameter across multiple patches
- **Patch randomizer** — constrained randomization, mutation
- **Performance/setlist mode** — song-based ordering, quick-switch
- **In-app help** — web-rendered quick-start inside the editor

---

## Parameter Coverage Summary

| Section | Status | Notes |
|---------|--------|-------|
| Common | ✅ complete | ~12 params |
| PCM Tone 1 | ⚠️ mostly complete | TVA/TVF envelopes and LFO incomplete in deep editor |
| PCM Tone 2 | ⚠️ mostly complete | Same gaps as PCM 1 |
| Modeling | ✅ complete | Per-model deep editor |
| MFX | ✅ complete | All 20 effect types |
| Delay / Chorus / Reverb | ✅ complete | |
| EQ | ✅ complete | |
| Assigns 1–8 | ✅ complete | Switch/Source/Mode/Target/Min/Max |
| CTL Pedal | ⚠️ partial | Switch + Function only; Target/Min/Max/Mode missing |
| ACT Range | ❌ missing | Not in address map yet |
| System / MIDI | ❌ missing | No system tab yet |

GR-55 has ~3,000 possible parameters total. Current coverage hits ~100% of
what a typical user touches day-to-day; the gaps above are power-user territory.

---

**Document Version:** 2.0
**Last Updated:** March 1, 2026
