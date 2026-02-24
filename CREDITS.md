# Credits & Acknowledgments

## Third-Party Projects

### gr55-remote
This project uses GR-55 parameter address mappings adapted from **[gr55-remote](https://github.com/motiz88/gr55-remote)** by Moti Zilberman.

**Author:** Moti Zilberman ([@motiz88](https://github.com/motiz88))  
**Repository:** https://github.com/motiz88/gr55-remote  
**License:** MIT License  
**Copyright:** © Moti Zilberman

#### Files Adapted
- `src/app/data/gr55-address-map.ts` - Parameter addresses adapted from `RolandGR55AddressMap.ts`
- `src/app/data/gr55-patch-model.ts` - Type definitions adapted from `RolandGR55PatchMap.ts`

#### What We Changed
- Converted React Native/React hooks patterns to Angular standalone components
- Removed mobile-specific dependencies (react-native-midi, Expo)
- Adapted for Web MIDI API instead of React Native MIDI
- Reorganized for Angular service layer architecture
- Added TypeScript strict mode compliance
- Converted to signal-based reactivity (Angular 21)

#### Thank You
The gr55-remote project provided invaluable reverse engineering work on the Roland GR-55 MIDI protocol. The comprehensive parameter address mappings saved weeks of manual documentation work. Thank you, Moti, for making this project possible!

---

## Other Acknowledgments

### Roland Corporation
- Roland GR-55 Guitar Synthesizer
- MIDI Implementation documentation
- We are not affiliated with or endorsed by Roland Corporation

### Community Resources
- **VGuitarForums** - GR-55 MIDI implementation discussions
- **GR-55 FloorBoard** (gumtown) - Reference for .g5l format and parameter validation
- **VController** (sixeight7) - Arduino examples validating SysEx protocol

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Adaptations from gr55-remote are also MIT licensed and include appropriate copyright notices in file headers.
