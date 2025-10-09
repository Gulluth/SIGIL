/**
 * SIGIL - Sigil Is Generative Interpretive Language
 * A minimalist YAML-based DSL for creating powerful random generators.
 */

// Export main engine and utilities
export { SigilEngine } from './template-engine.js';
export type { SigilData } from './yaml-loader.js';

// Browser-friendly YAML parsing functions
export { parseYamlContent, createSigilData, createSingleSigilData, mergeLists, extractTemplates } from './yaml-loader.js';

// Node.js file loading functions (will throw runtime errors in browser)
export { loadSigilData, loadSingleFile } from './yaml-loader.js';

// Export Markov generation utilities
export { SigilMarkov, generateMarkov } from './markov-generator.js';
export type { MarkovOptions, MarkovChain } from './markov-generator.js';

// Export parser utilities (for testing)
export { parseTemplateExpression, parseCompleteTemplate } from './template-parser.js';
export type { TemplateNode } from './template-parser.js';

// Version info - injected during build from package.json
export const VERSION = '__SIGIL_VERSION__';
