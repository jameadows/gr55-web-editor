/**
 * Librarian Component
 * 
 * Main UI for managing the OPFS patch library.
 * Provides search, filter, and batch operations on patches.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OpfsLibraryService } from '../../core/services/opfs-library.service';
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
  
  // State signals
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  selectedTags = signal<string[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');
  selectedPatches = signal<Set<string>>(new Set());
  
  // Computed signals
  allPatches = this.opfsLibrary.patches;
  isLoading = this.opfsLibrary.isLoading;
  isInitialized = this.opfsLibrary.isInitialized;
  
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
    // TODO: Implement loading patch to editor
    console.log('Load patch to editor:', id);
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
}

// Missing inject import
import { inject } from '@angular/core';
