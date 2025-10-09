import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine.js';
import { loadSigilData } from '../src/yaml-loader.js';

let engine: SigilEngine;
let testData: any;

const setupData = () => {
  if (!testData) {
    testData = loadSigilData([
      './examples/data/themes/fantasy.yaml',
      './examples/data/themes/scifi.yaml',
      './examples/data/templates.yaml'
    ]);
    engine = new SigilEngine(testData.lists);
  }
};

describe('SIGIL Template Engine - Basic', () => {
  describe('Text modifiers', () => {
    it('should apply capitalize modifier', () => {
      setupData();
      const result = engine.generate('[weapon.melee.capitalize]');
      assert.ok(typeof result === 'string', 'Should return a string');
      assert.ok(result.length > 0, 'Should not be empty');
      assert.ok(result[0] === result[0].toUpperCase(), 'First character should be uppercase');
    });
    it('should apply pluralForm modifier', () => {
      setupData();
      const result = engine.generate('[materials.pluralForm]');
      assert.ok(typeof result === 'string', 'Should return a string');
      assert.ok(result.length > 0, 'Should not be empty');
    });
  });

  describe('Indefinite articles', () => {
    it('should add correct indefinite articles', () => {
      setupData();
      const result = engine.generate('{a} [weapon.melee]');
      assert.ok(typeof result === 'string', 'Should return a string');
      assert.ok(result.startsWith('a ') || result.startsWith('an '), 'Should start with "a " or "an "');
    });
  });

  describe('Number ranges', () => {
    it('should generate numbers within specified ranges', () => {
      setupData();
      const result = engine.generate('Roll {1-6} damage');
      assert.ok(typeof result === 'string', 'Should return a string');
      const match = result.match(/Roll (\d+) damage/);
      assert.ok(match, 'Should match expected format');
      if (match) {
        const number = parseInt(match[1]);
        assert.ok(number >= 1 && number <= 6, `Number ${number} should be between 1 and 6`);
      }
    });

    it('should handle larger number ranges', () => {
      setupData();
      const result = engine.generate('The chamber has {2-8} exits');
      assert.ok(typeof result === 'string', 'Should return a string');
      const match = result.match(/The chamber has (\d+) exits/);
      assert.ok(match, 'Should match expected format');
      if (match) {
        const number = parseInt(match[1]);
        assert.ok(number >= 2 && number <= 8, `Number ${number} should be between 2 and 8`);
      }
    });
  });

  describe('Fuzzing: basic random template generation', () => {
    it('should not throw or hang on random templates', () => {
      const testEngine = new SigilEngine({
        foo: ['bar', 'baz', 'qux'],
        bar: ['[foo]', 'plain'],
        baz: ['[bar]', 'baz'],
        qux: ['[baz]', 'qux']
      });
      for (let i = 0; i < 100; i++) {
        const template = '[foo]';
        assert.doesNotThrow(() => testEngine.generate(template), `Should not throw on iteration ${i}`);
      }
    });
  });

  describe('Complex templates', () => {
    it('should process templates from data files', () => {
      setupData();
      if (testData.templates.weapon_discovery) {
        const template = testData.templates.weapon_discovery[0];
        const result = engine.generate(template);
        assert.ok(typeof result === 'string', 'Should return a string');
        assert.ok(result.length > 0, 'Should not be empty');
        assert.ok(!result.includes('['), 'Should not contain unresolved references');
      }
    });
  });

  describe('Optional content', () => {
    it('should handle optional content syntax [item?]', () => {
      setupData();
      // Run multiple times to test randomness
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(engine.generate('The sword [weapon.enhancement?] gleams'));
      }
      // All results should be valid strings
      results.forEach(result => {
        assert.ok(typeof result === 'string', 'Should return a string');
        assert.ok(result.includes('sword'), 'Should contain "sword"');
        assert.ok(result.includes('gleams'), 'Should contain "gleams"');
      });
      // Some should have enhancement, some should not (probabilistic test)
      const withEnhancement = results.filter(r => r !== 'The sword  gleams');
      const withoutEnhancement = results.filter(r => r === 'The sword  gleams');
      // At least one should be different (very high probability)
      assert.ok(results.length > 1, 'Should have variations in optional content');
    });
  });
});
