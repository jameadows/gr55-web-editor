/**
 * PatchWriteDialogComponent
 *
 * Modal dialog for writing the current patch to any GR-55 user slot (U01-1 → U99-3).
 *
 * Features
 * ─────────
 * • Searchable slot grid — type to filter by slot label (U01-1) or (eventually) name
 * • Editable patch name — rename before writing
 * • Keyboard navigation — arrows move selection, Enter confirms, Escape cancels
 * • Visual feedback    — current slot highlighted in green, selected slot in amber
 *
 * Usage
 * ─────
 * <app-patch-write-dialog
 *   [visible]="showWriteDialog()"
 *   [patchName]="patchName()"
 *   [currentSlot]="currentSlot()"
 *   (confirmed)="onWriteConfirmed($event)"
 *   (cancelled)="onWriteCancelled()">
 * </app-patch-write-dialog>
 *
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface WriteConfirmation {
  slot: number;
  patchName: string;
}

/** One entry in the slot grid */
interface SlotEntry {
  slot: number;        // 0-296
  label: string;       // "U01-1"
  bank: string;        // "U01"
  pos: number;         // 1-3
}

/** Build the full 297-slot list once at module level */
const ALL_SLOTS: SlotEntry[] = Array.from({ length: 297 }, (_, i) => {
  const bankIdx = Math.floor(i / 3);          // 0-98
  const posIdx  = i % 3;                       // 0-2
  const bank    = 'U' + String(bankIdx + 1).padStart(2, '0');
  const pos     = posIdx + 1;
  return { slot: i, label: `${bank}-${pos}`, bank, pos };
});

@Component({
  selector: 'app-patch-write-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patch-write-dialog.component.html',
  styleUrls: ['./patch-write-dialog.component.css'],
})
export class PatchWriteDialogComponent implements OnChanges, AfterViewInit {

  @Input() visible  = false;
  @Input() patchName  = '';
  @Input() currentSlot: number | null = null;

  @Output() confirmed = new EventEmitter<WriteConfirmation>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('slotGrid')    slotGridRef!:    ElementRef<HTMLDivElement>;

  // ── State ─────────────────────────────────────────────────
  searchQuery  = signal('');
  selectedSlot = signal<number | null>(null);
  editableName = signal('');

  // ── Derived ───────────────────────────────────────────────
  filteredSlots = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return ALL_SLOTS;
    return ALL_SLOTS.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.bank.toLowerCase().includes(q)
    );
  });

  selectedLabel = computed(() => {
    const slot = this.selectedSlot();
    if (slot === null) return null;
    return ALL_SLOTS[slot]?.label ?? null;
  });

  canConfirm = computed(() =>
    this.selectedSlot() !== null && this.editableName().trim().length > 0
  );

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      // Reset to current slot and name when dialog opens
      this.searchQuery.set('');
      this.selectedSlot.set(this.currentSlot ?? 0);
      this.editableName.set(this.patchName);
      // Focus search after Angular renders
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
    }
  }

  ngAfterViewInit(): void {}

  // ── User interactions ─────────────────────────────────────
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    // If filter reduced list and selected slot isn't visible, move to first visible
    const visible = this.filteredSlots();
    if (this.selectedSlot() !== null && !visible.find(s => s.slot === this.selectedSlot())) {
      this.selectedSlot.set(visible[0]?.slot ?? null);
    }
  }

  selectSlot(slot: number): void {
    this.selectedSlot.set(slot);
  }

  confirm(): void {
    if (!this.canConfirm()) return;
    this.confirmed.emit({
      slot: this.selectedSlot()!,
      patchName: this.editableName().trim().substring(0, 16),
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  // ── Keyboard navigation ────────────────────────────────────
  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.visible) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.cancel();
      return;
    }

    if (e.key === 'Enter' && this.canConfirm()) {
      e.preventDefault();
      this.confirm();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      this.moveSelection(e.key);
    }
  }

  private moveSelection(key: string): void {
    const slots = this.filteredSlots();
    if (slots.length === 0) return;

    const cur = this.selectedSlot();
    const idx = cur !== null ? slots.findIndex(s => s.slot === cur) : -1;

    // Slots are laid out in a 3-column grid (one per bank)
    const COLS = 3;
    let next = idx;

    if (key === 'ArrowRight') next = Math.min(idx + 1, slots.length - 1);
    if (key === 'ArrowLeft')  next = Math.max(idx - 1, 0);
    if (key === 'ArrowDown')  next = Math.min(idx + COLS, slots.length - 1);
    if (key === 'ArrowUp')    next = Math.max(idx - COLS, 0);

    if (next !== idx && next >= 0) {
      this.selectedSlot.set(slots[next].slot);
      this.scrollSelectedIntoView(slots[next].slot);
    }
  }

  private scrollSelectedIntoView(slot: number): void {
    if (!this.slotGridRef) return;
    const el = this.slotGridRef.nativeElement.querySelector(`[data-slot="${slot}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  // ── Template helpers ──────────────────────────────────────
  isCurrentSlot(slot: number): boolean {
    return slot === this.currentSlot;
  }

  isSelected(slot: number): boolean {
    return slot === this.selectedSlot();
  }
}
