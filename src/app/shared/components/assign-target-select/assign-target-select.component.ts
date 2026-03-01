/**
 * Assign Target Select Component
 *
 * A searchable dropdown for selecting from the 535 GR-55 assign target
 * parameters. Filters results in real time, shows category badges,
 * and stays keyboard-navigable.
 *
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import {
  Component, Input, Output, EventEmitter,
  signal, computed, HostListener, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GR55_ASSIGN_TARGETS,
  GR55_ASSIGN_TARGET_GROUPS,
  getAssignTargetGroup
} from '../../../data/gr55-assign-targets';

interface TargetOption {
  value: number;
  label: string;
  group: string;
}

@Component({
  selector: 'app-assign-target-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-target-select.component.html',
  styleUrl: './assign-target-select.component.css'
})
export class AssignTargetSelectComponent {

  // ═══════════════════════════════════════════════════════════
  // INPUTS / OUTPUTS
  // ═══════════════════════════════════════════════════════════

  /** Current target value (0–534) */
  @Input() set value(v: number) { this._value.set(v); }
  get value() { return this._value(); }

  /** Emits the new value when user selects a target */
  @Output() valueChange = new EventEmitter<number>();

  /** Whether the control is disabled */
  @Input() disabled = false;

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  private _value = signal(0);

  isOpen = signal(false);
  searchText = signal('');
  highlightedIndex = signal(0);

  // ═══════════════════════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════════════════════

  /** All 535 targets as option objects */
  private allOptions: TargetOption[] = GR55_ASSIGN_TARGETS.map((label, idx) => ({
    value: idx,
    label,
    group: getAssignTargetGroup(idx)
  }));

  /** Currently displayed options, filtered by search text */
  filteredOptions = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    if (!q) return this.allOptions;
    return this.allOptions.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.group.toLowerCase().includes(q)
    );
  });

  /** Label for the currently selected value */
  selectedLabel = computed(() => {
    const v = this._value();
    return (v >= 0 && v < GR55_ASSIGN_TARGETS.length)
      ? GR55_ASSIGN_TARGETS[v]
      : `Unknown (${v})`;
  });

  /** Group for the currently selected value */
  selectedGroup = computed(() => getAssignTargetGroup(this._value()));

  constructor(private el: ElementRef) {}

  // ═══════════════════════════════════════════════════════════
  // OPEN / CLOSE
  // ═══════════════════════════════════════════════════════════

  openDropdown() {
    if (this.disabled) return;
    this.isOpen.set(true);
    this.searchText.set('');
    // Highlight the current selection
    const idx = this.allOptions.findIndex(o => o.value === this._value());
    this.highlightedIndex.set(Math.max(0, idx));
    // Focus the search input next tick
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('.target-search');
      if (input) input.focus();
    });
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  select(option: TargetOption) {
    this._value.set(option.value);
    this.valueChange.emit(option.value);
    this.closeDropdown();
  }

  // ═══════════════════════════════════════════════════════════
  // KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════════════════════

  onSearchKeydown(event: KeyboardEvent) {
    const opts = this.filteredOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.min(i + 1, opts.length - 1));
        this.scrollHighlightedIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.max(i - 1, 0));
        this.scrollHighlightedIntoView();
        break;
      case 'Enter':
        event.preventDefault();
        if (opts[this.highlightedIndex()]) {
          this.select(opts[this.highlightedIndex()]);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  onSearchInput() {
    this.highlightedIndex.set(0);
  }

  private scrollHighlightedIntoView() {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector('.highlighted');
      if (el) el.scrollIntoView({ block: 'nearest' });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CLICK OUTSIDE TO CLOSE
  // ═══════════════════════════════════════════════════════════

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEMPLATE HELPERS
  // ═══════════════════════════════════════════════════════════

  /** Track group changes in the filtered list to show group headers */
  groupHeader(index: number): string | null {
    const opts = this.filteredOptions();
    if (index === 0) return opts[0]?.group ?? null;
    return opts[index]?.group !== opts[index - 1]?.group
      ? opts[index].group
      : null;
  }

  trackByValue(_: number, opt: TargetOption) { return opt.value; }
}
