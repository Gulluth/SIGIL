# SIGIL

**S**igil **I**s **G**enerative **I**nterpretive **L**anguage

A minimalist YAML-based DSL for creating powerful random generators. Perfect for game development, creative writing, worldbuilding, and any application that needs procedural content generation.

## What is SIGIL?

SIGIL transforms simple YAML lists into sophisticated random generators with intelligent text processing, automatic content merging, and flexible template syntax. Designed for both browser and Node.js environments.

## Installation

```bash
npm install sigil
```

## Quick Start

```javascript
import { SigilEngine } from 'sigil';

const engine = new SigilEngine();
await engine.loadData('./data/my-data.yaml');

// Generate content from templates
const result = engine.generate('my_template');
console.log(result);
```

## Core Features

- **YAML-based data structure** with automatic list merging
- **Hierarchical organization** using dot notation
- **Weighted randomization** with custom probabilities  
- **Rich template syntax** with inline processing
- **Text formatting modifiers** for proper grammar
- **Graceful error handling** with missing data
- **Browser and Node.js support** for flexible deployment

## Sigil Reference

SIGIL uses symbolic characters called **sigils** to define generation behavior. Each sigil has a specific meaning and purpose within templates:

### Core Sigils

| Sigil | Name                 | Purpose                       | Example                             |
| ----- | -------------------- | ----------------------------- | ----------------------------------- |
| `[]`  | **Reference Sigil**  | Access lists and tables       | `[device]` → "scanner"              |
| `{}`  | **Inline Sigil**     | Inline processing container   | `{red\|blue}` → "red"               |
| `\|`  | **OR Sigil**         | Choose one option             | `{this\|that}` → "this"             |
| `&`   | **AND Sigil**        | Combine multiple selections   | `{red&large}` → "redlarge"          |
| `^`   | **Weight Sigil**     | Control selection probability | `laser rifle ^2` → 2x more likely   |
| `?`   | **Optional Sigil**   | Random inclusion              | `[device?]` → may or may not appear |
| `!`   | **Exclusion Sigil**  | Filter out items              | `[device!broken]` → working devices |
| `*`   | **Repetition Sigil** | Repeat selections             | `[component*3]` → 3 components      |
| `.`   | **Modifier Sigil**   | Apply text transformations    | `[name.capitalize]` → "John"        |

### Special Patterns

| Pattern          | Purpose             | Example                                     |
| ---------------- | ------------------- | ------------------------------------------- |
| `{a}`            | Indefinite articles | `{a} [item]` → "an apple"                   |
| `{1-10}`         | Number ranges       | `{1-10}` → random number 1-10               |
| `table.subtable` | Hierarchical access | `[shape.triangle]` → from triangle subtable |

### Sigil Combinations

Sigils can be combined for complex behavior:
- `[device*{2-4}?]` - Optionally generate 2-4 devices
- `[material!radioactive.capitalize]` - Capitalized material, excluding radioactive
- `{[condition]&[device]}` - Combine condition and device selections

## Complete Syntax Reference

### Basic Templates
Reference lists using square brackets:
```yaml
templates:
  basic_item: "[condition] [device]"
```

### Weighted Lists
Control probability using `^` notation:
```yaml
devices:
  - laser rifle ^2      # 2x more likely
  - plasma torch        # default weight (1)
  - scanner ^0.5        # half as likely
```

### Hierarchical Selection
Use dot notation for organized data:
```yaml
shape:
  quadrilateral:
    - square
    - rectangle
  triangle:
    - equilateral
    - isosceles

# Select from subcategory
templates:
  room: "The [shape.quadrilateral] room"
```

### Inline Randomization

**OR Selection** - Pick one option:
```yaml
templates:
  greeting: "Hello {there|friend|stranger}"
```

**AND Combination** - Combine from two lists:
```yaml
# Descriptive combinations
templates:
  combo: "A {red&dwarf} object"  # e.g., "A reddwarf object"

# Compound word generation (names, terms)
name_prefixes:
  - Zyx
  - Nex
  - Vor
  - Keth

name_suffixes:
  - on
  - ax
  - prime
  - core

templates:
  survivor_name: "{[name_prefixes]&[name_suffixes]}"  # e.g., "Zyxon", "Nexcore"
```

**Mixed References** - Combine lists and inline options:
```yaml
templates:
  mixed: "A {[color]|[pattern]|striped} design"
```

