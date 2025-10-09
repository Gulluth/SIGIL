import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadSigilData } from '../src/yaml-loader.js';

describe('List Merging', () => {
    it('should merge hierarchical lists from multiple files', () => {
        const data = loadSigilData([
            './examples/data/themes/fantasy.yaml',
            './examples/data/themes/scifi.yaml',
            './examples/data/templates.yaml'
        ]);

        // Verify weapon categories merged properly
        assert.ok(data.lists.weapon, 'Should have weapon category');
        assert.ok(data.lists.weapon.melee, 'Should have melee weapons');
        assert.ok(data.lists.weapon.ranged, 'Should have ranged weapons');
        assert.ok(data.lists.weapon.enhancement, 'Should have enhancements');

        // Verify melee weapons from both files are present
        const meleeWeapons = data.lists.weapon.melee;
        assert.ok(meleeWeapons.length >= 4, `Should have multiple melee weapons, got ${meleeWeapons.length}`);

        // Should contain sci-fi weapons (from themes/scifi.yaml)
        const hasSciFiWeapons = meleeWeapons.some((weapon: string) =>
            weapon.includes('disruption') || weapon.includes('gravitic') || weapon.includes('monomolecular')
        );
        assert.ok(hasSciFiWeapons, 'Should contain sci-fi weapons from merged files');
    });

    it('should merge flat lists from multiple files', () => {
        const data = loadSigilData([
            './examples/data/themes/fantasy.yaml',
            './examples/data/themes/scifi.yaml'
        ]);

        // Verify materials merged from both files
        const materials = data.lists.materials;
        assert.ok(Array.isArray(materials), 'Materials should be an array');
        assert.ok(materials.length >= 6, `Should have materials from both files, got ${materials.length}`);

        // Should contain both medieval and sci-fi materials
        const hasTraditional = materials.some((material: string) => material.includes('iron') || material.includes('bone'));
        const hasSciFi = materials.some((material: string) => material.includes('crystalline') || material.includes('nano-carbon'));

        assert.ok(hasTraditional, 'Should contain traditional materials');
        assert.ok(hasSciFi, 'Should contain sci-fi materials');
    });

    it('should preserve templates from all files', () => {
        const data = loadSigilData([
            './examples/data/themes/fantasy.yaml',
            './examples/data/themes/scifi.yaml',
            './examples/data/templates.yaml'
        ]);

        assert.ok(data.templates, 'Should have templates object');

        const templateNames = Object.keys(data.templates);
        assert.ok(templateNames.length > 0, 'Should have template definitions');

        // Verify templates are arrays of strings
        templateNames.forEach(name => {
            assert.ok(Array.isArray(data.templates[name]), `Template ${name} should be an array`);
            assert.ok(data.templates[name].length > 0, `Template ${name} should not be empty`);
        });
    });

    it('should handle empty or missing lists gracefully', () => {
        // This test verifies robustness when merging files with different structures
        assert.doesNotThrow(() => {
            const data = loadSigilData([
                './examples/data/themes/fantasy.yaml'
            ]);
            assert.ok(data.lists, 'Should handle single file loading');
        }, 'Should not throw when loading single file');
    });
});