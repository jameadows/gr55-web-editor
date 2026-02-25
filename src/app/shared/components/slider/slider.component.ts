/**
 * Slider Component
 * 
 * Horizontal or vertical fader control for parameter editing.
 * Supports mouse drag interaction and click-to-set.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Component, Input, Output, EventEmitter, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent {
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
  
  /** Orientation */
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  
  /** Width in pixels (for horizontal) */
  @Input() width: number = 200;
  
  /** Height in pixels (for vertical) */
  @Input() height: number = 200;
  
  /** Whether the slider is disabled */
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
  // VIEW CHILDREN
  // ═══════════════════════════════════════════════════════════
  
  @ViewChild('track', { static: false }) trackElement?: ElementRef<HTMLDivElement>;
  
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  
  /** Is currently dragging? */
  private isDragging = signal(false);
  
  /** Temporary value during drag (for smooth updates) */
  private dragValue = signal(0);
  
  // ═══════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════
  
  /** Current percentage (0-100) */
  percentage = computed(() => {
    const currentValue = this.isDragging() ? this.dragValue() : this.value;
    const normalized = (currentValue - this.min) / (this.max - this.min);
    return Math.max(0, Math.min(100, normalized * 100));
  });
  
  /** Display value with units */
  displayValue = computed(() => {
    const currentValue = this.isDragging() ? this.dragValue() : this.value;
    return this.units ? `${currentValue}${this.units}` : currentValue.toString();
  });
  
  /** Color classes */
  colorClass = computed(() => `slider-${this.color}`);
  
  /** Orientation class */
  orientationClass = computed(() => `slider-${this.orientation}`);
  
  /** Container dimensions */
  containerStyle = computed(() => {
    if (this.orientation === 'horizontal') {
      return { width: `${this.width}px`, height: '60px' };
    } else {
      return { width: '60px', height: `${this.height}px` };
    }
  });
  
  /** Track dimensions */
  trackStyle = computed(() => {
    if (this.orientation === 'horizontal') {
      return { width: '100%', height: '4px' };
    } else {
      return { width: '4px', height: '100%' };
    }
  });
  
  /** Fill style (shows current value) */
  fillStyle = computed(() => {
    const percent = this.percentage();
    if (this.orientation === 'horizontal') {
      return { width: `${percent}%`, height: '100%' };
    } else {
      return { width: '100%', height: `${percent}%`, position: 'absolute', bottom: '0' };
    }
  });
  
  /** Thumb position */
  thumbStyle = computed(() => {
    const percent = this.percentage();
    if (this.orientation === 'horizontal') {
      return { left: `${percent}%` };
    } else {
      return { bottom: `${percent}%` };
    }
  });
  
  // ═══════════════════════════════════════════════════════════
  // MOUSE INTERACTION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Handle click on track to set value
   */
  onTrackClick(event: MouseEvent): void {
    if (this.disabled || !this.trackElement) return;
    
    this.updateValueFromMouse(event);
    
    // Emit immediately
    const newValue = this.calculateValueFromEvent(event);
    if (newValue !== this.value) {
      this.valueChange.emit(newValue);
    }
  }
  
  /**
   * Start dragging on thumb mouse down
   */
  onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging.set(true);
    this.dragValue.set(this.value);
    
    // Add global listeners for drag and release
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
  
  /**
   * Handle mouse move during drag
   */
  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging() || !this.trackElement) return;
    
    this.updateValueFromMouse(event);
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
   * Update drag value from mouse position
   */
  private updateValueFromMouse(event: MouseEvent): void {
    const newValue = this.calculateValueFromEvent(event);
    this.dragValue.set(newValue);
  }
  
  /**
   * Calculate value from mouse event
   */
  private calculateValueFromEvent(event: MouseEvent): number {
    if (!this.trackElement) return this.value;
    
    const rect = this.trackElement.nativeElement.getBoundingClientRect();
    let percentage: number;
    
    if (this.orientation === 'horizontal') {
      const x = event.clientX - rect.left;
      percentage = x / rect.width;
    } else {
      const y = event.clientY - rect.top;
      percentage = 1 - (y / rect.height); // Inverted for vertical
    }
    
    // Clamp percentage
    percentage = Math.max(0, Math.min(1, percentage));
    
    // Calculate value
    const rawValue = this.min + (percentage * (this.max - this.min));
    
    // Apply step
    const stepped = Math.round(rawValue / this.step) * this.step;
    
    // Final clamp
    return Math.max(this.min, Math.min(this.max, stepped));
  }
  
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
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
}
