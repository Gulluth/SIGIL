// src/template-parser.ts
// SIGIL Template Parser - Sigil Processing Engine
//
// SIGIL BEHAVIOR SPECIFICATION
// ============================
// SIGIL uses symbolic characters called "sigils" to define generation behavior.
// ALL strings are evaluated for sigils - there is no distinction between "templates" and "data".
//
// CORE PRINCIPLE: Universal Processing
// - Every string gets evaluated to see if it contains sigils
// - If sigils are found, process them according to their rules
// - If no sigils (or invalid sigils), return the literal string
// - Processing continues recursively until no sigils remain
//
// SIGIL TYPES:
//
// 1. INLINE SIGILS: {}
//    - Container for inline processing
//    - {material} → returns "material" (single text element)
//    - {this|that} → returns "this" OR "that" (OR operator)
//    - {[table1]|[table2]} → processes table lookups, returns result
//    - {red&large} → returns "redlarge" (AND operator - concatenation)
//    - {[table1]&[table2]} → processes table lookups, returns concatenated result
//
// 2. REFERENCE SIGILS: []
//    - Performs table lookups in YAML data
//    - [weapons] → looks up "weapons" table, returns random item
//    - [missing_table] → table not found → returns "" + console warning
//    - [weapons*3] → repetition modifier, returns 3 items from "weapons" table
//    - [weapons?] → optional modifier, 50% chance of empty string
//    - [weapons!broken] → exclusion modifier, filters out items containing "broken"
//
// 3. GRACEFUL DEGRADATION:
//    - Missing tables return empty string ("")
//    - Invalid syntax returns literal text
//    - Console warnings for debugging (when debug: true)
//    - No crashes or exceptions for malformed input
//
// 4. RECURSIVE PROCESSING:
//    - Results are processed again until no sigils remain
//    - Example: [weapons] → "{melee|ranged} weapon" → "melee weapon"
//    - Recursion depth limited to prevent infinite loops
//
// ARCHITECTURAL APPROACH: Bottom-up AST Evaluation
// ================================================
// This parser implements "bottom-up AST evaluation with operator precedence" - 
// the same approach used in mathematical expression evaluation (like algebra).
//
// Process:
// 1. PARSE: Convert template string into Abstract Syntax Tree (AST)
// 2. EVALUATE: Process from innermost nodes to outermost (post-order traversal)
// 3. COMBINE: Apply operators (&, |) according to precedence rules
//
// Example: "{[a*2]&{[b]|[c?]}}"
// 1. Parse into: AND(table(a*2), OR(table(b), table(c?)))
// 2. Evaluate innermost: [a*2] -> "foo, foo", [b] -> "bar", [c?] -> "baz" or ""
// 3. Apply OR: {bar|baz} -> "bar" or "baz"
// 4. Apply AND: "foo, foo" & "bar" -> "foo, foobar"
//
// This eliminates ad-hoc string manipulation in favor of Abstract Syntax Tree (AST) evaluation,
// providing robust handling of nested expressions and operator precedence.

export type TemplateNode =
    | { type: 'text', value: string }
    | { type: 'and', nodes: TemplateNode[] }
    | { type: 'or', nodes: TemplateNode[] }
    | {
        type: 'table',
        tablePath: string,
        modifiers?: string[],
        modifier?: string, // for backward compatibility
        isOptional: boolean,
        exclusions: string[],
        repetition: number | { min: number, max: number }
    }
    | { type: 'number_range', min: number, max: number }
    | { type: 'group', node: TemplateNode }
    | { type: 'indefinite_article' }
    | { type: 'mixed', nodes: TemplateNode[] };

/**
 * Parses a template string into a TemplateNode tree for bottom-up evaluation.
 * 
 * Uses recursive descent parsing to build an AST that respects operator precedence.
 * Currently handles top-level & and | operators with basic [table] and text support.
 *
 * @param input Template string to parse (e.g., "{[a*2]&{[b]|[c?]}}")
 * @returns TemplateNode AST ready for bottom-up evaluation
 * 
 * Example: "{[a*2]&{[b]|[c?]}}" -> and([table(a*2), or([table(b), table(c?)])])
 */
