/**
 * SIGIL - Sigil Is Generative Interpretive Language
 * A minimalist YAML-based DSL for creating powerful random generators.
 */

// Export main engine and utilities
export { SigilEngine } from './template-engine';
export { loadSigilData, loadSingleFile } from './yaml-loader';
export type { SigilData } from './yaml-loader';

// Export Markov generation utilities
export { SigilMarkov, generateMarkov } from './markov-generator';
export type { MarkovOptions, MarkovChain } from './markov-generator';

// Version info - imported from package.json to stay in sync
import { version } from '../package.json';
export const VERSION = version;
