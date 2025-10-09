import { describe, it, expect, beforeEach } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SigilProcessor', () => {
  let processor: SigilProcessor;

  beforeEach(() => {
    processor = new SigilProcessor();
  });

  describe('Basic SIGIL functionality', () => {
    it('should process a simple list template', async () => {
      const yaml = `
weapons:
  - sword
  - bow
  - dagger

weapon: "[weapons]"
`;

      const result = await processor.processYaml(yaml, 'weapon');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(['sword', 'bow', 'dagger']).toContain(result.output);
    });

    it('should process templates with text', async () => {
      const yaml = `
weapons:
  - sword
  - bow
  - dagger

find_weapon: "You find a [weapons]"
`;

      const result = await processor.processYaml(yaml, 'find_weapon');

      expect(result.success).toBe(true);
      expect(result.output).toMatch(/You find a (sword|bow|dagger)/);
    });

    it('should handle choice syntax', async () => {
      const yaml = `
greeting: "Hello {friend|stranger|traveler}"
`;

      const result = await processor.processYaml(yaml, 'greeting');

      expect(result.success).toBe(true);
      expect(result.output).toMatch(/Hello (friend|stranger|traveler)/);
    });
  });

  describe('Error handling', () => {
    it('should handle missing template ID', async () => {
      const yaml = `
weapons:
  - sword
  - bow
`;

      const result = await processor.processYaml(yaml, 'nonexistent');

      expect(result.success).toBe(true); // SIGIL handles missing gracefully
      // When template doesn't exist, SIGIL tries [nonexistent] which returns empty/missing
      expect(result.output).toBe(''); // SIGIL returns empty for missing references
    });

    it('should handle invalid YAML', async () => {
      const invalidYaml = `
weapons:
  - sword
  - bow
invalid: [
`;

      const result = await processor.processYaml(invalidYaml, 'weapon');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty template ID', async () => {
      const yaml = `
weapons:
  - sword
`;

      const result = await processor.processYaml(yaml, '');

      expect(result.success).toBe(true);
      expect(result.output).toBe('Enter a template ID and click Generate');
    });
  });

  describe('Complex SIGIL features', () => {
    it('should handle nested references', async () => {
      const yaml = `
weapons:
  - sword
  - bow

materials:
  - iron
  - steel

weapon: "[materials] [weapons]"
`;

      const result = await processor.processYaml(yaml, 'weapon');

      expect(result.success).toBe(true);
      expect(result.output).toMatch(/(iron|steel) (sword|bow)/);
    });

    it('should process the example from our editor', async () => {
      const yaml = `# SIGIL Example - Fantasy Weapons
weapons:
  - sword
  - bow  
  - staff
  - dagger

materials:
  - iron
  - steel
  - elvish
  - cursed

weapon_find: "You find a [materials] [weapons]"
weapon_craft: "You craft a {masterwork|crude} [weapons] from [materials]"`;

      const result = await processor.processYaml(yaml, 'weapon_find');

      expect(result.success).toBe(true);
      expect(result.output).toMatch(/You find a (iron|steel|elvish|cursed) (sword|bow|staff|dagger)/);
    });
  });

  describe('YAML validation', () => {
    it('should validate correct YAML', () => {
      const yaml = `
weapons:
  - sword
  - bow
`;

      const validation = processor.validateYaml(yaml);

      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should reject invalid YAML', () => {
      const invalidYaml = `
weapons:
  - sword
  - bow
invalid: [
`;

      const validation = processor.validateYaml(invalidYaml);

      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });
});