import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine.js';
import { loadSigilData } from '../src/yaml-loader.js';

describe('SIGIL Template Engine - Error Handling & Fuzzing', () => {
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

  describe('Error handling', () => {
    it('should handle missing table references gracefully', () => {
      setupData();
      const result = engine.generate('[nonexistent_table]');
      assert.ok(typeof result === 'string', 'Should return a string even for missing tables');
    });

    it('should handle complex nested references', () => {
      setupData();
      assert.doesNotThrow(() => {
        engine.generate('[weapon.[materials.capitalize]]');
      }, 'Should not throw for complex nested references');
    });

    it('should handle empty & sigil expressions', () => {
      setupData();
      const testEngine = new SigilEngine({
        empty: [],
        valid: ['test']
      });
      const result1 = testEngine.generate('{[empty]&[empty]}');
      assert.ok(typeof result1 === 'string', 'Should return a string for empty & empty');
      const result2 = testEngine.generate('{[valid]&[empty]}');
      assert.ok(typeof result2 === 'string', 'Should return a string for valid & empty');
      const result3 = testEngine.generate('{[empty]&[valid]}');
      assert.ok(typeof result3 === 'string', 'Should return a string for empty & valid');
    });

    it('should handle circular references without infinite recursion', () => {
      setupData();
      const testEngine = new SigilEngine({
        circular1: ['[circular2] item'],
        circular2: ['[circular1] thing']
      });
      // Should not crash or hang - recursion depth should be limited
      assert.doesNotThrow(() => {
        const result = testEngine.generate('[circular1]');
        assert.ok(typeof result === 'string', 'Should return a string even with circular references');
      }, 'Should handle circular references gracefully');
    });

    it('should handle whitespace in template strings', () => {
      setupData();
      const testEngine = new SigilEngine({
        items: ['sword', 'shield'],
        conditions: ['rusty', 'gleaming']
      });
      // Test various whitespace scenarios
      const result1 = testEngine.generate('  {[items]&[conditions]}  ');
      assert.ok(typeof result1 === 'string', 'Should handle leading/trailing whitespace');
      assert.ok(result1.trim().length > 0, 'Should have content after trimming');
      const result2 = testEngine.generate('A { [items] & [conditions] } weapon');
      assert.ok(typeof result2 === 'string', 'Should handle spaces around & sigil');
      assert.ok(result2.includes('weapon'), 'Should preserve surrounding text');
    });
  });

  describe('Malformed template syntax', () => {
    it('should handle unmatched brackets', () => {
      const testEngine = new SigilEngine({ value: ['test'] });
      const templates = [
        '[simple',
        'simple]',
        '{simple}',
        '[[simple]',
        '[simple]]'
      ];
      templates.forEach(template => {
        const result = testEngine.generate(template);
        assert.ok(typeof result === 'string', `Should return string for template: ${template}`);
      });
    });
    it('should handle incomplete sigil syntax', () => {
      const testEngine = new SigilEngine({
        list1: ['a', 'b'],
        list2: ['x', 'y']
      });
      const templates = [
        '{[list1]&}', '{[list1]|}', '{[list1]?}', '{[list1]!}', '{[list1]*}', '{&[list2]}', '{|[list2]}'
      ];
      templates.forEach(template => {
        const result = testEngine.generate(template);
        assert.ok(typeof result === 'string', `Should return string for template: ${template}`);
      });
    });
  });

  describe('Recursive and circular references', () => {
    it('should handle deeply nested valid references', () => {
      const testEngine = new SigilEngine({
        level1: ['[level2]'],
        level2: ['[level3]'],
        level3: ['[level4]'],
        level4: ['deep_value']
      });
      const result = testEngine.generate('[level1]');
      assert.strictEqual(result, 'deep_value', 'Should resolve nested references');
    });
    it('should handle potential circular references in YAML', () => {
      const testEngine = new SigilEngine({
        circular_a: ['[circular_b]'],
        circular_b: ['[circular_a]']
      });
      const result = testEngine.generate('[circular_a]');
      assert.ok(typeof result === 'string', 'Should return a string');
      assert.ok(result.length > 0, 'Should return non-empty result');
    });
  });

  describe('Extreme input scenarios', () => {
    it('should handle very long strings', () => {
      const longValue = 'a'.repeat(10000);
      const testEngine = new SigilEngine({ long: [longValue] });
      const result = testEngine.generate('[long]');
      assert.strictEqual(result, longValue, 'Should handle very long strings');
    });
    it('should handle empty and whitespace templates', () => {
      const testEngine = new SigilEngine({ value: ['test'] });
      const templates = ['', '   ', '\n', '\t', '   \n\t   '];
      templates.forEach(template => {
        const result = testEngine.generate(template);
        assert.strictEqual(result, template, `Should return template as-is: "${template}"`);
      });
    });
    it('should handle unicode and special characters', () => {
      const testEngine = new SigilEngine({
        unicode: ['🚀', '💻', '🎯'],
        accents: ['café', 'naïve', 'résumé'],
        symbols: ['©', '®', '™', '€', '£', '¥']
      });
      const unicodeResult = testEngine.generate('[unicode]');
      assert.ok(['🚀', '💻', '🎯'].includes(unicodeResult), 'Should handle unicode characters');
      const accentResult = testEngine.generate('[accents]');
      assert.ok(['café', 'naïve', 'résumé'].includes(accentResult), 'Should handle accented characters');
      const symbolResult = testEngine.generate('[symbols]');
      assert.ok(['©', '®', '™', '€', '£', '¥'].includes(symbolResult), 'Should handle special symbols');
    });
    it('should handle null and undefined edge cases', () => {
      const testEngine = new SigilEngine({
        empty: [],
        with_null: [null as any],
        with_undefined: [undefined as any]
      });
      assert.doesNotThrow(() => {
        testEngine.generate('[empty]');
        testEngine.generate('[with_null]');
        testEngine.generate('[with_undefined]');
      }, 'Should not throw on edge case data');
    });
  });

  describe('Fuzzing: malformed and edge-case templates', () => {
    it('should not throw on random malformed templates', () => {
      const testEngine = new SigilEngine({ foo: ['bar'] });
      const malformedTemplates = [
        '[', ']', '[foo', 'foo]', '[foo][bar', '[foo|bar', '[foo&bar', '[foo?', '[foo|', '[foo&', '[foo?', '[foo|bar?', '[foo&bar?', '[foo|bar&baz', '[foo|bar&baz?', '[foo|bar&baz?]'
      ];
      malformedTemplates.forEach((template, i) => {
        assert.doesNotThrow(() => testEngine.generate(template), `Should not throw on malformed template ${i}: ${template}`);
      });
    });
  });

  describe('YAML data containing sigils', () => {
    it('should handle YAML values with literal sigil characters', () => {
      setupData();

      // Add test data with literal sigil characters as plain strings (YAML would deliver them this way)
      const testEngine = new SigilEngine({
        weird_names: [
          'Rock & Roll',
          'Either|Or',
          'Question?',
          'Exclamation!',
          'Star*',
          'Caret^',
          'Brackets{here}',
          'More[brackets]'
        ]
      });

      const result = testEngine.generate('[weird_names]');

      // With the new behavior quoted/data values may be processed for sigils.
      // We only assert that we get a string back and not throw.
      assert.ok(typeof result === 'string', 'Should return a string');
    });

    // Literal handling is asserted via YAML integration in test/test-literal-handling.js.
  });
});
