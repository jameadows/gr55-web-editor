# MIDI Services

Angular services for GR-55 MIDI communication.

## Architecture

```
┌─────────────────────────────────────────┐
│         Components / Pages              │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│      Gr55ProtocolService                │  ← High-level API
│  - readParameter()                      │
│  - writeParameter()                     │
│  - getPatchName()                       │
│  - setTempo()                           │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         SysexService                    │  ← Roland protocol
│  - buildRQ1() / buildDT1()              │
│  - calculateChecksum()                  │
│  - request() / write()                  │
│  - 10ms delay enforcement               │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│        MidiIoService                    │  ← Web MIDI wrapper
│  - requestAccess()                      │
│  - selectInput() / selectOutput()       │
│  - send()                               │
│  - messages$ observable                 │
└─────────────────────────────────────────┘
                │
                ▼
          Web MIDI API
                │
                ▼
          USB MIDI → GR-55
```

## Services

### MidiIoService
**Purpose:** Low-level Web MIDI API wrapper

**Provides:**
- MIDI access management
- Port selection with auto-detect
- RxJS observables for incoming messages
- Connection state signals
- Message filtering (SysEx vs short messages)

**Usage:**
```typescript
constructor(private midiIo: MidiIoService) {}

async connect() {
  await this.midiIo.requestAccess();
  // Auto-selects GR-55 ports if found
  
  // Or manually select:
  this.midiIo.selectOutput('port-id');
  this.midiIo.selectInput('port-id');
}

// Listen for messages
this.midiIo.messages$.subscribe(msg => {
  console.log('MIDI message:', msg.data);
});
```

### SysexService
**Purpose:** Roland SysEx protocol implementation

**Provides:**
- Checksum calculation and validation
- RQ1 (request) message construction
- DT1 (data set) message construction
- SysEx parsing
- Request/response pattern with timeout
- 10ms inter-message delay enforcement

**Usage:**
```typescript
constructor(private sysex: SysexService) {}

// Build RQ1 (request)
const rq1 = this.sysex.buildRQ1(0x18000001, 17);

// Send and wait for response
this.sysex.request(0x18000001, 17).subscribe(data => {
  console.log('Received:', data);
});

// Write data
await this.sysex.write(0x18000200, [100]);
```

### Gr55ProtocolService
**Purpose:** High-level GR-55 specific API

**Provides:**
- Typed parameter read/write using address map
- Convenience methods for common operations
- Automatic value encoding/decoding
- GR-55 quirk handling (1752 gap, dummy bytes, etc.)

**Usage:**
```typescript
import { GR55AddressMap } from '@app/data/gr55-address-map';

constructor(private gr55: Gr55ProtocolService) {}

// Read a parameter
this.gr55.readParameter(GR55AddressMap.patch.common.patchLevel)
  .subscribe(level => {
    console.log('Patch level:', level);
  });

// Write a parameter
this.gr55.writeParameter(
  GR55AddressMap.patch.common.patchLevel, 
  150
).subscribe();

// Convenience methods
this.gr55.getPatchName().subscribe(name => {
  console.log('Patch name:', name);
});

this.gr55.setTempo(120).subscribe();
```

## TypeScript Patterns

### Strict Mode Compliance

Always type MIDI message data explicitly:

```typescript
// ✅ CORRECT
const data = Array.from(event.data) as number[];

// ❌ WRONG
const data = Array.from(event.data); // Returns unknown[]
```

### Signal-Based Reactivity

Services use Angular signals for reactive state:

```typescript
// In component
isConnected = computed(() => this.midiIo.isConnected());

// In template
@if (isConnected()) {
  <p>MIDI Connected</p>
}
```

### Observable Patterns

All async operations return RxJS observables:

```typescript
// Single value
this.gr55.getPatchName().subscribe(name => {
  this.patchName.set(name);
});

// Stream of messages
this.midiIo.messages$
  .pipe(
    filter(msg => msg.data[0] === 0xF0),
    map(msg => this.parseSysEx(msg.data))
  )
  .subscribe(parsed => {
    console.log('SysEx:', parsed);
  });
```

## Error Handling

All services use custom MIDIError class:

