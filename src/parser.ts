import * as fs from 'fs';
import * as path from 'path';

const templates = "poi_template"

// Interfaces for type safety
export interface ParsedTemplate {
  segments: string[];
  placeholders: string[];
}

export interface LookupData {
  [key: string]: string | undefined; // Values can be templates or final strings
}

export interface LookupFunctions {
  [key: string]: () => string;
}

export interface TableResult {
  value: string;
}

export interface Table {
  id: string;
  results: TableResult[];
}

export interface TablesData {
  tables: Table[];
}

// Parse Template
export function parseTemplate(template: string): ParsedTemplate {
  const regex = /\{([^}]+)\}/g;
  const placeholders: string[] = [];
  const segments: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    segments.push(template.slice(lastIndex, match.index));
    placeholders.push(match[1]);
    lastIndex = regex.lastIndex;
  }
  segments.push(template.slice(lastIndex));

  return { segments, placeholders };
}

// Lookup function for recursive resolution
export function createLookupFunction(key: string, data: LookupData, maxDepth: number = 10): () => string {
  return function resolve(): string {
    let value = data[key];
    if (!value) return `{${key}}`; // Fallback if key not found

    // Check if value contains placeholders
    const parsed = parseTemplate(value);
    if (parsed.placeholders.length === 0) return value; // No placeholders, return as is

    // Prevent infinite recursion
    if (maxDepth <= 0) return `{${key}}`;

    // Create lookup functions for nested placeholders
    const nestedLookup: LookupFunctions = {};
    for (const placeholder of parsed.placeholders) {
      nestedLookup[placeholder] = createLookupFunction(placeholder, data, maxDepth - 1);
    }

    // Recursively resolve the nested template
    return reconstructString(parsed, nestedLookup);
  };
}

// Reconstruct string from parsed template and lookup functions
export function reconstructString(parsed: ParsedTemplate, lookup: LookupFunctions): string {
  const { segments, placeholders } = parsed;
  let result = segments[0] || '';

  for (let i = 0; i < placeholders.length; i++) {
    const placeholder = placeholders[i];
    const value = lookup[placeholder]?.() || `{${placeholder}}`;
    result += value + (segments[i + 1] || '');
  }

  return result;
}

// Main processing function
export function processTemplate(template: string, data: LookupData): string {
  const parsed = parseTemplate(template);

  // Create lookup functions for all placeholders
  const lookup: LookupFunctions = {};
  for (const placeholder of parsed.placeholders) {
    lookup[placeholder] = createLookupFunction(placeholder, data);
  }

  return reconstructString(parsed, lookup);
}

// Get template by table ID with random selection
export function getTemplateByTableId(tablesData: TablesData, tableId: string): string | null {
  const table = tablesData.tables.find(t => t.id === tableId);
  if (!table || table.results.length === 0) {
    throw new Error(`Table with ID "${tableId}" not found or has no results`);
  }
  const randomIndex = Math.floor(Math.random() * table.results.length);
  return table.results[randomIndex].value;
}

// Get lookup data from all tables with random selection
export function getLookupData(tablesData: TablesData): LookupData {
  const lookupData: LookupData = {};
  for (const table of tablesData.tables) {
    if (table.id !== 'templates' && table.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * table.results.length);
      lookupData[table.id] = table.results[randomIndex].value;
    }
  }
  return lookupData;
}

// Utility to load and process template from tables.json
export function processTemplateFromFile(jsonPath: string, templateTableId: string = templates): string {
  try {
    const tablesPath = path.join(__dirname, jsonPath);
    const tablesData: TablesData = JSON.parse(fs.readFileSync(tablesPath, 'utf-8'));

    const template = getTemplateByTableId(tablesData, templateTableId);
    if (!template) {
      throw new Error('No template found');
    }

    const lookupData = getLookupData(tablesData);
    return processTemplate(template, lookupData);
  } catch (error) {
    throw new Error(`Error processing template: ${error instanceof Error ? error.message : error}`);
  }
}