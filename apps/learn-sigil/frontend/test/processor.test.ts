import { describe, it, expect, beforeEach } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor.js';

describe('SigilProcessor', () => {
  let processor: SigilProcessor;

  beforeEach(() => {
    processor = new SigilProcessor();
  });

  describe('Flat YAML structures', () => {
    const flatYaml = `
weapon:
  - sword
  - axe
  - bow

material:
  - iron
  - steel
  - wood
`;

    it('should process flat YAML structure correctly', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': flatYaml },
        'weapon'
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(['sword', 'axe', 'bow']).toContain(result.output);
    });

    it('should handle multiple flat templates', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': flatYaml },
        'material'
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(['iron', 'steel', 'wood']).toContain(result.output);
    });
  });

  describe('Hierarchical YAML structures with dot notation', () => {
    const hierarchicalYaml = `
weapon:
  melee:
    - sword
    - axe
    - dagger
  ranged:
    - bow
    - crossbow
    - sling

dot:
  notation:
    - testing value 1
    - testing value 2
    - testing value 3

materials:
  - iron
  - steel
  - wood

templates:
  weapon: "A [weapon.melee] made of [materials]"
`;

    it('should handle hierarchical dot notation access', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': hierarchicalYaml },
        'weapon.melee'
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(['sword', 'axe', 'dagger']).toContain(result.output);
    });

    it('should handle deep dot notation access', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': hierarchicalYaml },
        'dot.notation'
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(['testing value 1', 'testing value 2', 'testing value 3']).toContain(result.output);
    });

    it('should handle ranged weapons via dot notation', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': hierarchicalYaml },
        'weapon.ranged'
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(['bow', 'crossbow', 'sling']).toContain(result.output);
    });

    it('should handle template expansion with dot notation', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': hierarchicalYaml },
        'templates.weapon'
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      // Should expand to something like "A sword made of iron"
      expect(result.output).toMatch(/^A (sword|axe|dagger) made of (iron|steel|wood)$/);
    });
  });

  describe('Multi-file processing', () => {
    const baseYaml = `
weapon:
  melee:
    - sword
    - axe

materials:
  - iron
  - steel
`;

    const extensionYaml = `
weapon:
  ranged:
    - bow
    - crossbow

materials:
  - wood
  - bronze
`;

    it('should merge multiple files correctly', async () => {
      const result = await processor.processMultipleYaml(
        {
          'base.yaml': baseYaml,
          'extension.yaml': extensionYaml
        },
        'weapon.melee'
      );

      expect(result.success).toBe(true);
      expect(['sword', 'axe']).toContain(result.output);
    });

    it('should merge arrays from multiple files', async () => {
      const result = await processor.processMultipleYaml(
        {
          'base.yaml': baseYaml,
          'extension.yaml': extensionYaml
        },
        'materials'
      );

      expect(result.success).toBe(true);
      // Should contain items from both files
      expect(['iron', 'steel', 'wood', 'bronze']).toContain(result.output);
    });

    it('should handle ranged weapons from second file', async () => {
      const result = await processor.processMultipleYaml(
        {
          'base.yaml': baseYaml,
          'extension.yaml': extensionYaml
        },
        'weapon.ranged'
      );

      expect(result.success).toBe(true);
      expect(['bow', 'crossbow']).toContain(result.output);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid YAML gracefully', async () => {
      const invalidYaml = `
weapon:
  - sword
  - axe
invalid: [unclosed bracket
`;

      const result = await processor.processMultipleYaml(
        { 'invalid.yaml': invalidYaml },
        'weapon'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty template ID', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': 'weapon:\n  - sword' },
        ''
      );

      expect(result.success).toBe(true);
      expect(result.output).toBe('Enter a template ID and click Generate');
    });

    it('should handle non-existent template', async () => {
      const result = await processor.processMultipleYaml(
        { 'test.yaml': 'weapon:\n  - sword' },
        'nonexistent.template'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Complex hierarchical structures', () => {
    const complexYaml = `
character:
  classes:
    warrior:
      - fighter
      - paladin
      - barbarian
    mage:
      - wizard
      - sorcerer
      - warlock
    rogue:
      - thief
      - assassin
      - bard

equipment:
  armor:
    heavy:
      - plate mail
      - chain mail
    light:
      - leather armor
      - studded leather
  weapons:
    melee:
      - sword
      - axe
    ranged:
      - bow
      - crossbow

world:
  locations:
    cities:
      - Waterdeep
      - Neverwinter
    dungeons:
      - Undermountain
      - Tomb of Horrors

templates:
  hero: "A [character.classes.warrior] wearing [equipment.armor.heavy] from [world.locations.cities]"
`;

    it('should handle deep nested dot notation', async () => {
      const result = await processor.processMultipleYaml(
        { 'complex.yaml': complexYaml },
        'character.classes.warrior'
      );

      expect(result.success).toBe(true);
      expect(['fighter', 'paladin', 'barbarian']).toContain(result.output);
    });

    it('should handle equipment weapons', async () => {
      const result = await processor.processMultipleYaml(
        { 'complex.yaml': complexYaml },
        'equipment.weapons.ranged'
      );

      expect(result.success).toBe(true);
      expect(['bow', 'crossbow']).toContain(result.output);
    });

    it('should handle world locations', async () => {
      const result = await processor.processMultipleYaml(
        { 'complex.yaml': complexYaml },
        'world.locations.cities'
      );

      expect(result.success).toBe(true);
      expect(['Waterdeep', 'Neverwinter']).toContain(result.output);
    });

    it('should expand complex templates with multiple dot notations', async () => {
      const result = await processor.processMultipleYaml(
        { 'complex.yaml': complexYaml },
        'templates.hero'
      );

      expect(result.success).toBe(true);
      expect(result.output).toMatch(/^A (fighter|paladin|barbarian) wearing (plate mail|chain mail) from (Waterdeep|Neverwinter)$/);
    });
  });

  describe('Array format input', () => {
    it('should handle array format input', async () => {
      const result = await processor.processMultipleYaml(
        [
          { filename: 'test.yaml', content: 'weapon:\n  - sword\n  - axe' }
        ],
        'weapon'
      );

      expect(result.success).toBe(true);
      expect(['sword', 'axe']).toContain(result.output);
    });
  });
});