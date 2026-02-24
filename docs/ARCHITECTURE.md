# Architecture

## Design Principles

1. **Separation of concerns:** MIDI protocol logic isolated from UI components
2. **Reactive state management:** Angular signals for device state and patch parameters
3. **Framework-agnostic core:** Parameter maps and protocol logic are pure TypeScript
4. **Fail-safe operation:** Graceful degradation when device disconnected
5. **Performance:** Minimize SysEx traffic; batch reads where possible

## Service Layer

### Core Services (Planned)

```
src/app/core/
  midi/
    midi-io.service.ts         # Web MIDI API wrapper
    sysex.service.ts           # Roland protocol implementation
    gr55-protocol.service.ts   # GR-55 specific high-level API
  storage/
    opfs.service.ts            # Patch library persistence
```

### MidiIoService
- Wraps `navigator.requestMIDIAccess({ sysex: true })`
- Manages port selection and connection state
- Provides RxJS observables for MIDI messages

### SysexService  
- Roland checksum calculation
- RQ1/DT1 message construction
- Response parsing and validation
- 10ms inter-message delay enforcement

### Gr55ProtocolService
- High-level API: `readPatchName()`, `writePatchLevel(value)`
- Handles GR-55 quirks (1752 patch gap, dummy bytes)
- Returns typed observables

## Data Model

```typescript
export interface FieldDefinition<T> {
  address: number;           // 32-bit absolute address
  size: number;              // Size in bytes
  type: 'number' | 'string' | 'enum' | 'boolean';
  range?: [number, number];
  enumValues?: string[];
}
```

## UI Architecture

- Feature modules: device-control, patch-editor, patch-library
- Shared components: knob, slider, dropdown, led-indicator
- Angular signals for reactive parameter binding

See code comments for detailed implementation notes.
