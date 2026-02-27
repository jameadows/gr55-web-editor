/**
 * OPFS Library Service
 * 
 * Core service for managing patches in the Origin Private File System (OPFS).
 * Provides persistent, high-performance storage for the working patch library.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, signal } from '@angular/core';
import { PatchMetadata, PatchData, QuotaInfo, LibraryStats } from '../models/patch-metadata';

@Injectable({
  providedIn: 'root'
})
export class OpfsLibraryService {
  // Signals for reactive state
  private patchesSignal = signal<PatchMetadata[]>([]);
  private isInitializedSignal = signal(false);
  private isLoadingSignal = signal(false);
  
  // Public readonly signals
  patches = this.patchesSignal.asReadonly();
  isInitialized = this.isInitializedSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  
  // Private state
  private root: FileSystemDirectoryHandle | null = null;
  private patchesDir: FileSystemDirectoryHandle | null = null;
  private metadataDir: FileSystemDirectoryHandle | null = null;
  
  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════
  
  async initialize(): Promise<void> {
    if (this.isInitializedSignal()) {
      return; // Already initialized
    }
    
    try {
      // Check OPFS support
      if (!await this.checkSupport()) {
        throw new Error('OPFS not supported in this browser');
      }
      
      // Get OPFS root
      this.root = await navigator.storage.getDirectory();
      
      // Create directory structure
      this.patchesDir = await this.ensureDirectory('patches');
      this.metadataDir = await this.ensureDirectory('metadata');
      await this.ensureDirectory('collections');
      await this.ensureDirectory('settings');
      
      // Load existing patches into memory
      await this.refreshIndex();
      
      this.isInitializedSignal.set(true);
      console.log('OPFS Library initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OPFS:', error);
      throw error;
    }
  }
  
  async checkSupport(): Promise<boolean> {
    return 'storage' in navigator && 
           'getDirectory' in navigator.storage;
  }
  
  async getStorageQuota(): Promise<QuotaInfo> {
    if ('estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      
      return { usage, quota, percentage };
    }
    
    return { usage: 0, quota: 0, percentage: 0 };
  }
  
  // ═══════════════════════════════════════════════════════════
  // CORE OPERATIONS
  // ═══════════════════════════════════════════════════════════
  
  async savePatch(
    sysexData: Uint8Array,
    metadata: Partial<PatchMetadata>
  ): Promise<string> {
    await this.ensureInitialized();
    
    // Generate UUID if new patch
    const id = metadata.id || crypto.randomUUID();
    
    // Save binary .syx file
    await this.savePatchFile(id, sysexData);
    
    // Create/update metadata
    const fullMetadata: PatchMetadata = {
      id,
      name: metadata.name || 'Untitled Patch',
      originalSlot: metadata.originalSlot,
      importSource: metadata.importSource || 'manual',
      importDate: metadata.importDate || new Date().toISOString(),
      category: metadata.category,
      tags: metadata.tags || [],
      notes: metadata.notes || '',
      rating: metadata.rating,
      collection: metadata.collection,
      created: metadata.created || new Date().toISOString(),
      modified: new Date().toISOString(),
      lastAccessed: metadata.lastAccessed,
      version: (metadata.version || 0) + 1,
      fileSize: sysexData.length,
      checksum: await this.calculateChecksum(sysexData)
    };
    
    await this.saveMetadata(id, fullMetadata);
    
    // Update index
    await this.refreshIndex();
    
    return id;
  }
  
  async loadPatch(id: string): Promise<PatchData> {
    await this.ensureInitialized();
    
    const [sysexData, metadata] = await Promise.all([
      this.loadPatchFile(id),
      this.loadMetadata(id)
    ]);
    
    // Update last accessed timestamp
    await this.updateMetadata(id, {
      lastAccessed: new Date().toISOString()
    });
    
    return { sysexData, metadata };
  }
  
  async deletePatch(id: string): Promise<void> {
    await this.ensureInitialized();
    
    await Promise.all([
      this.deletePatchFile(id),
      this.deleteMetadata(id)
    ]);
    
    await this.refreshIndex();
  }
  
  async updateMetadata(id: string, updates: Partial<PatchMetadata>): Promise<void> {
    await this.ensureInitialized();
    
    const metadata = await this.loadMetadata(id);
    const updatedMetadata = {
      ...metadata,
      ...updates,
      modified: new Date().toISOString(),
      version: metadata.version + 1
    };
    
    await this.saveMetadata(id, updatedMetadata);
    await this.refreshIndex();
  }
  
  // ═══════════════════════════════════════════════════════════
  // LISTING & INDEXING
  // ═══════════════════════════════════════════════════════════
  
  async getAllPatches(): Promise<PatchMetadata[]> {
    await this.ensureInitialized();
    return this.patchesSignal();
  }
  
  async refreshIndex(): Promise<void> {
    if (!this.metadataDir) return;
    
    this.isLoadingSignal.set(true);
    
    try {
      const patches: PatchMetadata[] = [];
      
      // Iterate through all metadata files using entries()
      // @ts-ignore - FileSystemDirectoryHandle iteration is experimental
      for await (const [name, entry] of this.metadataDir.entries()) {
        if (entry.kind === 'file' && name.endsWith('.json')) {
          const id = name.replace('.json', '');
          try {
            const metadata = await this.loadMetadata(id);
            patches.push(metadata);
          } catch (error) {
            console.warn(`Failed to load metadata for ${id}:`, error);
          }
        }
      }
      
      // Sort by modified date (newest first)
      patches.sort((a, b) => 
        new Date(b.modified).getTime() - new Date(a.modified).getTime()
      );
      
      this.patchesSignal.set(patches);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // SEARCH & FILTER
  // ═══════════════════════════════════════════════════════════
  
  searchPatches(query: string): PatchMetadata[] {
    const lowerQuery = query.toLowerCase();
    return this.patchesSignal().filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.notes.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      (p.category && p.category.toLowerCase().includes(lowerQuery))
    );
  }
  
  filterByCategory(category: string): PatchMetadata[] {
    return this.patchesSignal().filter(p => p.category === category);
  }
  
  filterByTags(tags: string[]): PatchMetadata[] {
    return this.patchesSignal().filter(p => 
      tags.every(tag => p.tags.includes(tag))
    );
  }
  
  filterByCollection(collectionId: string): PatchMetadata[] {
    return this.patchesSignal().filter(p => p.collection === collectionId);
  }
  
  // ═══════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════
  
  getLibraryStats(): LibraryStats {
    const patches = this.patchesSignal();
    
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();
    let totalSize = 0;
    let totalRating = 0;
    let ratedCount = 0;
    
    for (const patch of patches) {
      // Count categories
      if (patch.category) {
        categories.set(patch.category, (categories.get(patch.category) || 0) + 1);
      }
      
      // Count tags
      for (const tag of patch.tags) {
        tags.set(tag, (tags.get(tag) || 0) + 1);
      }
      
      // Sum file sizes
      totalSize += patch.fileSize;
      
      // Calculate average rating
      if (patch.rating) {
        totalRating += patch.rating;
        ratedCount++;
      }
    }
    
    return {
      totalPatches: patches.length,
      totalSize,
      categories,
      tags,
      averageRating: ratedCount > 0 ? totalRating / ratedCount : undefined
    };
  }
  
  // ═══════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════
  
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitializedSignal()) {
      await this.initialize();
    }
  }
  
  private async ensureDirectory(name: string): Promise<FileSystemDirectoryHandle> {
    if (!this.root) {
      throw new Error('OPFS root not initialized');
    }
    return await this.root.getDirectoryHandle(name, { create: true });
  }
  
  private async savePatchFile(id: string, data: Uint8Array): Promise<void> {
    if (!this.patchesDir) throw new Error('Patches directory not initialized');
    
    const fileHandle = await this.patchesDir.getFileHandle(`${id}.syx`, { create: true });
    const writable = await fileHandle.createWritable();
    // Convert to ArrayBuffer to ensure type compatibility
    await writable.write(data.buffer as ArrayBuffer);
    await writable.close();
  }
  
  private async loadPatchFile(id: string): Promise<Uint8Array> {
    if (!this.patchesDir) throw new Error('Patches directory not initialized');
    
    const fileHandle = await this.patchesDir.getFileHandle(`${id}.syx`);
    const file = await fileHandle.getFile();
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }
  
  private async deletePatchFile(id: string): Promise<void> {
    if (!this.patchesDir) throw new Error('Patches directory not initialized');
    await this.patchesDir.removeEntry(`${id}.syx`);
  }
  
  private async saveMetadata(id: string, metadata: PatchMetadata): Promise<void> {
    if (!this.metadataDir) throw new Error('Metadata directory not initialized');
    
    const json = JSON.stringify(metadata, null, 2);
    const fileHandle = await this.metadataDir.getFileHandle(`${id}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();
  }
  
  private async loadMetadata(id: string): Promise<PatchMetadata> {
    if (!this.metadataDir) throw new Error('Metadata directory not initialized');
    
    const fileHandle = await this.metadataDir.getFileHandle(`${id}.json`);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as PatchMetadata;
  }
  
  private async deleteMetadata(id: string): Promise<void> {
    if (!this.metadataDir) throw new Error('Metadata directory not initialized');
    await this.metadataDir.removeEntry(`${id}.json`);
  }
  
  private async calculateChecksum(data: Uint8Array): Promise<string> {
    // Convert to ArrayBuffer to ensure type compatibility
    const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
