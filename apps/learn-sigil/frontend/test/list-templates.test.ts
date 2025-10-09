import { describe, it, expect } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SIGIL List-Based Templates', () => {
  it('should work with templates as list items', async () => {
    const processor = new SigilProcessor();

    // Structure based on SIGIL README examples
    const yaml = `
devices:
  - laser rifle
  - plasma cannon
  - scanner

condition:
  - broken
  - operational  
  - damaged

# Templates as list items (SIGIL way)
templates:
  - "[condition] [devices]"
  - "Hello {there|friend|stranger}"
  - "You find {a} [devices]"
`;

    console.log('=== Testing List-Based Templates ===');

    // Test 1: Direct list reference (should work)
    const result1 = await processor.processYaml(yaml, 'devices', true);
    console.log('Direct list result:', result1);

    // Test 2: Templates list reference (should pick a random template and process it)
    const result2 = await processor.processYaml(yaml, 'templates', true);
    console.log('Template list result:', result2);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // Direct list should return one of the devices
    expect(['laser rifle', 'plasma cannon', 'scanner']).toContain(result1.output);

    // Templates should return processed template content (not the literal template string)
    expect(result2.output).not.toBe('[condition] [devices]');
    expect(result2.output).not.toBe('Hello {there|friend|stranger}');
  });
});