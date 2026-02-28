/**
 * GR-55 Import Service
 *
 * Handles importing patches from the GR-55 hardware to the OPFS library,
 * and importing .syx / snapshot files from the user's computer.
 *
 * Hardware import strategy
 * ─────────────────────────
 * The GR-55 keeps the "active" patch in an edit buffer at 0x18000000.
 * We read all known patch parameters from that buffer and store them as a
 * structured JSON payload in OPFS.  To capture a specific slot the caller
 * should navigate the GR-55 to that slot first (or use importMultiplePatches
 * which does that automatically via selectPatch()).
 *
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, inject, signal } from '@angular/core';
import { Gr55ProtocolService } from '../midi/gr55-protocol.service';
import { OpfsLibraryService } from './opfs-library.service';
import { getAllFields } from '../../data/gr55-address-map';

export interface ImportProgress {
  current: number;
  total: number;
  currentSlot?: number;
  status: 'preparing' | 'importing' | 'complete' | 'error';
  error?: string;
}

/** Wire format stored in OPFS for a hardware-captured patch. */
export interface PatchSnapshot {
  version: 1;
  source: 'gr55-hardware' | 'syx-file';
  capturedAt: string;
  /** Keyed by "0x1800xxxx" hex address strings — raw decoded value */
  parameters: Record<string, unknown>;
}

/** Fields in the edit buffer address range */
function getPatchFields() {
  return getAllFields().filter(f =>
    f.address >= 0x18000000 && f.address < 0x19000000
  );
}

@Injectable({ providedIn: 'root' })
export class Gr55ImportService {
  private gr55 = inject(Gr55ProtocolService);
  private opfs = inject(OpfsLibraryService);

  importProgress = signal<ImportProgress | null>(null);
  isImporting = signal(false);

  // ═══════════════════════════════════════════════════════════
  // HARDWARE IMPORT
  // ═══════════════════════════════════════════════════════════

  /**
   * Snapshot the currently loaded patch from the GR-55 edit buffer.
   * Returns the OPFS id of the saved record.
   */
  async importCurrentPatch(customName?: string): Promise<string> {
    this.isImporting.set(true);
    const fields = getPatchFields();

    this.importProgress.set({ current: 0, total: fields.length, status: 'preparing' });

    try {
      this.importProgress.update(p => p ? { ...p, status: 'importing' } : null);

      const paramMap = await this.gr55.readAllParameters(
        fields,
        (done, total) => this.importProgress.update(p =>
          p ? { ...p, current: done, total } : null
        )
      );

      let patchName = customName;
      if (!patchName) {
        const raw = paramMap['0x18000001'];
        if (raw) {
          patchName = String(raw).trim().replace(/\0/g, '').trim() || undefined;
        }
        patchName = patchName || 'Imported Patch';
      }

      const snapshot: PatchSnapshot = {
        version: 1,
        source: 'gr55-hardware',
        capturedAt: new Date().toISOString(),
        parameters: paramMap
      };

      const jsonBytes = new TextEncoder().encode(JSON.stringify(snapshot));
      const id = await this.opfs.savePatch(jsonBytes, {
        name: patchName,
        importSource: 'gr55',
        importDate: new Date().toISOString()
      });

      this.importProgress.update(p => p ? { ...p, current: fields.length, status: 'complete' } : null);
      return id;

    } catch (err) {
      this.importProgress.update(p => p ? {
        ...p, status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      } : null);
      throw err;
    } finally {
      this.isImporting.set(false);
    }
  }

  /**
   * Bulk import: navigate to each slot, then snapshot.
   */
  async importMultiplePatches(slots: number[], customNames?: string[]): Promise<string[]> {
    this.isImporting.set(true);
    this.importProgress.set({ current: 0, total: slots.length, status: 'preparing' });
    const ids: string[] = [];

    try {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        this.importProgress.update(p => p ? { ...p, current: i, currentSlot: slot, status: 'importing' } : null);

        await this.gr55.selectPatch(slot);
        await this.delay(400); // let GR-55 load the patch into its edit buffer

        const id = await this.importCurrentPatch(customNames?.[i]);
        ids.push(id);
        await this.delay(100);
      }

      this.importProgress.update(p => p ? { ...p, current: slots.length, status: 'complete' } : null);
      return ids;

    } catch (err) {
      this.importProgress.update(p => p ? {
        ...p, status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      } : null);
      throw err;
    } finally {
      this.isImporting.set(false);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FILE IMPORT
  // ═══════════════════════════════════════════════════════════

  async importFromFile(file: File): Promise<string> {
    const data = new Uint8Array(await file.arrayBuffer());
    const baseName = file.name.replace(/\.(syx|json)$/i, '');

    // JSON snapshot (starts with '{')
    if (data[0] === 0x7B) {
      const snapshot = JSON.parse(new TextDecoder().decode(data)) as PatchSnapshot;
      if (!snapshot.parameters) throw new Error('Invalid GR-55 snapshot file');

      let name = baseName;
      const raw = snapshot.parameters['0x18000001'];
      if (raw) {
        const n = String(raw).trim().replace(/\0/g, '').trim();
        if (n) name = n;
      }
      return this.opfs.savePatch(data, { name, importSource: 'file', importDate: new Date().toISOString() });
    }

    // Raw SysEx
    if (data[0] !== 0xF0 || data[data.length - 1] !== 0xF7) {
      throw new Error('Invalid SysEx file: missing F0/F7 framing');
    }
    return this.opfs.savePatch(data, { name: baseName, importSource: 'file', importDate: new Date().toISOString() });
  }

  async importMultipleFiles(files: FileList | File[]): Promise<string[]> {
    const list = Array.from(files);
    this.isImporting.set(true);
    this.importProgress.set({ current: 0, total: list.length, status: 'preparing' });
    const ids: string[] = [];

    try {
      for (let i = 0; i < list.length; i++) {
        this.importProgress.update(p => p ? { ...p, current: i, status: 'importing' } : null);
        ids.push(await this.importFromFile(list[i]));
      }
      this.importProgress.update(p => p ? { ...p, current: list.length, status: 'complete' } : null);
      return ids;
    } catch (err) {
      this.importProgress.update(p => p ? {
        ...p, status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      } : null);
      throw err;
    } finally {
      this.isImporting.set(false);
    }
  }

  clearProgress(): void { this.importProgress.set(null); }

  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}
