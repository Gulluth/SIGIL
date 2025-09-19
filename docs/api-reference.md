# API Reference

## SigilEngine Class

```javascript
import { SigilEngine, loadSigilData, loadSingleFile } from '@gulluth/sigil';

// Single file (Node.js)
const data = loadSingleFile('./data.yaml');
const engine = new SigilEngine(data.lists);

// Multi-file (Node.js)
const mergedData = loadSigilData(['./core.yaml', './expansion.yaml']);
const engine = new SigilEngine(mergedData.lists);

// Browser with bundled files
import yamlData from './data.yaml?raw';
const engine = new SigilEngine(JSON.parse(yamlData));
```

### Constructor Options

- `debug: boolean` - Enable step-by-step resolution tracing
- `seed: string` - Set random seed for deterministic results
- `maxDepth: number` - Recursion depth limit (default: 10)
- `maxTemplate: number` - Maximum template length limit (default: unlimited)
- `errorMode: string` - Error handling mode: 'graceful' (default), 'strict', 'silent'
- `fallbackText: string` - Text to return for missing references (default: "[missing]")

### Methods

- `loadData(filePath)` - Load YAML data file
- `loadDataFromString(yamlString)` - Load from YAML string  
- `generate(templateName)` - Generate content from template
- `setSeed(seed)` - Change random seed
- `enableDebug(enable)` - Toggle debug mode
- `validateTemplate(template)` - Check template syntax without generating
- `getStats()` - Get generation statistics and performance metrics


## Error Handling Overview

SIGIL provides robust error handling with three modes:

- **Graceful** (default): Returns placeholder text for missing references or errors
- **Strict**: Throws detailed errors for debugging
- **Silent**: Returns empty string for missing references

See [Error Handling & Robustness](./error-handling.md) for full details, edge cases, and recovery strategies.

## Sigil Precedence and Evaluation Order

- **AND (&) takes precedence over Optional (?)**: In expressions like `{[a]&[b?]}`, the AND sigil overrides optionality. All referenced elements are always included; optional is ignored.
- **Debugging**: When debug mode is enabled, the engine will log: `[SIGIL DEBUG] Optional (?) ignored: AND (&) takes precedence in expression ...`
- **Weights and Repetition**: In `[item^2*3]`, weights are applied before repetition. Each repetition is an independent draw from the weighted pool.

## Debug and Validation

```javascript
// Enable detailed tracing
engine.enableDebug(true);
const result = engine.generate('[complex_template]');
// Logs: "Resolving [complex_template] → [sub_ref] → final_value"

// Validate templates before use
const isValid = engine.validateTemplate('[weapon.melee*{2-4}]');
if (!isValid.valid) {
  console.error('Template errors:', isValid.errors);
}

// Get performance statistics
const stats = engine.getStats();
console.log(`Generated ${stats.totalGenerations} templates`);
console.log(`Average generation time: ${stats.avgTime}ms`);
```


## Troubleshooting Common Issues

### Issue: Value is returned literally instead of being processed

SIGIL treats all top-level YAML keys equally—there is nothing special about a key named `templates`. Any key can be referenced in a template, and all keys are processed the same way.

```yaml
# ❌ Example: This returns "weapon" as literal text
templates:
  - weapon

# ✅ To process as a template, use brackets (unquoted)
templates:
  - [weapon]
```

### Issue: You want literal output with sigil characters (e.g., & or { })

If you want a value to be returned exactly as written—even if it contains sigil characters—quote the value in YAML. Quoted values are always treated as literals in SIGIL.

```yaml
# ✅ Quoted value is always literal
band_names:
  - "Rock & Roll"      # Will always return 'Rock & Roll', not process & as AND
  - '{this|that}'      # Will always return '{this|that}', not process as template

# Referencing the list will return the literal value
templates:
  music: [band_names]  # Result: "Rock & Roll" or "{this|that}"
```

Unquoted values will be processed for sigils. Use quoting to ensure literal output.
## YAML Quoting and Template Processing

**Important:** In SIGIL, quoted YAML values (single or double quotes) are always treated as literal strings and are never processed for sigils or template expansion. Only unquoted YAML values are parsed and processed as templates.

**Example:**
```yaml
# This will be returned as the literal string "{this|that}", not processed as a template
templates:
  literal: "{this|that}"

# This will be processed as a template and return either "this" or "that"
templates:
  processed: {this|that}
```

When writing SIGIL templates, use unquoted values for any field you want to be processed for sigils.

### Problem: Complex templates aren't working as expected

```javascript
// ✅ Solution: Use debug mode to trace resolution
engine.enableDebug(true);
const result = engine.generate('[complex_template]');
// Shows step-by-step resolution in console
```

### Problem: Templates with many sigils are hard to read

