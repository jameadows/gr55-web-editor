import {
  Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '../../shared/components/knob/knob.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { LedComponent } from '../../shared/components/led/led.component';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { Gr55ProtocolService } from '../../core/midi';
import {
  MFX_TYPE_BY_INDEX,
  MfxParamDef,
  mfxParamAddress,
} from '../../data/gr55-mfx-parameters';

@Component({
  selector: 'app-mfx-deep-editor',
  standalone: true,
  imports: [CommonModule, KnobComponent, DropdownComponent, LedComponent, TooltipDirective],
  templateUrl: './mfx-deep-editor.component.html',
  styleUrls: ['./mfx-deep-editor.component.css'],
})
export class MfxDeepEditorComponent implements OnChanges {
  private gr55 = inject(Gr55ProtocolService);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) mfxType: number = 0;

  get currentTypeDef() { return MFX_TYPE_BY_INDEX.get(this.mfxType); }
  get currentParams(): MfxParamDef[] { return this.currentTypeDef?.params ?? []; }
  get currentTypeName(): string { return this.currentTypeDef?.name ?? `Type ${this.mfxType}`; }

  paramValues: Record<number, number> = {};
  isLoading = false;
  private pendingReads = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mfxType']) {
      this.loadParamsForCurrentType();
    }
  }

  loadParamsForCurrentType(): void {
    const typeDef = MFX_TYPE_BY_INDEX.get(this.mfxType);
    if (!typeDef) return;

    const defaults: Record<number, number> = {};
    for (const param of typeDef.params) {
      defaults[param.slot] = param.defaultValue;
    }
    this.paramValues = { ...defaults };

    this.isLoading = true;
    this.pendingReads = typeDef.params.length;

    const onReadDone = () => {
      this.pendingReads--;
      if (this.pendingReads <= 0) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    };

    for (const param of typeDef.params) {
      this.gr55.readParameter<number>(this.makeFieldDef(param)).subscribe({
        next: (v) => {
          this.paramValues = { ...this.paramValues, [param.slot]: v };
          onReadDone();
        },
        error: (e) => {
          console.warn(`MFX slot ${param.slot} read failed:`, e);
          onReadDone();
        },
      });
    }
  }

  onParamChange(param: MfxParamDef, value: number): void {
    this.paramValues = { ...this.paramValues, [param.slot]: value };
    this.gr55.writeParameter<number>(this.makeFieldDef(param), value).subscribe({
      error: (e) => console.error(`MFX slot ${param.slot} write failed:`, e),
    });
  }

  getParamValue(slot: number): number {
    return this.paramValues[slot] ?? 0;
  }

  /**
   * Rate Sync conditional visibility.
   * Three-slot pattern: [N] Sync toggle → [N+1] raw Rate knob OR [N+2] Rate Note dropdown
   */
  isParamVisible(param: MfxParamDef): boolean {
    const label = param.label;
    const params = this.currentParams;

    if (label === 'Rate Note') {
      const sync = params.find(p => p.label === 'Rate Sync');
      return sync ? this.getParamValue(sync.slot) === 1 : true;
    }
    if (label === 'Step Note') {
      const sync = params.find(p => p.label === 'Step Rate Sync');
      return sync ? this.getParamValue(sync.slot) === 1 : true;
    }
    if (label === 'Rate' && param.type === 'number') {
      const sync = params.find(p => p.label === 'Rate Sync');
      return sync ? this.getParamValue(sync.slot) === 0 : true;
    }
    if (label === 'Step Rate' && param.type === 'number') {
      const sync = params.find(p => p.label === 'Step Rate Sync');
      return sync ? this.getParamValue(sync.slot) === 0 : true;
    }
    return true;
  }

  trackBySlot(_: number, param: MfxParamDef): number {
    return param.slot;
  }

  getKnobColor(param: MfxParamDef): 'amber' | 'cyan' | 'green' | 'red' {
    const label = param.label.toLowerCase();
    if (label.includes('gain') || label.includes('level') || label.includes('output')) return 'amber';
    if (label.includes('rate') || label.includes('speed') || label.includes('time') || label.includes('delay')) return 'cyan';
    if (label.includes('depth') || label.includes('resonance') || label.includes('feedback')) return 'green';
    return 'amber';
  }

  formatParamValue(param: MfxParamDef, rawValue: number): string {
    if (param.unit === 'dB') {
      const dB = rawValue - 15;
      return `${dB >= 0 ? '+' : ''}${dB} dB`;
    }
    if (param.unit === 'ms') return `${rawValue} ms`;
    if (param.unit === '°')  return `${rawValue}°`;
    if (param.label.includes('Pitch Shift')) {
      const v = rawValue - 24;
      return `${v >= 0 ? '+' : ''}${v} st`;
    }
    if (param.label.includes('Fine Tune') || param.label === 'Depth Dev' || param.label === 'Pan Dev') {
      const v = rawValue - 63;
      return `${v >= 0 ? '+' : ''}${v}`;
    }
    return String(rawValue);
  }

  private makeFieldDef(param: MfxParamDef): any {
    return {
      address: mfxParamAddress(param.slot),
      size: 1,
      type: 'number',
      defaultValue: param.defaultValue,
      range: param.range ?? [0, 127],
      label: param.label,
      uiLevel: 'primary',
      category: 'MFX',
    };
  }
}
