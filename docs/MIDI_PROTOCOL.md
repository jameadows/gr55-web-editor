# GR-55 MIDI Protocol Notes

## SysEx Message Format

### Request Data (RQ1)
```
F0 41 [devId] 00 00 53 11 [addr×4] [size×4] [checksum] F7
```

### Data Set (DT1)  
```
F0 41 [devId] 00 00 53 12 [addr×4] [data...] [checksum] F7
```

### Checksum
```javascript
checksum = (128 - (sum % 128)) % 128
```

## Key Addresses

| Address       | Size | Description          |
|---------------|------|----------------------|
| `01 00 00 00` | 2    | Current patch number |
| `18 00 00 00` | 1    | Guitar/Bass mode (0=Guitar, 1=Bass) |
| `18 00 00 01` | 17   | Patch name (1 dummy + 16 chars) |
| `18 00 02 00` | 1    | Patch level (0-200)  |
| `18 00 02 08` | 2    | Tempo (nibbles: byte[0]*16 + byte[1]) |
| `18 00 06 00` | 1    | MFX type |

## Known Quirks

1. **Patch Number Gap:** Patches 297+ require adding 1751 to internal number
2. **First Message Ignored:** GR-55 often ignores first SysEx after USB connection  
3. **Dummy Byte in Patch Name:** Response includes 1 leading junk byte
4. **10ms Delay Required:** Wait 10ms between consecutive SysEx sends
5. **Max Transfer Size:** 256 bytes per RQ1/DT1

## Testing Log

### Confirmed Working
- ✅ Universal Identity Request
- ✅ Read current patch number
- ✅ Read guitar/bass mode
- ✅ Read patch name
- ✅ Read patch level, tempo, MFX type

### To Be Tested
- ⏳ Write operations (DT1)
- ⏳ Chunked reads for large blocks
- ⏳ Read stored patches from memory

## References

- Roland GR-55 MIDI Implementation v1.00 (PDF)
- VGuitarForums: Complete MIDI Implementation thread
- gr55-remote source code (RolandGR55AddressMap.ts)
