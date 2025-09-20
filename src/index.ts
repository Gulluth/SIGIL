/**
 * SIGIL - Sigil Is Generative Interpretive Language
 * A minimalist YAML-based DSL for creating powerful random generators.
 */

// Export main engine and utilities
export { SigilEngine } from './template-engine';
export type { SigilData } from './yaml-loader';

// Browser-friendly YAML parsing functions
export { parseYamlContent, createSigilData, createSingleSigilData, mergeLists, extractTemplates } from './yaml-loader';

// Node.js file loading functions (will throw runtime errors in browser)
export { loadSigilData, loadSingleFile } from './yaml-loader';

// Export Markov generation utilities
export { SigilMarkov, generateMarkov } from './markov-generator';
export type { MarkovOptions, MarkovChain } from './markov-generator';

// Version info - injected during build from package.json
export const VERSION = '__SIGIL_VERSION__';
