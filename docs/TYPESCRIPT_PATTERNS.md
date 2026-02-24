# TypeScript Strict Mode Patterns

## MIDI Event Data Handling

**Issue:** In TypeScript strict mode, `Array.from(event.data)` returns `unknown[]`, not `number[]`.

**Solution:** Always use explicit type assertion:

```typescript
// ❌ WRONG - Returns unknown[]
const data = Array.from(event.data);

// ✅ CORRECT - Explicitly typed as number[]
const data = Array.from(event.data) as number[];
```

**When this applies:**
- Web MIDI API `MIDIMessageEvent.data` (Uint8Array)
- Any MIDI message handling code
- SysEx parsing
- Short message processing

**Pattern to use everywhere:**
```typescript
onMidiMessage(event: MIDIMessageEvent) {
  const data = Array.from(event.data) as number[];
  // Now data is properly typed as number[]
}
```

## Other Strict Mode Patterns

### Non-null Assertions

When you know a value exists but TypeScript doesn't:

```typescript
// Use ! operator sparingly
const port = this.midiAccess!.outputs.get(id);

// Better: Use optional chaining + null check
const port = this.midiAccess?.outputs.get(id);
if (port) {
  // Use port
}
```

### Type Guards

For runtime type checking:

```typescript
function isMIDIOutput(port: any): port is MIDIOutput {
  return port && typeof port.send === 'function';
}

if (isMIDIOutput(selectedPort)) {
  selectedPort.send([0xF0, 0xF7]); // TypeScript knows this is safe
}
```

### Array Initialization

```typescript
// For typed arrays
const params: number[] = new Array(32).fill(0);

// Not just
const params = new Array(32).fill(0); // TypeScript infers any[]
```

## Angular Specific

### Signal Initialization

```typescript
// Provide explicit type for complex signals
deviceState = signal<DeviceState>({ 
  patchNumber: '—', 
  mode: '—', 
  patchName: '—' 
});

// Not
deviceState = signal({ /* ... */ }); // Type might be inferred too broadly
```

### Event Handlers

```typescript
// Type the event parameter
onClick(event: MouseEvent) {
  // TypeScript knows event properties
}

// Not
onClick(event: any) {
  // Loses type safety
}
```

## Remember for Phase 2+

When generating MIDI services:
1. Always type MIDI data as `number[]` or `Uint8Array`
2. Use type assertions for Web MIDI API returns
3. Add type guards for MIDI port checking
4. Explicit types for RxJS observables: `Observable<number[]>`

## Fixed in Commit

- Commit: `350b008`
- File: `src/app/pages/midi-explorer/midi-explorer.component.ts`
- Line: `const data = Array.from(event.data) as number[];`
