/**
 * MIDI Type Definitions
 * 
 * TypeScript interfaces for Web MIDI API and Roland GR-55 communication.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

/**
 * Connection state for MIDI devices
 */
export type MIDIConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * MIDI port information
 */
export interface MIDIPortInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: 'disconnected' | 'connected';
  type: 'input' | 'output';
}

/**
 * MIDI message with metadata
 */
export interface MIDIMessage {
  data: number[];
  timestamp: number;
  port: string;
}

/**
 * SysEx message structure
 */
export interface SysExMessage {
  /** Manufacturer ID (0x41 for Roland) */
  manufacturerId: number;
  
  /** Device ID (typically 0x10 for GR-55) */
  deviceId: number;
  
  /** Model ID (0x00 0x00 0x53 for GR-55) */
  modelId: number[];
  
  /** Command (0x11 = RQ1, 0x12 = DT1) */
  command: number;
  
  /** 32-bit address */
  address: number;
  
  /** Data payload (for DT1) or size (for RQ1) */
  data: number[];
  
  /** Roland checksum */
  checksum: number;
  
  /** Full message bytes */
  bytes: number[];
}

/**
 * Roland command types
 */
export enum RolandCommand {
  /** RQ1 - Data Request */
  RQ1 = 0x11,
  
  /** DT1 - Data Set */
  DT1 = 0x12
}

/**
 * Roland GR-55 constants
 */
export const ROLAND_GR55 = {
  /** Roland manufacturer ID */
  MANUFACTURER_ID: 0x41,
  
  /** GR-55 model ID */
  MODEL_ID: [0x00, 0x00, 0x53],
  
  /** Default device ID */
  DEFAULT_DEVICE_ID: 0x10,
  
  /** Maximum SysEx size per message */
  MAX_SYSEX_SIZE: 256,
  
  /** Required delay between SysEx messages (ms) */
  INTER_MESSAGE_DELAY: 10,
  
  /** Patch number gap quirk offset */
  PATCH_GAP_OFFSET: 1751,
  
  /** Patch number where gap starts */
  PATCH_GAP_START: 296
} as const;

/**
 * SysEx request/response pair for tracking
 */
export interface SysExTransaction {
  id: string;
  request: SysExMessage;
  response?: SysExMessage;
  timestamp: number;
  timeout: number;
  status: 'pending' | 'completed' | 'timeout' | 'error';
}

/**
 * MIDI error types
 */
export class MIDIError extends Error {
  constructor(
    message: string,
    public code: MIDIErrorCode,
    public originalError?: any
  ) {
    super(message);
    this.name = 'MIDIError';
  }
}

export enum MIDIErrorCode {
  ACCESS_DENIED = 'ACCESS_DENIED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NO_PORTS = 'NO_PORTS',
  PORT_NOT_FOUND = 'PORT_NOT_FOUND',
  SEND_FAILED = 'SEND_FAILED',
  TIMEOUT = 'TIMEOUT',
  INVALID_SYSEX = 'INVALID_SYSEX',
  CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH'
}

/**
 * Type guard for checking Web MIDI API support
 */
export function isWebMIDISupported(): boolean {
  return 'requestMIDIAccess' in navigator;
}

/**
 * Type guard for MIDIAccess
 */
export function isMIDIAccess(obj: any): obj is MIDIAccess {
  return obj && typeof obj.inputs !== 'undefined' && typeof obj.outputs !== 'undefined';
}
