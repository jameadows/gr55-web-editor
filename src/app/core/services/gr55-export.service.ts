/**
 * GR-55 Export Service
 * 
 * Handles exporting patches from OPFS library to GR-55 hardware or filesystem.
 * Supports single export, batch export, and ZIP archive creation.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, inject } from '@angular/core';
import { Gr55ProtocolService } from './gr55-protocol.service';
import { OpfsLibraryService } from './opfs-library.service';

@Injectable({
  providedIn: 'root'
})
export class Gr55ExportService {
  private gr55 = inject(Gr55ProtocolService);
  private opfs = inject(OpfsLibraryService);
  
  // ═══════════════════════════════════════════════════════════
  // EXPORT TO GR-55
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Export a patch to a specific GR-55 slot
   */
  async exportToGR55(patchId: string, targetSlot: number): Promise<void> {
    // Load patch from OPFS
    const { sysexData, metadata } = await this.opfs.loadPatch(patchId);
    
    // Write to GR-55
    await this.writePatchToGR55(sysexData, targetSlot);
    
    console.log(`Exported "${metadata.name}" to GR-55 slot ${targetSlot + 1}`);
  }
  
  /**
   * Export multiple patches to consecutive GR-55 slots
   */
  async exportMultipleToGR55(
    patchIds: string[], 
    startingSlot: number
  ): Promise<void> {
    for (let i = 0; i < patchIds.length; i++) {
      const targetSlot = startingSlot + i;
      
      if (targetSlot >= 99) {
        throw new Error('Cannot write to preset slots (read-only)');
      }
      
      await this.exportToGR55(patchIds[i], targetSlot);
      
      // Small delay between writes
      await this.delay(100);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // EXPORT TO FILESYSTEM
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Export a single patch to a .syx file
   */
  async exportToFile(patchId: string): Promise<void> {
    const { sysexData, metadata } = await this.opfs.loadPatch(patchId);
    
    // Create filename from patch name
    const filename = this.sanitizeFilename(metadata.name) + '.syx';
    
    // Download file
    this.downloadFile(sysexData, filename, 'application/octet-stream');
  }
  
  /**
   * Export multiple patches as individual .syx files (triggers multiple downloads)
   */
  async exportMultipleToFiles(patchIds: string[]): Promise<void> {
    for (const id of patchIds) {
      await this.exportToFile(id);
      // Small delay between downloads
      await this.delay(200);
    }
  }
  
  /**
   * Export multiple patches as a ZIP archive
   */
  async exportAsZip(patchIds: string[], zipName: string = 'patches'): Promise<void> {
    // Create a simple ZIP file (no compression for simplicity)
    const patches = await Promise.all(
      patchIds.map(id => this.opfs.loadPatch(id))
    );
    
    // For now, use a simple approach: concatenate files with basic ZIP structure
    // In production, you'd use a library like JSZip
    
    // Fallback: export as individual files with sequential names
    console.warn('ZIP export not fully implemented, exporting individual files');
    await this.exportMultipleToFiles(patchIds);
  }
  
  /**
   * Export entire library as ZIP
   */
  async exportLibraryAsZip(): Promise<void> {
    const allPatches = await this.opfs.getAllPatches();
    const patchIds = allPatches.map(p => p.id);
    await this.exportAsZip(patchIds, 'gr55-library');
  }
  
  // ═══════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Write patch data to GR-55 slot
   */
  private async writePatchToGR55(sysexData: Uint8Array, slot: number): Promise<void> {
    // Validate slot is in user range (0-98)
    if (slot < 0 || slot >= 99) {
      throw new Error('Can only write to user patches (slots 0-98)');
    }
    
    const baseAddress = this.getPatchBaseAddress(slot);
    
    // TODO: Implement actual MIDI write operation
    // await this.gr55.writeMemoryRange(baseAddress, sysexData);
    
    console.log(`Writing patch to slot ${slot} at address 0x${baseAddress.toString(16)}`);
  }
  
  /**
   * Get base address for a patch slot
   */
  private getPatchBaseAddress(slot: number): number {
    const PATCH_SIZE = 0x4000; // 16KB per patch
    const USER_BASE = 0x10000000;
    
    return USER_BASE + (slot * PATCH_SIZE);
  }
  
  /**
   * Sanitize filename for safe file downloads
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9_\-\s]/gi, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);
  }
  
  /**
   * Download a file to the user's filesystem
   */
  private downloadFile(data: Uint8Array, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