export function parseTemplateExpression(input: string): TemplateNode {
    // Remove outermost braces if present
    let str = input.trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        str = str.slice(1, -1);
    }

    // Top-level split on & (AND)
    let andParts = splitTopLevel(str, '&');
    if (andParts.length > 1) {
        return { type: 'and', nodes: andParts.map(parseTemplateExpression) };
    }

    // Top-level split on | (OR)
    let orParts = splitTopLevel(str, '|');
    if (orParts.length > 1) {
        return { type: 'or', nodes: orParts.map(parseTemplateExpression) };
    }

    // Table reference (with optional modifiers like ?, !, *, etc.)
    if (str.startsWith('[') && str.includes(']')) {
        // Extract table content up to the closing bracket, and any trailing modifiers
        const closingBracket = str.indexOf(']');
        const tableContent = str.slice(1, closingBracket);
        const modifiers = str.slice(closingBracket + 1);

        // Parse the table reference with all modifiers
        return parseTableReference(tableContent, modifiers);
    }

    // Grouped expression: ( ... )
    if (str.startsWith('(') && str.endsWith(')')) {
        // Remove outermost parentheses and parse as group
        const inner = str.slice(1, -1).trim();
        return { type: 'group', node: parseTemplateExpression(inner) };
    }
    // Braced group: { ... } (not parenthesized)
    if (str.startsWith('{') && str.endsWith('}')) {
        // Parse as normal expression (OR/AND)
        return parseTemplateExpression(str.slice(1, -1));
    }

    // Number range: 1-10, 5-20, etc.
    const numberRangeMatch = str.match(/^(\d+)-(\d+)$/);
    if (numberRangeMatch) {
        const min = parseInt(numberRangeMatch[1]);
        const max = parseInt(numberRangeMatch[2]);
        return { type: 'number_range', min, max };
    }

    // Indefinite article: 'a'
    if (str === 'a') {
        return { type: 'indefinite_article' };
    }

    // Plain text
    return { type: 'text', value: str };
}

// Utility: split on a character, but only at top level (not inside braces/brackets)
function splitTopLevel(str: string, sep: string): string[] {
    let parts: string[] = [];
    let depth = 0;
    let last = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '{' || str[i] === '[') depth++;
        if (str[i] === '}' || str[i] === ']') depth--;
        if (str[i] === sep && depth === 0) {
            parts.push(str.slice(last, i));
            last = i + 1;
        }
    }
    parts.push(str.slice(last));
    return parts.map(s => s.trim()).filter(Boolean);
}

/**
 * Phase 3: Parse a complete template that may contain mixed content.
 * 
 * This is the main function for full AST-based parsing and evaluation.
 * Unlike parseTemplateExpression which handles single expressions like "{a|b}",
 * this function can parse complete templates like:
 * "A {[weapons]&[materials]} {a} [creature] appears"
 * 
 * Strategy: Scan for SIGIL patterns and build an AST of mixed content.
 */
export function parseCompleteTemplate(template: string): TemplateNode {
    const nodes: TemplateNode[] = [];
    let currentPos = 0;

    // Scan through the template looking for SIGIL patterns
    while (currentPos < template.length) {
        // Look for the next SIGIL pattern
        const nextPattern = findNextSigilPattern(template, currentPos);

        if (!nextPattern) {
            // No more patterns, add remaining text
            const remainingText = template.slice(currentPos);
            if (remainingText) {
                nodes.push({ type: 'text', value: remainingText });
            }
            break;
        }

        // Add text before the pattern
        if (nextPattern.start > currentPos) {
            const textBefore = template.slice(currentPos, nextPattern.start);
            if (textBefore) {
                nodes.push({ type: 'text', value: textBefore });
            }
        }

        // Parse the pattern itself
        try {
            const patternNode = parseSigilPattern(nextPattern);
            nodes.push(patternNode);
        } catch (error) {
            // If parsing fails, treat as literal text
            nodes.push({ type: 'text', value: nextPattern.fullMatch });
        }

        currentPos = nextPattern.end;
    }

    // If we only have one node and it's not text, return it directly
    if (nodes.length === 1 && nodes[0].type !== 'text') {
        return nodes[0];
    }

    // If we only have one text node, return it directly
    if (nodes.length === 1 && nodes[0].type === 'text') {
        return nodes[0];
    }

    // Multiple nodes - return as mixed content
    return { type: 'mixed', nodes };
}

interface SigilPattern {
    start: number;
    end: number;
    content: string;  // Content without brackets/braces
    fullMatch: string; // Full match including brackets/braces
    type: 'table' | 'inline';
}

/**
 * Find the next SIGIL pattern in the template string with proper nesting support
 */
