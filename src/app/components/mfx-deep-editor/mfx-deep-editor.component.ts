import {
  Component, Input, OnChanges, SimpleChanges, inject
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

  /** Current MFX type index (0–19), driven by parent */
  @Input({ required: true }) mfxType: number = 0;

  get currentTypeDef() { return MFX_TYPE_BY_INDEX.get(this.mfxType); }
  get currentParams(): MfxParamDef[] { return this.currentTypeDef?.params ?? []; }
  get currentTypeName(): string { return this.currentTypeDef?.name ?? `Type ${this.mfxType}`; }

  /** Per-slot raw values, keyed by slot index 0–31 */
  paramValues: Record<number, number> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mfxType']) {
      this.loadParamsForCurrentType();
    }
  }

  loadParamsForCurrentType(): void {
    const typeDef = MFX_TYPE_BY_INDEX.get(this.mfxType);
    if (!typeDef) return;

    // Seed defaults immediately
    const defaults: Record<number, number> = {};
    for (const param of typeDef.params) {
      defaults[param.slot] = param.defaultValue;
    }
    this.paramValues = { ...defaults };

    // Read each param from hardware
    for (const param of typeDef.params) {
      this.gr55.readParameter<number>(this.makeFieldDef(param)).subscribe({
        next: (v) => { this.paramValues = { ...this.paramValues, [param.slot]: v }; },
        error: (e) => console.warn(`MFX slot ${param.slot} read failed:`, e),
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
      return `${v >= 0 ? '+' : ''}${v}`;
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
