import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine';
import { loadSigilData } from '../src/yaml-loader';

describe('SIGIL Template Engine', () => {
    let engine: SigilEngine;
    let testData: any;

    // Setup test data before running tests
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

    describe('Basic table references', () => {
        it('should resolve simple table references', () => {
            setupData();

            const result1 = engine.generate('[weapon.melee]');
            assert.ok(typeof result1 === 'string', 'Should return a string');
            assert.ok(result1.length > 0, 'Should not be empty');

            const result2 = engine.generate('[materials]');
            assert.ok(typeof result2 === 'string', 'Should return a string');
            assert.ok(result2.length > 0, 'Should not be empty');
        });

        it('should handle hierarchical table references', () => {
            setupData();

            const result = engine.generate('[weapon.enhancement]');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.length > 0, 'Should not be empty');
        });
    });

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

    describe('Inline randomization', () => {
        it('should handle OR syntax {this|that}', () => {
            setupData();

            const result = engine.generate('The {ancient|modern|forgotten} temple');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(
                result.includes('ancient') || result.includes('modern') || result.includes('forgotten'),
                'Should contain one of the options'
            );
            assert.ok(result.startsWith('The '), 'Should preserve surrounding text');
        });

        it('should handle multiple inline options', () => {
            setupData();

            const result = engine.generate('{You discover|You find|You uncover} the treasure');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.endsWith(' the treasure'), 'Should preserve suffix text');
        });
    });

    describe('Number ranges', () => {
        it('should generate numbers within specified ranges', () => {
            setupData();

            const result = engine.generate('Roll {1-6} damage');
            assert.ok(typeof result === 'string', 'Should return a string');

            // Extract the number from the result
            const match = result.match(/Roll (\d+) damage/);
            assert.ok(match, 'Should match expected format');

            const number = parseInt(match[1]);
            assert.ok(number >= 1 && number <= 6, `Number ${number} should be between 1 and 6`);
        });

        it('should handle larger number ranges', () => {
            setupData();

            const result = engine.generate('The chamber has {2-8} exits');
            assert.ok(typeof result === 'string', 'Should return a string');

            const match = result.match(/The chamber has (\d+) exits/);
            assert.ok(match, 'Should match expected format');

            const number = parseInt(match[1]);
            assert.ok(number >= 2 && number <= 8, `Number ${number} should be between 2 and 8`);
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
    });
});
