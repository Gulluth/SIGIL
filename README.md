```
┏┓┳┏┓┳┓  
┗┓┃┃┓┃┃  
┗┛┻┗┛┻┗┛  
```

# SIGIL Mono Repo

SIGIL is experimental software. Expect breaking changes as development continues. You have been warned!

## What is SIGIL?

SIGIL (**S**igil **I**s **G**enerative **I**nterpretive **L**anguage) is a minimalist YAML-based DSL for creating powerful random generators. It’s perfect for game development, creative writing, worldbuilding, and any application that needs procedural content generation.

This mono repo contains:

- The core SIGIL TypeScript library (`libs/sigil`)
- The SIGIL desktop app (`apps/learn-sigil`)
- Examples, docs, and build scripts

## Getting Started

Clone the repo and install dependencies:

```bash
git clone <repo-url>
npm install
```

For Go projects, run:

```bash
go mod tidy
```

## Projects

### SIGIL Editor (`apps/learn-sigil`)

A desktop app built with Go and Svelte.  
Find builds in [`apps/learn-sigil/build/`](apps/learn-sigil/build/).  
App documentation: [`apps/learn-sigil/docs/`](apps/learn-sigil/docs/)

### SIGIL Library (`libs/sigil`)

A TypeScript library for templates, themes, and procedural generation.  
See [`libs/sigil/README.md`](libs/sigil/README.md) for API reference, syntax, and advanced usage.

NPM: https://www.npmjs.com/package/@gulluth/sigil

## Releases

- **Library:** Published on NPM as `@gulluth/sigil`

## Documentation

- [SIGIL Library Docs](libs/sigil/docs/)
- [SIGIL Editor Docs](apps/learn-sigil/docs/)
- [API Reference](libs/sigil/docs/api-reference.md)
- [Error Handling Guide](libs/sigil/docs/error-handling.md)

## License

MIT License. See LICENSE for details.

## Contributing

Contributions welcome! See CONTRIBUTING.md for guidelines.

---

SIGIL: Where symbols become worlds
