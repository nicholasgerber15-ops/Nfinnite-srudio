# Nfinnite Studio - AI Coding Engine

An advanced, modular AI coding engine inspired by OpenCode with a focus on separation of concerns. Supports multiple LLM providers, code analysis, generation, testing, and debugging.

## Features

- 🤖 Multi-agent architecture (code generation, analysis, testing, debugging, refactoring)
- 🔗 Multi-LLM provider support (OpenAI, Anthropic, Local models)
- 📊 Advanced code analysis with AST parsing
- 🧪 Automated test generation
- 🐛 Intelligent debugging assistance
- 💾 Flexible storage layer (database, cache, cloud)
- 🔐 Built-in security and authentication
- 📈 Comprehensive logging and monitoring
- 🚀 RESTful API with middleware support
- 🐳 Docker support for easy deployment

## Project Structure

```
src/
├── core/                 # Core engine functionality
├── agents/              # Specialized AI agents
├── processing/          # Request/response pipeline
├── code-analysis/       # Code understanding
├── integrations/        # External service adapters
├── storage/            # Data persistence
├── security/           # Authentication & security
├── logging/            # Logging & monitoring
├── utils/              # Utility functions
└── api/                # REST API routes & controllers
```

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Setup Instructions](./docs/SETUP.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## License

MIT
