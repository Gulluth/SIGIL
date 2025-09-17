/**
 * SIGIL Template Engine
 * Handles all SIGIL syntax: [table], {a}, {this|that}, weights, modifiers, etc.
 */

import { SigilData } from './yaml-loader';

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
     * Process a template string with full SIGIL syntax
     */
    public generate(template: string): string {
        this.depth = 0;
        return this.processTemplate(template);
    }

    private processTemplate(template: string): string {
        if (this.depth >= (this.options.maxDepth || 10)) {
            return template; // Prevent infinite recursion
        }

        this.depth++;

        let result = template;

        // Process [table] references (including modifiers, optional, exclusion, repetition)
        result = this.processTableReferences(result);

        // Process {a} indefinite articles
        result = this.processIndefiniteArticles(result);

        // Process {this|that} inline randomization
        result = this.processInlineRandomization(result);

        // Process {1-10} number ranges
        result = this.processNumberRanges(result);

        this.depth--;
        return result;
    }

    private processTableReferences(text: string): string {
        // Pattern: [table.subtable.modifier?!*{count}]
        const tablePattern = /\[([^\]]+)\]/g;

        return text.replace(tablePattern, (match, content) => {
            try {
                return this.resolveTableReference(content);
            } catch (error) {
                if (this.options.debug) {
                    console.error(`Error resolving ${match}:`, error);
                }
                return match; // Return original on error
            }
        });
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
            if (['capitalize', 'lowercase', 'pluralForm'].includes(lastPart)) {
                modifier = lastPart;
                tablePath = parts.slice(0, -1).join('.');
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

    private selectFromTable(tablePath: string, exclusions: string[] = []): string {
        const list = getNestedValue(this.lists, tablePath);

        if (!Array.isArray(list)) {
            if (this.options.debug) {
                console.warn(`Table not found or not array: ${tablePath}`);
            }
            return `[${tablePath}]`; // Graceful degradation
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
            return `[${tablePath}]`; // No items after filtering
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

    private processInlineRandomization(text: string): string {
        // Pattern: {option1|option2|option3}
        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            if (content.includes('|')) {
                const options = content.split('|').map((opt: string) => opt.trim());
                return options[Math.floor(Math.random() * options.length)];
            }
            return match; // Not a randomization pattern
        });
    }

    private processNumberRanges(text: string): string {
        // Pattern: {1-10} or {5-20}
        return text.replace(/\{(\d+)-(\d+)\}/g, (match, min, max) => {
            const minNum = parseInt(min);
            const maxNum = parseInt(max);
            const result = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            return result.toString();
        });
    }
}
