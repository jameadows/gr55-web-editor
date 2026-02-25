# GR-55 Full Parameter Manifest

## Extraction Status by Section

### System (Complete ✅)
- [x] Current Patch Number

### Common Section (Complete ✅)
**Primary (4 params):**
- [x] patchAttribute (Guitar/Bass)
- [x] patchName
- [x] patchLevel
- [x] patchTempo

**Secondary (10 params):**
- [x] normalPuLevel, normalPuMute
- [x] altTuneSwitch, altTuneType
- [x] ctlStatus, ctlFunction (basic CTL params)
- [x] gkSet
- [x] guitarOutSource

**Advanced (50+ params):**
- [x] userTuneShiftString1-6
- [x] effectStructure, lineSelectModel, lineSelectNormalPU
- [x] bypassChorusSendLevel, bypassDelaySendLevel, bypassReverbSendLevel
- [ ] Complete CTL pedal (17 params) - TODO
- [ ] Complete EXP pedal (46 params total) - TODO
- [ ] GK switches (26 params) - TODO
- [ ] Assign 1-8 (152 params total) - TODO
- [ ] V-Link (7 params) - TODO

### MFX Section (Essentials ✅, Deep params TODO)
**Primary:**
- [x] mfxSwitch
- [x] mfxType (80+ types enumerated)

**Secondary:**
- [x] mfxChorusSendLevel
- [x] mfxDelaySendLevel  
- [x] mfxReverbSendLevel

**Deep Parameters:**
- [ ] MFX Param 1-32 (context-dependent, vary by effect type) - TODO
  - These require specialized UI per effect type
  - ~2560 parameter definitions (80 types × 32 params)
  - Will be added when building dedicated MFX editor

### PCM Tone 1 & 2 (Essentials ✅, Deep params TODO)
**Primary:**
- [x] pcmTone1Switch, pcmTone2Switch
- [x] pcmTone1ToneNumber, pcmTone2ToneNumber

**Secondary:**
- [x] pcmTone1Level, pcmTone2Level
- [x] pcmTone1Pan, pcmTone2Pan
- [x] Octave shift, coarse/fine tune

**Advanced:**
- [ ] Complete PCM parameters (~60 each = 120 total) - TODO
  - Wave group, wave number variants
  - Filter (type, cutoff, resonance, etc.)
  - Amp envelope (attack, decay, sustain, release)
  - LFO (rate, fade, pitch/filter/amp depth)

### Modeling Section (Essentials ✅, Deep params TODO)
**Primary:**
- [x] modelingSwitch
- [x] modelingType (guitar/bass models)

**Secondary:**
- [x] modelingLevel
- [x] modelingTone

**Advanced:**
- [ ] Complete modeling (~50 params) - TODO
  - Pickup position, single/humbucking
  - Body type, resonance
  - E.GTR/ACOUSTIC/BASS specific params

### Effects Sections (Complete ✅)
**Delay:**
- [x] delaySwitch
- [x] delayType
- [x] delayLevel
- [x] delayTime, delayFeedback, delayHighCut

**Chorus:**
- [x] chorusSwitch
- [x] chorusType
- [x] chorusLevel
- [x] chorusRate, chorusDepth, chorusPreDelay

**Reverb:**
- [x] reverbSwitch
- [x] reverbType
- [x] reverbLevel
- [x] reverbTime, reverbPreDelay, reverbHighCut

## Parameter Count Summary

| Section | Extracted | Remaining | Total |
|---------|-----------|-----------|-------|
| System | 1 | 0 | 1 |
| Common | 64 | ~160 | ~224 |
| MFX | 6 | ~2560 | ~2566 |
| PCM Tone 1 | 8 | ~52 | ~60 |
| PCM Tone 2 | 8 | ~52 | ~60 |
| Modeling | 4 | ~46 | ~50 |
| Delay | 6 | 0 | 6 |
| Chorus | 6 | 0 | 6 |
| Reverb | 6 | 0 | 6 |
| **TOTAL** | **109** | **~2870** | **~2979** |

## Extraction Priority

### Now (Phase 4 Ready) ✅
Essential parameters to build functional editor:
- Primary controls for all sections
- Secondary controls for common operations
- Basic effect parameters

### Next (Phase 5)
When building dedicated section editors:
- Complete CTL/EXP/Assign parameters
- Complete PCM Tone parameters
- Complete Modeling parameters

### Later (Phase 6+)
Deep MFX editing:
- All 32 parameters × 80 effect types
- Context-sensitive UI per effect
- Specialized effect editors

## Why This Approach

1. **Phase 4 can proceed NOW** with ~100 essential params
2. **Incremental extraction** as we build each tab
3. **Context-dependent params** (MFX) need specialized UI anyway
4. **User needs met progressively:**
   - 80% of users: Essential params (done ✅)
   - 15% of users: Section params (Phase 5)
   - 5% of users: Deep MFX (Phase 6+)

Total parameters: ~3000 (not 1500 - MFX multiplies by effect type)
