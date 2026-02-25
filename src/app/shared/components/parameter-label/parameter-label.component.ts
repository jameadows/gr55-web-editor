/**
 * Parameter Label Component
 * 
 * Read-only display of parameter name and current value.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parameter-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parameter-label.component.html',
  styleUrl: './parameter-label.component.css'
})
export class ParameterLabelComponent {
  // ═══════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** Parameter label */
  @Input() label: string = '';
  
  /** Current value */
  @Input() value: string | number = '';
  
  /** Units to display (e.g., 'dB', 'Hz', '%') */
  @Input() units: string = '';
  
  /** Color theme for value */
  @Input() color: 'amber' | 'green' | 'cyan' | 'red' | 'default' = 'default';
  
  // ═══════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════
  
  /** Display value with units */
  displayValue = computed(() => {
    if (typeof this.value === 'string') {
      return this.value;
    }
    return this.units ? `${this.value}${this.units}` : this.value.toString();
  });
  
  /** Color classes */
  colorClass = computed(() => `value-${this.color}`);
}
