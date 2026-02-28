/**
 * GR-55 Export Service
 *
 * Handles exporting patches from the OPFS library back to the GR-55 hardware,
 * or saving them as files on the user's computer.
 *
 * Hardware export strategy
 * ─────────────────────────
 * Patches stored in OPFS are either:
 *   a) JSON snapshots produced by Gr55ImportService (PatchSnapshot format)
 *   b) Raw SysEx blobs imported from .syx files
 *
 * For JSON snapshots, we decode the parameter map and call writeAllParameters()
 * to restore each parameter to the GR-55 edit buffer.  For raw SysEx blobs we
 * stream the DT1 messages directly.
 *
 * Writing to a specific user slot: after restoring to the edit buffer the
 * caller should invoke "Write" on the GR-55 itself (the device requires the
 * user to confirm the slot destination via its own UI, or we can trigger a
 * write via the appropriate SysEx command once that is mapped).
 *
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, inject, signal } from '@angular/core';
import { Gr55ProtocolService } from '../midi/gr55-protocol.service';
import { OpfsLibraryService } from './opfs-library.service';
import { getAllFields } from '../../data/gr55-address-map';
import { PatchSnapshot } from './gr55-import.service';

export interface ExportProgress {
  current: number;
  total: number;
  status: 'preparing' | 'writing' | 'complete' | 'error';
  error?: string;
}

function getPatchFields() {
  return getAllFields().filter(f =>
    f.address >= 0x18000000 && f.address < 0x19000000
  );
}

@Injectable({ providedIn: 'root' })
export class Gr55ExportService {
  private gr55 = inject(Gr55ProtocolService);
  private opfs = inject(OpfsLibraryService);

  exportProgress = signal<ExportProgress | null>(null);
  isExporting = signal(false);

  // ═══════════════════════════════════════════════════════════
  // EXPORT TO GR-55 HARDWARE
  // ═══════════════════════════════════════════════════════════

  /**
   * Restore a patch from OPFS to the GR-55 edit buffer.
   *
   * After this call the patch is "loaded" in the GR-55 as if the user had
   * selected it — the user can then save it to any user slot from the device.
   */
  async exportToGR55(patchId: string): Promise<void> {
    this.isExporting.set(true);
    const fields = getPatchFields();

    this.exportProgress.set({ current: 0, total: fields.length, status: 'preparing' });

    try {
      const { sysexData } = await this.opfs.loadPatch(patchId);

      this.exportProgress.update(p => p ? { ...p, status: 'writing' } : null);

      // Detect format
      if (sysexData[0] === 0x7B /* JSON '{' */) {
        await this.writeJsonSnapshotToHardware(sysexData, fields);
      } else if (sysexData[0] === 0xF0) {
        await this.writeSyxToHardware(sysexData);
      } else {
        throw new Error('Unknown patch data format');
      }

      this.exportProgress.update(p => p ? { ...p, current: fields.length, status: 'complete' } : null);

    } catch (err) {
      this.exportProgress.update(p => p ? {
        ...p, status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      } : null);
      throw err;
    } finally {
      this.isExporting.set(false);
    }
  }

  /**
   * Restore multiple patches to the GR-55 in sequence.
   * Each patch is written to the edit buffer; between each one we trigger
   * a hardware write to the corresponding user slot.
   */
  async exportMultipleToGR55(patchIds: string[], startingSlot: number): Promise<void> {
    for (let i = 0; i < patchIds.length; i++) {
      const targetSlot = startingSlot + i;
      if (targetSlot >= 297) {
        throw new Error('Cannot write beyond user patch range (slot 0–296)');
      }
      await this.exportToGR55(patchIds[i]);
      // Write the edit buffer to the target user slot
      await this.gr55.writePatchToSlot(targetSlot);
      await this.delay(200);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // EXPORT TO FILES
  // ═══════════════════════════════════════════════════════════

  /**
   * Export a single patch to a .json snapshot file (our format) or .syx
   * (if the stored data is raw SysEx).
   */
  async exportToFile(patchId: string): Promise<void> {
    const { sysexData, metadata } = await this.opfs.loadPatch(patchId);
    const baseName = this.sanitizeFilename(metadata.name);

    if (sysexData[0] === 0x7B) {
      this.downloadFile(sysexData, `${baseName}.json`, 'application/json');
    } else {
      this.downloadFile(sysexData, `${baseName}.syx`, 'application/octet-stream');
    }
  }

  async exportMultipleToFiles(patchIds: string[]): Promise<void> {
    for (const id of patchIds) {
      await this.exportToFile(id);
      await this.delay(200);
    }
  }

  async exportLibraryAsZip(): Promise<void> {
    const allPatches = await this.opfs.getAllPatches();
    await this.exportMultipleToFiles(allPatches.map(p => p.id));
  }

  // ═══════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  private async writeJsonSnapshotToHardware(
    data: Uint8Array,
    fields: ReturnType<typeof getPatchFields>
  ): Promise<void> {
    const snapshot = JSON.parse(new TextDecoder().decode(data)) as PatchSnapshot;
    if (!snapshot.parameters) throw new Error('Invalid snapshot: missing parameters');

    await this.gr55.writeAllParameters(
      snapshot.parameters,
      fields,
      (done, total) => this.exportProgress.update(p =>
        p ? { ...p, current: done, total } : null
      )
    );
  }

  private async writeSyxToHardware(data: Uint8Array): Promise<void> {
    // Raw SysEx: parse each F0...F7 message and send via sysex service
    // We delegate to the protocol service's raw send capability
    await this.gr55.sendRawSysEx(Array.from(data));
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9_\-\s]/gi, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50) || 'patch';
  }

  private downloadFile(data: Uint8Array, filename: string, mimeType: string): void {
    const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  clearProgress(): void { this.exportProgress.set(null); }
}
