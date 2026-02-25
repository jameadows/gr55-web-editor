/**
 * Patch Library Component
 * 
 * Browse, load, and save GR-55 patches.
 * Manages the complete patch library with file I/O.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MidiIoService, PatchLibraryService, Gr55ProtocolService, PatchInfo } from '../../core/midi';

@Component({
  selector: 'app-patch-library',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './patch-library.component.html',
  styleUrl: './patch-library.component.css'
})
export class PatchLibraryComponent implements OnInit {
  private midiIo = inject(MidiIoService);
  private patchLib = inject(PatchLibraryService);
  private gr55 = inject(Gr55ProtocolService);
  private router = inject(Router);
  
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  isConnected = this.midiIo.isConnected;
  patches = this.patchLib.patches;
  isLoading = this.patchLib.isLoading;
  currentPatchNumber = this.patchLib.currentPatchNumber;
  currentPatchName = signal('—');
  
  searchQuery = signal('');
  selectedPatch = signal<PatchInfo | null>(null);
  
  // Filter and sort
  filteredPatches = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allPatches = this.patches();
    
    if (!query) return allPatches;
    
    return allPatches.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.displayName.toLowerCase().includes(query)
    );
  });
  
  // ═══════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════
  
  ngOnInit() {
    if (!this.isConnected()) {
      // Show connection prompt
      return;
    }
    
    // Load current patch info
    this.loadCurrentPatchInfo();
    
    // Generate patch list (quick version - names loaded on demand)
    this.generatePatchList();
  }
  
  // ═══════════════════════════════════════════════════════════
  // PATCH OPERATIONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Load current patch information
   */
  loadCurrentPatchInfo() {
    this.patchLib.getCurrentPatchNumber().subscribe({
      next: (num) => {
        console.log('Current patch number:', num);
        // Also read patch name
        this.gr55.getPatchName().subscribe({
          next: (name) => this.currentPatchName.set(name),
          error: (e) => console.error('Failed to read patch name:', e)
        });
      },
      error: (e) => console.error('Failed to read patch number:', e)
    });
  }
  
  /**
   * Generate patch list with placeholders
   * Names will be loaded on demand
   */
  generatePatchList() {
    const patches: PatchInfo[] = [];
    
    for (let i = 0; i < 297; i++) {
      const bankNumber = Math.floor(i / 3);
      const patchNumber = i % 3;
      const bank = Math.floor(bankNumber / 3) + 1;
      const patch = (bankNumber % 3) * 3 + patchNumber + 1;
      const displayName = `U${bank.toString().padStart(2, '0')}-${patch}`;
      
      patches.push({
        number: i,
        bankNumber,
        patchNumber,
        displayName,
        name: '',  // Load on demand
        isLoaded: i === this.currentPatchNumber()
      });
    }
    
    this.patchLib.patches.set(patches);
  }
  
  /**
   * Load a patch by clicking on it
   */
  onPatchClick(patch: PatchInfo) {
    this.selectedPatch.set(patch);
  }
  
  /**
   * Load selected patch to GR-55
   */
  loadSelectedPatch() {
    const patch = this.selectedPatch();
    if (!patch) return;
    
    this.isLoading.set(true);
    
    this.patchLib.loadPatch(patch.number).subscribe({
      next: () => {
        console.log('Patch loaded:', patch.displayName);
        this.currentPatchNumber.set(patch.number);
        
        // Read the patch name
        setTimeout(() => {
          this.gr55.getPatchName().subscribe({
            next: (name) => {
              this.currentPatchName.set(name);
              this.isLoading.set(false);
              
              // Navigate to editor to edit the patch
              this.router.navigate(['/editor']);
            },
            error: (e) => {
              console.error('Failed to read patch name:', e);
              this.isLoading.set(false);
            }
          });
        }, 100);
      },
      error: (e) => {
        console.error('Failed to load patch:', e);
        this.isLoading.set(false);
        alert('Failed to load patch: ' + e.message);
      }
    });
  }
  
  /**
   * Save current patch to .syx file
   */
  saveCurrentPatch() {
    const name = this.currentPatchName();
    const filename = `gr55-${name.replace(/[^a-z0-9]/gi, '_')}.syx`;
    
    this.isLoading.set(true);
    
    this.patchLib.saveCurrentPatchToFile(filename).subscribe({
      next: () => {
        console.log('Patch saved:', filename);
        this.isLoading.set(false);
        alert('Patch saved to: ' + filename);
      },
      error: (e) => {
        console.error('Failed to save patch:', e);
        this.isLoading.set(false);
        alert('Failed to save patch: ' + e.message);
      }
    });
  }
  
  /**
   * Load patch from .syx file
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    this.isLoading.set(true);
    
    this.patchLib.loadPatchFromFile(file).subscribe({
      next: () => {
        console.log('Patch loaded from file:', file.name);
        this.isLoading.set(false);
        alert('Patch loaded from file! Go to Editor to see changes.');
        
        // Refresh current patch info
        this.loadCurrentPatchInfo();
      },
      error: (e) => {
        console.error('Failed to load patch from file:', e);
        this.isLoading.set(false);
        alert('Failed to load patch: ' + e.message);
      }
    });
    
    // Reset input
    input.value = '';
  }
  
  /**
   * Go to editor to edit current patch
   */
  editCurrentPatch() {
    this.router.navigate(['/editor']);
  }
  
  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery.set('');
  }
}
