import { SigilEngine, parseYamlContent, createSingleSigilData, createSigilData } from '@gulluth/sigil';

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

  async processMultipleYaml(yamlFiles: { [filename: string]: string } | { filename: string; content: string }[], templateId?: string, debug = false): Promise<SigilResult> {
    if (!yamlFiles) {
      throw new Error('yamlFiles is required');
    }

    try {
      // Process files using SIGIL's data loader approach
      const yamlContents: string[] = [];

      // Handle both object format { filename: content } and array format
      if (Array.isArray(yamlFiles)) {
        // Array format: [{ filename: string, content: string }]
        if (yamlFiles.length === 0) {
          throw new Error('No YAML files provided');
        }

        for (let i = 0; i < yamlFiles.length; i++) {
          const fileData = yamlFiles[i];

          if (!fileData || typeof fileData !== 'object') {
            continue;
          }

          const { filename, content } = fileData;

          if (!content || content.trim() === '') {
            continue;
          }

          yamlContents.push(content);
        }
      } else {
        // Object format: { filename: content, filename2: content2 }
        const filenames = Object.keys(yamlFiles);
        if (filenames.length === 0) {
          throw new Error('No YAML files provided');
        }

        for (const filename of filenames) {
          const content = yamlFiles[filename];

          if (!content || content.trim() === '') {
            continue;
          }

          yamlContents.push(content);
        }
      }

      // Use SIGIL's built-in multi-file processing
      const sigilData = createSigilData(yamlContents);

      // Create new engine with lists data - exactly like SIGIL's tests
      this.engine = new SigilEngine(sigilData.lists);

      // Generate content using the template ID if provided
      if (!templateId || !templateId.trim()) {
        return { success: true, output: 'Enter a template ID and click Generate' };
      }

      // Auto-wrap user input in square brackets for SIGIL template syntax
      const sigilTemplate = `[${templateId.trim()}]`;

      const output = this.engine.generate(sigilTemplate);

      return { success: true, output };
    } catch (error) {
      console.error('Error processing multiple YAML files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
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

      if (debug) {
        console.log('About to call engine.generate with:', sigilTemplate);
      }

      let output: string;
      try {
        output = this.engine.generate(sigilTemplate);
        if (debug) {
          console.log(`Generated output:`, output);
          console.log('Generation completed successfully');
        }
      } catch (genError) {
        if (debug) {
          console.error('Error during generation:', genError);
        }
        throw new Error(`Generation failed: ${genError instanceof Error ? genError.message : genError}`);
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
