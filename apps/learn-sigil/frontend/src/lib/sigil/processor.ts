import { SigilEngine, parseYamlContent, createSingleSigilData } from '@gulluth/sigil';

export interface SigilResult {
  success: boolean;
  output?: string;
  error?: string;
}

export class SigilProcessor {
  private engine: SigilEngine;

  constructor() {
    // Initialize with empty data - will be replaced when processing YAML
    this.engine = new SigilEngine({});
  }

  async processYaml(yamlContent: string, templateId?: string, debug = false): Promise<SigilResult> {
    try {
      if (debug) {
        console.log('Processing YAML content:', yamlContent);
        console.log('Template ID:', templateId);
      }

      // Parse a single YAML string into SIGIL internal structure (browser-friendly)
      const loadedData = createSingleSigilData(yamlContent);

      // Create new engine with ALL the data (lists + templates combined)
      // SIGIL treats everything as potential templates
      const allData = { ...loadedData.lists, ...loadedData.templates };
      this.engine = new SigilEngine(allData);

      if (debug) {
        console.log('Loaded data:', allData);
        console.log('Engine created with data');
      }

      // Generate content using the template ID
      if (!templateId || !templateId.trim()) {
        return { success: true, output: 'Enter a template ID and click Generate' };
      }

      // Auto-wrap user input in square brackets for SIGIL template syntax
      const sigilTemplate = `[${templateId.trim()}]`;

      if (debug) {
        console.log(`User input: '${templateId}' -> SIGIL template: '${sigilTemplate}'`);
      }

      const output = this.engine.generate(sigilTemplate);

      if (debug) {
        console.log(`Generated output:`, output);
      }

      return { success: true, output };
    } catch (error) {
      if (debug) {
        console.error('Error in processYaml:', error);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  validateYaml(yamlContent: string): { valid: boolean; error?: string } {
    try {
      createSingleSigilData(yamlContent);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid YAML'
      };
    }
  }
}