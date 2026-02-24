# Phase 1: Ethical Parameter Map Extraction

## gr55-remote License Check

**Repository:** https://github.com/motiz88/gr55-remote  
**License:** MIT License  
**Author:** Moti Zilberman (motiz88)  
**Copyright:** © Moti Zilberman

### MIT License Requirements

The MIT license is permissive and allows:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

**BUT requires:**
- ✅ Include original copyright notice
- ✅ Include license text
- ✅ Credit original author

## Our Ethical Approach

### 1. Add CREDITS.md to Project Root

```markdown
# Credits & Acknowledgments

## gr55-remote
This project uses parameter address mappings adapted from [gr55-remote](https://github.com/motiz88/gr55-remote).

**Author:** Moti Zilberman (@motiz88)  
**License:** MIT  
**Files adapted:**
- `src/app/data/gr55-address-map.ts` - Adapted from `RolandGR55AddressMap.ts`
- `src/app/data/gr55-patch-model.ts` - Adapted from `RolandGR55PatchMap.ts`

Original copyright © Moti Zilberman. Used under MIT License.

### What We Changed
- Converted React Native patterns to Angular services
- Removed React hooks dependencies
- Added TypeScript strict mode compliance
- Reorganized for standalone component architecture

### Thank You
Thank you to Moti Zilberman for the excellent reverse engineering work on the GR-55 MIDI protocol. This project would not be possible without gr55-remote's foundation.
```

### 2. Add License Headers to Adapted Files

At the top of each file we adapt from gr55-remote:

```typescript
/**
 * GR-55 Address Map
 * 
 * Adapted from gr55-remote by Moti Zilberman (@motiz88)
 * Original: https://github.com/motiz88/gr55-remote
 * 
 * Original work © Moti Zilberman (MIT License)
 * Adaptations © 2025 GR-55 Web Editor Contributors (MIT License)
 * 
 * Changes from original:
 * - Converted from React Native to Angular
 * - Removed hook dependencies
 * - Added service layer integration
 */

export const GR55AddressMap = {
  // ... our adapted code
};
```

### 3. Link to gr55-remote in README

Update our main README.md:

```markdown
## Credits

This project builds upon the excellent work of:

- **[gr55-remote](https://github.com/motiz88/gr55-remote)** by Moti Zilberman  
  We adapted the GR-55 parameter address mappings from this MIT-licensed project. Thank you for the meticulous reverse engineering work!

See [CREDITS.md](CREDITS.md) for full attribution details.
```

### 4. What We Extract vs What We Write

**From gr55-remote (adapted with attribution):**
- ✅ Parameter addresses (e.g., `0x18000001` = patch name)
- ✅ Parameter sizes (e.g., 17 bytes for name)
- ✅ Parameter types (number, string, enum)
- ✅ Enum value lists (e.g., MFX type names)
- ✅ Address calculation patterns

**We write from scratch:**
- ✅ Angular service implementations
- ✅ RxJS observable patterns
- ✅ Signal-based reactivity
- ✅ UI components
- ✅ Storage layer
- ✅ All application logic

**The key distinction:** We're using gr55-remote as a *reference manual* for GR-55 addresses (which came from reverse engineering), not copying application code.

### 5. Consider Reaching Out

**Optional but nice:**

```
Email to Moti Zilberman:
Subject: Using gr55-remote parameter map in new web editor

Hi Moti,

I'm building a browser-based patch editor for the GR-55 and wanted to 
let you know I'm using gr55-remote's parameter address map as a reference.

Project: https://github.com/[your-username]/gr55-web-editor
License: MIT (same as gr55-remote)

I've added full attribution in CREDITS.md and file headers. The web 
editor targets desktop browsers with Web MIDI, so it's a different 
use case from your mobile app.

Thanks for the excellent reverse engineering work - saved me weeks!

Best,
[Your name]
```

This isn't *required* by MIT license, but it's courteous and might lead to collaboration.

## Phase 1 Implementation Plan (Ethical Version)

### Step 1: Clone gr55-remote (for reference)
```bash
cd ~/projects
git clone https://github.com/motiz88/gr55-remote.git
```

### Step 2: Create CREDITS.md
```bash
cd ~/projects/gr55-web-editor
# I'll generate CREDITS.md with proper attribution
```

### Step 3: Extract & Adapt Parameter Map

**I will:**
1. Read `gr55-remote/src/RolandGR55AddressMap.ts`
2. Adapt the structure to Angular patterns
3. Add MIT license header with attribution
4. Note what was changed from original
5. Create new TypeScript interfaces where needed

**Result:** 3 new files with clear attribution

### Step 4: Update README.md
Add credits section linking to gr55-remote

### Step 5: Commit
```bash
git commit -m "Phase 1: Add GR-55 parameter map (adapted from gr55-remote)

Adapted parameter address definitions from gr55-remote by Moti Zilberman
Original: https://github.com/motiz88/gr55-remote (MIT License)

Changes from original:
- Converted React Native patterns to Angular services
- Removed hook dependencies
- Added TypeScript strict mode compliance

See CREDITS.md for full attribution."
```

## License Compatibility

**Our project:** MIT License ✅  
**gr55-remote:** MIT License ✅  
**Compatible:** Yes, perfectly compatible

Both use the same permissive license, so we can freely combine the work as long as we maintain attribution.

## What This Looks Like in Practice

When Phase 1 is complete, you'll have:

```
gr55-web-editor/
├── CREDITS.md                    # 👈 NEW: Full attribution
├── README.md                      # Updated with credits section
└── src/app/data/
    ├── gr55-address-map.ts       # 👈 Header: "Adapted from gr55-remote..."
    ├── gr55-patch-model.ts       # 👈 Header: "Adapted from gr55-remote..."
    └── parameter-metadata.ts     # 👈 Our original work
```

Each adapted file has a header like:
```typescript
/**
 * Adapted from gr55-remote by Moti Zilberman
 * Original: https://github.com/motiz88/gr55-remote
 * © Moti Zilberman (MIT), Adaptations © 2025 GR-55 Web Editor (MIT)
 */
```

## Summary: How We Stay Ethical

1. ✅ **Credit the author** - Moti Zilberman in all adapted files
2. ✅ **Include license** - MIT license text in headers
3. ✅ **Document changes** - What we adapted vs wrote
4. ✅ **Link to source** - Repository URLs in comments
5. ✅ **Public CREDITS.md** - Central attribution document
6. ✅ **Transparent README** - Users know the project history
7. ✅ **Same license** - MIT like gr55-remote
8. ✅ **(Optional) Reach out** - Courtesy email to author

This approach:
- Fully complies with MIT license requirements
- Gives proper credit to excellent work
- Maintains transparency
- Builds on open source the right way
- Might lead to collaboration!

## Ready to Proceed?

When you say "Start Phase 1", I will:

1. Generate CREDITS.md with full attribution
2. Create the 3 parameter map files with headers
3. Update README.md with credits section
4. Provide commit message with attribution

Sound good? Any other ethical concerns you'd like to address?
