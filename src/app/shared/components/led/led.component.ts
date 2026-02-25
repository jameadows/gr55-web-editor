/**
 * LED Indicator Component
 * 
 * On/off visual indicator for switch parameters (effect enables, etc.).
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-led',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './led.component.html',
  styleUrl: './led.component.css'
})
export class LedComponent {
  // ═══════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** LED state */
  @Input() isOn: boolean = false;
  
  /** Label text */
  @Input() label: string = '';
  
  /** LED size in pixels */
  @Input() size: number = 12;
  
  /** Whether the LED is clickable/toggleable */
  @Input() clickable: boolean = false;
  
  /** Color theme */
  @Input() color: 'amber' | 'green' | 'cyan' | 'red' = 'green';
  
  // ═══════════════════════════════════════════════════════════
  // OUTPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** Emits when LED is clicked (if clickable) */
  @Output() toggle = new EventEmitter<boolean>();
  
  // ═══════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════
  
  /** Color classes */
  colorClass = computed(() => `led-${this.color}`);
  
  /** LED size style */
  sizeStyle = computed(() => ({
    width: `${this.size}px`,
    height: `${this.size}px`
  }));
  
  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Handle click to toggle
   */
  onToggle(): void {
    if (this.clickable) {
      this.toggle.emit(!this.isOn);
    }
  }
}
