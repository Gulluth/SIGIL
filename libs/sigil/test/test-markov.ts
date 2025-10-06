import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine';
import { generateMarkov } from '../src/markov-generator';

describe('SIGIL Template Engine - Markov', () => {
    it('should apply markov modifier', () => {
        const testEngine = new SigilEngine({
            names: ['cyber', 'nano', 'bio', 'quantum', 'plasma', 'neural', 'proto', 'neo']
        });
        const result = testEngine.generate('[names.markov]');
        assert.ok(typeof result === 'string', 'Should return a string');
        assert.ok(result.length > 0, 'Should not be empty');
        assert.ok(!result.includes('['), 'Should not contain unresolved references');
    });
    it('should handle markov modifier with exclusions', () => {
        const testEngine = new SigilEngine({
            tech_words: ['cybernetics', 'nanotechnology', 'biotechnology', 'quantum ^2']
        });
        const result = testEngine.generate('[tech_words!nano.markov]');
        assert.ok(typeof result === 'string', 'Should return a string');
        assert.ok(result.length > 0, 'Should not be empty');
    });
    it('should handle markov modifier with repetition', () => {
        const testEngine = new SigilEngine({
            prefixes: ['cyber', 'neo', 'proto', 'meta', 'ultra', 'mega']
        });
        const result = testEngine.generate('[prefixes.markov*3]');
        assert.ok(typeof result === 'string', 'Should return a string');
        assert.ok(result.includes(','), 'Should contain comma-separated results for repetition');
        const parts = result.split(', ');
        assert.ok(parts.length === 3, 'Should generate exactly 3 results');
    });
});