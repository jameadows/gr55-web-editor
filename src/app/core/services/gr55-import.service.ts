/**
 * GR-55 Import Service
 * 
 * Handles importing patches from the GR-55 hardware to OPFS library.
 * Supports single patch, multiple patches, and bulk import of all 297 patches.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, inject, signal } from '@angular/core';
import { Gr55ProtocolService } from './gr55-protocol.service';
import { OpfsLibraryService } from './opfs-library.service';
import { PatchMetadata } from '../models/patch-metadata';

export interface ImportProgress {
  current: number;
  total: number;
  currentSlot?: number;
  status: 'preparing' | 'importing' | 'complete' | 'error';
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Gr55ImportService {
  private gr55 = inject(Gr55ProtocolService);
  private opfs = inject(OpfsLibraryService);
  
  // Progress tracking
  importProgress = signal<ImportProgress | null>(null);
  isImporting = signal(false);
  
  // ═══════════════════════════════════════════════════════════
  // IMPORT FROM GR-55
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Import a single patch from GR-55
   */
  async importSinglePatch(slot: number, customName?: string): Promise<string> {
    this.isImporting.set(true);
    this.importProgress.set({
      current: 0,
      total: 1,
      currentSlot: slot,
      status: 'preparing'
    });
    
    try {
      // Read entire patch data from GR-55
      const patchData = await this.readPatchFromGR55(slot);
      
      this.importProgress.update(p => p ? { ...p, status: 'importing' } : null);
      
      // Extract patch name if not provided
      const patchName = customName || this.extractPatchName(patchData) || `Patch ${slot + 1}`;
      
      // Save to OPFS
      const id = await this.opfs.savePatch(patchData, {
        name: patchName,
        originalSlot: slot,
        importSource: 'gr55',
        importDate: new Date().toISOString()
      });
      
      this.importProgress.update(p => p ? { 
        ...p, 
        current: 1, 
        status: 'complete' 
      } : null);
      
      return id;
    } catch (error) {
      this.importProgress.update(p => p ? {
        ...p,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
      throw error;
    } finally {
      this.isImporting.set(false);
    }
  }
  
  /**
   * Import multiple patches from GR-55
   */
  async importMultiplePatches(slots: number[]): Promise<string[]> {
    this.isImporting.set(true);
    this.importProgress.set({
      current: 0,
      total: slots.length,
      status: 'preparing'
    });
    
    const ids: string[] = [];
    
    try {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        
        this.importProgress.update(p => p ? {
          ...p,
          current: i,
          currentSlot: slot,
          status: 'importing'
        } : null);
        
        // Read patch from GR-55
        const patchData = await this.readPatchFromGR55(slot);
        const patchName = this.extractPatchName(patchData) || `Patch ${slot + 1}`;
        
        // Save to OPFS
        const id = await this.opfs.savePatch(patchData, {
          name: patchName,
          originalSlot: slot,
          importSource: 'gr55',
          importDate: new Date().toISOString()
        });
        
        ids.push(id);
        
        // Small delay to avoid overwhelming the GR-55
        await this.delay(100);
      }
      
      this.importProgress.update(p => p ? {
        ...p,
        current: slots.length,
        status: 'complete'
      } : null);
      
      return ids;
    } catch (error) {
      this.importProgress.update(p => p ? {
        ...p,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
      throw error;
    } finally {
      this.isImporting.set(false);
    }
  }
  
  /**
   * Import all 297 patches from GR-55
   */
  async importAllPatches(onProgress?: (progress: ImportProgress) => void): Promise<string[]> {
    const totalPatches = 297; // GR-55 has 297 patches (99 user + 99 preset × 2)
    
    this.isImporting.set(true);
    this.importProgress.set({
      current: 0,
      total: totalPatches,
      status: 'preparing'
    });
    
    const ids: string[] = [];
    
    try {
      for (let slot = 0; slot < totalPatches; slot++) {
        this.importProgress.update(p => p ? {
          ...p,
          current: slot,
          currentSlot: slot,
          status: 'importing'
        } : null);
        
        // Call optional progress callback
        if (onProgress && this.importProgress()) {
          onProgress(this.importProgress()!);
        }
        
        // Read patch from GR-55
        const patchData = await this.readPatchFromGR55(slot);
        const patchName = this.extractPatchName(patchData) || `Patch ${slot + 1}`;
        
        // Save to OPFS
        const id = await this.opfs.savePatch(patchData, {
          name: patchName,
          originalSlot: slot,
          importSource: 'gr55',
          importDate: new Date().toISOString()
        });
        
        ids.push(id);
        
        // Small delay to avoid overwhelming the GR-55
        await this.delay(50);
      }
      
      this.importProgress.update(p => p ? {
        ...p,
        current: totalPatches,
        status: 'complete'
      } : null);
      
      return ids;
    } catch (error) {
      this.importProgress.update(p => p ? {
        ...p,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
      throw error;
    } finally {
      this.isImporting.set(false);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // IMPORT FROM FILES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Import a single .syx file
   */
  async importFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const sysexData = new Uint8Array(arrayBuffer);
    
    // Validate SysEx data
    if (!this.isValidSysEx(sysexData)) {
      throw new Error('Invalid SysEx file');
    }
    
    // Extract name from filename (remove .syx extension)
    const fileName = file.name.replace(/\.syx$/i, '');
    const patchName = this.extractPatchName(sysexData) || fileName;
    
    // Save to OPFS
    return await this.opfs.savePatch(sysexData, {
      name: patchName,
      importSource: 'file',
      importDate: new Date().toISOString()
    });
  }
  
  /**
   * Import multiple .syx files
   */
  async importMultipleFiles(files: FileList | File[]): Promise<string[]> {
    const fileArray = Array.from(files);
    
    this.isImporting.set(true);
    this.importProgress.set({
      current: 0,
      total: fileArray.length,
      status: 'preparing'
    });
    
    const ids: string[] = [];
    
    try {
      for (let i = 0; i < fileArray.length; i++) {
        this.importProgress.update(p => p ? {
          ...p,
          current: i,
          status: 'importing'
        } : null);
        
        const id = await this.importFromFile(fileArray[i]);
        ids.push(id);
      }
      
      this.importProgress.update(p => p ? {
        ...p,
        current: fileArray.length,
        status: 'complete'
      } : null);
      
      return ids;
    } catch (error) {
      this.importProgress.update(p => p ? {
        ...p,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
      throw error;
    } finally {
      this.isImporting.set(false);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Read a complete patch from GR-55
   */
  private async readPatchFromGR55(slot: number): Promise<Uint8Array> {
    // GR-55 patch size is approximately 16KB
    // Base address for patches varies by slot
    const baseAddress = this.getPatchBaseAddress(slot);
    const patchSize = 16384; // 16KB typical patch size
    
    // Read entire patch data
    // This would use the GR55ProtocolService to read the memory range
    // For now, this is a placeholder - actual implementation would read via MIDI
    
    // TODO: Implement actual MIDI read operation
    // return await this.gr55.readMemoryRange(baseAddress, patchSize);
    
    // Placeholder: Create dummy data for development
    const dummyData = new Uint8Array(patchSize);
    return dummyData;
  }
  
  /**
   * Get the base address for a patch slot
   */
  private getPatchBaseAddress(slot: number): number {
    // GR-55 memory map (simplified)
    // User patches: 0-98 (slots 0-98)
    // Preset patches 1: 99-197 (slots 99-197)
    // Preset patches 2: 198-296 (slots 198-296)
    
    const PATCH_SIZE = 0x4000; // 16KB per patch
    const USER_BASE = 0x10000000;
    const PRESET1_BASE = 0x20000000;
    const PRESET2_BASE = 0x30000000;
    
    if (slot < 99) {
      // User patches
      return USER_BASE + (slot * PATCH_SIZE);
    } else if (slot < 198) {
      // Preset bank 1
      return PRESET1_BASE + ((slot - 99) * PATCH_SIZE);
    } else {
      // Preset bank 2
      return PRESET2_BASE + ((slot - 198) * PATCH_SIZE);
    }
  }
  
  /**
   * Extract patch name from SysEx data
   */
  private extractPatchName(sysexData: Uint8Array): string | null {
    // GR-55 patch names are stored at a specific offset
    // This is a simplified implementation
    // TODO: Implement actual name extraction from SysEx data
    return null;
  }
  
  /**
   * Validate SysEx data
   */
  private isValidSysEx(data: Uint8Array): boolean {
    // Basic validation: SysEx should start with 0xF0 and end with 0xF7
    return data.length > 0 && 
           data[0] === 0xF0 && 
           data[data.length - 1] === 0xF7;
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Clear import progress
   */
  clearProgress(): void {
    this.importProgress.set(null);
  }
}
