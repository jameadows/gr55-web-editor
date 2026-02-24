# Working with Claude + Your IDE

## Overview

This project can be built using **three coordination modes** between Claude (me) and your IDE's AI assistant (Cursor, GitHub Copilot, etc.).

---

## Mode 1: Claude Generates Everything

### When to Use
- You want to move fast
- Learning Angular isn't the priority
- Complex logic (RxJS, protocol implementation)

### Workflow

**In Claude Chat:**
```
You: "Generate the MidiIoService"
```

**Claude Responds:**
```typescript
// Creates complete file content
// Includes imports, types, comments
```

**In Your IDE:**
1. Create the file: `src/app/core/midi/midi-io.service.ts`
2. Copy/paste Claude's code
3. Save and test
4. Report any errors back to Claude

### Example Exchange

**You:** Generate the MidiIoService that wraps Web MIDI API with RxJS observables

**Claude:** Here's `src/app/core/midi/midi-io.service.ts`: [full file]

**You:** I'm getting error "navigator.requestMIDIAccess is not defined" in tests

**Claude:** Add this to your test file: [mock setup code]

---

## Mode 2: Specs → IDE Generates

### When to Use
- You want to learn the codebase
- Repetitive components (7 patch sections)
- UI work where you have design preferences

### Workflow

**In Claude Chat:**
```
You: "Give me a spec for the Knob component"
```

**Claude Responds:**
```markdown
# Knob Component Spec

File: src/app/shared/components/knob/knob.component.ts

Requirements:
- Angular standalone component
- Inputs: value, min, max, label
- SVG rotary knob with mouse drag
- Emit valueChange on change
[detailed requirements...]

Implementation:
- Use @HostListener for mouse events
- Calculate angle from value
[step-by-step guide...]
```

