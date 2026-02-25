/**
 * Patch Library Service
 * 
 * Manages GR-55 patch library operations:
 * - Reading all patch names from GR-55
 * - Loading patches by number
 * - Saving patches to .syx files
 * - Importing .syx files
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, signal } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Gr55ProtocolService } from './gr55-protocol.service';
import { SysexService } from './sysex.service';
import { ROLAND_GR55 } from './midi.types';

export interface PatchInfo {
  number: number;        // 0-296 (user patches)
  bankNumber: number;    // 0-98 (U01-U99)
  patchNumber: number;   // 0-8 (1-9)
  displayName: string;   // "U01-1", "U99-9", etc.
  name: string;          // Patch name (16 chars)
  isLoaded?: boolean;    // Is this the current patch?
}

export interface PatchData {
  info: PatchInfo;
  sysexData: Uint8Array; // Complete .syx file data
}

@Injectable({
  providedIn: 'root'
})
export class PatchLibraryService {
  
  /** All user patches (0-296) */
  patches = signal<PatchInfo[]>([]);
  
  /** Currently loaded patch number */
  currentPatchNumber = signal<number>(0);
  
  /** Loading state */
  isLoading = signal<boolean>(false);
  
  constructor(
    private gr55: Gr55ProtocolService,
    private sysex: SysexService
  ) {}
  
  // ═══════════════════════════════════════════════════════════
  // PATCH BROWSING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Load all patch names from GR-55
   * This reads all 297 patch names (takes ~30 seconds)
   */
  loadAllPatchNames(): Observable<PatchInfo[]> {
    this.isLoading.set(true);
    
    const requests: Observable<PatchInfo>[] = [];
    
    // Read all 297 user patches
    for (let i = 0; i < 297; i++) {
      requests.push(this.readPatchName(i));
    }
    
    return forkJoin(requests).pipe(
      tap(patches => {
        this.patches.set(patches);
        this.isLoading.set(false);
      })
    );
  }
  
  /**
   * Read a single patch name by number
   */
  private readPatchName(patchNum: number): Observable<PatchInfo> {
    // Convert patch number to bank/patch
    const bankNumber = Math.floor(patchNum / 3);
    const patchNumber = patchNum % 3;
    const displayName = this.formatPatchLocation(bankNumber, patchNumber);
    
    // Calculate address for this patch's name
    // Temporary patch is at 0x18000001
    // We need to load the patch first, then read its name
    // For now, return placeholder
    return from(Promise.resolve({
      number: patchNum,
      bankNumber,
      patchNumber,
      displayName,
      name: 'Loading...',
      isLoaded: false
    }));
  }
  
  /**
   * Get current patch number from GR-55
   */
  getCurrentPatchNumber(): Observable<number> {
    return this.gr55.getCurrentPatchNumber().pipe(
      tap(num => this.currentPatchNumber.set(num))
    );
  }
  
  // ═══════════════════════════════════════════════════════════
  // PATCH LOADING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Load a patch by number
   * This sends the patch to temporary edit buffer
   */
  loadPatch(patchNum: number): Observable<void> {
    return this.gr55.setPatchNumber(patchNum);
  }
  
  // ═══════════════════════════════════════════════════════════
  // FILE I/O (.syx)
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Read complete patch data from GR-55 temporary buffer
   * Returns full .syx file data ready for download
   */
  readCurrentPatch(): Observable<Uint8Array> {
    // GR-55 temporary patch is at 0x18000000
    // Size is approximately 0x4000 bytes (16KB)
    // We need to read in chunks
    
    return this.sysex.request(0x18000000, 0x4000).pipe(
      map(data => this.wrapInSysEx(data))
    );
  }
  
  /**
   * Save current patch to .syx file
   * Downloads file to user's computer
   */
  saveCurrentPatchToFile(filename?: string): Observable<void> {
    return new Observable(observer => {
      this.readCurrentPatch().subscribe({
        next: (sysexData) => {
          // Generate filename if not provided
          const name = filename || `gr55-patch-${Date.now()}.syx`;
          
          // Create blob and download
          const blob = new Blob([sysexData], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = name;
          link.click();
          
          URL.revokeObjectURL(url);
          
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
  
  /**
   * Load patch from .syx file
   * Reads file and sends to GR-55
   */
  loadPatchFromFile(file: File): Observable<void> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(arrayBuffer);
          
          // Parse and validate .syx file
          const patchData = this.parseSysExFile(data);
          
          // Write to GR-55 temporary buffer
          await this.sysex.write(0x18000000, Array.from(patchData));
          
          observer.next();
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };
      
      reader.onerror = () => observer.error(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  // ═══════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Format patch location as "U01-1" to "U99-9"
   */
  private formatPatchLocation(bankNumber: number, patchNumber: number): string {
    const bank = Math.floor(bankNumber / 3) + 1; // U01-U99
    const patch = (bankNumber % 3) * 3 + patchNumber + 1; // 1-9
    return `U${bank.toString().padStart(2, '0')}-${patch}`;
  }
  
  /**
   * Wrap patch data in Roland SysEx message format
   */
  private wrapInSysEx(data: number[]): Uint8Array {
    const sysex: number[] = [
      0xF0,           // SysEx start
      0x41,           // Roland
      0x00,           // Device ID
      0x00,           // Model ID (GR-55)
      0x00,
      0x53,
      0x12,           // Command (DT1 - Data Set)
      ...data,        // Patch data
      0x00,           // Checksum (calculated)
      0xF7            // SysEx end
    ];
    
    // Calculate Roland checksum
    const checksum = this.calculateChecksum(data);
    sysex[sysex.length - 2] = checksum;
    
    return new Uint8Array(sysex);
  }
  
  /**
   * Parse .syx file and extract patch data
   */
  private parseSysExFile(data: Uint8Array): Uint8Array {
    // Validate SysEx format
    if (data[0] !== 0xF0 || data[data.length - 1] !== 0xF7) {
      throw new Error('Invalid SysEx file format');
    }
    
    // Check for Roland GR-55
    if (data[1] !== 0x41 || data[5] !== 0x53) {
      throw new Error('Not a Roland GR-55 SysEx file');
    }
    
    // Extract patch data (between header and checksum/end)
    return data.slice(7, data.length - 2);
  }
  
  /**
   * Calculate Roland checksum
   */
  private calculateChecksum(data: number[]): number {
    let sum = 0;
    for (const byte of data) {
      sum += byte;
    }
    return (128 - (sum % 128)) & 0x7F;
  }
  
  /**
   * Get patch info by number
   */
  getPatchInfo(patchNum: number): PatchInfo | undefined {
    return this.patches().find(p => p.number === patchNum);
  }
  
  /**
   * Search patches by name
   */
  searchPatches(query: string): PatchInfo[] {
    const q = query.toLowerCase();
    return this.patches().filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q)
    );
  }
}