function findNextSigilPattern(template: string, startPos: number): SigilPattern | null {
    let nearestMatch: SigilPattern | null = null;

    // Look for table patterns [...]
    const tableMatch = findBalancedPattern(template, startPos, '[', ']');
    if (tableMatch) {
        nearestMatch = {
            start: tableMatch.start,
            end: tableMatch.end,
            content: tableMatch.content,
            fullMatch: tableMatch.fullMatch,
            type: 'table'
        };
    }

    // Look for inline patterns {...}
    const inlineMatch = findBalancedPattern(template, startPos, '{', '}');
    if (inlineMatch && (!nearestMatch || inlineMatch.start < nearestMatch.start)) {
        nearestMatch = {
            start: inlineMatch.start,
            end: inlineMatch.end,
            content: inlineMatch.content,
            fullMatch: inlineMatch.fullMatch,
            type: 'inline'
        };
    }

    return nearestMatch;
}

/**
 * Find a balanced pattern with proper nesting support (e.g., {...} or [...])
 */
function findBalancedPattern(template: string, startPos: number, openChar: string, closeChar: string): SigilPattern | null {
    let openIndex = template.indexOf(openChar, startPos);
    if (openIndex === -1) return null;

    let depth = 0;
    let closeIndex = -1;

    for (let i = openIndex; i < template.length; i++) {
        if (template[i] === openChar) {
            depth++;
        } else if (template[i] === closeChar) {
            depth--;
            if (depth === 0) {
                closeIndex = i;
                break;
            }
        }
    }

    if (closeIndex === -1) return null; // No matching close bracket

    const fullMatch = template.slice(openIndex, closeIndex + 1);
    const content = template.slice(openIndex + 1, closeIndex);

    return {
        start: openIndex,
        end: closeIndex + 1,
        content,
        fullMatch,
        type: openChar === '[' ? 'table' : 'inline'
    };
}

/**
 * Parse a specific SIGIL pattern that was found
 */
function parseSigilPattern(pattern: SigilPattern): TemplateNode {
    switch (pattern.type) {
        case 'table':
            return parseTableReference(pattern.content, '');

        case 'inline':
            return parseTemplateExpression(pattern.fullMatch);

        default:
            return { type: 'text', value: pattern.fullMatch };
    }
}

/**
 * Parse a table reference with all modifiers
 * Examples: "table", "table.subtable", "table!item*3?", "table*{1-3}"
 * Note: Only known text modifiers (capitalize, lowercase, pluralForm, markov) are treated as modifiers
 * Everything else is part of the table path
 */
function parseTableReference(content: string, trailingModifiers: string): TemplateNode {

    // Known text modifiers that should be separated from table path (add more as needed)
    const knownModifiers = ['capitalize', 'lowercase', 'pluralForm', 'markov'];

    // Extract the core table reference (before any !, *, ?, ^)
    const coreMatch = content.match(/^([^!*?^]+?)(?:\^(\d+))?(?:!([^*?]+))?(?:\*(\{[\d-]+\}|\d+))?(\?)?$/);
    let tablePath = content;
    let modifiers: string[] = [];
    let weight: string | undefined = undefined;
    let exclusionPart: string | undefined = undefined;
    let repetitionPart: string | undefined = undefined;
    let optional: string | undefined = undefined;

    if (coreMatch) {
        let [, corePath, weightCapture, exclusionCapture, repetitionCapture, optionalCapture] = coreMatch;
        weight = weightCapture;
        exclusionPart = exclusionCapture;
        repetitionPart = repetitionCapture;
        optional = optionalCapture;

        // ARCHITECTURAL DECISION:
        // Modifiers are applied left-to-right, matching user intuition and template order.
        // For [table.capitalize.uppercase], the result is: lookup, then capitalize, then uppercase.
        // We gobble from the right, but reverse the array so the leftmost in the template is first in the array.
        let pathParts = corePath.split('.');
        const tempModifiers: string[] = [];
        while (pathParts.length > 1 && knownModifiers.includes(pathParts[pathParts.length - 1])) {
            tempModifiers.push(pathParts.pop()!);
        }
        modifiers = tempModifiers.reverse(); // Leftmost in template is first in array (left-to-right application)
        tablePath = pathParts.join('.');
    }

    // Parse exclusions
    const exclusions = exclusionPart ? exclusionPart.split('!').filter(Boolean) : [];

    // Parse repetition
    let repetition: number | { min: number, max: number } = 1;
    if (repetitionPart) {
        if (repetitionPart.startsWith('{') && repetitionPart.endsWith('}')) {
            const range = repetitionPart.slice(1, -1);
            const [min, max] = range.split('-').map(Number);
            repetition = { min, max };
        } else {
            repetition = parseInt(repetitionPart);
        }
    }

    // Parse optional
    const isOptional = !!optional || trailingModifiers.includes('?');

    return {
        type: 'table',
        tablePath,
        modifiers: modifiers.length > 0 ? modifiers : undefined,
        isOptional,
        exclusions,
        repetition
    };
}