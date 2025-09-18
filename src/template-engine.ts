/**
 * SIGIL Template Engine
 * 
 * Parser-first template processing engine that handles all SIGIL syntax:
 * - [table] references with modifiers, weights, and repetition
 * - {this|that} OR logic and {this&that} AND logic
 * - {a} indefinite articles
 * - {1-6} number ranges
 * - Nested expressions with proper precedence
 * 
 * Architecture: Single-pass AST evaluation with structured parsing
 * for ease of maintainability and support for complex nested expressions.
 */

import { SigilData } from './yaml-loader';
import { generateMarkov } from './markov-generator';
import { parseCompleteTemplate, TemplateNode } from './template-parser';

export interface TemplateOptions {
    maxDepth?: number;
    debug?: boolean;
    seed?: string;
}

export interface WeightedItem {
    value: string;
    weight: number;
}

/**
 * Parse weighted items from a list
 * "sword ^2" -> { value: "sword", weight: 2 }
 */
export function parseWeightedList(items: string[]): WeightedItem[] {
    return items.map(item => {
        const match = item.match(/^(.+?)\s*\^([\d.]+)$/);
        if (match) {
            return {
                value: match[1].trim(),
                weight: parseFloat(match[2])
            };
        }
        return {
            value: item,
            weight: 1.0
        };
    });
}

/**
 * Select random item from weighted list
 */
export function selectWeighted(items: WeightedItem[]): string {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight;
        if (random <= 0) {
            return item.value;
        }
    }

    // Fallback to last item
    return items[items.length - 1]?.value || '';
}

/**
 * Get value from nested object using dot notation
 * getNestedValue(data, 'weapon.melee') -> data.weapon.melee
 */
export function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

/**
 * Apply text modifiers (.capitalize, .lowercase, .pluralForm)
 */
export function applyModifier(text: string, modifier: string): string {
    switch (modifier) {
        case 'capitalize':
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        case 'lowercase':
            return text.toLowerCase();
        case 'pluralForm':
            // Simple English pluralization
            if (text.endsWith('s') || text.endsWith('sh') || text.endsWith('ch') || text.endsWith('x') || text.endsWith('z')) {
                return text + 'es';
            } else if (text.endsWith('y') && !/[aeiou]y$/.test(text)) {
                return text.slice(0, -1) + 'ies';
            } else if (text.endsWith('f')) {
                return text.slice(0, -1) + 'ves';
            } else if (text.endsWith('fe')) {
                return text.slice(0, -2) + 'ves';
            }
            return text + 's';
        default:
            return text;
    }
}

/**
 * Generate indefinite article (a/an)
 */
export function getIndefiniteArticle(word: string): string {
    const vowels = /^[aeiouAEIOU]/;
    return vowels.test(word) ? 'an' : 'a';
}

/**
 * Main SIGIL Template Engine
 */
export class SigilEngine {
    private lists: SigilData;
    private options: TemplateOptions;
    private depth: number = 0;

    constructor(lists: SigilData, options: TemplateOptions = {}) {
        this.lists = lists;
        this.options = {
            maxDepth: 10,
            debug: false,
            ...options
        };
    }

    /**
     * Generate content from a SIGIL template string.
     * 
     * Processes the template using parser-first architecture:
     * 1. Parse template into AST (Abstract Syntax Tree)
     * 2. Evaluate AST with proper operator precedence
     * 3. Apply post-processing (indefinite articles)
     * 
     * @param template SIGIL template string to process
     * @returns Generated content string
     */
    public generate(template: string): string {
        this.depth = 0;
        return this.processTemplate(template);
    }

    /**
     * Phase 3: Complete parser-first template processing.
     * 
     * ARCHITECTURAL EVOLUTION:
     * - Phase 1: Number ranges migrated to parser-first (51.8% faster)
     * - Phase 2: Core sigils (AND/OR, tables) migrated to parser-first  
     * - Phase 3: Complete migration - single-pass AST evaluation
     * 
     * This replaces the multi-pass regex approach with structured parsing:
     * 1. Parse entire template into AST (mixed content support)
     * 2. Evaluate AST bottom-up with proper operator precedence
     * 3. Handle indefinite articles in post-processing pass
     * 
     * Benefits: Better precedence, cleaner code, foundation for advanced features
     */
    private processTemplate(template: string): string {
        if (this.depth >= (this.options.maxDepth || 10)) {
            return template; // Prevent infinite recursion
        }

        // ARCHITECTURAL DECISION:
        // If the template string is quoted (single or double), treat as literal and do not process for sigils.
        if (
            (template.startsWith('"') && template.endsWith('"')) ||
            (template.startsWith("'") && template.endsWith("'"))
        ) {
            // Remove the quotes and return as literal
            return template.slice(1, -1);
        }

        this.depth++;

        try {
            // Phase 3: Single-pass parser-first approach
            const parsed = parseCompleteTemplate(template);
            let result = this.evaluateTemplateNode(parsed);

            // Post-processing: Handle indefinite articles with context
            // This needs to be done after AST evaluation to have proper word context
            result = this.processIndefiniteArticles(result);

            this.depth--;
            return result;

        } catch (error) {
            // Fallback to original template if parsing fails completely
            if (this.options.debug) {
                console.error(`Template parsing failed for: "${template}"`, error);
            }
            this.depth--;
            return template;
        }
    }

