# Error Handling & Robustness

SIGIL is designed with robustness in mind and includes comprehensive error handling. Our test suite (67+ tests including various edge cases) exercises these behaviors.

## Design Principles

- **Defensive programming**: Attempts to return valid strings even with malformed syntax
- **Graceful degradation**: Missing data typically returns placeholder text  
- **Data separation**: YAML values with sigil characters are treated as literal text
- **Recursion limits**: Includes protection against circular references
- **Unicode handling**: Processes emojis, accented characters, and special symbols

## Robust Input Handling

### Literal Sigil Characters in Data

```yaml
# These are treated as literal text, not interpreted as sigils
band_names:
  - "Rock & Roll"      # Literal ampersand
  - "Either|Or"        # Literal pipe
  - "Question?"        # Literal question mark
  - "Star*"            # Literal asterisk

templates:
  music: "The band [band_names] is playing"
  # Result: "The band Rock & Roll is playing"
```

### Template-like Strings in Data

```yaml
# These look like templates but are treated as literal values
example_text:
  - "[fake_reference]"
  - "{this|that}"
  - "{list&another}"

templates:
  demo: "Example: [example_text]"
  # Result: "Example: [fake_reference]"
```

### Malformed Template Syntax

```yaml
templates:
  # All of these work without crashing:
  incomplete_1: "[missing_bracket"     # Missing close bracket
  incomplete_2: "missing_open]"        # Missing open bracket  
  wrong_type: "{square_in_curly}"      # Wrong bracket type
  incomplete_sigil: "[list&]"          # Incomplete AND sigil
  leading_sigil: "{&list}"             # Leading sigil
```

### Deep Nesting and Circular References

```yaml
# Deep nesting resolves correctly
level1: ["[level2]"]
level2: ["[level3]"]  
level3: ["[level4]"]
level4: ["deep_value"]

# Circular references don't cause infinite loops
circular_a: ["[circular_b]"]
circular_b: ["[circular_a]"]

templates:
  deep: "[level1]"      # Result: "deep_value"
  circular: "[circular_a]"  # Result: handled gracefully
```

## Edge Case Handling

### Extreme Inputs

- **Very long strings**: Handles 10,000+ character values without issue
- **Empty templates**: Returns empty string as-is
- **Whitespace-only**: Preserves spaces, tabs, and newlines
- **Null/undefined data**: Graceful handling without crashes
- **Unicode characters**: Full support for 🚀, café, ©, etc.

### Complex Sigil Combinations

```yaml
templates:
  # All combinations work reliably:
  complex: "[device*{2-4}!broken.capitalize?]"
  nested: "{[color]&[material]|solid}"  
  mixed: "{a} [shape.triangle?] {structure|building}"
```

## Error Recovery Strategies

1. **Missing References**: Return descriptive placeholder text
2. **Malformed Syntax**: Process what's valid, ignore invalid parts  
3. **Circular Dependencies**: Break cycles after safe recursion depth
4. **Empty Lists**: Return empty string or configured fallback
5. **Invalid Modifiers**: Apply valid modifiers, ignore invalid ones

## Fuzzing Test Results

SIGIL has been tested with various edge cases and unusual inputs. Our test suite exercises behavior across a range of inputs, including deliberately malformed scenarios.

### Input Validation Tests

- � **Sigil character handling**: YAML data containing `&`, `|`, `?`, `!`, `*`, `^` characters
- � **Template-like strings**: Data values that look like `[references]` and `{inline|options}`
- � **Bracket mismatches**: Unmatched `[`, `]`, `{`, `}` characters in templates
- � **Incomplete syntax**: Expressions like `[list&]`, `{|options}`

### Data Structure Tests

- � **Deep nesting**: Multi-level references up to configured recursion limits
- � **Circular references**: Detection and handling of circular reference patterns
- � **Null/undefined values**: Handling of missing or invalid data values
- � **Large datasets**: Processing of datasets with 10,000+ characters

### Character Encoding Tests

- � **Unicode handling**: Emojis (🚀💻🎯), accented characters (café, naïve), symbols (©®™€£¥)
- � **Whitespace preservation**: Tabs, newlines, and space characters
- � **Special characters**: Mathematical symbols, currency symbols, and punctuation

## Security Considerations

### Design Approach

- **No code execution**: YAML data is treated as data, not executable code
- **Template isolation**: User data is processed separately from template logic  
- **Bounded recursion**: Configurable depth limits help prevent excessive recursion
- **Input processing**: All inputs go through parsing and validation steps

### Recommended Practices

```javascript
// Example: Validate file sources in your application
const trustedSources = ['./data/', './content/'];
const filePath = validatePath(userInput, trustedSources);
await engine.loadData(filePath);

// Example: Set conservative limits for user-generated content
const engine = new SigilEngine({
  maxDepth: 5,        // Limit recursion depth
  maxTemplate: 1000   // Limit template length
});
```

## Test Coverage

**Current test scenarios** (67+ automated tests covering):
- ✅ Basic functionality across all sigils
- ✅ Complex cross-sigil combinations  
- ✅ Various edge cases and unusual inputs
- ✅ Unicode and international character handling
- ✅ Recursion limits and circular reference detection
- ✅ Large data sets and performance scenarios

## Sigil Precedence and Evaluation Order

- **AND (&) takes precedence over Optional (?)**: In expressions like `{[a]&[b?]}`, the AND sigil overrides optionality. All referenced elements are always included; optional is ignored.
- **Debugging**: When debug mode is enabled, the engine will log: `[SIGIL DEBUG] Optional (?) ignored: AND (&) takes precedence in expression ...`
- **Weights and Repetition**: In `[item^2*3]`, weights are applied before repetition. Each repetition is an independent draw from the weighted pool.