# Development Guide

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
# or
ng serve
```

The app will be available at `http://localhost:4200`

### Build for Production
```bash
npm run build
```

Output will be in `dist/gr55-web-editor/browser/`

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── home/                    # Landing page
│   │   │   └── home.component.ts
│   │   └── midi-explorer/           # MIDI Explorer (Angular port of prototype)
│   │       ├── midi-explorer.component.ts
│   │       ├── midi-explorer.component.html
│   │       └── midi-explorer.component.css
│   ├── shared/                      # Shared components (future)
│   ├── core/                        # Services (future)
│   ├── app.component.ts             # Root component with navigation
│   ├── app.config.ts                # App configuration
│   └── app.routes.ts                # Route definitions
├── index.html                       # HTML shell
├── main.ts                          # Bootstrap entry point
└── styles.css                       # Global styles (includes Bootstrap)
```

## Current Features

### Navigation
- Responsive navbar with GR-55 branding
- Routes: `/` (home) and `/midi-explorer`
- Mobile-friendly collapsible menu

### Home Page
- Project overview and features
- Development status tracker
- Browser compatibility table
- Call-to-action to MIDI Explorer

### MIDI Explorer
- Full Angular port of HTML prototype
- Web MIDI API integration with SysEx support
- Roland GR-55 protocol implementation
- Real-time message logging
- Device state display
- Preset query buttons
- Custom RQ1 builder
- Raw SysEx input

## Next Steps

1. **Extract Parameter Map from gr55-remote**
   - Clone: `git clone https://github.com/motiz88/gr55-remote.git`
   - Copy: `RolandGR55AddressMap.ts` → `src/app/data/gr55-address-map.ts`

2. **Create Core Services**
   - `MidiIoService` - Web MIDI wrapper
   - `SysexService` - Roland protocol
   - `Gr55ProtocolService` - High-level API

3. **Build Full Patch Editor**
   - Parameter components (knob, slider, dropdown)
   - Patch editor page with tabs
   - Two-way parameter binding

4. **Add Patch Library**
   - OPFS storage service
   - Library browser component
   - .syx import/export

## Browser Requirements

- Chrome 86+ or Edge 86+ (Web MIDI API with SysEx)
- Roland GR-55 connected via USB

## Testing

Connect your GR-55 via USB, then:

1. Navigate to `/midi-explorer`
2. Click "Request MIDI Access"
3. Select GR-55 input/output ports
4. Try preset queries or build custom RQ1

All communication should appear in the log with colored byte display.
