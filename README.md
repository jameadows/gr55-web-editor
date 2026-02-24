# GR-55 Web Editor

Browser-based patch editor and librarian for the Roland GR-55 Guitar Synthesizer.

## Project Goals

- Platform-independent patch editing via Web MIDI API (Chrome/Edge)
- Full patch librarian with OPFS storage (import/export .syx files)
- Zero installation — runs directly in browser
- Linux as first-class citizen (addressing gap in existing tools)

## Current Status

**Phase: Protocol Exploration**
- ✅ MIDI explorer prototype built (see `prototypes/gr55-explorer.html`)
- ✅ Confirmed Web MIDI SysEx communication with GR-55
- ⏳ Angular 21 app scaffolding
- ⏳ Parameter address map extraction from gr55-remote

## Tech Stack

- **Framework:** Angular 21 (standalone components, signals)
- **MIDI:** Web MIDI API (native browser, SysEx enabled)
- **Storage:** Origin Private File System (OPFS) for patch library
- **UI:** Bootstrap 5 (initial prototyping)

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed design.

### Key Services (planned)
```
src/app/core/
  midi/
    midi-io.service.ts         # Web MIDI access, port management
    sysex.service.ts           # Roland protocol encode/decode
    gr55-protocol.service.ts   # GR-55 specific RQ1/DT1 wrappers
  storage/
    opfs.service.ts            # Patch library persistence
```

## Protocol Reference

- **MIDI Implementation:** Roland GR-55 MIDI Implementation v1.00
- **Key Addresses:**
  - `01 00 00 00` — Current patch number
  - `18 00 00 00` — Guitar/Bass mode  
  - `18 00 00 01` — Patch name (16 chars)
  - Edit buffer starts at `18 00 00 00`
  - User patches at `20 00 00 00` + offset

See [docs/MIDI_PROTOCOL.md](docs/MIDI_PROTOCOL.md) for full details.

## Related Projects

- **gr55-remote** (motiz88): React Native app, MIT license — mining parameter definitions
  - Repository: https://github.com/motiz88/gr55-remote
  - Live app: https://gr55.app
- **GR-55 FloorBoard** (gumtown): Qt desktop editor — reference for .g5l format
  - Repository: https://sourceforge.net/projects/grfloorboard/
- **VController** (sixeight7): Arduino MIDI controller — validated SysEx examples
  - Repository: https://github.com/sixeight7/VController_v2

## Development

### Prerequisites
- Node.js 18+ and npm
- Chrome or Edge browser (Web MIDI API requirement)
- Roland GR-55 connected via USB

### Setup
```bash
# Clone repository
git clone <repository-url>
cd gr55-web-editor

# Install dependencies (when Angular app is scaffolded)
npm install

# Serve development build
ng serve

# Test MIDI explorer prototype
open prototypes/gr55-explorer.html
```

## Browser Compatibility

| Browser | Web MIDI | SysEx | Status |
|---------|----------|-------|--------|
| Chrome  | ✅       | ✅    | Full support |
| Edge    | ✅       | ✅    | Full support |
| Firefox | ⚠️       | ⚠️    | Requires flag, unstable |
| Safari  | ❌       | ❌    | Not supported |

## File Format Support

- **.syx** — Standard MIDI System Exclusive files (import/export)
- **.g5l** — GR-55 FloorBoard library format (planned)
- **OPFS** — Origin Private File System (internal patch storage)

## Contributing

This is an early-stage project. Contributions welcome once the core architecture stabilizes.

## License

MIT License (see LICENSE file)
