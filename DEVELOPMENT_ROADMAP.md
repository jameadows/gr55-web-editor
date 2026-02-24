# GR-55 Web Editor - Development Roadmap

## Overview: What's Needed

To transform this into a full patch editor/librarian, we need:

1. **Parameter Address Map** (~1500 parameters from gr55-remote)
2. **Core MIDI Services** (3 services)
3. **UI Components** (5-7 reusable components)
4. **Patch Editor Pages** (7 major sections)
5. **OPFS Storage Service** (patch library)
6. **Library Browser** (import/export UI)

**Estimated Development Time:** 20-30 hours of focused work across 5-7 phases

---

## Phase Breakdown

### Phase 1: Extract & Port Parameter Map ⏱️ 2-3 hours
**Goal:** Get the GR-55 parameter definitions into our codebase

**What to Build:**
```
src/app/data/
  gr55-address-map.ts          # Core parameter definitions
  gr55-patch-model.ts           # TypeScript interfaces for patches
  parameter-metadata.ts         # Display names, ranges, enums
```

**Source:** Clone gr55-remote and extract `RolandGR55AddressMap.ts`

**Complexity:** Medium (requires understanding TypeScript generics)

---

### Phase 2: Core MIDI Services ⏱️ 4-6 hours
**Goal:** Abstract MIDI protocol into Angular services

**What to Build:**
```
src/app/core/midi/
  midi-io.service.ts            # Web MIDI wrapper (RxJS observables)
  sysex.service.ts              # Roland checksum, RQ1/DT1 builders
  gr55-protocol.service.ts      # High-level API (readPatchName, etc.)
  midi.types.ts                 # TypeScript interfaces
```

**Dependencies:** Phase 1 (parameter map)

**Complexity:** Medium-High (RxJS knowledge helpful)

---

### Phase 3: Reusable UI Components ⏱️ 6-8 hours
**Goal:** Build parameter editing widgets

**What to Build:**
```
src/app/shared/components/
  knob/
    knob.component.ts           # Rotary knob (SVG-based, mouse drag)
    knob.component.html
    knob.component.css
  slider/
    slider.component.ts         # Horizontal/vertical fader
  dropdown/
    dropdown.component.ts       # Enum parameter selector
  led-indicator/
    led-indicator.component.ts  # On/off status LED
  parameter-label/
    parameter-label.component.ts # Displays param name + value
```

**Complexity:** Medium (SVG manipulation for knob)

---

### Phase 4: Patch Editor Shell ⏱️ 3-4 hours
**Goal:** Create tabbed editor layout

**What to Build:**
```
src/app/features/patch-editor/
  patch-editor.component.ts     # Main container with tabs
  patch-common/
    patch-common.component.ts   # Level, tempo, key, beat
  (stub components for other tabs)
```

**Complexity:** Low-Medium (mostly layout)

---

### Phase 5: Patch Section Editors ⏱️ 8-12 hours
**Goal:** Build all 7 patch sections

**What to Build:**
```
src/app/features/patch-editor/
  pcm-tone-1/                   # PCM Tone 1 editor
  pcm-tone-2/                   # PCM Tone 2 editor
  modeling/                     # Guitar/Bass modeling
  mfx/                          # Multi-effects (80+ types!)
  delay/                        # Delay editor
  chorus/                       # Chorus editor
  reverb/                       # Reverb editor
  assigns/                      # 8 assign blocks
```

**Complexity:** High (MFX section is complex - 80+ effect types)

---

### Phase 6: OPFS Storage ⏱️ 3-4 hours
**Goal:** Persistent patch library

**What to Build:**
```
src/app/core/storage/
  opfs.service.ts               # OPFS wrapper
  patch-serializer.ts           # .syx file format
  library-metadata.ts           # Patch tags, favorites
```

**Complexity:** Medium (OPFS API is straightforward)

---

### Phase 7: Library Browser ⏱️ 4-5 hours
**Goal:** UI for managing patches

**What to Build:**
```
src/app/features/library/
  library.component.ts          # Grid/list view of patches
  import-export/                # .syx file handling
  patch-card/                   # Individual patch display
```

**Complexity:** Medium (file picker API)

---

## Coordination Strategy: How to Work With Your IDE

### Option A: I Generate Files, You Integrate
**Best for:** Complete features where I can write the whole thing

**Workflow:**
1. You tell me: "Generate Phase 2: MIDI Services"
2. I create all 4 files in full
3. You copy/paste into your project
4. We iterate on any issues

