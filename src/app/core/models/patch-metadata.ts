/**
 * Patch Metadata Interface
 * 
 * Metadata structure for patches stored in OPFS library.
 * 
 * © 2025 GR-55 Web Editor Contributors (MIT License)
 */

export interface PatchMetadata {
  // Core identity
  id: string;                    // UUID for this patch
  name: string;                  // User-friendly name
  
  // Origin tracking
  originalSlot?: number;         // GR-55 slot number (0-296) if imported
  importSource: 'gr55' | 'file' | 'manual';  // How patch entered library
  importDate: string;            // ISO timestamp
  
  // Organization
  category?: string;             // User-defined category
  tags: string[];                // User-defined tags
  notes: string;                 // User notes
  rating?: number;               // 1-5 stars
  collection?: string;           // Collection ID if in a collection
  
  // Timestamps
  created: string;               // ISO timestamp
  modified: string;              // ISO timestamp
  lastAccessed?: string;         // ISO timestamp
  
  // Metadata
  version: number;               // Increments on each save
  fileSize: number;              // Size in bytes
  checksum: string;              // For integrity checking
}

export interface PatchData {
  sysexData: Uint8Array;         // Binary .syx data
  metadata: PatchMetadata;       // Associated metadata
}

export interface QuotaInfo {
  usage: number;                 // Bytes used
  quota: number;                 // Bytes available
  percentage: number;            // Usage percentage
}

export interface LibraryStats {
  totalPatches: number;
  totalSize: number;
  categories: Map<string, number>;
  tags: Map<string, number>;
  averageRating?: number;
}
