# Decision Log

## [2025-02-24] Use Angular 21, not React/Vue

**Decision:** Angular 21 with standalone components and signals.

**Rationale:** Patch editor is fundamentally a complex reactive form with ~1500 parameters. Angular's signals, reactive forms, and DI align better than React Native's gesture-focused model.

---

## [2025-02-24] OPFS over IndexedDB for patch storage

**Decision:** Origin Private File System (OPFS) as primary storage.

**Rationale:** True filesystem semantics for .syx import/export, no permission prompts after initial grant, natural fit for patch librarian workflow.

---

## [2025-02-24] Mine gr55-remote, don't fork

**Decision:** Extract TypeScript parameter definitions; do not use as dependency.

**Rationale:** Only need the address map (~5% of codebase). React Native/Expo dependency chain unnecessary for web-only target.

---

## [2025-02-24] Bootstrap 5 as initial UI framework

**Decision:** Use Bootstrap 5 for prototyping; evaluate custom components later.

**Rationale:** Fast iteration during protocol exploration. Can replace component-by-component if design demands.

---

## [2025-02-24] Single-file HTML prototype before Angular

**Decision:** Build standalone MIDI explorer before scaffolding Angular app.

**Rationale:** Validate protocol assumptions against real hardware. Isolate MIDI issues from framework issues.

**Outcome:** `prototypes/gr55-explorer.html` successfully validated SysEx communication.

---

## [2025-02-24] No offline mode

**Decision:** Require hardware connection. No "offline patch editor."

**Rationale:** Core value is live editing, not file manipulation. Maintaining dual codepaths doubles complexity.

---

## [2025-02-24] Web-only, no Electron wrapper

**Decision:** Pure web app. No Electron, Tauri, or native wrapper.

**Rationale:** Web MIDI works in browser without native bridge. Installation-free is core project goal.

---

## [2025-02-24] Git repo structure: docs/ over wiki

**Decision:** Markdown files in `docs/`, committed to repo.

**Rationale:** Version-controlled, searchable in IDE, works offline, AI assistants can read as context.

---

## Future Decisions (To Be Made)

- UI component library (when Bootstrap becomes limiting)
- MFX editor strategy (dynamic components vs unified form)
- .g5l format support (worth reverse engineering?)
- Patch comparison/diff tool
- Real-time performance mode

---

Last reviewed: 2025-02-24 (initial commit)