**Number Ranges** - Generate random numbers:
```yaml
templates:
  quantity: "Found {1-10} coins"
  precise: "Exactly {2.5-7.3} meters"
```

### Advanced Features

**Optional Content** - Random inclusion using `?`:
```yaml
templates:
  item: "[device] [modification?]"  # Modification may or may not appear
```

**Exclusion Filters** - Remove items using `!`:
```yaml
templates:
  working_device: "[device!broken]"  # All devices except broken ones
```

**Repetition** - Repeat selections using `*`:
```yaml
templates:
  treasure: "[component*{2-4}]"  # Generates 2-4 components
```

### Text Formatting

**Indefinite Articles** - Automatic a/an:
```yaml
templates:
  description: "{a} [shape]"  # "an octagon" or "a square"
```

**Capitalization Modifiers**:
```yaml
templates:
  title: "[name.capitalize]"     # First letter uppercase
  whisper: "[shout.lowercase]"   # All lowercase
  plural: "[item.pluralForm]"    # Proper pluralization
```

**Markov Generation** - AI-style text from training data:
```yaml
templates:
  generated_callsign: "[survivor_names&settlements.markov]"
```

## Data Organization

### Automatic List Merging
Lists with the same name from different files are automatically combined:

```yaml
# post-apocalypse.yaml
devices:
  - laser rifle
  - plasma cannon

# Result: All devices available together for genre blending
```

### File Structure
Organize your data across multiple YAML files:

```
project/
├── data/
│   ├── devices.yaml
│   ├── survivors.yaml
│   └── settlements.yaml
└── generator.js
```

## YAML Structure Approaches

Choose the organizational style that best fits your content complexity.

### Flat Structure (Simple Lists)
Perfect for straightforward content:

```yaml
# simple-data.yaml
entities:
  - radiation mutant ^2
  - scavenger android ^1.5
  - malfunctioning drone

locations:
  - abandoned facility ^2
  - irradiated wasteland
  - underground bunker

templates:
  encounter:
    - "You detect [sounds] echoing from the [locations]"
    - "A [atmosphere] [entities] prowls nearby"
```

### Hierarchical Structure (Organized Categories)

Better for complex, organized content:

```yaml
# organized-data.yaml
vessel:
  type:
    - transport ^2
    - interceptor
    - cargo hauler ^3
  status:
    - operational
    - damaged ^2
    - derelict ^1.5

templates:
  vessel_description: "A [vessel.status] [vessel.type]"
```

## Error Handling & Reliability

SIGIL is designed for robust operation:

- **Graceful degradation**: Missing lists return placeholder text instead of crashing
- **Circular reference detection**: Prevents infinite loops with recursion depth limits  
- **Template validation**: Malformed syntax is detected and reported clearly
- **Import error handling**: Clear messages when referenced files don't exist
- **Debug mode**: Trace template resolution step-by-step for troubleshooting

## Common Use Cases

- **Game Development**: Procedural content, random events, character generation
- **Creative Writing**: Plot generators, character traits, world details  
- **Tabletop RPGs**: Monsters, loot, NPCs, dungeon rooms, random encounters
- **Educational Tools**: Quiz questions, example datasets, learning scenarios
- **Testing Data**: Realistic mock data generation for applications

## API Reference

### SigilEngine Class

```javascript
const engine = new SigilEngine(options);
```

**Options:**
- `debug: boolean` - Enable step-by-step resolution tracing
- `seed: string` - Set random seed for deterministic results
- `maxDepth: number` - Recursion depth limit (default: 10)

**Methods:**
- `loadData(filePath)` - Load YAML data file
- `loadDataFromString(yamlString)` - Load from YAML string  
- `generate(templateName)` - Generate content from template
- `setSeed(seed)` - Change random seed
- `enableDebug(enable)` - Toggle debug mode

## Browser vs Node.js

**Browser Usage:**
```javascript
// Load data via fetch or bundle with your app
const yamlData = await fetch('./data.yaml').then(r => r.text());
engine.loadDataFromString(yamlData);
```

**Node.js Usage:**
```javascript
// Direct file loading
await engine.loadData('./data/generators.yaml');
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions welcome! Please read the contributing guidelines and submit pull requests for any improvements.

---

*SIGIL: Where symbols become worlds*
