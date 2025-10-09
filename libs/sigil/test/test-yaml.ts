import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadSingleFile, loadSigilData } from '../src/yaml-loader.js';

describe('YAML Loader', () => {
    describe('loadSingleFile', () => {
        it('should load hierarchical YAML structure correctly', () => {
            const data = loadSingleFile('./examples/data/themes/fantasy.yaml');

            // Verify basic structure
            assert.ok(data.lists, 'Should have lists property');

            // Verify hierarchical weapon structure
            assert.ok(data.lists.weapon, 'Should have weapon category');
            assert.ok(Array.isArray(data.lists.weapon.melee), 'Should have melee weapons array');
            assert.ok(Array.isArray(data.lists.weapon.ranged), 'Should have ranged weapons array');
            assert.ok(Array.isArray(data.lists.weapon.enhancement), 'Should have weapon enhancements array');

            // Verify materials list
            assert.ok(Array.isArray(data.lists.materials), 'Should have materials array');
            assert.ok(data.lists.materials.length > 0, 'Materials should not be empty');
        });

        it('should handle weighted items in lists', () => {
            const data = loadSingleFile('./examples/data/themes/fantasy.yaml');

            // Check that weighted items are preserved as strings
            const meleeWeapons = data.lists.weapon.melee;
            const hasWeightedItems = meleeWeapons.some((weapon: string) => weapon.includes('^'));
            assert.ok(hasWeightedItems, 'Should preserve weighted item syntax');
        });
    });

    describe('loadSigilData', () => {
        it('should merge lists from multiple files', () => {
            const data = loadSigilData([
                './examples/data/themes/fantasy.yaml',
                './examples/data/themes/scifi.yaml'
            ]);

            // Verify that weapons from both files are present
            assert.ok(data.lists.weapon, 'Should have weapon category');
            assert.ok(data.lists.weapon.melee, 'Should have melee weapons');

            const meleeWeapons = data.lists.weapon.melee;
            assert.ok(meleeWeapons.length > 2, 'Should have weapons from both files');

            // Verify materials merged
            assert.ok(data.lists.materials, 'Should have materials');
            assert.ok(data.lists.materials.length > 4, 'Should have materials from both files');
        });

        it('should preserve templates from all files', () => {
            const data = loadSigilData([
                './examples/data/themes/fantasy.yaml',
                './examples/data/templates.yaml'
            ]);

            assert.ok(data.templates, 'Should have templates');
            assert.ok(Object.keys(data.templates).length > 0, 'Should have template definitions');
        });
    });
});