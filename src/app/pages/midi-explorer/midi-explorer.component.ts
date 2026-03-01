import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LogEntry {
  time: string;
  direction: 'tx' | 'rx' | 'info' | 'error';
  label: string;
  decoded?: string;
  bytes?: number[];
}

interface DeviceState {
  patchNumber: string;
  mode: string;
  patchName: string;
}

export interface ScanResult {
  address: number;
  addrStr: string;
  status: 'pending' | 'ok' | 'timeout' | 'scanning';
  data?: number[];
  dataStr?: string;
}

// Results from empirical scan 2025-03-01:
// ✅ Common(0x0000), MFX-sends(0x0300), Modeling(0x0500), MFX(0x0600),
//    Effects-block(0x0700), Assigns(0x010C), PCMTone1/2, PCMOff1/2
// ❌ 0x0800, 0x0900, 0x0A00 — DO NOT EXIST as separate pages
// Chorus/Reverb/EQ are packed within the 0x07xx block
const SECTION_PROBES = [
  // ✅ Confirmed responding
  { label: '✅ Common',        addr: 0x18000000, note: 'Mode/Name/Level - CONFIRMED' },
  { label: '✅ Assigns',       addr: 0x1800010C, note: 'assign1Switch - CONFIRMED' },
  { label: '✅ MFX sends',     addr: 0x18000300, note: 'chorus/delay/reverb send - CONFIRMED' },
  { label: '✅ Modeling',      addr: 0x18000500, note: 'guitar/bass modeling - CONFIRMED' },
  { label: '✅ MFX',           addr: 0x18000600, note: 'MFX type/params - CONFIRMED' },
  { label: '✅ Effects block', addr: 0x18000700, note: 'Delay+Chorus+Reverb+EQ all here' },
  { label: '✅ PCM Tone 1',    addr: 0x18002000, note: 'toneSelect - CONFIRMED' },
  { label: '✅ PCM Tone 2',    addr: 0x18002100, note: 'toneSelect - CONFIRMED' },
  { label: '✅ PCM Offsets 1', addr: 0x18003000, note: 'TVF/TVA offsets - CONFIRMED' },
  { label: '✅ PCM Offsets 2', addr: 0x18003100, note: 'TVF/TVA offsets - CONFIRMED' },
  // ❌ Dead addresses — do not scan
  { label: '❌ 0x0800',        addr: 0x18000800, note: 'DEAD — chorus is NOT here' },
  { label: '❌ 0x0900',        addr: 0x18000900, note: 'DEAD — reverb is NOT here' },
  { label: '❌ 0x0A00',        addr: 0x18000A00, note: 'DEAD — EQ is NOT here' },
];

// Preset scan ranges for convenience
const SCAN_PRESETS = [
  { label: 'Effects block (0x0700–0x077F)', start: '18000700', end: '1800077F', stride: '01' },
  { label: 'MFX params (0x0600–0x067F)',    start: '18000600', end: '1800067F', stride: '01' },
  { label: 'Common (0x0000–0x007F)',        start: '18000000', end: '1800007F', stride: '01' },
  { label: 'Assigns (0x010C–0x021A)',       start: '1800010C', end: '1800021A', stride: '01' },
];

@Component({
  selector: 'app-midi-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './midi-explorer.component.html',
  styleUrl: './midi-explorer.component.css'
})
export class MidiExplorerComponent implements OnInit, OnDestroy {
  midiAccess: any = null;
  selectedOutput: any = null;
  selectedInput: any = null;

  connectionStatus = signal<'disconnected' | 'connected' | 'error'>('disconnected');
  statusText = signal('Not Connected');
  outputPorts = signal<any[]>([]);
  inputPorts = signal<any[]>([]);
  logEntries = signal<LogEntry[]>([]);
  deviceState = signal<DeviceState>({ patchNumber: '—', mode: '—', patchName: '—' });
  scanResults = signal<ScanResult[]>([]);
  isScanning = signal(false);
  scanProgress = signal('');
  stats = signal({ tx: 0, rx: 0, btx: 0, brx: 0, lastRx: '—' });

  deviceId = '10';
  outputPortId = '';
  inputPortId = '';
  addr1 = '18'; addr2 = '00'; addr3 = '00'; addr4 = '00';
  reqSize = 1;
  rawSysex = '';
  autoScroll = true;

  scanStartHex  = '18000600';
  scanEndHex    = '18000A1D';
  scanStrideHex = '01';
  scanTimeout   = 800;

