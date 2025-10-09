import { describe, it, expect } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SIGIL Simple Lists', () => {
  it('should work with basic SIGIL patterns', async () => {
    const processor = new SigilProcessor();

    // Simple flat structure as shown in SIGIL README
    const yaml = `
devices:
  - laser rifle
  - plasma cannon
  - scanner

condition:
  - broken
  - operational  
  - damaged

# Templates that reference the lists
basic_item: "[condition] [devices]"
greeting: "Hello {there|friend|stranger}"
`;

    console.log('=== Testing Basic SIGIL Patterns ===');

    // Test 1: Direct list reference
    const result1 = await processor.processYaml(yaml, 'devices', true);
    console.log('Direct list result:', result1);

    // Test 2: Template with list reference  
    const result2 = await processor.processYaml(yaml, 'basic_item', true);
    console.log('Template result:', result2);

    // Test 3: Inline OR syntax
    const result3 = await processor.processYaml(yaml, 'greeting', true);
    console.log('Inline OR result:', result3);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);

    // Verify outputs match expected patterns
    expect(['laser rifle', 'plasma cannon', 'scanner']).toContain(result1.output);
    expect(result2.output).toMatch(/(broken|operational|damaged) (laser rifle|plasma cannon|scanner)/);
    expect(result3.output).toMatch(/Hello (there|friend|stranger)/);
  });
});