import * as YAML from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

/**
 * YAML Data Loader for SIGIL
 * Handles loading YAML files and merging lists with same names
 */

export interface SigilData {
    [key: string]: any;
}

export interface SigilTemplate {
    [templateName: string]: string[];
}

export interface LoadedData {
    lists: SigilData;
    templates: SigilTemplate;
}

/**
 * Load a single YAML file and parse its contents
 */
export function loadYamlFile(filePath: string): SigilData {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = YAML.parse(fileContent);
        return parsed || {};
    } catch (error) {
        throw new Error(`Failed to load YAML file "${filePath}": ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Merge multiple YAML data objects, combining lists with same names
 */
export function mergeLists(dataObjects: SigilData[]): SigilData {
    const merged: SigilData = {};

    for (const data of dataObjects) {
        for (const [key, value] of Object.entries(data)) {
            if (key === 'templates') {
                // Templates are handled separately
                continue;
            }

            if (Array.isArray(value)) {
                // Merge arrays (lists)
                if (merged[key] && Array.isArray(merged[key])) {
                    merged[key] = [...merged[key], ...value];
                } else {
                    merged[key] = [...value];
                }
            } else if (typeof value === 'object' && value !== null) {
                // Merge objects recursively  
                if (merged[key] && typeof merged[key] === 'object') {
                    merged[key] = { ...merged[key], ...value };
                } else {
                    merged[key] = { ...value };
                }
            } else {
                // For primitive values, last one wins
                merged[key] = value;
            }
        }
    }

    return merged;
}

/**
 * Extract templates from YAML data objects
 */
export function extractTemplates(dataObjects: SigilData[]): SigilTemplate {
    const templates: SigilTemplate = {};

    for (const data of dataObjects) {
        if (data.templates && typeof data.templates === 'object') {
            Object.assign(templates, data.templates);
        }
    }

    return templates;
}

/**
 * Load multiple YAML files and merge them according to SIGIL rules
 */
export function loadSigilData(filePaths: string[]): LoadedData {
    const dataObjects: SigilData[] = [];

    for (const filePath of filePaths) {
        const data = loadYamlFile(filePath);
        dataObjects.push(data);
    }

    const lists = mergeLists(dataObjects);
    const templates = extractTemplates(dataObjects);

    return { lists, templates };
}

/**
 * Load a single YAML file as SIGIL data
 */
export function loadSingleFile(filePath: string): LoadedData {
    return loadSigilData([filePath]);
}