    private resolveTableReference(content: string): string {
        // Parse optional (?), exclusion (!), repetition (*), and modifiers
        let tablePath = content;
        let modifier = '';
        let isOptional = false;
        let exclusions: string[] = [];
        let repetition = 1;

        // Check for repetition: table*{1-3} or table*3
        const repetitionMatch = tablePath.match(/^(.+?)\*(\{[\d-]+\}|\d+)$/);
        if (repetitionMatch) {
            tablePath = repetitionMatch[1];
            const repValue = repetitionMatch[2];
            if (repValue.startsWith('{') && repValue.endsWith('}')) {
                // Range like {1-3}
                const range = repValue.slice(1, -1);
                const [min, max] = range.split('-').map(Number);
                repetition = Math.floor(Math.random() * (max - min + 1)) + min;
            } else {
                repetition = parseInt(repValue);
            }
        }

        // Check for optional: table?
        if (tablePath.endsWith('?')) {
            isOptional = true;
            tablePath = tablePath.slice(0, -1);

            // 50% chance to return empty for optional content
            if (Math.random() < 0.5) {
                return '';
            }
        }

        // Check for exclusions: table!exclude1!exclude2
        const exclusionMatch = tablePath.match(/^([^!]+)(!.+)?$/);
        if (exclusionMatch && exclusionMatch[2]) {
            tablePath = exclusionMatch[1];
            exclusions = exclusionMatch[2].split('!').slice(1); // Remove first empty element
        }

        // Check for modifier: table.modifier
        const parts = tablePath.split('.');
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (['capitalize', 'lowercase', 'pluralForm', 'markov'].includes(lastPart)) {
                modifier = lastPart;
                tablePath = parts.slice(0, -1).join('.');
            }
        }

        // Handle Markov generation specially (needs access to full list)
        if (modifier === 'markov') {
            const list = getNestedValue(this.lists, tablePath);
            if (Array.isArray(list)) {
                // Filter out exclusions if any
                let filteredList = list;
                if (exclusions.length > 0) {
                    filteredList = list.filter(item => {
                        const cleanItem = item.replace(/ \^[\d.]+$/, ''); // Remove weight for comparison
                        return !exclusions.some(exc => cleanItem.toLowerCase().includes(exc.toLowerCase()));
                    });
                }

                if (filteredList.length === 0) {
                    return `[${tablePath}]`; // No items after filtering
                }

                // Generate multiple Markov results if repetition is requested
                const results: string[] = [];
                for (let i = 0; i < repetition; i++) {
                    const markovResult = generateMarkov(filteredList);
                    results.push(markovResult);
                }
                return results.join(', ');
            } else {
                return `[${tablePath}]`; // Graceful degradation
            }
        }

        // Generate the requested number of items
        const results: string[] = [];
        for (let i = 0; i < repetition; i++) {
            const item = this.selectFromTable(tablePath, exclusions);
            if (item) {
                let processedItem = this.processTemplate(item); // Recursive processing
                if (modifier) {
                    processedItem = applyModifier(processedItem, modifier);
                }
                results.push(processedItem);
            }
        }