**Pros:** Fast, complete, tested together  
**Cons:** Less learning, might not match your style preferences

---

### Option B: I Provide Specs, Your IDE Generates
**Best for:** UI components, repetitive work

**Workflow:**
1. I create a detailed spec (see example below)
2. You feed it to Cursor/Copilot with: "Implement this spec"
3. Your IDE generates the code
4. You review and tweak
5. We debug together if needed

**Example Spec:**
```markdown
# Knob Component Spec

## File: src/app/shared/components/knob/knob.component.ts

### Requirements:
- Standalone Angular component
- Inputs: value (number), min (number), max (number), label (string)
- Output: valueChange (EventEmitter<number>)
- SVG-based rotary knob (100x100px)
- Rotation range: -135° to +135° (270° total)
- Mouse drag to rotate (track deltaY)
- Display current value in center
- Amber (#e8a020) for active, dim (#6c757d) for inactive
- Emit value on mouseup

### Implementation notes:
- Use @HostListener for mouse events
- Calculate angle from value: angle = ((value - min) / (max - min)) * 270 - 135
- Calculate value from deltaY: sensitivity = (max - min) / 200
- Clamp value between min and max
```

Then you tell Cursor: "Generate this knob component following the spec"

**Pros:** Learn Angular patterns, matches your coding style  
**Cons:** Slower, might need iteration

---

### Option C: Hybrid (Recommended)
**Best for:** This project

**Workflow:**

**I Generate:**
- Phase 1 (parameter map extraction - requires knowledge of gr55-remote)
- Phase 2 (MIDI services - complex RxJS)
- Partial Phase 3 (Knob component as reference)

**Your IDE Generates (with my specs):**
- Phase 3 (remaining UI components - follow knob pattern)
- Phase 4 (editor shell - layout/structure)
- Phase 5 (patch sections - repetitive, similar structure)

**We Collaborate:**
- Phase 6 & 7 (storage/library - I can provide skeleton, you customize UX)

---

## Immediate Next Steps - Choose Your Path

### Path 1: "Claude, Build Everything" 🤖
```
You: "Generate Phase 1: Parameter Map"
Me: [creates 3 files]
You: [copy/paste, test]
Repeat for Phases 2-7
```
**Timeline:** ~7 sessions (one per phase)

### Path 2: "I'll Build With IDE, Claude Provides Specs" 👨‍💻
```
You: "Give me specs for Phase 2 MIDI Services"
Me: [creates detailed markdown specs]
You: [feed to Cursor, implement]
We: [debug together]
Repeat for Phases 1-7
```
**Timeline:** ~14 sessions (spec + debug per phase)

### Path 3: "Hybrid" ⚡ (Recommended)
```
Session 1: I generate Phase 1 (parameter map)
Session 2: I generate Phase 2 (MIDI services)  
Session 3: I generate knob component (reference)
Session 4: You build remaining components with IDE
Session 5: You build editor shell with IDE
Session 6: I generate MFX section (most complex)
Session 7: You build other sections following MFX pattern
Session 8: I generate OPFS service
Session 9: You build library UI with IDE
```
**Timeline:** ~9 sessions, best learning curve

---

## What I Need From You Now

**Choose one:**

1. **"Start Phase 1"** - I'll extract the parameter map from gr55-remote
2. **"Give me Phase 2 specs"** - I'll write detailed specs for your IDE
3. **"Build Phase 1 & 2 for me"** - I'll generate all the files
4. **"Show me the knob component first"** - Let's start with one UI piece

Then we proceed iteratively through the phases.

---

## File Generation Formats I Can Provide

### Format A: Complete Files
```typescript
// I paste the entire file content
// You copy into your project
// Ready to use (might need small tweaks)
```

### Format B: File Skeletons + TODOs
```typescript
// I provide structure and key functions
// You fill in details with your IDE
// Good for learning
```

### Format C: Detailed Specs
```markdown
# Component: Knob
## Inputs: ...
## Behavior: ...
## Styling: ...
(Your IDE implements)
```

---

## Recommended Starting Point

**My suggestion:**

1. **I'll generate Phase 1 + 2** (parameter map + MIDI services)  
   - These are foundation pieces  
   - Hardest to spec out  
   - Need to work correctly for everything else

2. **I'll generate one UI component** (knob) as reference  
   - You see the pattern  
   - Your IDE can replicate for slider/dropdown

3. **You build the rest** with specs from me  
   - Faster iteration  
   - Matches your preferences  
   - We debug together

**Sound good? Want to start with Phase 1?**
