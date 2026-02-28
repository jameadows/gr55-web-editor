import {
  Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnobComponent } from '../../shared/components/knob/knob.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { LedComponent } from '../../shared/components/led/led.component';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { Gr55ProtocolService } from '../../core/midi';
import { GR55AddressMap, FieldDefinition } from '../../data/gr55-address-map';

interface PcmParam {
  field: FieldDefinition<any>;
  label: string;
  group: string;
  encodedOffset?: number;
  unit?: string;
}

@Component({
  selector: 'app-pcm-deep-editor',
  standalone: true,
  imports: [CommonModule, KnobComponent, DropdownComponent, LedComponent, TooltipDirective],
  templateUrl: './pcm-deep-editor.component.html',
  styleUrls: ['./pcm-deep-editor.component.css'],
})
export class PcmDeepEditorComponent implements OnChanges {
  private gr55 = inject(Gr55ProtocolService);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) toneIndex: 1 | 2 = 1;

  paramValues: Record<number, number | boolean> = {};
  isLoading = false;
  private pendingReads = 0;

  // ── Parameter definitions ──────────────────────────────────────

  get params(): PcmParam[] {
    const t = this.toneIndex;
    const tone = t === 1 ? GR55AddressMap.patch.pcmTone1 : GR55AddressMap.patch.pcmTone2;
    const offset = t === 1 ? GR55AddressMap.patch.pcmTone1Offset : GR55AddressMap.patch.pcmTone2Offset;

    return [
      // ── Voice behaviour
      { field: (tone as any).chromatic,        label: 'Chromatic',       group: 'Voice' },
      { field: (tone as any).legatoSwitch,     label: 'Legato',          group: 'Voice' },
      { field: (tone as any).nuanceSwitch,     label: 'Nuance',          group: 'Voice' },
      { field: (tone as any).releaseMode,      label: 'Release Mode',    group: 'Voice' },
      { field: (tone as any).portamentoSwitch, label: 'Portamento',      group: 'Voice' },
      { field: (tone as any).outputMfxSelect,  label: 'Output (MFX)',    group: 'Voice' },

      // ── TVF filter
      { field: offset.tvfFilterType,    label: 'Filter Type',      group: 'TVF Filter' },
      { field: offset.tvfCutoff,        label: 'Cutoff Offset',    group: 'TVF Filter', encodedOffset: 63 },
      { field: offset.tvfResonance,     label: 'Resonance Offset', group: 'TVF Filter', encodedOffset: 64 },
      { field: offset.tvfCutoffVelSens, label: 'Vel Sens',         group: 'TVF Filter', encodedOffset: 64 },
      { field: offset.tvfCutoffVelCurve,label: 'Vel Curve',        group: 'TVF Filter' },
      { field: offset.tvfCutoffKeyfollow,label: 'Keyfollow',       group: 'TVF Filter', encodedOffset: 200 },

      // ── TVF envelope
      { field: offset.tvfEnvDepth,  label: 'Env Depth',   group: 'TVF Envelope', encodedOffset: 63 },
      { field: offset.tvfEnvTime1,  label: 'Attack',      group: 'TVF Envelope', encodedOffset: 64 },
      { field: offset.tvfEnvTime2,  label: 'Decay',       group: 'TVF Envelope', encodedOffset: 64 },
      { field: offset.tvfEnvLevel3, label: 'Sustain',     group: 'TVF Envelope', encodedOffset: 64 },
      { field: offset.tvfEnvTime4,  label: 'Release',     group: 'TVF Envelope', encodedOffset: 64 },

      // ── TVA envelope
      { field: offset.tvaLevelVelSens, label: 'Vel Sens', group: 'TVA Envelope', encodedOffset: 63 },
      { field: offset.tvaEnvTime1,  label: 'Attack',      group: 'TVA Envelope', encodedOffset: 64 },
      { field: offset.tvaEnvTime2,  label: 'Decay',       group: 'TVA Envelope', encodedOffset: 64 },
      { field: offset.tvaEnvLevel3, label: 'Sustain',     group: 'TVA Envelope', encodedOffset: 64 },
      { field: offset.tvaEnvTime4,  label: 'Release',     group: 'TVA Envelope', encodedOffset: 64 },

      // ── Pitch envelope
      { field: offset.pitchEnvOffset, label: 'Pitch Env',  group: 'Pitch Envelope', encodedOffset: 12, unit: 'st' },
      { field: offset.pitchEnvAttack, label: 'Attack',     group: 'Pitch Envelope', encodedOffset: 64 },
      { field: offset.pitchEnvDecay,  label: 'Decay',      group: 'Pitch Envelope', encodedOffset: 64 },
      { field: offset.portamentoType, label: 'Porto Type', group: 'Pitch Envelope' },

      // ── LFO 1
      { field: offset.lfo1PitchDepth,  label: 'Pitch',  group: 'LFO 1', encodedOffset: 63 },
      { field: offset.lfo1FilterDepth, label: 'Filter', group: 'LFO 1', encodedOffset: 63 },
      { field: offset.lfo1AmpDepth,    label: 'Amp',    group: 'LFO 1', encodedOffset: 63 },
      { field: offset.lfo1PanDepth,    label: 'Pan',    group: 'LFO 1', encodedOffset: 63 },

      // ── LFO 2
      { field: offset.lfo2PitchDepth,  label: 'Pitch',  group: 'LFO 2', encodedOffset: 63 },
      { field: offset.lfo2FilterDepth, label: 'Filter', group: 'LFO 2', encodedOffset: 63 },
      { field: offset.lfo2AmpDepth,    label: 'Amp',    group: 'LFO 2', encodedOffset: 63 },
      { field: offset.lfo2PanDepth,    label: 'Pan',    group: 'LFO 2', encodedOffset: 63 },
    ];
  }

  get paramGroups(): { name: string; params: PcmParam[] }[] {
    const map = new Map<string, PcmParam[]>();
    for (const p of this.params) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return Array.from(map.entries()).map(([name, params]) => ({ name, params }));
  }

  get totalParamCount(): number { return this.params.length; }

  // ── Lifecycle ──────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toneIndex']) {
      this.loadAllParams();
    }
  }

  loadAllParams(): void {
    const allParams = this.params;
    if (allParams.length === 0) return;

    const defaults: Record<number, any> = {};
    for (const p of allParams) {
      defaults[p.field.address] = p.field.defaultValue;
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

    for (const p of allParams) {
      this.gr55.readParameter<any>(p.field).subscribe({
        next: (v) => {
          this.paramValues = { ...this.paramValues, [p.field.address]: v };
          onDone();
        },
        error: (e) => {
          console.warn(`PCM${this.toneIndex} param 0x${p.field.address.toString(16)} read failed:`, e);
          onDone();
        },
      });
    }
  }

  onParamChange(param: PcmParam, value: any): void {
    this.paramValues = { ...this.paramValues, [param.field.address]: value };
    this.gr55.writeParameter<any>(param.field, value).subscribe({
      error: (e) => console.error(`PCM param write failed:`, e),
    });
  }

  getValue(field: FieldDefinition<any>): any {
    const v = this.paramValues[field.address];
    return v !== undefined ? v : field.defaultValue;
  }

  getNumericValue(field: FieldDefinition<any>): number {
    return this.getValue(field) as number;
  }

  formatValue(param: PcmParam, raw: number): string {
    if (param.encodedOffset !== undefined) {
      const v = raw - param.encodedOffset;
      const sign = v > 0 ? '+' : '';
      return `${sign}${v}${param.unit ? ' ' + param.unit : ''}`;
    }
    if (param.unit) return `${raw} ${param.unit}`;
    return String(raw);
  }

  getKnobColor(param: PcmParam): 'amber' | 'cyan' | 'green' | 'red' {
    const g = param.group.toLowerCase();
    if (g.includes('tvf')) return 'green';
    if (g.includes('tva')) return 'amber';
    if (g.includes('pitch')) return 'cyan';
    if (g.includes('lfo')) return 'cyan';
    return 'amber';
  }

  isBoolean(field: FieldDefinition<any>): boolean {
    return field.type === 'boolean';
  }

  isEnum(field: FieldDefinition<any>): boolean {
    return field.type === 'enum';
  }

  isNumber(field: FieldDefinition<any>): boolean {
    return field.type === 'number';
  }

  trackByAddr(_: number, param: PcmParam): number {
    return param.field.address;
  }
}
