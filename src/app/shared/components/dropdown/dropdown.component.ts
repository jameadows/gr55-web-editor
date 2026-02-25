/**
 * Dropdown Component
 * 
 * Select control for enum parameters (MFX types, modes, etc.).
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  // ═══════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** Selected index */
  @Input() value: number = 0;
  
  /** Option labels */
  @Input() options: string[] = [];
  
  /** Parameter label */
  @Input() label: string = '';
  
  /** Whether the dropdown is disabled */
  @Input() disabled: boolean = false;
  
  /** Color theme */
  @Input() color: 'amber' | 'green' | 'cyan' | 'red' = 'amber';
  
  // ═══════════════════════════════════════════════════════════
  // OUTPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** Emits when value changes */
  @Output() valueChange = new EventEmitter<number>();
  
  // ═══════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════
  
  /** Color classes */
  colorClass = computed(() => `dropdown-${this.color}`);
  
  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Handle selection change
   */
  onChange(event: Event): void {
    if (this.disabled) return;
    
    const target = event.target as HTMLSelectElement;
    const newValue = parseInt(target.value, 10);
    
    if (!isNaN(newValue) && newValue !== this.value) {
      this.valueChange.emit(newValue);
    }
  }
}