        return results.join(', ');
    }

    /**
     * Selects an item from a YAML table with graceful degradation.
     * 
     * GRACEFUL DEGRADATION BEHAVIOR:
     * - Missing tables: Returns empty string ("") + console warning
     * - Empty tables after filtering: Returns empty string ("")
     * - Invalid table data: Returns empty string ("") + console warning
     * 
     * This ensures that reference sigils [missing_table] degrade gracefully
     * rather than crashing or returning placeholder text like "[missing_table]".
     * 
     * Examples:
     * - [weapons] where weapons exists → random weapon name
     * - [missing] where missing doesn't exist → "" (empty string)
     * - [weapons!*] where all items filtered → "" (empty string)
     * 
     * @param tablePath Dot-notation path to table in YAML data
     * @param exclusions Array of strings to exclude from selection
     * @returns Selected item string or empty string if table missing/empty
     */
    private selectFromTable(tablePath: string, exclusions: string[] = []): string {
        const list = getNestedValue(this.lists, tablePath);

        if (!Array.isArray(list)) {
            if (this.options.debug) {
                console.warn(`Table not found or not array: ${tablePath}`);
            }
            return ''; // Graceful degradation - return empty string
        }

        // Filter out exclusions
        let filteredList = list;
        if (exclusions.length > 0) {
            filteredList = list.filter(item => {
                const cleanItem = item.replace(/ \^[\d.]+$/, ''); // Remove weight for comparison
                return !exclusions.some(exc => cleanItem.toLowerCase().includes(exc.toLowerCase()));
            });
        }

        if (filteredList.length === 0) {
            return ''; // No items after filtering - return empty string
        }

        const weightedItems = parseWeightedList(filteredList);
        return selectWeighted(weightedItems);
    }

    private processIndefiniteArticles(text: string): string {
        // Pattern: {a} word
        return text.replace(/\{a\}\s+(\w+)/g, (match, word) => {
            return `${getIndefiniteArticle(word)} ${word}`;
        });
    }

    /**
     * Evaluates a parsed TemplateNode using bottom-up AST evaluation.
     * 
     * This implements the core of our "algebraic" template evaluation approach:
     * - Processes leaf nodes (tables, text) first
     * - Applies operators (&, |) with proper precedence  
     * - Recursively evaluates nested structures
     * 
     * Operator Precedence Rules:
     * - AND (&) takes precedence over optional (?) - strips trailing ?
     * - Evaluation proceeds from innermost to outermost expressions
     * 
     * @param node TemplateNode to evaluate (from parseCompleteTemplate)
     * @returns Fully resolved string result
     */
    private evaluateTemplateNode(node: TemplateNode): string {
        switch (node.type) {
            case 'text':
                return node.value;

            case 'table':
                // Handle optional tables - 50% chance to return empty
                if (node.isOptional && Math.random() < 0.5) {
                    return '';
                }

                // Determine repetition count
                let repetitionCount: number;
                if (typeof node.repetition === 'number') {
                    repetitionCount = node.repetition;
                } else {
                    const { min, max } = node.repetition;
                    repetitionCount = Math.floor(Math.random() * (max - min + 1)) + min;
                }

                // Generate the requested number of items
                const results: string[] = [];
                for (let i = 0; i < repetitionCount; i++) {
                    const item = this.selectFromTable(node.tablePath, node.exclusions);
                    if (item) {
                        let processedItem = this.processTemplate(item); // Recursive processing
                        // Support chained modifiers (array)
                        if (Array.isArray(node.modifiers)) {
                            for (const mod of node.modifiers) {
                                processedItem = applyModifier(processedItem, mod);
                            }
                        }
                        results.push(processedItem);
                    }
                }

                return results.join(', ');

            case 'and':
                /**
                 * OPERATOR PRECEDENCE DESIGN DECISION:
                 * 
                 * AND operations have higher precedence than individual operand optionality.
                 * When using & (AND), the semantic intent is "this AND that" not "this AND maybe that".
                 * 
                 * Examples:
                 * - {[a]&[b]?} should ALWAYS return both 'a' and 'b', never just 'a'
                 * - {[weapon]&[armor]?} should return "sword plate mail", not sometimes just "sword"
                 * 
                 * Mathematical precedence rule: The & operator overrides the ? modifier on individual operands.
                 * This ensures consistent, predictable behavior that matches user semantic expectations.
                 * 
                 * Implementation: Force isOptional: false for all table nodes within AND operations.
                 */
                const andResults = node.nodes.map(n => {
                    if (n.type === 'table') {
                        // Create a copy of the table node with isOptional forced to false
                        const requiredTableNode = { ...n, isOptional: false };
                        return this.evaluateTemplateNode(requiredTableNode);
                    } else {
                        return this.evaluateTemplateNode(n);
                    }
                });
                return andResults.join('');

            case 'or':
                const orOptions = node.nodes;
                const chosen = orOptions[Math.floor(Math.random() * orOptions.length)];
                return this.evaluateTemplateNode(chosen);

            case 'group':
                return this.evaluateTemplateNode(node.node);

            case 'number_range':
                const result = Math.floor(Math.random() * (node.max - node.min + 1)) + node.min;
                return result.toString();

            case 'indefinite_article':
                // Return a placeholder that will be processed later with context
                return '{a}';

            case 'mixed':
                // Evaluate all sub-nodes and concatenate results
                const mixedResults = node.nodes.map(n => this.evaluateTemplateNode(n));
                return mixedResults.join('');

            default:
                return '';
        }
    }
}
