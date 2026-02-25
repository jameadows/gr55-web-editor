/**
 * MIDI I/O Service
 * 
 * Wraps the Web MIDI API with RxJS observables for Angular integration.
 * Manages MIDI port access, connection state, and message streaming.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject, fromEvent, EMPTY, merge } from 'rxjs';
import { map, filter, share, takeUntil } from 'rxjs/operators';
import {
  MIDIConnectionState,
  MIDIPortInfo,
  MIDIMessage,
  MIDIError,
  MIDIErrorCode,
  isWebMIDISupported
} from './midi.types';

@Injectable({
  providedIn: 'root'
})
export class MidiIoService {
  // ═══════════════════════════════════════════════════════════
  // STATE SIGNALS
  // ═══════════════════════════════════════════════════════════
  
  /** Current connection state */
  connectionState = signal<MIDIConnectionState>('disconnected');
  
  /** Available output ports */
  outputPorts = signal<MIDIPortInfo[]>([]);
  
  /** Available input ports */
  inputPorts = signal<MIDIPortInfo[]>([]);
  
  /** Currently selected output port ID */
  selectedOutputId = signal<string | null>(null);
  
  /** Currently selected input port ID */
  selectedInputId = signal<string | null>(null);
  
  /** Computed: Is MIDI connected and ready? */
  isConnected = computed(() => this.connectionState() === 'connected');
  
  /** Computed: Selected output port info */
  selectedOutput = computed(() => {
    const id = this.selectedOutputId();
    return id ? this.outputPorts().find(p => p.id === id) : null;
  });
  
  /** Computed: Selected input port info */
  selectedInput = computed(() => {
    const id = this.selectedInputId();
    return id ? this.inputPorts().find(p => p.id === id) : null;
  });
  
  // ═══════════════════════════════════════════════════════════
  // PRIVATE STATE
  // ═══════════════════════════════════════════════════════════
  
  private midiAccess: MIDIAccess | null = null;
  private outputPort: MIDIOutput | null = null;
  private inputPort: MIDIInput | null = null;
  
  private messagesSubject = new Subject<MIDIMessage>();
  private destroySubject = new Subject<void>();
  
  /** Observable stream of all incoming MIDI messages */
  public messages$ = this.messagesSubject.asObservable().pipe(
    share() // Share subscription among multiple subscribers
  );
  
  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Check if Web MIDI API is supported
   */
  isSupported(): boolean {
    return isWebMIDISupported();
  }
  
  /**
   * Request MIDI access with SysEx support
   */
  async requestAccess(): Promise<void> {
    if (!this.isSupported()) {
      throw new MIDIError(
        'Web MIDI API is not supported in this browser',
        MIDIErrorCode.NOT_SUPPORTED
      );
    }
    
    try {
      this.connectionState.set('connecting');
      
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
      
      this.connectionState.set('connected');
      
      // Populate port lists
      this.refreshPorts();
      
      // Listen for port state changes
      this.midiAccess.onstatechange = () => this.handleStateChange();
      
      // Auto-select GR-55 ports if found
      this.autoSelectGR55Ports();
      
    } catch (error) {
      this.connectionState.set('error');
      throw new MIDIError(
        'Failed to access MIDI devices',
        MIDIErrorCode.ACCESS_DENIED,
        error
      );
    }
  }
  
  /**
   * Refresh the list of available MIDI ports
   */
  refreshPorts(): void {
    if (!this.midiAccess) return;
    
    const outputs: MIDIPortInfo[] = [];
    const inputs: MIDIPortInfo[] = [];
    
    this.midiAccess.outputs.forEach((port) => {
      outputs.push(this.portToInfo(port, 'output'));
    });
    
    this.midiAccess.inputs.forEach((port) => {
      inputs.push(this.portToInfo(port, 'input'));
    });
    
    this.outputPorts.set(outputs);
    this.inputPorts.set(inputs);
  }
  
  /**
   * Select an output port by ID
   */
  selectOutput(portId: string): void {
    if (!this.midiAccess) return;
    
    let port: MIDIOutput | undefined;
    this.midiAccess.outputs.forEach((p) => {
      if (p.id === portId) port = p;
    });
    
    if (!port) {
      throw new MIDIError(
        `Output port not found: ${portId}`,
        MIDIErrorCode.PORT_NOT_FOUND
      );
    }
    
    this.outputPort = port;
    this.selectedOutputId.set(portId);
  }
  
  /**
   * Select an input port by ID
   */
  selectInput(portId: string): void {
    if (!this.midiAccess) return;
    
    let port: MIDIInput | undefined;
    this.midiAccess.inputs.forEach((p) => {
      if (p.id === portId) port = p;
    });
    
    if (!port) {
      throw new MIDIError(
        `Input port not found: ${portId}`,
        MIDIErrorCode.PORT_NOT_FOUND
      );
    }
    
    // Remove listener from previous port
    if (this.inputPort) {
      this.inputPort.onmidimessage = null;
    }
    
    this.inputPort = port;
    this.selectedInputId.set(portId);
    
    // Attach message listener
    this.inputPort.onmidimessage = (event: MIDIMessageEvent) => {
      this.handleMIDIMessage(event);
    };
  }
  
  /**
   * Send a MIDI message
   * 
   * @param data MIDI message bytes
   * @param timestamp Optional timestamp for scheduling
   */
  send(data: number[], timestamp?: number): void {
    if (!this.outputPort) {
      throw new MIDIError(
        'No output port selected',
        MIDIErrorCode.PORT_NOT_FOUND
      );
    }
    
    try {
      if (timestamp !== undefined) {
        this.outputPort.send(data, timestamp);
      } else {
        this.outputPort.send(data);
      }
    } catch (error) {
      throw new MIDIError(
        'Failed to send MIDI message',
        MIDIErrorCode.SEND_FAILED,
        error
      );
    }
  }
  
  /**
   * Get observable stream filtered to SysEx messages only
   */
  getSysExMessages$(): Observable<MIDIMessage> {
    return this.messages$.pipe(
      filter(msg => msg.data.length > 0 && msg.data[0] === 0xF0)
    );
  }
  
  /**
   * Get observable stream filtered to short messages (non-SysEx)
   */
  getShortMessages$(): Observable<MIDIMessage> {
    return this.messages$.pipe(
      filter(msg => msg.data.length > 0 && msg.data[0] !== 0xF0)
    );
  }
  
  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.inputPort) {
      this.inputPort.onmidimessage = null;
    }
    
    this.outputPort = null;
    this.inputPort = null;
    this.selectedOutputId.set(null);
    this.selectedInputId.set(null);
    this.connectionState.set('disconnected');
  }
  
  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
    this.disconnect();
  }
  
  // ═══════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Handle incoming MIDI messages
   */
  private handleMIDIMessage(event: MIDIMessageEvent): void {
    if (!event.data) return; // Guard against null
    
    const data = Array.from(event.data) as number[]; // TypeScript strict mode
    
    const message: MIDIMessage = {
      data,
      timestamp: event.timeStamp,
      port: this.inputPort?.id || 'unknown'
    };
    
    this.messagesSubject.next(message);
  }
  
  /**
   * Handle MIDI port state changes
   */
  private handleStateChange(): void {
    this.refreshPorts();
    
    // Re-select ports if they were disconnected and reconnected
    const outputId = this.selectedOutputId();
    const inputId = this.selectedInputId();
    
    if (outputId && this.outputPorts().some(p => p.id === outputId)) {
      this.selectOutput(outputId);
    }
    
    if (inputId && this.inputPorts().some(p => p.id === inputId)) {
      this.selectInput(inputId);
    }
  }
  
  /**
   * Auto-select GR-55 ports if detected
   */
  private autoSelectGR55Ports(): void {
    const outputs = this.outputPorts();
    const inputs = this.inputPorts();
    
    // Look for ports with "GR-55" or "GR55" in the name
    const gr55Output = outputs.find(p => 
      p.name.toUpperCase().includes('GR-55') || 
      p.name.toUpperCase().includes('GR55')
    );
    
    const gr55Input = inputs.find(p => 
      p.name.toUpperCase().includes('GR-55') || 
      p.name.toUpperCase().includes('GR55')
    );
    
    if (gr55Output) {
      this.selectOutput(gr55Output.id);
    }
    
    if (gr55Input) {
      this.selectInput(gr55Input.id);
    }
  }
  
  /**
   * Convert MIDIPort to MIDIPortInfo
   */
  private portToInfo(port: MIDIPort, type: 'input' | 'output'): MIDIPortInfo {
    return {
      id: port.id,
      name: port.name || 'Unknown',
      manufacturer: port.manufacturer || 'Unknown',
      state: port.state,
      type
    };
  }
}