**In Your IDE (Cursor Example):**
1. Open Cursor
2. Create new file: `src/app/shared/components/knob/knob.component.ts`
3. Press **Cmd+K** (Cursor's "Edit with AI")
4. Paste Claude's spec
5. Add: "Implement this component spec"
6. Review generated code
7. Tweak styling/behavior to your preference

**In Your IDE (Copilot Example):**
1. Create the file
2. Paste spec as a multi-line comment at top
3. Start typing `export class KnobComponent`
4. Let Copilot autocomplete based on spec
5. Accept/reject suggestions

### Testing the Result

**Back in Claude Chat:**
```
You: "I implemented the knob component. Here's what I got: [paste code]
Any issues?"
```

**Claude:** Reviews and suggests improvements

---

## Mode 3: Hybrid (Recommended)

### Division of Labor

**Claude Does (Complex/Foundational):**
- ✅ Parameter address map extraction
- ✅ MIDI service layer (RxJS)
- ✅ GR-55 protocol service
- ✅ SysEx parsing logic
- ✅ One reference UI component (Knob)
- ✅ MFX section (most complex - 80+ effect types)

**Your IDE Does (Following Patterns):**
- ✅ Remaining UI components (Slider, Dropdown, LED)
- ✅ Patch editor shell/layout
- ✅ 6 simpler patch sections (following MFX pattern)
- ✅ Library browser UI
- ✅ Styling tweaks

**We Collaborate On:**
- ✅ OPFS storage (Claude: service, You: UI integration)
- ✅ State management patterns
- ✅ Debugging issues
- ✅ Performance optimization

### Example Session Flow

```
Session 1:
You: "Let's start Phase 1 - parameter map"
Claude: [generates 3 files from gr55-remote]
You: [copies files, commits to git]

Session 2:
You: "Generate Phase 2 - MIDI services"
Claude: [generates MidiIoService, SysexService, Gr55ProtocolService]
You: [integrates, tests with MIDI Explorer]

Session 3:
You: "Generate the Knob component as reference"
Claude: [generates full knob component]
You: [tests knob, understands pattern]

Session 4:
You: "Give me specs for Slider and Dropdown"
Claude: [provides detailed specs]
You: [uses Cursor to implement following knob pattern]

Session 5:
You: "My slider isn't updating properly"
Claude: [debugs, provides fix]
You: [applies fix]

...continue through phases...
```

---

## Prompts to Use With Your IDE

### When Claude Gave You a Spec

**For Cursor:**
```
Implement this Angular component spec:

[paste Claude's spec]

Use Angular 21 standalone components with signals.
Follow the project's dark terminal theme (amber #e8a020 accents).
```

**For Copilot:**
```typescript
/**
 * [paste Claude's spec as JSDoc comment]
 * 
 * Style: Match existing components
 * Theme: Dark terminal (see src/styles.css)
 * Patterns: Use signals, not zones
 */
export class SliderComponent {
  // Start typing and accept suggestions
```

### When You Hit an Error

**Copy error + relevant code, paste in Claude:**
```
I'm getting this error:

[paste error message]

In this code:

[paste relevant code snippet]

Context: I'm implementing [feature name] from Phase [N]
```

### When You Want Code Review

**In Claude:**
```
Can you review this component I built?

[paste your code]

Specifically check:
- Does it match Angular 21 patterns?
- Any RxJS anti-patterns?
- Performance issues?
- Missing error handling?
```

---

## File Structure Reference

When working with your IDE, keep this structure in mind:

```
src/app/
├── core/                   # Services (Claude generates these)
│   ├── midi/
│   │   ├── midi-io.service.ts
│   │   ├── sysex.service.ts
│   │   └── gr55-protocol.service.ts
│   └── storage/
│       └── opfs.service.ts
├── data/                   # Parameter maps (Claude extracts)
│   ├── gr55-address-map.ts
│   └── gr55-patch-model.ts
├── shared/                 # UI components (You + IDE)
│   └── components/
│       ├── knob/           # (Claude provides reference)
│       ├── slider/         # (You implement)
│       ├── dropdown/       # (You implement)
│       └── led-indicator/  # (You implement)
└── features/               # Pages (Hybrid)
    ├── patch-editor/
    │   ├── patch-common/   # (You + IDE)
    │   ├── pcm-tone-1/     # (You + IDE)
    │   ├── mfx/            # (Claude - complex)
    │   └── ...
    └── library/            # (You + IDE with Claude specs)
```

---

## Git Workflow Recommendation

After each phase:

```bash
# Test the new code
npm start
# Try the feature

# Commit
git add .
git commit -m "Phase N: [Feature name]

Generated by: [Claude/IDE/Hybrid]
Status: [Working/Needs debug]"

# Then proceed to next phase
```

This way you can roll back if needed.

---

## Debugging Strategy

### Level 1: Your IDE's AI
```
You: [paste error]
Cursor: [suggests fix]
You: [apply fix]
```

### Level 2: Claude + Context
```
You: "Error in MidiIoService: [error]
Here's the service: [code]
And how I'm using it: [usage code]"

Claude: [analyzes, finds issue, provides fix]
```

### Level 3: Both Together
```
You ask Claude: "What should I ask Cursor to fix this?"
Claude provides: "Ask Cursor: 'The observable isn't 
completing, add a takeUntil operator with this pattern..'"
You to Cursor: [pastes Claude's suggested prompt]
```

---

## Quality Checklist

Before moving to next phase, verify:

- [ ] TypeScript compiles with no errors
- [ ] Component renders in browser
- [ ] No console errors
- [ ] Matches dark terminal theme
- [ ] Responsive (test mobile view)
- [ ] Git committed with clear message

---

## Communication Templates

### Starting a Phase
```
Me to Claude:
"Ready for Phase [N]: [Name]
Approach: [Generate all / Specs only / Hybrid]
Any prerequisites?"
```

### Reporting Success
```
Me to Claude:
"✅ Phase [N] complete
- All files created
- Tested: [what you tested]
- Committed: [commit hash]
Ready for Phase [N+1]"
```

### Asking for Help
```
Me to Claude:
"🐛 Stuck on [specific issue]
Phase: [N]
File: [filename]
Error: [paste error]
What I tried: [list attempts]"
```

---

## Tips for Speed

1. **Keep Claude context focused**
   - Don't paste entire files unless needed
   - Reference "the MidiIoService we built in Phase 2"

2. **Use your IDE for**
   - Repetitive components
   - Styling tweaks
   - Simple CRUD operations

3. **Use Claude for**
   - Novel logic
   - Protocol implementation
   - Architecture decisions
   - Debugging gnarly issues

4. **Commit often**
   - After each working feature
   - Makes rollback easy
   - Clear progress tracking

---

## What Works Best?

Based on this project:

**Use Claude to generate:**
- Phases 1-2 (parameter map, MIDI services)
- Knob component (reference)
- MFX section (complex)

**Use your IDE to build:**
- Slider, Dropdown, LED (following Knob)
- Patch editor sections 1-6 (following MFX)
- Library UI (following design patterns)

**Collaborate on:**
- Integration issues
- State management
- Performance tuning
- Testing strategy

This gives you ~60% learning, 40% speed boost from Claude.

---

## Ready to Start?

Pick your mode and say:
- **"Generate Phase 1"** (Mode 1)
- **"Give me Phase 1 specs"** (Mode 2)  
- **"Let's do hybrid - you start Phase 1"** (Mode 3)
