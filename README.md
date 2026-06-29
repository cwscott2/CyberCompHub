# CyberComplianceHub

A smart compliance knowledge capability for cybersecurity frameworks including NIST CSF, ISO 27001, FedRAMP, CMMC, SOX, and AI security/governance standards.

## Features

- **Multi-Framework Knowledge Base**: NIST CSF, NIST RMF, FedRAMP, CMMC, ISO 27001, SOX, AI RMF
- **AI-Powered Chat**: Ask questions about compliance requirements with source citations
- **Document Search**: Full-text search across all compliance documents
- **Policy Generator**: Create policies, checklists, and control mappings
- **Multi-Format Export**: Markdown, DOCX, PDF

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Vector Search**: pgvector extension

## Documentation

- [Product Requirements Document](./docs/PRD.md)

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── services/         # API clients
│   ├── types/            # TypeScript definitions
│   └── styles/           # CSS/ Tailwind
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
└── docs/                 # Documentation
```

## Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## License

MIT
