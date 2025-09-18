import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine';
import { loadSigilData } from '../src/yaml-loader';

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

describe('SIGIL Template Engine - Inline and Cross-Sigil', () => {
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

    describe('AND sigil combinations', () => {
        it('should combine inline options with & sigil for compound words', () => {
            setupData();
            const result = engine.generate('{red&large}');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.strictEqual(result, 'redlarge', 'Should concatenate without spaces');
        });

        it('should combine table references with & sigil', () => {
            setupData();
            // Create a simple test engine with known data
            const testEngine = new SigilEngine({
                colors: ['red', 'blue', 'green'],
                sizes: ['small', 'large', 'tiny']
            });
            const result = testEngine.generate('{[colors]&[sizes]}');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.length > 0, 'Should not be empty');
            assert.ok(!result.includes(' '), 'Should not contain spaces');
            // Result should be a combination of a color and size
            const colors = ['red', 'blue', 'green'];
            const sizes = ['small', 'large', 'tiny'];
            const validCombinations = [];
            for (const color of colors) {
                for (const size of sizes) {
                    validCombinations.push(color + size);
                }
            }
            assert.ok(validCombinations.includes(result), `Result "${result}" should be a valid combination`);
        });

        it('should handle mixed references and inline options with & sigil', () => {
            setupData();
            const testEngine = new SigilEngine({
                prefixes: ['cyber', 'nano', 'bio']
            });
            const result = testEngine.generate('{[prefixes]&tech}');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(['cybertech', 'nanotech', 'biotech'].includes(result), `Result "${result}" should be a valid combination`);
        });

        it('should handle multiple & combinations', () => {
            setupData();
            const testEngine = new SigilEngine({
                prefix: ['ultra', 'mega'],
                base: ['core', 'matrix'],
                suffix: ['prime', 'max']
            });
            const result = testEngine.generate('{[prefix]&[base]&[suffix]}');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.length > 0, 'Should not be empty');
            assert.ok(!result.includes(' '), 'Should not contain spaces');
            // Should be a combination of all three parts
            const prefixes = ['ultra', 'mega'];
            const bases = ['core', 'matrix'];
            const suffixes = ['prime', 'max'];
            const validCombinations = [];
            for (const prefix of prefixes) {
                for (const base of bases) {
                    for (const suffix of suffixes) {
                        validCombinations.push(prefix + base + suffix);
                    }
                }
            }
            assert.ok(validCombinations.includes(result), `Result "${result}" should be a valid three-part combination`);
        });

        it('should work within larger templates', () => {
            setupData();
            const testEngine = new SigilEngine({
                name_parts: {
                    prefix: ['Zyx', 'Nex', 'Vor'],
                    suffix: ['on', 'ax', 'prime']
                }
            });
            const result = testEngine.generate('Survivor {[name_parts.prefix]&[name_parts.suffix]} reports in');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.startsWith('Survivor '), 'Should preserve prefix');
            assert.ok(result.endsWith(' reports in'), 'Should preserve suffix');
            const nameMatch = result.match(/Survivor (\w+) reports in/);
            assert.ok(nameMatch, 'Should match expected format');
            const name = nameMatch[1];
            const validNames = [];
            for (const prefix of ['Zyx', 'Nex', 'Vor']) {
                for (const suffix of ['on', 'ax', 'prime']) {
                    validNames.push(prefix + suffix);
                }
            }
            assert.ok(validNames.includes(name), `Generated name "${name}" should be valid`);
        });

        it('should handle multiple & sigil expressions in one template', () => {
            setupData();
            const testEngine = new SigilEngine({
                colors: ['red', 'blue'],
                sizes: ['large', 'small'],
                weapons: ['sword', 'axe'],
                types: ['steel', 'iron']
            });
            const result = testEngine.generate('The {[colors]&[sizes]} warrior wields a {[weapons]&[types]}');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.startsWith('The '), 'Should preserve prefix');
            assert.ok(result.includes(' warrior wields a '), 'Should preserve middle text');
            // Extract both compound terms
            const match = result.match(/The (\w+) warrior wields a (\w+)/);
            assert.ok(match, 'Should match expected pattern');
            const [, warrior, weapon] = match;
            // Verify warrior combinations
            const validWarriors = ['redlarge', 'redsmall', 'bluelarge', 'bluesmall'];
            assert.ok(validWarriors.includes(warrior), `Warrior "${warrior}" should be a valid combination`);
            // Verify weapon combinations
            const validWeapons = ['swordsteel', 'swordiron', 'axesteel', 'axeiron'];
            assert.ok(validWeapons.includes(weapon), `Weapon "${weapon}" should be a valid combination`);
        });
    });

    describe('Additional Cross-Sigil Combinations', () => {
        it('should handle repetition with optional', () => {
            const testEngine = new SigilEngine({ item: ['a', 'b', 'c'] });
            const result = testEngine.generate('[item*3?]');
            assert.ok(typeof result === 'string');
            assert.ok(result === '' || result.split(' ').length === 3);
        });
        it('should handle exclusion with repetition', () => {
            const testEngine = new SigilEngine({ item: ['good', 'bad', 'ugly'] });
            for (let i = 0; i < 10; i++) {
                const result = testEngine.generate('[item!bad*2]');
                assert.ok(!result.includes('bad'));
            }
        });
        it('should handle AND with optional (AND takes precedence)', () => {
            const testEngine = new SigilEngine({ a: ['foo'], b: ['bar'] });
            for (let i = 0; i < 5; i++) {
                const result = testEngine.generate('{[a]&[b]?}');
                assert.strictEqual(result, 'foobar');
            }
        });
        it('should handle OR with exclusion', () => {
            const testEngine = new SigilEngine({ a: ['x', 'y'], b: ['z', 'w'] });
            for (let i = 0; i < 10; i++) {
                const result = testEngine.generate('{[a!x]|[b!w]}');
                assert.ok(!result.includes('x'));
                assert.ok(!result.includes('w'));
            }
        });
        it('should handle nested cross-sigil combinations (AND takes precedence over optional)', () => {
            const testEngine = new SigilEngine({ a: ['foo'], b: ['bar'], c: ['baz'] });
            const result = testEngine.generate('{[a*2]&{[b]|[c?]}}');
            // [a*2] should produce 'foo, foo', and & should concatenate with the right side
            assert.ok(result.startsWith('foo, foo'));
            // Should end with bar, baz, or just 'foo, foo' if optional is empty
            assert.ok(result.endsWith('bar') || result.endsWith('baz') || result === 'foo, foo');
        });
        it('should handle weight with repetition (weights applied before repetition)', () => {
            const testEngine = new SigilEngine({ item: ['a^2', 'b', 'c'] });
            let aCount = 0;
            for (let i = 0; i < 40; i++) {
                const result = testEngine.generate('[item^2*3]');
                if (result.split(' ').filter(x => x === 'a').length > 0) aCount++;
            }
            assert.ok(aCount > 0, 'Weighted item should appear sometimes');
        });
    });

    describe('Cross-Sigil Combinations', () => {
        it('should handle markov with repetition (*)', () => {
            setupData();
            const testEngine = new SigilEngine({
                names: ['cyber', 'nano', 'bio', 'quantum', 'neural', 'proto']
            });
            const result = testEngine.generate('[names.markov*3]');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.includes(','), 'Should contain comma-separated results');
            const parts = result.split(', ');
            assert.ok(parts.length === 3, 'Should generate exactly 3 markov results');
        });

        it('should handle markov with optional (?)', () => {
            setupData();
            const testEngine = new SigilEngine({
                names: ['alpha', 'beta', 'gamma', 'delta']
            });
            // Run multiple times to test randomness
            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(testEngine.generate('Agent [names.markov?] reporting'));
            }
            // All should be valid strings
            results.forEach(result => {
                assert.ok(typeof result === 'string', 'Should return a string');
                assert.ok(result.includes('Agent'), 'Should contain "Agent"');
                assert.ok(result.includes('reporting'), 'Should contain "reporting"');
            });
            // Should have some variation (some with names, some without)
            const uniqueResults = [...new Set(results)];
            assert.ok(uniqueResults.length > 1, 'Should have variations due to optional markov');
        });

        it('should handle markov with exclusions (!)', () => {
            setupData();
            const testEngine = new SigilEngine({
                words: ['cybernetic', 'nanotechnology', 'biotechnology', 'quantum']
            });
            const result = testEngine.generate('[words!nano.markov]');
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.length > 0, 'Should not be empty');
            // The result should be generated from words excluding those containing 'nano'
        });

        it('should handle & sigil with markov on one side', () => {
            setupData();
            const testEngine = new SigilEngine({
                prefixes: ['cyber', 'nano', 'bio'],
                suffixes: ['tech', 'core', 'link']
            });
            // Test markov on left side of &
            const result1 = testEngine.generate('{[prefixes.markov]&[suffixes]}');
            assert.ok(typeof result1 === 'string', 'Should return a string for markov & normal');
            assert.ok(result1.length > 0, 'Should not be empty');
            // Test markov on right side of &
            const result2 = testEngine.generate('{[prefixes]&[suffixes.markov]}');
            assert.ok(typeof result2 === 'string', 'Should return a string for normal & markov');
            assert.ok(result2.length > 0, 'Should not be empty');
        });

        it('should handle & sigil with markov on both sides', () => {
            setupData();
            const testEngine = new SigilEngine({
                prefixes: ['ultra', 'mega', 'super'],
                suffixes: ['core', 'matrix', 'system']
            });
            const result = testEngine.generate('{[prefixes.markov]&[suffixes.markov]}');
            assert.ok(typeof result === 'string', 'Should return a string for markov & markov');
            assert.ok(result.length > 0, 'Should not be empty');
            // Should be a compound of two markov-generated words
        });

        it('should handle complex markov combinations', () => {
            setupData();
            const testEngine = new SigilEngine({
                first: ['zyx', 'nex', 'vor'],
                middle: ['prime', 'core', 'tech'],
                last: ['alpha', 'beta', 'gamma']
            });
            // Triple compound with markov
            const result1 = testEngine.generate('{[first.markov]&[middle]&[last.markov]}');
            assert.ok(typeof result1 === 'string', 'Should handle triple compound with markov');
            // Markov with repetition in compound
            const result2 = testEngine.generate('{[first.markov*2]&[last]}');
            assert.ok(typeof result2 === 'string', 'Should handle markov repetition in compound');
            // Optional markov in compound
            const result3 = testEngine.generate('{[first.markov?]&[last]}');
            assert.ok(typeof result3 === 'string', 'Should handle optional markov in compound');
        });
    });
});
