/**
 * SysEx Service
 * 
 * Roland SysEx protocol implementation for GR-55 communication.
 * Handles message construction, parsing, checksum validation, and timing.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable } from '@angular/core';
import { Observable, Subject, timer, throwError } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';
import {
  SysExMessage,
  RolandCommand,
  ROLAND_GR55,
  MIDIError,
  MIDIErrorCode
} from './midi.types';
import { MidiIoService } from './midi-io.service';

@Injectable({
  providedIn: 'root'
})
export class SysexService {
  
  // Queue for enforcing 10ms delay between sends
  private sendQueue: Array<{ data: number[], resolve: () => void }> = [];
  private isSending = false;
  private lastSendTime = 0;
  
  constructor(private midiIo: MidiIoService) {}
  
  // ═══════════════════════════════════════════════════════════
  // ROLAND CHECKSUM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Calculate Roland checksum
   * 
   * Formula: (128 - (sum % 128)) % 128
   * 
   * @param bytes Bytes to checksum (address + data/size)
   * @returns Checksum byte (0-127)
   */
  calculateChecksum(bytes: number[]): number {
    const sum = bytes.reduce((acc, byte) => acc + byte, 0);
    return (128 - (sum % 128)) % 128;
  }
  
  /**
   * Validate checksum in a SysEx message
   * 
   * @param sysex Complete SysEx message
   * @returns True if checksum is valid
   */
  validateChecksum(sysex: number[]): boolean {
    if (sysex.length < 13) return false; // Minimum valid Roland SysEx
    if (sysex[0] !== 0xF0 || sysex[sysex.length - 1] !== 0xF7) return false;
    
    // Extract checksum data (address + data, excluding header and checksum/F7)
    const checksumStart = 7; // After F0 41 [devId] 00 00 53 [cmd]
    const checksumEnd = sysex.length - 2; // Before checksum and F7
    const checksumData = sysex.slice(checksumStart, checksumEnd);
    
    const expected = this.calculateChecksum(checksumData);
    const actual = sysex[sysex.length - 2];
    
    return expected === actual;
  }
  
  // ═══════════════════════════════════════════════════════════
  // MESSAGE CONSTRUCTION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Build RQ1 (Request Data) message
   * 
   * Format: F0 41 [devId] 00 00 53 11 [addr4] [size4] [checksum] F7
   * 
   * @param address 32-bit address
   * @param size Number of bytes to request (1-256)
   * @param deviceId Device ID (default: 0x10)
   * @returns Complete SysEx message
   */
  buildRQ1(address: number, size: number, deviceId: number = ROLAND_GR55.DEFAULT_DEVICE_ID): number[] {
    // Convert address to 4 bytes (MSB first)
    const addrBytes = [
      (address >>> 24) & 0x7F,
      (address >>> 16) & 0x7F,
      (address >>> 8) & 0x7F,
      address & 0x7F
    ];
    
    // Convert size to 4 bytes (MSB first)
    const sizeBytes = [
      (size >>> 24) & 0x7F,
      (size >>> 16) & 0x7F,
      (size >>> 8) & 0x7F,
      size & 0x7F
    ];
    
    // Calculate checksum (address + size)
    const checksumData = [...addrBytes, ...sizeBytes];
    const checksum = this.calculateChecksum(checksumData);
    
    // Build complete message
    return [
      0xF0,                           // SysEx start
      ROLAND_GR55.MANUFACTURER_ID,    // Roland
      deviceId,                       // Device ID
      ...ROLAND_GR55.MODEL_ID,        // GR-55 model
      RolandCommand.RQ1,              // RQ1 command
      ...addrBytes,                   // Address
      ...sizeBytes,                   // Size
      checksum,                       // Checksum
      0xF7                            // SysEx end
    ];
  }
  
  /**
   * Build DT1 (Data Set) message
   * 
   * Format: F0 41 [devId] 00 00 53 12 [addr4] [data...] [checksum] F7
   * 
   * @param address 32-bit address
   * @param data Data bytes to write
   * @param deviceId Device ID (default: 0x10)
   * @returns Complete SysEx message
   */
  buildDT1(address: number, data: number[], deviceId: number = ROLAND_GR55.DEFAULT_DEVICE_ID): number[] {
    // Convert address to 4 bytes (MSB first)
    const addrBytes = [
      (address >>> 24) & 0x7F,
      (address >>> 16) & 0x7F,
      (address >>> 8) & 0x7F,
      address & 0x7F
    ];
    
    // Calculate checksum (address + data)
    const checksumData = [...addrBytes, ...data];
    const checksum = this.calculateChecksum(checksumData);
    
    // Build complete message
    return [
      0xF0,                           // SysEx start
      ROLAND_GR55.MANUFACTURER_ID,    // Roland
      deviceId,                       // Device ID
      ...ROLAND_GR55.MODEL_ID,        // GR-55 model
      RolandCommand.DT1,              // DT1 command
      ...addrBytes,                   // Address
      ...data,                        // Data payload
      checksum,                       // Checksum
      0xF7                            // SysEx end
    ];
  }
  
  // ═══════════════════════════════════════════════════════════
  // MESSAGE PARSING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Parse a Roland SysEx message
   * 
   * @param sysex Complete SysEx message
   * @returns Parsed message or null if invalid
   */
  parseSysEx(sysex: number[]): SysExMessage | null {
    // Validate basic structure
    if (sysex.length < 13) return null;
    if (sysex[0] !== 0xF0 || sysex[sysex.length - 1] !== 0xF7) return null;
    
    // Check manufacturer (Roland)
    if (sysex[1] !== ROLAND_GR55.MANUFACTURER_ID) return null;
    
    // Check model ID (GR-55)
    if (sysex[3] !== ROLAND_GR55.MODEL_ID[0] ||
        sysex[4] !== ROLAND_GR55.MODEL_ID[1] ||
        sysex[5] !== ROLAND_GR55.MODEL_ID[2]) {
      return null;
    }
    
    const deviceId = sysex[2];
    const command = sysex[6];
    
    // Extract address (4 bytes)
    const address = (sysex[7] << 24) | (sysex[8] << 16) | (sysex[9] << 8) | sysex[10];
    
    // Extract data (everything between address and checksum)
    const data = sysex.slice(11, sysex.length - 2);
    
    const checksum = sysex[sysex.length - 2];
    
    return {
      manufacturerId: ROLAND_GR55.MANUFACTURER_ID,
      deviceId,
      modelId: [...ROLAND_GR55.MODEL_ID],
      command,
      address,
      data,
      checksum,
      bytes: sysex
    };
  }
  
  /**
   * Check if message is a Roland DT1 (data set)
   */
  isDT1(sysex: number[]): boolean {
    const parsed = this.parseSysEx(sysex);
    return parsed !== null && parsed.command === RolandCommand.DT1;
  }
  
  /**
   * Check if message is a Roland RQ1 (request)
   */
  isRQ1(sysex: number[]): boolean {
    const parsed = this.parseSysEx(sysex);
    return parsed !== null && parsed.command === RolandCommand.RQ1;
  }
  
  // ═══════════════════════════════════════════════════════════
  // SEND WITH TIMING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Send SysEx with 10ms delay enforcement
   * 
   * GR-55 requires minimum 10ms between consecutive SysEx messages.
   * This method queues messages and enforces the delay.
   * 
   * @param sysex SysEx message to send
   * @returns Promise that resolves when sent
   */
  async sendSysEx(sysex: number[]): Promise<void> {
    return new Promise((resolve) => {
      this.sendQueue.push({ data: sysex, resolve });
      this.processSendQueue();
    });
  }
  
  /**
   * Process the send queue with timing
   */
  private async processSendQueue(): Promise<void> {
    if (this.isSending || this.sendQueue.length === 0) return;
    
    this.isSending = true;
    
    while (this.sendQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastSend = now - this.lastSendTime;
      
      // Enforce 10ms minimum delay
      if (timeSinceLastSend < ROLAND_GR55.INTER_MESSAGE_DELAY) {
        const delay = ROLAND_GR55.INTER_MESSAGE_DELAY - timeSinceLastSend;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const item = this.sendQueue.shift();
      if (item) {
        this.midiIo.send(item.data);
        this.lastSendTime = Date.now();
        item.resolve();
      }
    }
    
    this.isSending = false;
  }
  
  // ═══════════════════════════════════════════════════════════
  // REQUEST/RESPONSE PATTERN
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Send RQ1 and wait for DT1 response.
   *
   * CRITICAL ORDERING:
   *   1. Subscribe to incoming MIDI stream FIRST (never miss a fast reply)
   *   2. Send the RQ1 message
   *   3. Start the timeout clock only AFTER the send resolves
   *
   * Using a plain Observable constructor so we control subscription order
   * precisely. switchMap/defer approaches have a subscribe-after-send race.
   *
   * @param address   Address to read
   * @param size      Number of bytes to read
   * @param timeoutMs Timeout in milliseconds, measured from when the RQ1 is
   *                  actually transmitted (default: 2000)
   * @returns Observable that emits the response data bytes
   */
  request(address: number, size: number, timeoutMs: number = 2000): Observable<number[]> {
    const rq1 = this.buildRQ1(address, size);

    return new Observable<number[]>(subscriber => {
      let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

      // ── Step 1: listen BEFORE sending ────────────────────────────────────
      const msgSub = this.midiIo.getSysExMessages$().pipe(
        map(msg => msg.data),
        filter(data => this.isDT1(data)),
        map(data => this.parseSysEx(data)),
        filter(parsed => parsed !== null && parsed.address === address),
        map(parsed => parsed!.data),
        take(1)
      ).subscribe({
        next: data => {
          if (timeoutHandle !== null) clearTimeout(timeoutHandle);
          subscriber.next(data);
          subscriber.complete();
        },
        error: err => subscriber.error(err)
      });

      // ── Step 2: send the request ─────────────────────────────────────────
      this.sendSysEx(rq1).then(() => {
        // ── Step 3: start timeout only now ───────────────────────────────
        timeoutHandle = setTimeout(() => {
          msgSub.unsubscribe();
          subscriber.error(new Error(
            `GR-55 timeout: no response for address 0x${address.toString(16).padStart(8, '0')} ` +
            `after ${timeoutMs}ms`
          ));
        }, timeoutMs);
      }).catch(err => {
        msgSub.unsubscribe();
        subscriber.error(err);
      });

      // ── Teardown on unsubscribe ───────────────────────────────────────────
      return () => {
        if (timeoutHandle !== null) clearTimeout(timeoutHandle);
        msgSub.unsubscribe();
      };
    });
  }
  
  /**
   * Write data via DT1
   * 
   * @param address Address to write
   * @param data Data to write
   * @returns Promise that resolves when sent
   */
  async write(address: number, data: number[]): Promise<void> {
    const dt1 = this.buildDT1(address, data);
    await this.sendSysEx(dt1);
  }
}
