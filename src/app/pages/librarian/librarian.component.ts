/**
 * Librarian Component
 * 
 * Main UI for managing the OPFS patch library.
 * Provides search, filter, and batch operations on patches.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OpfsLibraryService } from '../../core/services/opfs-library.service';
import { Gr55ImportService } from '../../core/services/gr55-import.service';
import { Gr55ExportService } from '../../core/services/gr55-export.service';
import { MidiIoService } from '../../core/midi/midi-io.service';
import { Gr55ProtocolService } from '../../core/midi/gr55-protocol.service';
import { PatchMetadata } from '../../core/models/patch-metadata';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-librarian',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './librarian.component.html',
  styleUrl: './librarian.component.css'
})
export class LibrarianComponent implements OnInit {
  // Inject services
  private opfsLibrary = inject(OpfsLibraryService);
  private importService = inject(Gr55ImportService);
  private exportService = inject(Gr55ExportService);
  private midiIo = inject(MidiIoService);
  private gr55 = inject(Gr55ProtocolService);
  private router = inject(Router);
  
  // State signals
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  selectedTags = signal<string[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');
  selectedPatches = signal<Set<string>>(new Set());
  showImportDialog = signal(false);
  showExportDialog = signal(false);
  exportTargetPatch = signal<string | null>(null);
  
  // Computed signals
  allPatches = this.opfsLibrary.patches;
  isLoading = this.opfsLibrary.isLoading;
  isInitialized = this.opfsLibrary.isInitialized;
  isConnected = this.midiIo.isConnected;
  isImporting = this.importService.isImporting;
  importProgress = this.importService.importProgress;
  
  filteredPatches = computed(() => {
    let patches = this.allPatches();
    
    // Apply search
    if (this.searchQuery()) {
      patches = this.opfsLibrary.searchPatches(this.searchQuery());
    }
    
    // Apply category filter
    if (this.selectedCategory()) {
      patches = patches.filter(p => p.category === this.selectedCategory());
    }
    
    // Apply tag filter
    if (this.selectedTags().length > 0) {
      patches = patches.filter(p => 
        this.selectedTags().every(tag => p.tags.includes(tag))
      );
    }
    
    return patches;
  });
  
  stats = computed(() => this.opfsLibrary.getLibraryStats());
  
  categories = computed(() => {
    const stats = this.stats();
    return Array.from(stats.categories.keys()).sort();
  });
  
  allTags = computed(() => {
    const stats = this.stats();
    return Array.from(stats.tags.keys()).sort();
  });
  
  ngOnInit() {
    this.initializeLibrary();
  }
  
  private async initializeLibrary() {
    try {
      await this.opfsLibrary.initialize();
    } catch (error) {
      console.error('Failed to initialize OPFS library:', error);
      alert('Failed to initialize patch library. OPFS may not be supported in this browser.');
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // SEARCH & FILTER
  // ═══════════════════════════════════════════════════════════
  
  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }
  
  onCategorySelect(category: string | null) {
    this.selectedCategory.set(category);
  }
  
  onTagToggle(tag: string) {
    const tags = new Set(this.selectedTags());
    if (tags.has(tag)) {
      tags.delete(tag);
    } else {
      tags.add(tag);
    }
    this.selectedTags.set(Array.from(tags));
  }
  
  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
    this.selectedTags.set([]);
  }
  
  // ═══════════════════════════════════════════════════════════
  // SELECTION
  // ═══════════════════════════════════════════════════════════
  
  togglePatchSelection(id: string) {
    const selected = new Set(this.selectedPatches());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedPatches.set(selected);
  }
  
  selectAll() {
    const ids = new Set(this.filteredPatches().map(p => p.id));
    this.selectedPatches.set(ids);
  }
  
  selectNone() {
    this.selectedPatches.set(new Set());
  }
  
  isSelected(id: string): boolean {
    return this.selectedPatches().has(id);
  }
  
  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════
  
  async deletePatch(id: string) {
    const confirmed = confirm('Delete this patch from the library?');
    if (!confirmed) return;
    
    try {
      await this.opfsLibrary.deletePatch(id);
    } catch (error) {
      console.error('Failed to delete patch:', error);
      alert('Failed to delete patch');
    }
  }
  
  async deleteSelected() {
    const count = this.selectedPatches().size;
    const confirmed = confirm(`Delete ${count} selected patches from the library?`);
    if (!confirmed) return;
    
    try {
      const ids = Array.from(this.selectedPatches());
      for (const id of ids) {
        await this.opfsLibrary.deletePatch(id);
      }
      this.selectNone();
    } catch (error) {
      console.error('Failed to delete patches:', error);
      alert('Failed to delete patches');
    }
  }
  
  async loadPatchToEditor(id: string) {
    if (!this.isConnected()) {
      const shouldContinue = confirm(
        'MIDI not connected. Load patch for offline editing?\n\n' +
        'You can view and edit parameters, but cannot send to GR-55 until connected.'
      );
      if (!shouldContinue) return;
    }
    
    try {
      // Load patch from OPFS
      const { sysexData } = await this.opfsLibrary.loadPatch(id);
      
      // Write patch to GR-55 temporary editing buffer (if connected)
      if (this.isConnected()) {
        // Note: writePatch returns an Observable, need to convert to Promise
        await new Promise<void>((resolve, reject) => {
          this.gr55.writePatch(sysexData).subscribe({
            next: () => resolve(),
            error: (err) => reject(err)
          });
        });
      }
      
      // Navigate to editor
      this.router.navigate(['/editor']);
      
      // The editor will read the patch from GR-55 on load
    } catch (error) {
      console.error('Failed to load patch to editor:', error);
      alert('Failed to load patch to editor');
    }
  }
  
  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }
  
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  
  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString();
  }
  
  // ═══════════════════════════════════════════════════════════
  // IMPORT OPERATIONS
  // ═══════════════════════════════════════════════════════════
  
  async importFromGR55Single() {
    if (!this.isConnected()) {
      alert('Please connect to GR-55 first');
      return;
    }
    
    const slotStr = prompt('Enter GR-55 slot number (1-297):');
    if (!slotStr) return;
    
    const slot = parseInt(slotStr) - 1; // Convert to 0-indexed
    if (isNaN(slot) || slot < 0 || slot >= 297) {
      alert('Invalid slot number. Must be 1-297.');
      return;
    }
    
    try {
      await this.importService.importSinglePatch(slot);
      alert('Patch imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import patch');
    }
  }
  
  async importFromGR55All() {
    if (!this.isConnected()) {
      alert('Please connect to GR-55 first');
      return;
    }
    
    const confirmed = confirm(
      'Import all 297 patches from GR-55?\n\nThis will take several minutes.'
    );
    if (!confirmed) return;
    
    try {
      await this.importService.importAllPatches();
      alert('All patches imported successfully!');
    } catch (error) {
      console.error('Bulk import failed:', error);
      alert('Failed to import patches');
    }
  }
  
  async importFromFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.syx';
    input.multiple = true;
    
    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;
      
      try {
        const ids = await this.importService.importMultipleFiles(input.files);
        alert(`Imported ${ids.length} patch(es) successfully!`);
      } catch (error) {
        console.error('File import failed:', error);
        alert('Failed to import files');
      }
    };
    
    input.click();
  }
  
  // ═══════════════════════════════════════════════════════════
  // EXPORT OPERATIONS
  // ═══════════════════════════════════════════════════════════
  
  async exportPatchToFile(id: string) {
    try {
      await this.exportService.exportToFile(id);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export patch');
    }
  }
  
  async exportSelectedToFiles() {
    if (this.selectedPatches().size === 0) {
      alert('No patches selected');
      return;
    }
    
    try {
      const ids = Array.from(this.selectedPatches());
      await this.exportService.exportMultipleToFiles(ids);
      alert(`Exported ${ids.length} patch(es) successfully!`);
    } catch (error) {
      console.error('Batch export failed:', error);
      alert('Failed to export patches');
    }
  }
  
  async exportPatchToGR55(id: string) {
    if (!this.isConnected()) {
      alert('Please connect to GR-55 first');
      return;
    }
    
    const slotStr = prompt('Enter target GR-55 slot (1-99, user patches only):');
    if (!slotStr) return;
    
    const slot = parseInt(slotStr) - 1; // Convert to 0-indexed
    if (isNaN(slot) || slot < 0 || slot >= 99) {
      alert('Invalid slot number. Must be 1-99 (user patches only).');
      return;
    }
    
    const confirmed = confirm(
      `Overwrite GR-55 slot ${slot + 1}?\n\nThis will replace the current patch in that slot.`
    );
    if (!confirmed) return;
    
    try {
      await this.exportService.exportToGR55(id, slot);
      alert('Patch exported to GR-55 successfully!');
    } catch (error) {
      console.error('Export to GR-55 failed:', error);
      alert('Failed to export patch to GR-55');
    }
  }
}

// Missing inject import - moved to top
// import { inject } from '@angular/core';