  private scanAbort = false;
  private pendingProbeResolve: ((data: number[] | null) => void) | null = null;
  private pendingProbeAddr = -1;

  readonly ROLAND_ID = 0x41;
  readonly GR55_MODEL = [0x00, 0x00, 0x53];
  readonly CMD_RQ1 = 0x11;
  readonly CMD_DT1 = 0x12;
  readonly sectionProbes = SECTION_PROBES;
  readonly scanPresets = SCAN_PRESETS;

  sysexPreview = computed(() => {
    const bytes = this.buildRQ1(
      parseInt(this.addr1, 16) || 0, parseInt(this.addr2, 16) || 0,
      parseInt(this.addr3, 16) || 0, parseInt(this.addr4, 16) || 0, this.reqSize);
    return this.formatBytesColored(bytes);
  });

  ngOnInit() { if (!(navigator as any).requestMIDIAccess) { this.connectionStatus.set('error'); this.statusText.set('Web MIDI Not Supported'); } }

  ngOnDestroy() { this.scanAbort = true; if (this.selectedInput) this.selectedInput.onmidimessage = null; }

  async requestMidiAccess() {
    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: true });
      this.connectionStatus.set('connected');
      this.statusText.set('MIDI Access Granted');
      this.populatePorts();
      this.midiAccess.onstatechange = () => this.populatePorts();
      this.addLog('info', 'MIDI Access', `Granted — ${this.midiAccess.outputs.size} outputs, ${this.midiAccess.inputs.size} inputs`);
    } catch (e: any) {
      this.connectionStatus.set('error');
      this.statusText.set('Access Denied');
      this.addLog('error', 'MIDI Error', e.message || 'Access denied');
    }
  }

  populatePorts() {
    const outputs: any[] = []; const inputs: any[] = [];
    for (const [id, port] of this.midiAccess.outputs) {
      outputs.push({ id, name: (port as any).name });
      if (!this.outputPortId && (port as any).name.toUpperCase().includes('GR')) { this.outputPortId = id; this.selectOutput(id); }
    }
    for (const [id, port] of this.midiAccess.inputs) {
      inputs.push({ id, name: (port as any).name });
      if (!this.inputPortId && (port as any).name.toUpperCase().includes('GR')) { this.inputPortId = id; this.selectInput(id); }
    }
    this.outputPorts.set(outputs);
    this.inputPorts.set(inputs);
  }

  selectOutput(id: string) {
    this.selectedOutput = id ? this.midiAccess.outputs.get(id) : null;
    if (this.selectedOutput) this.addLog('info', 'Output', `Selected: ${this.selectedOutput.name}`);
  }

  selectInput(id: string) {
    if (this.selectedInput) { const old = this.midiAccess.inputs.get(this.selectedInput.id); if (old) old.onmidimessage = null; }
    this.selectedInput = id ? this.midiAccess.inputs.get(id) : null;
    if (this.selectedInput) { this.selectedInput.onmidimessage = (e: any) => this.onMidiMessage(e); this.addLog('info', 'Input', `Listening: ${this.selectedInput.name}`); }
  }

  getDeviceId(): number { return parseInt(this.deviceId, 16) || 0x10; }

  rolandChecksum(bytes: number[]): number {
    return (128 - (bytes.reduce((a, b) => a + b, 0) % 128)) % 128;
  }

  buildRQ1(b0: number, b1: number, b2: number, b3: number, size: number): number[] {
    const addr = [b0, b1, b2, b3];
    const sz = [(size>>>24)&0x7F, (size>>>16)&0x7F, (size>>>8)&0x7F, size&0x7F];
    return [0xF0, this.ROLAND_ID, this.getDeviceId(), ...this.GR55_MODEL, this.CMD_RQ1,
      ...addr, ...sz, this.rolandChecksum([...addr, ...sz]), 0xF7];
  }

  buildRQ1FromAddr(addr: number, size: number): number[] {
    return this.buildRQ1((addr>>>24)&0x7F, (addr>>>16)&0x7F, (addr>>>8)&0x7F, addr&0x7F, size);
  }

  sendSysEx(bytes: number[], label: string) {
    if (!this.selectedOutput) { this.addLog('error', 'TX Error', 'No output port selected.'); return; }
    try {
      this.selectedOutput.send(bytes);
      const s = this.stats();
      this.stats.set({ ...s, tx: s.tx + 1, btx: s.btx + bytes.length });
      this.addLog('tx', label, undefined, bytes);
    } catch (e: any) { this.addLog('error', 'TX Error', e.message); }
  }

  // ═══ ADDRESS SCANNER ═══

  private rolandAddrAdd(addr: number, delta: number): number {
    let b3 = (addr & 0xFF) + delta;
    let b2 = ((addr>>>8)&0xFF) + Math.floor(b3/0x80); b3 %= 0x80;
    let b1 = ((addr>>>16)&0xFF) + Math.floor(b2/0x80); b2 %= 0x80;
    let b0 = ((addr>>>24)&0xFF) + Math.floor(b1/0x80); b1 %= 0x80;
    return ((b0&0x7F)<<24)|((b1&0x7F)<<16)|((b2&0x7F)<<8)|(b3&0x7F);
  }

  private parseHex(s: string): number { return parseInt(s.replace(/\s/g,''), 16) || 0; }

  formatAddr(addr: number): string {
    return [24,16,8,0].map(s => this.toHex((addr>>>s)&0xFF)).join(' ');
  }

  private probeAddr(addr: number, timeoutMs: number): Promise<number[] | null> {
    return new Promise(resolve => {
      this.pendingProbeAddr = addr;
      this.pendingProbeResolve = resolve;
      try {
        const rq1 = this.buildRQ1FromAddr(addr, 1);
        this.selectedOutput.send(rq1);
        const s = this.stats();
        this.stats.set({ ...s, tx: s.tx+1, btx: s.btx+rq1.length });
      } catch { this.pendingProbeAddr = -1; this.pendingProbeResolve = null; resolve(null); return; }
      setTimeout(() => {
        if (this.pendingProbeAddr === addr) { this.pendingProbeAddr = -1; this.pendingProbeResolve = null; resolve(null); }
      }, timeoutMs);
    });
  }

  async runScan() {
    if (!this.selectedOutput || !this.selectedInput) { this.addLog('error', 'Scanner', 'Select output AND input ports first.'); return; }
    this.scanAbort = false; this.isScanning.set(true); this.scanResults.set([]);
    const start = this.parseHex(this.scanStartHex);
    const end   = this.parseHex(this.scanEndHex);
    const stride = Math.max(1, this.parseHex(this.scanStrideHex));
    this.addLog('info', 'Scan start', `0x${start.toString(16)} – 0x${end.toString(16)}, stride ${stride}, timeout ${this.scanTimeout}ms`);
    let addr = start; let idx = 0;
    while (addr <= end && !this.scanAbort) {
      const addrStr = this.formatAddr(addr);
      this.scanResults.update(r => [...r, { address: addr, addrStr, status: 'scanning' }]);
      this.scanProgress.set(`${idx + 1} — probing ${addrStr} …`);
      const data = await this.probeAddr(addr, this.scanTimeout);
      this.scanResults.update(r => { const c = [...r]; c[idx] = { address: addr, addrStr, status: data ? 'ok' : 'timeout', data: data ?? undefined, dataStr: data ? data.map(b=>this.toHex(b)).join(' ') : undefined }; return c; });
      if (data) this.addLog('rx', `OK @ ${addrStr}`, data.map(b=>this.toHex(b)).join(' '));
      addr = this.rolandAddrAdd(addr, stride); idx++;
      await new Promise(r => setTimeout(r, 15));
    }
    const ok = this.scanResults().filter(r => r.status === 'ok');
    this.scanProgress.set(this.scanAbort ? 'Aborted' : `Done — ${ok.length}/${this.scanResults().length} responded`);
    this.addLog('info', 'Scan complete', ok.map(r => '0x'+r.address.toString(16).toUpperCase()).join(', ') || 'no responses');
    this.isScanning.set(false); this.scanAbort = false;
  }

  async probeSectionBases() {
    if (!this.selectedOutput || !this.selectedInput) { this.addLog('error', 'Probe', 'Select ports first.'); return; }
    this.scanAbort = false; this.isScanning.set(true); this.scanResults.set([]);
    for (let i = 0; i < SECTION_PROBES.length && !this.scanAbort; i++) {
      const { label, addr, note } = SECTION_PROBES[i];
      const addrStr = this.formatAddr(addr);
      this.scanResults.update(r => [...r, { address: addr, addrStr, status: 'scanning', dataStr: `${label}` }]);
      this.scanProgress.set(`Probing ${label} @ ${addrStr} …`);
      const data = await this.probeAddr(addr, this.scanTimeout);
      this.scanResults.update(r => { const c=[...r]; c[i]={ address:addr, addrStr, status: data?'ok':'timeout', data: data??undefined, dataStr: data ? `${label}: [${data.map(b=>this.toHex(b)).join(' ')}]` : `${label}: NO RESPONSE (${note})` }; return c; });
      await new Promise(r => setTimeout(r, 20));
    }
    this.scanProgress.set('Section probe complete — see results below');
    this.isScanning.set(false); this.scanAbort = false;
  }

  stopScan() { this.scanAbort = true; }
  clearScan() { this.scanResults.set([]); this.scanProgress.set(''); }

  exportScan() {
    const r = this.scanResults(); if (!r.length) return;
    const csv = 'Address,Status,Data\n' + r.map(x => `0x${x.address.toString(16).toUpperCase()},${x.status},"${x.dataStr??''}"`).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = `gr55-scan-${Date.now()}.csv`; a.click();
  }

  // ═══ INCOMING MESSAGES ═══
  onMidiMessage(event: any) {
    const data = Array.from(event.data) as number[];
    const s = this.stats();
    this.stats.set({ ...s, rx: s.rx+1, brx: s.brx+data.length, lastRx: new Date().toLocaleTimeString() });

    // Route to probe resolver
    if (data[0]===0xF0 && data[1]===this.ROLAND_ID && data[6]===this.CMD_DT1 && this.pendingProbeResolve) {
      const rxAddr = (data[7]<<24)|(data[8]<<16)|(data[9]<<8)|data[10];
      if (rxAddr === this.pendingProbeAddr) {
        const payload = data.slice(11, data.length - 2);
        const r = this.pendingProbeResolve;
        this.pendingProbeAddr = -1; this.pendingProbeResolve = null;
        r(payload); return;
      }
    }
    if (data[0] === 0xF0) this.handleSysEx(data);
    else this.addLog('rx', this.getMidiMsgType(data[0]), this.describeShortMsg(data), data);
  }

  handleSysEx(data: number[]) {
    if (data[1]===0x7E && data[3]===0x06 && data[4]===0x02) {
      this.addLog('rx', 'Identity Response', `Manufacturer:${data.slice(5,8).map(b=>this.toHex(b)).join(' ')} Family:${data.slice(8,10).map(b=>this.toHex(b)).join(' ')}`, data);
      return;
    }
    if (data[1]===this.ROLAND_ID && data[5]===0x53 && data[6]===this.CMD_DT1) {
      const addr = (data[7]<<24)|(data[8]<<16)|(data[9]<<8)|data[10];
      const payload = data.slice(11, data.length-2);
      const addrStr = [7,8,9,10].map(i=>this.toHex(data[i])).join(' ');
      let decoded = `${payload.length}B: ${payload.map(b=>this.toHex(b)).join(' ')}`;
      if (addr===0x01000000) decoded = this.decodePatchNumber(payload);
      else if (addr===0x18000000) { decoded = payload[0]===0?'Guitar Mode':'Bass Mode'; this.deviceState.update(s=>({...s, mode: decoded.slice(0,3)})); }
      else if (addr===0x18000001) decoded = this.decodePatchName(payload);
      else if (addr===0x18000200) decoded = `Level: ${payload[0]}`;
      else if (addr===0x18000208) decoded = this.decodeTempo(payload);
      this.addLog('rx', `DT1 @ ${addrStr}`, decoded, data);
      return;
    }
    this.addLog('rx', 'SysEx', `Unknown (${data.length}B)`, data);
  }

  decodePatchNumber(p: number[]): string {
    let num = (p[0]<<7)|p[1]; if (num>2047) num-=1751;
    const b = Math.floor(num/128), n = num%128;
    const disp = `${String.fromCharCode(65+Math.floor(b/8))}${(b%8)+1}-${String(n+1).padStart(2,'0')}`;
    this.deviceState.update(s=>({...s, patchNumber: disp}));
    return `Patch: ${disp} (raw:${num})`;
  }

  decodePatchName(p: number[]): string {
    const name = p.map(b=>String.fromCharCode(b)).join('').replace(/\0/g,'').trim();
    this.deviceState.update(s=>({...s, patchName: name||'—'}));
    return `Name: "${name}"`;
  }

  decodeTempo(p: number[]): string { return p.length>=2 ? `Tempo: ${p[0]*16+p[1]} BPM` : p.map(b=>this.toHex(b)).join(' '); }
  getMidiMsgType(s: number): string { const t=s>>4,c=(s&0xF)+1; return ({8:'Note Off',9:'Note On',11:'CC',12:'PC',14:'Pitch Bend'} as any)[t]||'MIDI'+` Ch${c}`; }
  describeShortMsg(d: number[]): string { const t=d[0]>>4; if(t===11) return `CC#${d[1]}=${d[2]}`; if(t===12) return `PC:${d[1]}`; return d.map(b=>this.toHex(b)).join(' '); }

  queryIdentity()    { this.sendSysEx([0xF0,0x7E,0x7F,0x06,0x01,0xF7], 'Universal Identity'); }
  queryPatchNumber() { this.sendSysEx(this.buildRQ1(0x01,0x00,0x00,0x00,2), 'Patch Number'); }
  queryMode()        { this.sendSysEx(this.buildRQ1(0x18,0x00,0x00,0x00,1), 'Mode'); }
  queryPatchName()   { this.sendSysEx(this.buildRQ1(0x18,0x00,0x00,0x01,17), 'Patch Name'); }
  queryPatchLevel()  { this.sendSysEx(this.buildRQ1(0x18,0x00,0x02,0x00,1), 'Patch Level'); }
  queryTempo()       { this.sendSysEx(this.buildRQ1(0x18,0x00,0x02,0x08,2), 'Tempo'); }
  queryMfx()         { this.sendSysEx(this.buildRQ1(0x18,0x00,0x06,0x00,8), 'MFX block (×8)'); }
  queryAssign1()     { this.sendSysEx(this.buildRQ1(0x18,0x00,0x01,0x0C,1), 'assign1Switch'); }

  loadPreset(preset: any) {
    this.scanStartHex = preset.start;
    this.scanEndHex = preset.end;
    this.scanStrideHex = preset.stride;
  }

  sendCustomRQ1() {
    const [a,b,c,d] = [this.addr1,this.addr2,this.addr3,this.addr4].map(x=>parseInt(x,16)||0);
    this.sendSysEx(this.buildRQ1(a,b,c,d,this.reqSize), `RQ1 @ ${this.toHex(a)} ${this.toHex(b)} ${this.toHex(c)} ${this.toHex(d)} ×${this.reqSize}`);
  }

  sendRawSysex() {
    const bytes = this.rawSysex.trim().split(/[\s,]+/).filter(Boolean).map(s=>parseInt(s,16));
    if (bytes.some(isNaN)) { this.addLog('error','Parse Error','Invalid hex'); return; }
    this.sendSysEx(bytes, 'Raw SysEx');
  }

  addLog(direction: 'tx'|'rx'|'info'|'error', label: string, decoded?: string, bytes?: number[]) {
    const now = new Date();
    const time = now.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+'.'+String(now.getMilliseconds()).padStart(3,'0');
    this.logEntries.update(e => [...e, { time, direction, label, decoded, bytes }]);
    if (this.autoScroll) setTimeout(()=>{ const el=document.getElementById('log'); if(el) el.scrollTop=el.scrollHeight; }, 50);
  }

  clearLog() { this.logEntries.set([]); this.stats.set({tx:0,rx:0,btx:0,brx:0,lastRx:'—'}); }
  toggleAutoScroll() { this.autoScroll = !this.autoScroll; }

  exportLog() {
    let t = 'GR-55 Log\n'+new Date().toISOString()+'\n\n';
    this.logEntries().forEach(e => { t+=`[${e.time}] ${e.direction.toUpperCase()} ${e.label}\n`; if(e.bytes) t+='  '+e.bytes.map(b=>this.toHex(b)).join(' ')+'\n'; if(e.decoded) t+='  '+e.decoded+'\n'; t+='\n'; });
    const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'})); a.download=`gr55-log-${Date.now()}.txt`; a.click();
  }

  toHex(b: number): string { return b.toString(16).toUpperCase().padStart(2,'0'); }

  formatBytesColored(bytes: number[]): string {
    if (!bytes?.length) return '';
    return bytes.map((b,i)=>{
      let cls = i===0||i===bytes.length-1 ? 'b-end' : i>=1&&i<=6 ? 'b-header' : i>=7&&i<=10 ? 'b-addr' : i===bytes.length-2 ? 'b-chk' : 'b-data';
      return `<span class="${cls}">${this.toHex(b)}</span>`;
    }).join(' ');
  }

  hasOutput(): boolean { return !!this.selectedOutput; }
}
