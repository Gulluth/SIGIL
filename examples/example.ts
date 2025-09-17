import { loadSigilData, loadSingleFile } from '../src/yaml-loader';
import { SigilEngine } from '../src/template-engine';

console.log('=== SIGIL Examples ===\n');

// Example 1: Flat structure (Horror theme)
console.log('1. FLAT STRUCTURE EXAMPLE (Horror)');
console.log('   Simple lists for straightforward content\n');

try {
    const horrorData = loadSigilData([
        './examples/data/themes/horror.yaml',
        './examples/data/templates.yaml'
    ]);

    console.log('Available lists:', Object.keys(horrorData.lists));
    console.log('Creatures:', horrorData.lists.creatures);
    console.log('Locations:', horrorData.lists.locations);
    console.log('Templates:', Object.keys(horrorData.templates));
    console.log();

    // Generate some horror content
    if (horrorData.templates.horror_encounter) {
        const engine = new SigilEngine(horrorData.lists);

        console.log('Horror Encounters:');
        for (let i = 0; i < 3; i++) {
            const result = engine.generate(horrorData.templates.horror_encounter[0]);
            console.log(`  ${i + 1}. ${result}`);
        }
    }
} catch (error) {
    console.log('Horror example error:', error);
}

console.log('\n============================================================\n');

// Example 2: Hierarchical structure (Space theme)
console.log('2. HIERARCHICAL STRUCTURE EXAMPLE (Space)');
console.log('   Organized categories for complex content\n');

try {
    const spaceData = loadSigilData([
        './examples/data/themes/scifi.yaml',
        './examples/data/templates.yaml'
    ]);

    console.log('Available lists:', Object.keys(spaceData.lists));
    if (spaceData.lists.ship) {
        console.log('Ship categories:', Object.keys(spaceData.lists.ship));
        console.log('Ship types:', spaceData.lists.ship.type);
        console.log('Ship status:', spaceData.lists.ship.status);
    }
    console.log('Templates:', Object.keys(spaceData.templates));
    console.log();

    // Generate space content using hierarchical structure
    if (spaceData.templates.space_mission) {
        const engine = new SigilEngine(spaceData.lists);

        console.log('Space Missions:');
        for (let i = 0; i < 3; i++) {
            const result = engine.generate(spaceData.templates.space_mission[0]);
            console.log(`  ${i + 1}. ${result}`);
        }
    }
} catch (error) {
    console.log('Space example error:', error);
}

console.log('\n============================================================\n');

// Example 3: Genre blending through automatic merging
console.log('3. GENRE BLENDING EXAMPLE');
console.log('   Automatic merging demonstrates SIGIL\'s power\n');

try {
    const genreBlendData = loadSigilData([
        './examples/data/themes/fantasy.yaml',
        './examples/data/themes/scifi.yaml',
        './examples/data/templates.yaml'
    ]);

    console.log('Merged lists:', Object.keys(genreBlendData.lists));

    // Show how weapons from different genres merged
    if (genreBlendData.lists.weapon && genreBlendData.lists.weapon.melee) {
        console.log('Merged melee weapons (medieval + sci-fi):');
        console.log(genreBlendData.lists.weapon.melee);
    }

    if (genreBlendData.lists.materials) {
        console.log('Merged materials (medieval + sci-fi):');
        console.log(genreBlendData.lists.materials);
    }

    console.log('Templates:', Object.keys(genreBlendData.templates));
    console.log();

    // Generate blended content
    if (genreBlendData.templates.blended_item) {
        const engine = new SigilEngine(genreBlendData.lists);

        console.log('Genre-Blended Items:');
        for (let i = 0; i < 5; i++) {
            const result = engine.generate(genreBlendData.templates.blended_item[0]);
            console.log(`  ${i + 1}. ${result}`);
        }
    }
} catch (error) {
    console.log('Genre blending error:', error);
}

console.log('\n=== End Examples ===');
