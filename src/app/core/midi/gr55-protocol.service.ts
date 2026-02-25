/**
 * GR-55 Protocol Service
 * 
 * High-level API for GR-55 parameter access.
 * Uses the parameter address map from Phase 1 to provide typed read/write operations.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, signal } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SysexService } from './sysex.service';
import { MidiIoService } from './midi-io.service';
import { FieldDefinition } from '../../data/gr55-address-map';
import { ROLAND_GR55, MIDIError, MIDIErrorCode } from './midi.types';

@Injectable({
  providedIn: 'root'
})
export class Gr55ProtocolService {
  
  /** Current device ID (can be changed for multi-device setups) */
  deviceId = signal<number>(ROLAND_GR55.DEFAULT_DEVICE_ID);
  
  constructor(
    private sysex: SysexService,
    private midiIo: MidiIoService
  ) {}
  
  // ═══════════════════════════════════════════════════════════
  // GENERIC PARAMETER ACCESS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Read a parameter value
   * 
   * @param field Field definition from address map
   * @returns Observable that emits the decoded value
   */
  readParameter<T>(field: FieldDefinition<T>): Observable<T> {
    return this.sysex.request(field.address, field.size).pipe(
      map(data => this.decodeValue<T>(data, field)),
      catchError(error => {
        console.error(`Failed to read parameter at ${this.formatAddress(field.address)}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Write a parameter value
   * 
   * @param field Field definition from address map
   * @param value Value to write
   * @returns Observable that completes when write is done
   */
  writeParameter<T>(field: FieldDefinition<T>, value: T): Observable<void> {
    const data = this.encodeValue(value, field);
    return from(this.sysex.write(field.address, data)).pipe(
      catchError(error => {
        console.error(`Failed to write parameter at ${this.formatAddress(field.address)}:`, error);
        return throwError(() => error);
      })
    );
  }
  
  // ═══════════════════════════════════════════════════════════
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Get current patch number
   * 
   * Automatically handles the 1752 gap quirk.
   */
  getCurrentPatchNumber(): Observable<number> {
    return this.sysex.request(0x01000000, 2).pipe(
      map(data => {
        let num = (data[0] << 8) | data[1];
        // Handle 1752 gap quirk
        if (num > 2047) {
          num -= ROLAND_GR55.PATCH_GAP_OFFSET;
        }
        return num;
      })
    );
  }
  
  /**
   * Set current patch number
   * 
   * Automatically handles the 1752 gap quirk.
   */
  setPatchNumber(patchNum: number): Observable<void> {
    let adjusted = patchNum;
    
    // Apply 1752 gap quirk for patches 297+
    if (patchNum > ROLAND_GR55.PATCH_GAP_START) {
      adjusted = patchNum + ROLAND_GR55.PATCH_GAP_OFFSET;
    }
    
    const data = [
      (adjusted >>> 8) & 0x7F,
      adjusted & 0x7F
    ];
    
    return from(this.sysex.write(0x01000000, data));
  }
  
  /**
   * Get guitar/bass mode
   */
  getMode(): Observable<'guitar' | 'bass'> {
    return this.sysex.request(0x18000000, 1).pipe(
      map(data => data[0] === 0 ? 'guitar' : 'bass')
    );
  }
  
  /**
   * Set guitar/bass mode
   */
  setMode(mode: 'guitar' | 'bass'): Observable<void> {
    const data = [mode === 'guitar' ? 0 : 1];
    return from(this.sysex.write(0x18000000, data));
  }
  
  /**
   * Get patch name
   * 
   * Note: Response includes 1 dummy byte which is stripped.
   */
  getPatchName(): Observable<string> {
    return this.sysex.request(0x18000001, 17).pipe(
      map(data => {
        // Skip first dummy byte, take 16 name bytes
        const nameBytes = data.slice(1, 17);
        // Convert to string, remove null padding
        return nameBytes
          .map(b => String.fromCharCode(b))
          .join('')
          .replace(/\0/g, '')
          .trim();
      })
    );
  }
  
  /**
   * Set patch name
   * 
   * @param name Patch name (max 16 characters)
   */
  setPatchName(name: string): Observable<void> {
    // Truncate to 16 chars
    const truncated = name.substring(0, 16);
    
    // Convert to bytes, pad with nulls
    const data = new Array(17).fill(0);
    data[0] = 0; // Dummy byte
    
    for (let i = 0; i < truncated.length; i++) {
      data[i + 1] = truncated.charCodeAt(i);
    }
    
    return from(this.sysex.write(0x18000001, data));
  }
  
  /**
   * Get patch level
   */
  getPatchLevel(): Observable<number> {
    return this.sysex.request(0x18000200, 1).pipe(
      map(data => data[0])
    );
  }
  
  /**
   * Set patch level
   * 
   * @param level Level (0-200)
   */
  setPatchLevel(level: number): Observable<void> {
    const clamped = Math.max(0, Math.min(200, level));
    return from(this.sysex.write(0x18000200, [clamped]));
  }
  
  /**
   * Get tempo
   * 
   * GR-55 stores tempo as 2 nibbles: tempo = byte[0] * 16 + byte[1]
   */
  getTempo(): Observable<number> {
    return this.sysex.request(0x18000208, 2).pipe(
      map(data => data[0] * 16 + data[1])
    );
  }
  
  /**
   * Set tempo
   * 
   * @param bpm Tempo in BPM (40-250)
   */
  setTempo(bpm: number): Observable<void> {
    const clamped = Math.max(40, Math.min(250, bpm));
    const byte0 = Math.floor(clamped / 16);
    const byte1 = clamped % 16;
    
    return from(this.sysex.write(0x18000208, [byte0, byte1]));
  }
  
  // ═══════════════════════════════════════════════════════════
  // BULK OPERATIONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Read entire patch from edit buffer
   * 
   * Note: This is a placeholder for future implementation.
   * Full patch read requires chunking into multiple RQ1 requests.
   */
  readPatch(): Observable<any> {
    // TODO: Implement chunked read of entire patch
    // Will need to request each section separately and combine
    return throwError(() => new Error('Not yet implemented'));
  }
  
  /**
   * Write entire patch to edit buffer
   * 
   * Note: This is a placeholder for future implementation.
   * Full patch write requires chunking into multiple DT1 requests.
   */
  writePatch(patch: any): Observable<void> {
    // TODO: Implement chunked write of entire patch
    return throwError(() => new Error('Not yet implemented'));
  }
  
  // ═══════════════════════════════════════════════════════════
  // VALUE ENCODING/DECODING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Decode raw bytes to typed value based on field definition
   */
  private decodeValue<T>(data: number[], field: FieldDefinition<T>): T {
    switch (field.type) {
      case 'number':
        // Simple case: single byte number
        if (field.size === 1) {
          return data[0] as T;
        }
        // Multi-byte: combine MSB first
        let num = 0;
        for (let i = 0; i < field.size; i++) {
          num = (num << 7) | (data[i] & 0x7F);
        }
        return num as T;
        
      case 'string':
        // Convert bytes to ASCII string
        return data
          .map(b => String.fromCharCode(b))
          .join('')
          .replace(/\0/g, '')
          .trim() as T;
        
      case 'enum':
        // Enum value is index into enumValues array
        return data[0] as T;
        
      case 'boolean':
        return (data[0] !== 0) as T;
        
      default:
        console.warn(`Unknown field type: ${field.type}`);
        return data[0] as T;
    }
  }
  
  /**
   * Encode typed value to raw bytes based on field definition
   */
  private encodeValue<T>(value: T, field: FieldDefinition<T>): number[] {
    switch (field.type) {
      case 'number':
        const num = value as unknown as number;
        
        // Clamp to range if specified
        let clamped = num;
        if (field.range) {
          clamped = Math.max(field.range[0], Math.min(field.range[1], num));
        }
        
        // Single byte
        if (field.size === 1) {
          return [clamped & 0x7F];
        }
        
        // Multi-byte: MSB first
        const numBytes: number[] = [];
        for (let i = field.size - 1; i >= 0; i--) {
          numBytes.unshift((clamped >>> (i * 7)) & 0x7F);
        }
        return numBytes;
        
      case 'string':
        const str = value as unknown as string;
        const strBytes = new Array(field.size).fill(0);
        for (let i = 0; i < Math.min(str.length, field.size); i++) {
          strBytes[i] = str.charCodeAt(i) & 0x7F;
        }
        return strBytes;
        
      case 'enum':
        return [(value as unknown as number) & 0x7F];
        
      case 'boolean':
        return [value ? 1 : 0];
        
      default:
        console.warn(`Unknown field type: ${field.type}`);
        return [0];
    }
  }
  
  /**
   * Format address as hex string for logging
   */
  private formatAddress(address: number): string {
    return '0x' + address.toString(16).toUpperCase().padStart(8, '0');
  }
}
