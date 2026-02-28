/**
 * GR-55 Protocol Service
 * 
 * High-level API for GR-55 parameter access.
 * Uses the parameter address map from Phase 1 to provide typed read/write operations.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import {Injectable, signal} from '@angular/core';
import {defer, from, Observable, Subject, throwError} from 'rxjs';
import {catchError, concatMap, map, tap} from 'rxjs/operators';
import {SysexService} from './sysex.service';
import {MidiIoService} from './midi-io.service';
import {FieldDefinition, getAllFields} from '../../data/gr55-address-map';
import {ROLAND_GR55} from './midi.types';

@Injectable({
  providedIn: 'root'
})
export class Gr55ProtocolService {
  
  /** Current device ID (can be changed for multi-device setups) */
  deviceId = signal<number>(ROLAND_GR55.DEFAULT_DEVICE_ID);

      /**
       * Serial read queue — ensures only ONE RQ1 is outstanding at a time.
       */
      private readQueue$ = new Subject<Observable<any>>();
      
      // We use concatMap to ensure serial execution, and add a 25ms delay 
      // between requests to prevent the GR-55 buffer from choking.
      private readQueue = this.readQueue$.pipe(
        concatMap(obs$ => obs$.pipe(
          tap(() => {}), // placeholder for debugging if needed
          catchError(() => from([null])) // prevent queue from dying on single error
        ))
      );

      constructor(
        private sysex: SysexService,
        private midiIo: MidiIoService
      ) {
        this.readQueue.subscribe();
      }
  
      // ═══════════════════════════════════════════════════════════
      // GENERIC PARAMETER ACCESS
      // ═══════════════════════════════════════════════════════════
  
      /**
       * Read a parameter value
       */
      readParameter<T>(field: FieldDefinition<T>): Observable<T> {
        return new Observable<T>(subscriber => {
          const req$ = defer(() =>
            this.sysex.request(field.address, field.size).pipe(
              // Small pacing delay after receiving response 
              // gives the GR-55 hardware a breather
              concatMap(data => from(new Promise(r => setTimeout(() => r(data), 25)))),
              map(data => this.decodeValue<T>(data as number[], field)),
              catchError(error => {
                console.error(`Failed to read parameter at ${this.formatAddress(field.address)}:`, error);
                return throwError(() => error);
              })
            )
          );

          // Push the request into the serial queue
          this.readQueue$.next(
            req$.pipe(
              tap({
                next: v => { subscriber.next(v); subscriber.complete(); },
                error: e => subscriber.error(e)
              })
            )
          );
        });
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
   * Note: Response includes 1 dummy byte at the END (byte 16).
   */
  getPatchName(): Observable<string> {
    return this.sysex.request(0x18000001, 17).pipe(
      map(data => {
        // Take first 16 bytes (actual name), skip last dummy byte
        const nameBytes = data.slice(0, 16);
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
    
    // Convert to bytes, pad with nulls, add dummy byte at end
    const data = new Array(17).fill(0);
    
    for (let i = 0; i < truncated.length; i++) {
      data[i] = truncated.charCodeAt(i);
    }
    // Dummy byte at position 16 (already 0 from fill)
    
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
   * Read all known patch parameters from the GR-55 edit buffer.
   *
   * Returns a plain record: { address (hex string) → raw value }.
   * The value type matches whatever decodeValue returns (number | string | boolean).
   *
   * Progress callback receives (completed, total) counts so callers can
   * display a progress bar.
   */
  async readAllParameters(
    fields: FieldDefinition[],
    onProgress?: (done: number, total: number) => void
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};
    let done = 0;

    for (const field of fields) {
      try {
        const value = await new Promise<unknown>((resolve, reject) => {
          this.readParameter(field).subscribe({ next: resolve, error: reject });
        });
        result[`0x${field.address.toString(16).padStart(8, '0')}`] = value;
      } catch (err) {
        // Non-fatal: log and continue so one failing parameter doesn't abort all
        console.warn(`readAllParameters: skipping ${this.formatAddress(field.address)}:`, err);
      }
      done++;
      onProgress?.(done, fields.length);
    }
    return result;
  }

  /**
   * Write a set of parameters back to the GR-55 edit buffer.
   *
   * @param paramMap  Map produced by readAllParameters() or loaded from OPFS.
   * @param fields    Field definitions to use for encoding.  Only parameters
   *                  whose address appears in paramMap are written.
   * @param onProgress  Optional (written, total) progress callback.
   */
  async writeAllParameters(
    paramMap: Record<string, unknown>,
    fields: FieldDefinition[],
    onProgress?: (done: number, total: number) => void
  ): Promise<void> {
    let done = 0;
    const toWrite = fields.filter(f =>
      Object.prototype.hasOwnProperty.call(
        paramMap,
        `0x${f.address.toString(16).padStart(8, '0')}`
      )
    );

    for (const field of toWrite) {
      const key = `0x${field.address.toString(16).padStart(8, '0')}`;
      const value = paramMap[key];
      try {
        await new Promise<void>((resolve, reject) => {
          this.writeParameter(field, value as any).subscribe({ next: resolve, error: reject });
        });
      } catch (err) {
        console.warn(`writeAllParameters: skipping ${this.formatAddress(field.address)}:`, err);
      }
      done++;
      onProgress?.(done, toWrite.length);
      // Small pacing gap between writes
      await new Promise(r => setTimeout(r, 20));
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PATCH NAVIGATION & PERSISTENCE
  // ═══════════════════════════════════════════════════════════

  /**
   * Navigate the GR-55 to a specific patch slot (0-based).
   * Async wrapper around setPatchNumber().
   */
  async selectPatch(slot: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.setPatchNumber(slot).subscribe({ next: resolve, error: reject });
    });
  }

  /**
   * Write the current edit buffer to a user patch slot on the hardware.
   *
   * GR-55 "Patch Write" SysEx: DT1 to address 0x01000010, 2-byte slot number.
   * The slot value uses the same 1752-gap encoding as patch numbers.
   */
  async writePatchToSlot(slot: number): Promise<void> {
    if (slot < 0 || slot >= 297) {
      throw new Error(`Patch slot ${slot} is out of user range (0–296)`);
    }
    // Select the target slot first, then issue a "write" command.
    // Roland GR-55 write: set address 0x01000010 with the 2-byte patch number.
    const adjusted = slot > ROLAND_GR55.PATCH_GAP_START
      ? slot + ROLAND_GR55.PATCH_GAP_OFFSET
      : slot;
    const data = [(adjusted >>> 8) & 0x7F, adjusted & 0x7F];
    await this.sysex.write(0x01000010, data);
  }

  /**
   * Send raw SysEx bytes directly.  Used for replaying imported .syx blobs.
   * Parses the concatenated F0...F7 messages and sends each with pacing.
   */
  async sendRawSysEx(data: number[]): Promise<void> {
    // Split into individual F0...F7 messages
    const messages: number[][] = [];
    let start = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0xF0) {
        start = i;
      } else if (data[i] === 0xF7 && start >= 0) {
        messages.push(data.slice(start, i + 1));
        start = -1;
      }
    }

    for (const msg of messages) {
      this.midiIo.send(msg);
      await new Promise(r => setTimeout(r, 25));
    }
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
        // Patch name: GR-55 appends 1 dummy byte AFTER the 16-char name.
        // Response is 17 bytes: [char1..char16, dummy]
        let stringData = data;
        if (field.label === 'Patch Name' && data.length === 17) {
          stringData = data.slice(0, 16);
        }
        // Convert bytes to ASCII string
        return stringData
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
