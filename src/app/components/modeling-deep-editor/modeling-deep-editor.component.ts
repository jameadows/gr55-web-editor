import {
  Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '../../shared/components/knob/knob.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { LedComponent } from '../../shared/components/led/led.component';
import { Gr55ProtocolService } from '../../core/midi';
import {
  ModelingParamDef,
  COMMON_PARAMS,
  TWELVE_STR_PARAMS,
  getModelDef,
  has12String,
} from '../../data/gr55-modeling-parameters';

interface ParamGroup {
  name: string;
  params: ModelingParamDef[];
}

@Component({
  selector: 'app-modeling-deep-editor',
  standalone: true,
  imports: [CommonModule, KnobComponent, DropdownComponent, LedComponent],
  templateUrl: './modeling-deep-editor.component.html',
  styleUrls: ['./modeling-deep-editor.component.css'],
})
export class ModelingDeepEditorComponent implements OnChanges {
  private gr55 = inject(Gr55ProtocolService);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) isGuitar: boolean = true;
  @Input({ required: true }) categoryIndex: number = 0;
  @Input({ required: true }) toneIndex: number = 0;

  paramValues: Record<number, number> = {};
  isLoading = false;
  private pendingReads = 0;

  // ── Derived state ──────────────────────────────────────────────────

  get modelDef() {
    return getModelDef(this.isGuitar, this.categoryIndex, this.toneIndex);
  }

  get modelName(): string {
    return this.modelDef?.name ?? '—';
  }

  get show12String(): boolean {
    return has12String(this.isGuitar, this.categoryIndex);
  }

  /** All params to read/display, grouped by section */
  get paramGroups(): ParamGroup[] {
    const modelParams = this.modelDef?.params ?? [];
    const groups: ParamGroup[] = [];

    // 1. Model-specific params first (Pickup, Body, etc.)
    if (modelParams.length > 0) {
      groups.push(...this.groupBy(modelParams));
    }

    // 2. Noise Suppressor (common, but only shown for models that have tone/volume)
    const nsParams = COMMON_PARAMS.filter(p => p.group === 'Noise Suppressor');
    groups.push({ name: 'Noise Suppressor', params: nsParams });

    // 3. String Levels
    const stringParams = COMMON_PARAMS.filter(p => p.group === 'String Levels');
    groups.push({ name: 'String Levels', params: stringParams });

    // 4. Pitch
    const pitchParams = COMMON_PARAMS.filter(p => p.group === 'Pitch');
    groups.push({ name: 'Pitch', params: pitchParams });

    // 5. 12-String (only for eligible models)
    if (this.show12String) {
      groups.push({ name: '12-String', params: TWELVE_STR_PARAMS });
    }

    return groups;
  }

  get totalParamCount(): number {
    return this.paramGroups.reduce((n, g) => n + g.params.length, 0);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    const relevant = ['isGuitar', 'categoryIndex', 'toneIndex'];
    if (relevant.some(k => k in changes)) {
      this.loadAllParams();
    }
  }

  loadAllParams(): void {
    const allParams = this.paramGroups.flatMap(g => g.params);
    if (allParams.length === 0) return;

    // Seed defaults
    const defaults: Record<number, number> = {};
    for (const p of allParams) {
      defaults[p.address] = p.defaultValue;
    }
    this.paramValues = { ...defaults };

    this.isLoading = true;
    this.pendingReads = allParams.length;

    const onDone = () => {
      this.pendingReads--;
      if (this.pendingReads <= 0) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    };

    for (const param of allParams) {
      this.gr55.readParameter<number>(this.toFieldDef(param)).subscribe({
        next: (v) => {
          this.paramValues = { ...this.paramValues, [param.address]: v };
          onDone();
        },
        error: (e) => {
          console.warn(`Modeling param 0x${param.address.toString(16)} read failed:`, e);
          onDone();
        },
      });
    }
  }

  onParamChange(param: ModelingParamDef, value: number): void {
    this.paramValues = { ...this.paramValues, [param.address]: value };
    this.gr55.writeParameter<number>(this.toFieldDef(param), value).subscribe({
      error: (e) => console.error(`Modeling param 0x${param.address.toString(16)} write failed:`, e),
    });
  }

  getValue(address: number): number {
    return this.paramValues[address] ?? 0;
  }

  formatValue(param: ModelingParamDef, raw: number): string {
    if (param.encodedOffset !== undefined) {
      const v = raw - param.encodedOffset;
      const sign = v >= 0 ? '+' : '';
      return `${sign}${v}${param.unit ? ' ' + param.unit : ''}`;
    }
    if (param.unit) return `${raw} ${param.unit}`;
    return String(raw);
  }

  getKnobColor(param: ModelingParamDef): 'amber' | 'cyan' | 'green' | 'red' {
    const g = (param.group ?? '').toLowerCase();
    const l = param.label.toLowerCase();
    if (g === 'noise suppressor' || l.includes('ns')) return 'red';
    if (g === 'pitch' || g === 'pitch shift' || g === 'sweep' || g === 'vibrato') return 'cyan';
    if (g === 'filter' || l.includes('resonance') || l.includes('cutoff')) return 'green';
    return 'amber';
  }

  trackByAddr(_: number, param: ModelingParamDef): number {
    return param.address;
  }

  // ── Private helpers ────────────────────────────────────────────────

  private groupBy(params: ModelingParamDef[]): ParamGroup[] {
    const map = new Map<string, ModelingParamDef[]>();
    for (const p of params) {
      const key = p.group ?? 'Parameters';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).map(([name, ps]) => ({ name, params: ps }));
  }

  private toFieldDef(param: ModelingParamDef): any {
    return {
      address: param.address,
      size: 1,
      type: param.type === 'enum' ? 'number' : param.type,
      defaultValue: param.defaultValue,
      range: param.range ?? [0, (param.enumValues?.length ?? 2) - 1],
      label: param.label,
      uiLevel: 'primary',
      category: 'Modeling',
    };
  }
}
