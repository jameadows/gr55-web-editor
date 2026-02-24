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

@Component({
  selector: 'app-midi-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './midi-explorer.component.html',
  styleUrl: './midi-explorer.component.css'
})
export class MidiExplorerComponent implements OnInit, OnDestroy {
  // MIDI state
  midiAccess: any = null;
  selectedOutput: any = null;
  selectedInput: any = null;

  // Signals
  connectionStatus = signal<'disconnected' | 'connected' | 'error'>('disconnected');
  statusText = signal('Not Connected');
  outputPorts = signal<any[]>([]);
  inputPorts = signal<any[]>([]);
  logEntries = signal<LogEntry[]>([]);
  deviceState = signal<DeviceState>({ patchNumber: '—', mode: '—', patchName: '—' });

  // Stats
  stats = signal({ tx: 0, rx: 0, btx: 0, brx: 0, lastRx: '—' });

  // Form models
  deviceId = '10';
  outputPortId = '';
  inputPortId = '';
  addr1 = '18';
  addr2 = '00';
  addr3 = '00';
  addr4 = '00';
  reqSize = 1;
  rawSysex = '';
  autoScroll = true;

  // Constants
  readonly ROLAND_ID = 0x41;
  readonly GR55_MODEL = [0x00, 0x00, 0x53];
  readonly CMD_RQ1 = 0x11;
  readonly CMD_DT1 = 0x12;

  // Computed values
  sysexPreview = computed(() => {
    const addr = [
      parseInt(this.addr1, 16) || 0,
      parseInt(this.addr2, 16) || 0,
      parseInt(this.addr3, 16) || 0,
      parseInt(this.addr4, 16) || 0
    ];
    const bytes = this.buildRQ1(addr[0], addr[1], addr[2], addr[3], this.reqSize);
    return this.formatBytesColored(bytes, 'rq1');
  });

  ngOnInit() {
    this.checkWebMidiSupport();
  }

