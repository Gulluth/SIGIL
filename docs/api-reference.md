# API Reference

## SigilEngine Class

```javascript
const engine = new SigilEngine(options);
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

## Error Handling Modes

```javascript
// Graceful mode (default): Returns placeholder text for errors
const engine = new SigilEngine({ errorMode: 'graceful' });
engine.generate('[missing_ref]'); // Returns "[missing]"

// Strict mode: Throws detailed errors for debugging
const strictEngine = new SigilEngine({ errorMode: 'strict' });
try {
  strictEngine.generate('[missing_ref]');
} catch (error) {
  console.error('Template error:', error.message);
}

// Silent mode: Returns empty string for missing references  
const silentEngine = new SigilEngine({ errorMode: 'silent' });
silentEngine.generate('[missing_ref]'); // Returns ""
```

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

### Problem: Template returns literal text instead of generating

```yaml
# ❌ Problem: This returns "[weapon]" as literal text
templates:
  item: "weapon"  # Missing brackets

# ✅ Solution: Use proper reference syntax
templates:
  item: "[weapon]"  # Correctly references weapon list
```

### Problem: Sigil characters in data are interpreted as syntax

```yaml
# ❌ Problem: This might cause issues if & is interpreted
band_names:
  - Rock & Roll  # Ampersand could be confused with AND sigil

# ✅ Solution: SIGIL automatically handles this correctly
# The & is treated as literal text, not as an AND sigil
templates:
  music: "[band_names]"  # Result: "Rock & Roll"
```

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

## Browser vs Node.js

### Browser Usage

```javascript
// Load data via fetch or bundle with your app
const yamlData = await fetch('./data.yaml').then(r => r.text());
engine.loadDataFromString(yamlData);
```

### Node.js Usage

```javascript
// Direct file loading
await engine.loadData('./data/generators.yaml');
```