```yaml
# ❌ Hard to read
templates:
  complex: "[weapon.melee*{2-4}!broken.capitalize?]"

# ✅ Better: Break into parts or add comments
templates:
  # Generate 2-4 working melee weapons, optionally capitalize
  working_weapons: "[weapon.melee!broken]"
  multiple_weapons: "[working_weapons*{2-4}]"
  final_weapons: "[multiple_weapons.capitalize?]"
```

## Data Loading and Multi-File Support

SIGIL supports different data loading approaches depending on your environment.

### Node.js Environment

#### Single File Loading
```javascript
import { SigilEngine, loadSingleFile } from '@gulluth/sigil';

// Method 1: Using the engine's built-in loader
const engine = new SigilEngine();
await engine.loadData('./data/generators.yaml');

// Method 2: Using the standalone loader
const data = loadSingleFile('./data/generators.yaml');
const engine = new SigilEngine(data.lists);
```

#### Multi-File Loading and Merging
SIGIL automatically merges multiple YAML files, combining lists with the same names:

```javascript
import { SigilEngine, loadSigilData } from '@gulluth/sigil';

// Load and merge multiple files
const data = loadSigilData([
  './data/core-tables.yaml',
  './data/location-types.yaml',
  './data/themes.yaml'
]);

const engine = new SigilEngine(data.lists);
// Templates from all files are available
// Lists with same names are merged automatically
```

**Merging Rules:**
- **Arrays/Lists**: Combined (e.g., `weapons` from multiple files become one list)
- **Objects**: Merged recursively (later files override earlier ones)
- **Templates**: Combined from all files
- **Primitives**: Last file wins

#### Example Multi-File Structure
```yaml
# core-tables.yaml
weapons:
  - sword
  - bow
templates:
  weapon_find: "You find a [weapons]"

# expansion-weapons.yaml  
weapons:
  - staff
  - dagger
templates:
  weapon_craft: "You craft a [weapons]"
```
Result: `weapons` list contains `[sword, bow, staff, dagger]`, both templates available.

### Browser Environment

#### Single File Loading
```javascript
import { SigilEngine } from '@gulluth/sigil';

// Method 1: Fetch at runtime
const yamlData = await fetch('./data.yaml').then(r => r.text());
const engine = new SigilEngine();
engine.loadDataFromString(yamlData);

// Method 2: Bundle with Vite/Webpack
import yamlData from './data.yaml?raw';
const { parse } = await import('yaml');
const data = parse(yamlData);
const engine = new SigilEngine(data);
```

#### Multi-File Loading (Manual Merging)
Since browsers can't access the file system directly, you need to manually merge files:

```javascript
import { SigilEngine } from '@gulluth/sigil';
import coreData from './data/core-tables.yaml?raw';
import locationData from './data/location-types.yaml?raw';

const { parse } = await import('yaml');
const core = parse(coreData);
const locations = parse(locationData);

// Manual merging (mimics SIGIL's server-side behavior)
const merged = {
  ...core,
  ...locations,
  // Merge arrays manually if needed
  weapons: [...(core.weapons || []), ...(locations.weapons || [])]
};

const engine = new SigilEngine(merged);
```

#### Production Example (Vite + SvelteKit)
```javascript
// In a SvelteKit/Vite project
import { SigilEngine } from '@gulluth/sigil';
import tablesData from '$lib/data/tables.yaml?raw';
import locationTypesData from '$lib/data/location-types.yaml?raw';

let engine;

try {
  const { parse } = await import('yaml');
  const tables = parse(tablesData);
  const locationTypes = parse(locationTypesData);
  
  // Merge data (browser equivalent of loadSigilData)
  const mergedData = { ...tables, ...locationTypes };
  
  engine = new SigilEngine(mergedData);
} catch (error) {
  console.error('Failed to initialize SIGIL:', error);
  engine = new SigilEngine({}); // Fallback
}

// Use the engine
const result = engine.generate('[location_types]');
```

### Best Practices

#### File Organization
```
data/
├── core-tables.yaml      # Main lists and templates
├── location-types.yaml   # Hierarchical location categories
├── themes/
│   ├── fantasy.yaml     # Fantasy-specific content
│   ├── sci-fi.yaml      # Sci-fi content
│   └── horror.yaml      # Horror content
└── templates.yaml       # Shared templates
```

#### Error Handling
```javascript
// Always handle loading errors gracefully
try {
  const data = loadSigilData(['./core.yaml', './expansion.yaml']);
  const engine = new SigilEngine(data.lists);
} catch (error) {
  console.error('SIGIL loading failed:', error);
  // Provide fallback or user-friendly error
  const engine = new SigilEngine({ 
    fallback: ['basic content'] 
  });
}
```

```