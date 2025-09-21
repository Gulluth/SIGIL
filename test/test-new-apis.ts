import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine';

describe('SIGIL Template Engine - New APIs', () => {
    it('parseTokens should return table descriptors with modifiers', () => {
        const data = {
            fruits: ['apple', 'banana', 'cherry'],
            nested: { list: ['alpha', 'beta'] }
        } as any;
        const engine = new SigilEngine(data);

        const descriptors = engine.parseTokens('The [fruits] and [nested.list.capitalize]');
        assert.ok(Array.isArray(descriptors), 'Descriptors should be an array');
        // Expect two table descriptors
        const tablePaths = descriptors.filter(d => d.type === 'table').map(d => d.tablePath);
        assert.deepStrictEqual(tablePaths, ['fruits', 'nested.list']);

        const mods = descriptors.find(d => d.tablePath === 'nested.list')?.modifiers;
        assert.ok(Array.isArray(mods) && mods!.includes('capitalize'), 'Should detect capitalize modifier');
    });

    it('resolveRaw should return raw data at path', () => {
        const data = { animals: ['cat', 'dog'] } as any;
        const engine = new SigilEngine(data);

        const raw = engine.resolveRaw('animals');
        assert.ok(Array.isArray(raw), 'resolveRaw should return the raw array');
        assert.deepStrictEqual(raw, ['cat', 'dog']);
    });

    it('resolveSelected should pick a single item from a list', () => {
        const data = { colors: ['red', 'blue', 'green'] } as any;
        const engine = new SigilEngine(data);

        const sel = engine.resolveSelected('colors');
        assert.ok(typeof sel === 'string', 'Selected value should be a string');
        assert.ok(['red', 'blue', 'green'].includes(sel), 'Selected value should be from the list');
    });

    it('renderRawIfSingleToken should return selected item for single-table template', () => {
        const data = { items: ['sword', 'shield'] } as any;
        const engine = new SigilEngine(data);

        const out = engine.renderRawIfSingleToken('[items]');
        // For single token, renderRawIfSingleToken returns a selected item (string)
        assert.ok(typeof out === 'string', 'Should return a string for single token');
        assert.ok(['sword', 'shield'].includes(out), 'Returned value should be selected from items');
    });

    it('renderRawIfSingleToken should fallback to generate for mixed templates', () => {
        const data = { items: ['rock'] } as any;
        const engine = new SigilEngine(data);

        const out = engine.renderRawIfSingleToken('The [items] sits here');
        assert.strictEqual(typeof out, 'string');
        assert.ok(out.includes('sits') || out.includes('rock'), 'Should render full template');
    });
});
