/**
 * Knob Component
 * 
 * SVG-based rotary knob control for parameter editing.
 * Supports mouse drag interaction and displays current value.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, Input, Output, EventEmitter, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-knob',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knob.component.html',
  styleUrl: './knob.component.css'
})
export class KnobComponent {
  // ═══════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** Current value */
  @Input() value: number = 0;
  
  /** Minimum value */
  @Input() min: number = 0;
  
  /** Maximum value */
  @Input() max: number = 127;
  
  /** Parameter label */
  @Input() label: string = '';
  
  /** Units to display (e.g., 'dB', 'Hz', '%') */
  @Input() units: string = '';
  
  /** Knob size in pixels */
  @Input() size: number = 80;
  
  /** Whether the knob is disabled */
  @Input() disabled: boolean = false;
  
  /** Step size for value changes */
  @Input() step: number = 1;
  
  /** Color theme */
  @Input() color: 'amber' | 'green' | 'cyan' | 'red' = 'amber';
  
  // ═══════════════════════════════════════════════════════════
  // OUTPUTS
  // ═══════════════════════════════════════════════════════════
  
  /** Emits when value changes */
  @Output() valueChange = new EventEmitter<number>();
  
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  /** Is currently dragging? */
  private isDragging = signal(false);
  
  /** Last mouse Y position during drag */
  private lastY = 0;
  
  /** Temporary value during drag (for smooth updates) */
  private dragValue = signal(0);
  
  // ═══════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════
  
  /** Current rotation angle in degrees (-135° to +135°) */
  rotation = computed(() => {
    const currentValue = this.isDragging() ? this.dragValue() : this.value;
    const normalized = (currentValue - this.min) / (this.max - this.min);
    return normalized * 270 - 135; // Map 0-1 to -135° to +135°
  });
  
  /** Display value with units */
  displayValue = computed(() => {
    const currentValue = this.isDragging() ? this.dragValue() : this.value;
    return this.units ? `${currentValue}${this.units}` : currentValue.toString();
  });
  
  /** SVG transform string */
  transform = computed(() => `rotate(${this.rotation()} 50 50)`);
  
  /** Color classes */
  colorClass = computed(() => `knob-${this.color}`);
  
  // ═══════════════════════════════════════════════════════════
  // MOUSE INTERACTION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Start dragging on mouse down
   */
  onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    this.isDragging.set(true);
    this.lastY = event.clientY;
    this.dragValue.set(this.value);
    
    // Add global listeners for drag and release
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
  
  /**
   * Handle mouse move during drag
   */
  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging()) return;
    
    const deltaY = this.lastY - event.clientY; // Inverted: up = increase
    this.lastY = event.clientY;
    
    // Calculate sensitivity based on range
    const range = this.max - this.min;
    const sensitivity = range / 200; // Move 200px to cover full range
    
    // Update drag value
    const newValue = this.dragValue() + (deltaY * sensitivity);
    const clamped = Math.max(this.min, Math.min(this.max, newValue));
    const stepped = Math.round(clamped / this.step) * this.step;
    
    this.dragValue.set(stepped);
  };
  
  /**
   * End dragging on mouse up
   */
  private onMouseUp = (): void => {
    if (!this.isDragging()) return;
    
    this.isDragging.set(false);
    
    // Emit final value
    const finalValue = this.dragValue();
    if (finalValue !== this.value) {
      this.valueChange.emit(finalValue);
    }
    
    // Remove global listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
  
  /**
   * Handle mouse wheel for fine adjustment
   */
  onWheel(event: WheelEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -this.step : this.step;
    const newValue = Math.max(this.min, Math.min(this.max, this.value + delta));
    
    if (newValue !== this.value) {
      this.valueChange.emit(newValue);
    }
  }
  
  /**
   * Handle double-click to reset to default (middle of range)
   */
  onDoubleClick(): void {
    if (this.disabled) return;
    
    const defaultValue = Math.round((this.min + this.max) / 2);
    if (defaultValue !== this.value) {
      this.valueChange.emit(defaultValue);
    }
  }
  
  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
}
