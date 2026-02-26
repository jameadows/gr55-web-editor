/**
 * Tooltip Directive
 * 
 * Shows helpful tooltips on hover for all controls.
 * Displays parameter descriptions, value ranges, and keyboard shortcuts.
 * 
 * Usage:
 * <app-knob [tooltip]="'Patch output level (0-100)'"></app-knob>
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Directive, Input, ElementRef, HostListener, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[tooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input() tooltip: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay: number = 300; // ms
  
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}
  
  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltip) return;
    
    // Delay showing tooltip
    this.showTimeout = setTimeout(() => {
      this.show();
    }, this.tooltipDelay);
  }
  
  @HostListener('mouseleave')
  onMouseLeave(): void {
    clearTimeout(this.showTimeout);
    this.hide();
  }
  
  private show(): void {
    if (this.tooltipElement) return;
    
    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);
    
    // Set content
    const textNode = this.renderer.createText(this.tooltip);
    this.renderer.appendChild(this.tooltipElement, textNode);
    
    // Append to body
    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Position tooltip
    this.position();
  }
  
  private hide(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
  
  private position(): void {
    if (!this.tooltipElement) return;
    
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    switch (this.tooltipPosition) {
      case 'top':
        top = hostPos.top - tooltipPos.height - 8;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'bottom':
        top = hostPos.bottom + 8;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left - tooltipPos.width - 8;
        break;
      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + 8;
        break;
    }
    
    // Keep tooltip on screen
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipPos.height - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipPos.width - 8));
    
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }
  
  ngOnDestroy(): void {
    clearTimeout(this.showTimeout);
    this.hide();
  }
}
