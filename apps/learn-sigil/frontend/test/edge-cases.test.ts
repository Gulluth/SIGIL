import { describe, it, expect } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SIGIL Edge Cases for Template String Processing', () => {
  it('should handle circular references gracefully', async () => {
    const processor = new SigilProcessor();

    // Test potential circular reference
    const yaml = `
a: "[b]"
b: "[a]"
`;

    const result = await processor.processYaml(yaml, 'a');
    console.log('Circular reference result:', result);

    // Should not crash and should return something (likely the original string after depth limit)
    expect(result.success).toBe(true);
    expect(typeof result.output).toBe('string');
  });

  it('should handle plain text with brackets correctly', async () => {
    const processor = new SigilProcessor();

    const yaml = `
message: "This is [not a template] but plain text"
`;

    const result = await processor.processYaml(yaml, 'message');
    console.log('Plain text result:', result);

    // Should process it but since [not a template] doesn't exist, it should return empty or the string
    expect(result.success).toBe(true);
    expect(typeof result.output).toBe('string');
  });

  it('should handle deeply nested templates', async () => {
    const processor = new SigilProcessor();

    const yaml = `
devices: ['sword', 'axe']  
conditions: ['sharp', 'dull']
level1: "[conditions] [devices]"
level2: "A [level1]"
level3: "Found: [level2]"
`;

    const result = await processor.processYaml(yaml, 'level3');
    console.log('Deep nesting result:', result);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Found: A ');
    expect(result.output.includes('sword') || result.output.includes('axe')).toBe(true);
  });
});