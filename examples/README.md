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

The example script (`example.ts`) showcases three key SIGIL features:

### 1. Flat Structure (Horror Theme)
- Simple YAML lists for straightforward content
- Basic template processing
- Uses `horror-flat.yaml` and `example-templates.yaml`

### 2. Hierarchical Structure (Space Theme)  
- Organized categories using dot notation
- Complex data organization
- Uses `space-nested.yaml` and `example-templates.yaml`

### 3. Genre Blending
- Automatic list merging from multiple files
- Demonstrates SIGIL's power for creative combinations
- Uses `medieval-data.yaml`, `scifi-data.yaml`, and `global-templates.yaml`

## Example Data Files

- **`horror-flat.yaml`** - Simple horror-themed lists
- **`space-nested.yaml`** - Hierarchical space/sci-fi data
- **`medieval-data.yaml`** - Medieval fantasy content
- **`scifi-data.yaml`** - Science fiction content
- **`global-templates.yaml`** - Shared templates
- **`example-templates.yaml`** - Demo-specific templates

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
