import { describe, it, expect } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SIGIL Quote Investigation', () => {
  it('should test unquoted vs quoted templates', async () => {
    const processor = new SigilProcessor();

    // Test unquoted template (should work according to README)
    const yaml = `
devices:
  - laser rifle
  - plasma cannon

condition:
  - broken
  - operational

# Unquoted template - should be processed
basic_item: [condition] [devices]
# Quoted template - treated as literal
quoted_item: "[condition] [devices]"
`;

    console.log('=== Testing Unquoted vs Quoted ===');

    const result1 = await processor.processYaml(yaml, 'basic_item', true);
    console.log('Unquoted result:', result1);

    const result2 = await processor.processYaml(yaml, 'quoted_item', true);
    console.log('Quoted result:', result2);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });
});