  ngOnDestroy() {
    // Cleanup MIDI listeners
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null;
    }
  }

  // ═══ WEB MIDI ACCESS ═══
  checkWebMidiSupport() {
    if (!(navigator as any).requestMIDIAccess) {
      this.connectionStatus.set('error');
      this.statusText.set('Web MIDI Not Supported');
    }
  }

  async requestMidiAccess() {
    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: true });
      this.connectionStatus.set('connected');
      this.statusText.set('MIDI Access Granted');
      this.populatePorts();
      this.midiAccess.onstatechange = () => this.onPortStateChange();
      this.addLog('info', 'MIDI Access', `Granted. ${this.midiAccess.outputs.size} outputs, ${this.midiAccess.inputs.size} inputs found.`);
    } catch (e: any) {
      this.connectionStatus.set('error');
      this.statusText.set('Access Denied');
      this.addLog('error', 'MIDI Error', e.message || 'Access denied or not supported.');
    }
  }

  populatePorts() {
    const outputs: any[] = [];
    const inputs: any[] = [];

    for (const [id, port] of this.midiAccess.outputs) {
      outputs.push({ id, name: port.name });
      // Auto-select GR-55
      if (port.name.toUpperCase().includes('GR-55') || port.name.toUpperCase().includes('GR55')) {
        this.outputPortId = id;
        this.selectOutput(id);
      }
    }

    for (const [id, port] of this.midiAccess.inputs) {
      inputs.push({ id, name: port.name });
      // Auto-select GR-55
      if (port.name.toUpperCase().includes('GR-55') || port.name.toUpperCase().includes('GR55')) {
        this.inputPortId = id;
        this.selectInput(id);
      }
    }

    this.outputPorts.set(outputs);
    this.inputPorts.set(inputs);
  }

  onPortStateChange() {
    this.addLog('info', 'Port Change', 'MIDI port configuration changed');
    this.populatePorts();
  }

  selectOutput(id: string) {
    this.selectedOutput = id ? this.midiAccess.outputs.get(id) : null;
    if (this.selectedOutput) {
      this.addLog('info', 'Output', `Selected: ${this.selectedOutput.name}`);
    }
  }

  selectInput(id: string) {
    if (this.selectedInput) {
      const old = this.midiAccess.inputs.get(this.selectedInput.id);
      if (old) old.onmidimessage = null;
    }
    this.selectedInput = id ? this.midiAccess.inputs.get(id) : null;
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = (event: any) => this.onMidiMessage(event);
      this.addLog('info', 'Input', `Listening: ${this.selectedInput.name}`);
    }
  }

  // ═══ ROLAND PROTOCOL ═══
  getDeviceId(): number {
    return parseInt(this.deviceId, 16) || 0x10;
  }

  rolandChecksum(bytes: number[]): number {
    const sum = bytes.reduce((a, b) => a + b, 0);
    return (128 - (sum % 128)) % 128;
  }

  buildRQ1(addr4: number, addr3: number, addr2: number, addr1: number, size: number): number[] {
    const addrBytes = [addr4, addr3, addr2, addr1];
    const sizeBytes = [
      (size >>> 24) & 0x7F,
      (size >>> 16) & 0x7F,
      (size >>> 8) & 0x7F,
      size & 0x7F
    ];
    const checksumData = [...addrBytes, ...sizeBytes];
    const checksum = this.rolandChecksum(checksumData);
    return [0xF0, this.ROLAND_ID, this.getDeviceId(), ...this.GR55_MODEL, this.CMD_RQ1,
      ...addrBytes, ...sizeBytes, checksum, 0xF7];
  }

  sendSysEx(bytes: number[], label: string) {
    if (!this.selectedOutput) {
      this.addLog('error', 'TX Error', 'No output port selected.');
      return;
    }
    try {
      this.selectedOutput.send(bytes);
      const currentStats = this.stats();
      this.stats.set({
        ...currentStats,
        tx: currentStats.tx + 1,
        btx: currentStats.btx + bytes.length
      });
      this.addLog('tx', label || 'SysEx TX', undefined, bytes);
    } catch (e: any) {
      this.addLog('error', 'TX Error', e.message);
    }
  }

  // ═══ INCOMING MESSAGES ═══
  onMidiMessage(event: any) {
    const data = Array.from(event.data);
    const currentStats = this.stats();
    this.stats.set({
      ...currentStats,
      rx: currentStats.rx + 1,
      brx: currentStats.brx + data.length,
      lastRx: new Date().toLocaleTimeString()
    });

    if (data[0] === 0xF0) {
      this.handleSysEx(data);
    } else {
      const type = this.getMidiMsgType(data[0]);
      this.addLog('rx', type, this.describeShortMsg(data), data);
    }
  }

  handleSysEx(data: number[]) {
    // Universal Identity Response
    if (data[1] === 0x7E && data[3] === 0x06 && data[4] === 0x02) {
      const manufacturer = data.slice(5, 8).map(this.toHex).join(' ');
      const family = data.slice(8, 10).map(this.toHex).join(' ');
      const member = data.slice(10, 12).map(this.toHex).join(' ');
      const revision = data.slice(12, 16).map(this.toHex).join(' ');
      const decoded = `Manufacturer: ${manufacturer} | Family: ${family} | Member: ${member} | Revision: ${revision}`;
      this.addLog('rx', 'Identity Response', decoded, data);
      return;
    }

    // Roland DT1
    if (data[1] === this.ROLAND_ID && data[3] === 0x00 && data[4] === 0x00 &&
      data[5] === 0x53 && data[6] === this.CMD_DT1) {
      const addr = (data[7] << 24) | (data[8] << 16) | (data[9] << 8) | data[10];
      const payload = data.slice(11, data.length - 2);
      const addrStr = `${this.toHex(data[7])} ${this.toHex(data[8])} ${this.toHex(data[9])} ${this.toHex(data[10])}`;
      let decoded = '';

      switch (addr) {
        case 0x01000000: // Patch number
          decoded = this.decodePatchNumber(payload);
          break;
        case 0x18000000: // Mode
          decoded = payload[0] === 0 ? 'Guitar Mode' : 'Bass Mode';
          this.deviceState.update(s => ({ ...s, mode: payload[0] === 0 ? 'GTR' : 'BSS' }));
          break;
        case 0x18000001: // Patch name
          decoded = this.decodePatchName(payload);
          break;
        case 0x18000200: // Patch level
          decoded = `Level: ${payload[0]} (0–200)`;
          break;
        case 0x18000208: // Tempo
          decoded = this.decodeTempo(payload);
          break;
        case 0x18000600: // MFX type
          decoded = `MFX Type: ${payload[0]} (${this.mfxTypeName(payload[0])})`;
          break;
        default:
          decoded = `${payload.length} byte(s) of data`;
      }

      this.addLog('rx', `DT1 @ ${addrStr}`, decoded, data);
      return;
    }

    this.addLog('rx', 'SysEx', `Unknown (${data.length} bytes)`, data);
  }

  decodePatchNumber(payload: number[]): string {
    let num = (payload[0] << 8) | payload[1];
    if (num > 2047) num -= 1751;
    const bank = Math.floor(num / 128);
    const patchN = num % 128;
    const bankLetter = String.fromCharCode(65 + Math.floor(bank / 8));
    const display = `${bankLetter}${(bank % 8) + 1}-${String(patchN + 1).padStart(2, '0')}`;
    this.deviceState.update(s => ({ ...s, patchNumber: display }));
    return `Patch: ${display} (raw: ${num})`;
  }

  decodePatchName(payload: number[]): string {
    const nameBytes = payload.slice(1);
    const name = nameBytes.map(b => String.fromCharCode(b)).join('').replace(/\0/g, '').trim();
    this.deviceState.update(s => ({ ...s, patchName: name || '—' }));
    return `Name: "${name}"`;
  }

  decodeTempo(payload: number[]): string {
    if (payload.length >= 2) {
      const bpm = payload[0] * 16 + payload[1];
      return `Tempo: ${bpm} BPM`;
    }
    return `Tempo data: ${payload.map(this.toHex).join(' ')}`;
  }

  mfxTypeName(n: number): string {
    const types = ['Equalizer', 'Spectrum', 'Enhancer', 'Humanizer', 'Overdrive', 'Distortion',
      'Compressor', 'Limiter', 'Gate', 'Delay', 'Chorus', 'Flanger', 'Phaser', 'Tremolo', 'Auto Pan',
      'Slicer', 'Rotary', 'VK Rotary', 'Hexa Chorus', 'Tremolo Chorus', 'Stereo Chorus',
      'Space D', '3D Chorus', 'Stereo Delay', 'Mod Delay', '3 Tap Delay', '4 Tap Delay',
      'Tm Ctrl Delay', 'Reverb', 'Gated Reverb', '2x2 Chorus', 'Sub Delay'];
    return types[n] || `Type ${n}`;
  }

  getMidiMsgType(status: number): string {
    const type = status >> 4;
    const ch = (status & 0x0F) + 1;
    const names: any = { 8: 'Note Off', 9: 'Note On', 10: 'Aftertouch', 11: 'Control Change',
      12: 'Program Change', 13: 'Channel Pressure', 14: 'Pitch Bend', 15: 'System' };
    return `${names[type] || 'Unknown'} (Ch${ch})`;
  }

  describeShortMsg(data: number[]): string {
    const type = data[0] >> 4;
    if (type === 11) return `CC #${data[1]} = ${data[2]}`;
    if (type === 12) return `Program: ${data[1]}`;
    if (type === 14) {
      const val = ((data[2] << 7) | data[1]) - 8192;
      return `Pitch Bend: ${val}`;
    }
    return data.map(this.toHex).join(' ');
  }

  // ═══ PRESET QUERIES ═══
  queryIdentity() {
    const msg = [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7];
    this.sendSysEx(msg, 'Universal Identity Request');
  }

  queryPatchNumber() {
    this.sendSysEx(this.buildRQ1(0x01, 0x00, 0x00, 0x00, 2), 'RQ1 Patch Number');
  }

  queryMode() {
    this.sendSysEx(this.buildRQ1(0x18, 0x00, 0x00, 0x00, 1), 'RQ1 Guitar/Bass Mode');
  }

  queryPatchName() {
    this.sendSysEx(this.buildRQ1(0x18, 0x00, 0x00, 0x01, 17), 'RQ1 Patch Name');
  }

  queryPatchLevel() {
    this.sendSysEx(this.buildRQ1(0x18, 0x00, 0x02, 0x00, 1), 'RQ1 Patch Level');
  }

  queryTempo() {
    this.sendSysEx(this.buildRQ1(0x18, 0x00, 0x02, 0x08, 2), 'RQ1 Patch Tempo');
  }

  queryMfxType() {
    this.sendSysEx(this.buildRQ1(0x18, 0x00, 0x06, 0x00, 1), 'RQ1 MFX Type');
  }

  queryAssign1() {
    this.sendSysEx(this.buildRQ1(0x18, 0x00, 0x10, 0x00, 8), 'RQ1 Assign 1');
  }

  sendCustomRQ1() {
    const a1 = parseInt(this.addr1, 16) || 0;
    const a2 = parseInt(this.addr2, 16) || 0;
    const a3 = parseInt(this.addr3, 16) || 0;
    const a4 = parseInt(this.addr4, 16) || 0;
    const addr = `${this.toHex(a1)} ${this.toHex(a2)} ${this.toHex(a3)} ${this.toHex(a4)}`;
    this.sendSysEx(this.buildRQ1(a1, a2, a3, a4, this.reqSize), `RQ1 @ ${addr} ×${this.reqSize}`);
  }

  sendRawSysex() {
    const raw = this.rawSysex.trim();
    const bytes = raw.split(/[\s,]+/).filter(Boolean).map(s => parseInt(s, 16));
    if (bytes.some(isNaN)) {
      this.addLog('error', 'Parse Error', 'Invalid hex in raw SysEx field.');
      return;
    }
    this.sendSysEx(bytes, 'Raw SysEx');
  }

  // ═══ LOGGING ═══
  addLog(direction: 'tx' | 'rx' | 'info' | 'error', label: string, decoded?: string, bytes?: number[]) {
    const now = new Date();
    const time = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      + '.' + String(now.getMilliseconds()).padStart(3, '0');

    this.logEntries.update(entries => [
      ...entries,
      { time, direction, label, decoded, bytes }
    ]);

    // Auto-scroll
    if (this.autoScroll) {
      setTimeout(() => {
        const logEl = document.getElementById('log');
        if (logEl) logEl.scrollTop = logEl.scrollHeight;
      }, 50);
    }
  }

  clearLog() {
    this.logEntries.set([]);
    this.stats.set({ tx: 0, rx: 0, btx: 0, brx: 0, lastRx: '—' });
  }

  toggleAutoScroll() {
    this.autoScroll = !this.autoScroll;
  }

  exportLog() {
    let text = 'GR-55 MIDI Explorer Log\n' + new Date().toISOString() + '\n\n';
    this.logEntries().forEach(e => {
      text += `[${e.time}] ${e.direction.toUpperCase()} ${e.label}\n`;
      if (e.bytes) text += `  ${e.bytes.map(this.toHex).join(' ')}\n`;
      if (e.decoded) text += `  ${e.decoded}\n`;
      text += '\n';
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gr55-log-${Date.now()}.txt`;
    a.click();
  }

  // ═══ UTILITIES ═══
  toHex(byte: number): string {
    return byte.toString(16).toUpperCase().padStart(2, '0');
  }

  formatBytesColored(bytes: number[], type: string): string {
    if (!bytes || !bytes.length) return '';
    return bytes.map((b, i) => {
      let cls = '';
      if (i === 0 || i === bytes.length - 1) cls = 'b-end';
      else if (i === 1 || i === 2) cls = 'b-header';
      else if (i >= 3 && i <= 6) cls = 'b-header';
      else if (i >= 7 && i <= 10) cls = 'b-addr';
      else if (i === bytes.length - 2) cls = 'b-chk';
      else cls = 'b-data';
      return `<span class="${cls}">${this.toHex(b)}</span>`;
    }).join(' ');
  }

  // For template use
  hasOutput(): boolean {
    return !!this.selectedOutput;
  }
}