```typescript
try {
  await this.midiIo.requestAccess();
} catch (error) {
  if (error instanceof MIDIError) {
    switch (error.code) {
      case MIDIErrorCode.ACCESS_DENIED:
        console.error('User denied MIDI access');
        break;
      case MIDIErrorCode.NOT_SUPPORTED:
        console.error('Web MIDI not supported');
        break;
    }
  }
}

// In observables
this.gr55.getPatchName()
  .pipe(
    catchError(error => {
      console.error('Failed to read patch name:', error);
      return of('Error');
    })
  )
  .subscribe();
```

## Testing

### Mock Services

For unit testing components:

```typescript
const mockMidiIo = {
  isConnected: signal(true),
  messages$: of({ data: [0xF0, 0xF7], timestamp: 0, port: 'test' })
};

TestBed.configureTestingModule({
  providers: [
    { provide: MidiIoService, useValue: mockMidiIo }
  ]
});
```

### Integration Testing

For testing with real MIDI:

```typescript
describe('Gr55ProtocolService', () => {
  let service: Gr55ProtocolService;
  
  beforeEach(async () => {
    // Request real MIDI access in integration tests
    const midiIo = TestBed.inject(MidiIoService);
    await midiIo.requestAccess();
  });
  
  it('should read patch name', (done) => {
    service.getPatchName().subscribe(name => {
      expect(name).toBeTruthy();
      done();
    });
  });
});
```

## Common Patterns

### Reading and Displaying a Parameter

```typescript
@Component({...})
export class PatchCommonComponent {
  private gr55 = inject(Gr55ProtocolService);
  
  patchLevel = signal(100);
  
  ngOnInit() {
    // Read current value from GR-55
    this.gr55.readParameter(GR55AddressMap.patch.common.patchLevel)
      .subscribe(level => this.patchLevel.set(level));
  }
}
```

### Two-Way Parameter Binding

```typescript
@Component({...})
export class KnobComponent {
  private gr55 = inject(Gr55ProtocolService);
  
  @Input() field!: FieldDefinition<number>;
  value = signal(0);
  
  ngOnInit() {
    // Load initial value
    this.gr55.readParameter(this.field)
      .subscribe(v => this.value.set(v));
  }
  
  onChange(newValue: number) {
    // Optimistic update
    this.value.set(newValue);
    
    // Write to GR-55
    this.gr55.writeParameter(this.field, newValue)
      .pipe(
        catchError(error => {
          // Revert on error
          this.gr55.readParameter(this.field)
            .subscribe(v => this.value.set(v));
          return EMPTY;
        })
      )
      .subscribe();
  }
}
```

### Batch Reading Multiple Parameters

```typescript
const fields = [
  GR55AddressMap.patch.common.patchLevel,
  GR55AddressMap.patch.common.tempo,
  GR55AddressMap.patch.common.key
];

forkJoin(
  fields.map(field => this.gr55.readParameter(field))
).subscribe(values => {
  console.log('Level:', values[0]);
  console.log('Tempo:', values[1]);
  console.log('Key:', values[2]);
});
```

## Performance Tips

1. **Debounce writes** - Don't write on every knob movement
   ```typescript
   valueChanges$.pipe(
     debounceTime(100),
     switchMap(value => this.gr55.writeParameter(field, value))
   ).subscribe();
   ```

2. **Cache reads** - Store frequently-read values
   ```typescript
   private patchNameCache = signal<string | null>(null);
   
   getPatchName(): Observable<string> {
     const cached = this.patchNameCache();
     if (cached) return of(cached);
     
     return this.gr55.getPatchName().pipe(
       tap(name => this.patchNameCache.set(name))
     );
   }
   ```

3. **Batch sequential writes** - Use the 10ms delay queue
   ```typescript
   // SysexService automatically queues and spaces these
   await this.gr55.setPatchLevel(100);
   await this.gr55.setTempo(120);
   await this.gr55.setPatchName('MY PATCH');
   // All sent with proper 10ms spacing
   ```

## Next Steps

- Phase 3: Build UI components (Knob, Slider, etc.)
- Phase 4: Create patch editor shell
- Phase 5: Implement section editors using these services
