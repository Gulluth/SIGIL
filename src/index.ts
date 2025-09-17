/**
 * SIGIL - Sigil Is Generative Interpretive Language
 * A minimalist YAML-based DSL for TTRPG world building generators
 */

// Export main engine and utilities
export { SigilEngine } from './template-engine';
export { loadSigilData, loadSingleFile } from './yaml-loader';
export type { SigilData } from './yaml-loader';

// Version info
export const VERSION = '0.1.0';
