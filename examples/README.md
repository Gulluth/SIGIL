# SIGIL Examples

This directory contains example YAML data files and a demonstration script showing SIGIL's capabilities.

## Running the Examples

### From the Project Root

```bash
# Install dependencies (if not already done)
npm install

# Run the examples
npm run example
```

### Direct Execution

```bash
# Build the project first
npm run build

# Run the compiled example directly
node dist/examples/example.js
```

### Development Mode

```bash
# Watch for changes and rebuild automatically
npm run dev

# In another terminal, run examples after changes
node dist/examples/example.js
```

## What the Examples Demonstrate

The example script (`example.ts`) showcases four key SIGIL features:

### 1. Flat Structure (Horror Theme)
- Simple YAML lists for straightforward content
- Basic template processing
- Uses `horror.yaml` and `templates.yaml`

### 2. Hierarchical Structure (Space Theme)  
- Organized categories using dot notation
- Complex data organization
- Uses `scifi.yaml` and `templates.yaml`

### 3. Genre Blending
- Automatic list merging from multiple files
- Demonstrates SIGIL's power for creative combinations
- Uses `fantasy.yaml`, `scifi.yaml`, and `templates.yaml`

### 4. AND Sigil (&) - Compound Word Generation
- Uses the `&` sigil to create compound words and names
- Demonstrates procedural name generation and tech terms
- Uses `compound.yaml`, `scifi.yaml`, and `templates.yaml`

## Example Data Files

- **`horror.yaml`** - Horror themed content using simple lists
- **`fantasy.yaml`** - Medieval themed fantasy content using a mix of hierarchical and flat lists
- **`scifi.yaml`** - Sci-Fi themed content using a more complex structure
- **`compound.yaml`** - Name prefixes/suffixes and tech components for & sigil examples
- **`templates.yaml`** - Shared templates including & sigil demonstrations

## Expected Output

The examples will generate random content like:

```
Horror Encounters:
  1. You hear distant screaming echoing from the cursed cemetery
  2. You hear whispered prayers echoing from the forgotten basement

Space Missions:
  1. The scout vessel shows derelict readings near a neutron star
  2. The frigate shows damaged readings near a gas giant

Genre-Blended Items:
  1. A crystalline sword
  2. A nano-carbon axe

AND Sigil Examples:
  1. Contact established with Nexcore
  2. Found a nanoscanner in the ruins
  3. Triple compound: activecybermatrix
```

## Customizing the Examples

Feel free to:
- Modify the YAML files to add your own content
- Edit `example.ts` to test different SIGIL features
- Create new YAML files following the existing patterns

## Troubleshooting

If you encounter issues:

1. **File not found errors**: Make sure you're running from the project root
2. **Import errors**: Run `npm run build` to compile TypeScript
3. **Permission errors**: Ensure you have read access to the example files

For more information about SIGIL syntax and features, see the main [README](../README.md).
