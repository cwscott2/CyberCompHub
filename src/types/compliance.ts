// Compliance Framework types
export type FrameworkCategory = 'iso' | 'nist' | 'fedramp' | 'cmmc' | 'sox' | 'ai-safety';

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string | null;
  version: string | null;
  abbreviation: string;
  official_url: string | null;
  icon_url: string | null;
  color_hex: string | null;
  category: FrameworkCategory;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Document Source types
export type SourceType = 'json' | 'csv' | 'pdf' | 'webpage' | 'api';
export type ScraperType = 'nist-json' | 'nist-csf' | 'nist-rmf' | 'iso-api' | 'fedramp-csv' | 'cmmc-web' | 'generic-pdf' | 'generic-webpage';
export type RefreshFrequency = 'weekly' | 'monthly' | 'quarterly';

export interface Source {
  id: string;
  framework_id: string;
  name: string;
  url: string;
  source_type: SourceType;
  scraper_type: ScraperType;
  parse_config: Record<string, unknown> | null;
  last_scraped_at: string | null;
  next_refresh_at: string | null;
  refresh_frequency: RefreshFrequency;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  framework?: ComplianceFramework;
}

// Document types
export type DocumentType = 'framework' | 'guideline' | 'control' | 'requirement' | 'publication';

export interface Document {
  id: string;
  source_id: string;
  framework_id: string;
  title: string;
  document_type: DocumentType;
  url: string | null;
  version: string | null;
  published_date: string | null;
  content_hash: string | null;
  raw_content: string | null;
  metadata: Record<string, unknown> | null;
  is_indexed: boolean;
  created_at: string;
  updated_at: string;
  source?: Source;
  framework?: ComplianceFramework;
}

// Document Chunk for RAG
export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
  metadata: ChunkMetadata | null;
  created_at: string;
  document?: Document;
}

export interface ChunkMetadata {
  section?: string;
  subsection?: string;
  control_id?: string;
  context?: string;
  page_number?: number;
}

// Template types
export type TemplateType = 'policy' | 'checklist' | 'control-map' | 'procedure' | 'raci' | 'gap_assessment' | 'poam';

export interface Template {
  id: string;
  framework_id: string;
  name: string;
  description: string | null;
  template_type: TemplateType;
  structure_version: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  framework?: ComplianceFramework;
  sections?: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  template_id: string;
  section_key: string;
  display_name: string;
  section_order: number;
  prompt_template: string | null;
  retrieval_query: string | null;
  is_required: boolean;
  created_at: string;
}

// Generated Document
export interface GeneratedDocument {
  id: string;
  title: string;
  framework_id: string;
  template_id: string;
  content_markdown: string;
  metadata: Record<string, unknown> | null;
  export_formats: string[];
  created_at: string;
  updated_at: string;
  framework?: ComplianceFramework;
  template?: Template;
}

// Ingest Job tracking
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface IngestJob {
  id: string;
  source_id: string;
  status: JobStatus;
  documents_ingested: number;
  chunks_created: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  source?: Source;
  sources?: { name: string; compliance_frameworks?: { abbreviation: string; name: string } };
}

// Framework Mapping (cross-references)
export type MappingType = 'direct' | 'partial' | 'related';

export interface FrameworkMapping {
  id: string;
  source_framework_id: string;
  target_framework_id: string;
  source_control_id: string;
  target_control_id: string;
  mapping_type: MappingType;
  explanation: string | null;
  confidence_score: number | null;
  created_at: string;
  source_framework?: ComplianceFramework;
  target_framework?: ComplianceFramework;
}

// Chat message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface Citation {
  document_id?: string;
  document_title: string;
  chunk_id?: string;
  content_snippet: string;
  url: string | null;
  framework_name: string;
  related_frameworks?: string[];
  relevance_score?: number;
  control_id?: string | null;
}

// Search types
export interface SearchResult {
  document: Document;
  chunks: DocumentChunk[];
  relevance_score: number;
  highlights?: string[];
}

// Generation request types
export interface GenerationRequest {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
  additional_context?: string;
}

// Export types
export type ExportFormat = 'markdown' | 'docx' | 'xlsx';

export interface ExportRequest {
  document_id: string;
  format: ExportFormat;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
