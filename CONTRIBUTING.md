# Contributing to SIGIL

## Development Workflow

### Setting up the development environment

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests to ensure everything works: `npm test`

### Making changes

SIGIL follows a Test-Driven Development (TDD) approach:

1. **Write tests first**: Create failing tests for the new feature
2. **Watch tests fail**: Run `npm test` to confirm tests fail as expected
3. **Implement code**: Write the minimal code to make tests pass
4. **Verify tests pass**: Run `npm test` to confirm implementation works
5. **Refactor if needed**: Clean up code while keeping tests green

### Useful development commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode compilation for development
- `npm test` - Run all tests
- `npm test:watch` - Run tests in watch mode
- `npm run example` - Run the example to see SIGIL in action
- `npm run clean` - Remove compiled files

## Release Process

SIGIL uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated versioning and changelog generation based on conventional commits.

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring without changing functionality
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates

**Breaking changes:**
- Add `BREAKING CHANGE:` in the footer or use `!` after type (triggers major version bump)
- Example: `feat!: remove deprecated .old sigil syntax`

## Release Process

For complete release instructions, see [`RELEASE.md`](RELEASE.md).

## Feature Development Guidelines

### Implementing new SIGIL features

1. **Create a new branch**: `git checkout -b feature-name`
2. **Add examples first**: Update examples to show the new feature
3. **Write comprehensive tests**: Cover edge cases and error conditions
4. **Implement incrementally**: Start with the simplest case
5. **Update documentation**: Add to README if user-facing

### Code organization

- `src/index.ts` - Main API exports
- `src/template-engine.ts` - Core SIGIL processing logic
- `src/parser.ts` - YAML parsing and validation
- `src/yaml-loader.ts` - File loading utilities
- `src/markov-generator.ts` - Markov chain text generation
- `test/` - All test files (mirror src/ structure)
- `examples/` - Usage examples and sample data

### Testing guidelines

- Test file naming: `test-[module].ts`
- Use descriptive test names that explain the behavior
- Test both success and failure cases
- Include edge cases (empty strings, null values, etc.)
- Mock external dependencies when appropriate

## Questions?

If you're unsure about anything, feel free to:
1. Run `npm run release:dry-run` to preview changes
2. Check existing tests for patterns
3. Look at recent commits for examples
4. Open an issue for discussion

Remember: when in doubt, write a test first!