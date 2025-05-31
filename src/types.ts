/**
 * Common types used throughout the application
 */

/**
 * Represents the current state of a processing operation
 */
export interface ProcessingState {
  /** The current status of the operation */
  status: 'idle' | 'processing' | 'completed' | 'error';
  
  /** An optional message describing the current state */
  message: string;
} 