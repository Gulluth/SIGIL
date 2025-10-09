import { describe, it, expect } from 'vitest';
import { SigilProcessor } from '../src/lib/sigil/processor';

describe('SIGIL Debug Template Processing', () => {
  it('should debug why template strings return empty', async () => {
    const processor = new SigilProcessor();

    const yaml = `
devices: 
  - sword
  - axe  
conditions: 
  - sharp
  - dull
level1: "[conditions] [devices]"
`;

    // Test each level (correct signature: yamlContent, templateId)
    const devicesResult = await processor.processYaml(yaml, 'devices');
    console.log('Devices result:', devicesResult);

    const conditionsResult = await processor.processYaml(yaml, 'conditions');
    console.log('Conditions result:', conditionsResult);

    const level1Result = await processor.processYaml(yaml, 'level1');
    console.log('Level1 result:', level1Result);
  });
});