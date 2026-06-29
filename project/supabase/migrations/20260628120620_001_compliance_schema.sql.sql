-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Compliance Frameworks (reference data)
CREATE TABLE compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT,
  abbreviation TEXT NOT NULL,
  official_url TEXT,
  icon_url TEXT,
  color_hex TEXT,
  category TEXT NOT NULL CHECK (category IN ('iso', 'nist', 'fedramp', 'cmmc', 'sox', 'ai-safety')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources for compliance documents
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('json', 'csv', 'pdf', 'webpage', 'api')),
  scraper_type TEXT NOT NULL CHECK (scraper_type IN ('nist-json', 'nist-csf', 'nist-rmf', 'iso-api', 'fedramp-csv', 'cmmc-web', 'generic-pdf', 'generic-webpage')),
  parse_config JSONB DEFAULT '{}',
  last_scraped_at TIMESTAMPTZ,
  next_refresh_at TIMESTAMPTZ,
  refresh_frequency TEXT DEFAULT 'monthly' CHECK (refresh_frequency IN ('weekly', 'monthly', 'quarterly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Source documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('framework', 'guideline', 'control', 'requirement', 'publication')),
  url TEXT,
  version TEXT,
  published_date DATE,
  content_hash TEXT,
  raw_content TEXT,
  metadata JSONB DEFAULT '{}',
  is_indexed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create full-text search index on documents
CREATE INDEX documents_title_search_idx ON documents USING gin(to_tsvector('english', title));
CREATE INDEX documents_content_search_idx ON documents USING gin(to_tsvector('english', COALESCE(raw_content, '')));

-- Document chunks for RAG with vector embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector index for similarity search
CREATE INDEX document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX document_chunks_document_idx ON document_chunks(document_id);

-- Framework-specific templates for policy/checklist generation
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('policy', 'checklist', 'control-map', 'procedure', 'raci')),
  structure_version TEXT DEFAULT '1.0',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template sections that dynamically populate from documents
CREATE TABLE template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  section_order INTEGER DEFAULT 0,
  prompt_template TEXT,
  retrieval_query TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated documents
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  content_markdown TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  export_formats TEXT[] DEFAULT ARRAY['markdown'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingest job tracking
CREATE TABLE ingest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  documents_ingested INTEGER DEFAULT 0,
  chunks_created INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Framework cross-references
CREATE TABLE framework_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  target_framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  source_control_id TEXT NOT NULL,
  target_control_id TEXT NOT NULL,
  mapping_type TEXT NOT NULL CHECK (mapping_type IN ('direct', 'partial', 'related')),
  explanation TEXT,
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (source_framework_id != target_framework_id)
);

-- Enable RLS on all tables
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access (no auth required yet)
CREATE POLICY "public_read_frameworks" ON compliance_frameworks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_sources" ON sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_documents" ON documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_chunks" ON document_chunks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_templates" ON templates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_template_sections" ON template_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_generated_docs" ON generated_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_ingest_jobs" ON ingest_jobs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_mappings" ON framework_mappings FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies: Service role full access (for edge functions)
CREATE POLICY "service_all_frameworks" ON compliance_frameworks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_sources" ON sources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_chunks" ON document_chunks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_templates" ON templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_template_sections" ON template_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_generated_docs" ON generated_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_ingest_jobs" ON ingest_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_mappings" ON framework_mappings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER update_frameworks_updated_at BEFORE UPDATE ON compliance_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_docs_updated_at BEFORE UPDATE ON generated_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vector search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 10,
  framework_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  document_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    dc.document_id,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE
    (framework_filter IS NULL OR d.framework_id = framework_filter)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;