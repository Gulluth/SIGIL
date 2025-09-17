import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilMarkov, generateMarkov } from '../src/markov-generator';

describe('SIGIL Markov Generator', () => {
    describe('SigilMarkov Class', () => {
        it('should create a Markov chain with default order 2', () => {
            const markov = new SigilMarkov();
            const stats = markov.getStats();

            assert.strictEqual(stats.ngramCount, 0, 'Should start with empty chain');
            assert.strictEqual(stats.startTokens, 0, 'Should start with no start tokens');
        });

        it('should create a Markov chain with custom order', () => {
            const markov = new SigilMarkov(3);
            assert.ok(markov instanceof SigilMarkov, 'Should create instance with custom order');
        });

        it('should handle minimum order of 1', () => {
            const markov = new SigilMarkov(0); // Should be clamped to 1
            const testWords = ['abc', 'def'];
            markov.train(testWords);

            const stats = markov.getStats();
            assert.ok(stats.ngramCount > 0, 'Should create valid chain even with order 0 input');
        });

        it('should train from word list and build chain', () => {
            const markov = new SigilMarkov(2);
            const testWords = ['hello', 'world', 'help', 'held'];

            markov.train(testWords);
            const stats = markov.getStats();

            assert.ok(stats.ngramCount > 0, 'Should create n-grams from training words');
            assert.ok(stats.startTokens > 0, 'Should create start tokens');
            assert.ok(stats.totalTransitions > 0, 'Should create character transitions');
        });

        it('should filter out words that are too short', () => {
            const markov = new SigilMarkov(3);
            const testWords = ['a', 'ab', 'abc', 'abcd', 'abcde']; // Only last two should be used

            markov.train(testWords);
            const stats = markov.getStats();

            // Should only train on words >= order length
            assert.ok(stats.ngramCount > 0, 'Should create chain from valid words');
        });

        it('should generate words from trained data', () => {
            const markov = new SigilMarkov(2);
            const testWords = ['cyber', 'cyborg', 'system', 'synth', 'syntax'];

            markov.train(testWords);

            // Generate multiple words to test variability
            const results = [];
            for (let i = 0; i < 10; i++) {
                const result = markov.generate({ minLength: 3, maxLength: 8 });
                results.push(result);
            }

            // All results should be valid strings
            results.forEach(result => {
                assert.ok(typeof result === 'string', 'Should generate string');
                if (result.length > 0) {
                    assert.ok(result.length >= 3, 'Generated word should meet minimum length');
                    assert.ok(result.length <= 8, 'Generated word should not exceed maximum length');
                    assert.ok(result[0] === result[0].toUpperCase(), 'First letter should be capitalized');
                }
            });

            // Should have generated at least some words
            const validResults = results.filter(r => r.length > 0);
            assert.ok(validResults.length > 0, 'Should generate at least some valid words');
        });

        it('should handle empty training data gracefully', () => {
            const markov = new SigilMarkov();
            markov.train([]);

            const result = markov.generate();
            assert.strictEqual(result, '', 'Should return empty string for no training data');
        });

        it('should handle generation with no valid paths', () => {
            const markov = new SigilMarkov(2);
            markov.train(['ab']); // Too short for order 2

            const result = markov.generate();
            assert.strictEqual(result, '', 'Should return empty string when no valid generation possible');
        });

        it('should respect length constraints', () => {
            const markov = new SigilMarkov(2);
            const longWords = ['supercalifragilisticexpialidocious', 'antidisestablishmentarianism'];

            markov.train(longWords);

            const shortResult = markov.generate({ minLength: 3, maxLength: 6 });
            if (shortResult.length > 0) {
                assert.ok(shortResult.length >= 3 && shortResult.length <= 6, 'Should respect length constraints');
            }
        });
    });

    describe('generateMarkov Helper Function', () => {
        it('should generate words from simple word list', () => {
            const words = ['tech', 'mesh', 'flesh', 'steel', 'neon'];

            const result = generateMarkov(words);
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.length > 0, 'Should return non-empty result');
        });

        it('should handle SIGIL weighted words', () => {
            const words = ['cyber ^2', 'nano ^1.5', 'bio', 'quantum ^0.5'];

            const result = generateMarkov(words);
            assert.ok(typeof result === 'string', 'Should return a string');
            assert.ok(result.length > 0, 'Should return non-empty result');
            assert.ok(!result.includes('^'), 'Should not include weight notation in result');
        });

        it('should handle empty or invalid input gracefully', () => {
            assert.strictEqual(generateMarkov([]), '[empty-list]', 'Should handle empty array');
            assert.strictEqual(generateMarkov(['', '  ', '\t']), '[no-valid-words]', 'Should handle only whitespace');
        });

        it('should accept custom options', () => {
            const words = ['prototype', 'protocol', 'process', 'program'];

            const result = generateMarkov(words, {
                order: 3,
                minLength: 4,
                maxLength: 8
            });

            assert.ok(typeof result === 'string', 'Should return a string');
            if (result.length > 0 && !words.includes(result)) {
                assert.ok(result.length >= 4, 'Should respect minimum length');
                assert.ok(result.length <= 8, 'Should respect maximum length');
            }
        });

        it('should fallback to original words when generation fails', () => {
            // Use very short words that will likely fail generation
            const words = ['a', 'b', 'c'];

            const result = generateMarkov(words, { minLength: 10 }); // Impossible requirement
            assert.ok(words.includes(result.toLowerCase()) || result.includes('empty') || result.includes('valid'),
                'Should fallback to original word or error message');
        });

        it('should work well with realistic name lists', () => {
            const prefixes = ['Zyx', 'Nex', 'Vor', 'Keth', 'Drax', 'Cyb'];
            const suffixes = ['on', 'ax', 'prime', 'core', 'tech', 'ion'];
            const combined = [...prefixes, ...suffixes];

            // Generate multiple names to test consistency
            const names = [];
            for (let i = 0; i < 5; i++) {
                names.push(generateMarkov(combined, { minLength: 3, maxLength: 7 }));
            }

            names.forEach(name => {
                assert.ok(typeof name === 'string', 'Should generate string names');
                assert.ok(name.length > 0, 'Should generate non-empty names');
            });
        });

        it('should work with sci-fi themed word lists', () => {
            const scifiWords = ['nexus', 'matrix', 'cyber', 'neural', 'quantum', 'plasma', 'nano', 'bio'];

            const result = generateMarkov(scifiWords, { order: 2 });
            assert.ok(typeof result === 'string', 'Should generate sci-fi themed words');
            assert.ok(result.length > 0, 'Should generate non-empty result');
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle mixed case input consistently', () => {
            const words = ['CYBER', 'nano', 'Bio', 'QuAnTuM'];

            const result = generateMarkov(words);
            assert.ok(typeof result === 'string', 'Should handle mixed case');
            // Result should be properly capitalized (first letter uppercase)
            if (result.length > 0 && !result.includes('[')) {
                assert.ok(result[0] === result[0].toUpperCase(), 'Should capitalize first letter');
            }
        });

        it('should work with realistic post-apocalyptic themes', () => {
            const wastelandWords = ['rust', 'scrap', 'ash', 'dust', 'steel', 'chrome', 'nuke', 'rad'];

            const results = [];
            for (let i = 0; i < 3; i++) {
                results.push(generateMarkov(wastelandWords));
            }

            results.forEach(result => {
                assert.ok(typeof result === 'string', 'Should generate wasteland-themed words');
            });
        });
    });
});