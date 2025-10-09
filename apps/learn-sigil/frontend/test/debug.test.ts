import { describe, it, expect, beforeEach } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SIGIL Debug Test', () => {
  let processor: SigilProcessor;

  beforeEach(() => {
    processor = new SigilProcessor();
  });

  it('should debug a simple case', async () => {
    const yaml = `
weapons:
  - sword
  - bow

weapon: "[weapons]"
`;

    console.log('Testing SIGIL with debug enabled...');
    const result = await processor.processYaml(yaml, 'weapon', true);

    console.log('Final result:', result);
    expect(result.success).toBe(true);
  });
});