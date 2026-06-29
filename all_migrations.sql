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
$$;-- Seed compliance frameworks
INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url, color_hex) VALUES
('NIST Cybersecurity Framework', 'NIST CSF', 'A voluntary framework providing a policy framework of computer security guidance for how private sector organizations in the United States can assess and improve their ability to prevent, detect, and respond to cyber attacks.', '2.0', 'nist', 'https://www.nist.gov/cyberframework', '#0078D4'),
('NIST Risk Management Framework', 'NIST RMF', 'A structured process that integrates security, privacy, and cyber supply chain risk management activities into the system development life cycle.', NULL, 'nist', 'https://csrc.nist.gov/projects/risk-management', '#0078D4'),
('NIST SP 800-53', 'SP 800-53', 'Security and Privacy Controls for Information Systems and Organizations - a comprehensive catalog of security and privacy controls.', '5.0', 'nist', 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final', '#0078D4'),
('FedRAMP', 'FedRAMP', 'Federal Risk and Authorization Management Program - standardized approach to security assessment, authorization, and continuous monitoring for cloud products and services.', NULL, 'fedramp', 'https://www.fedramp.gov', '#00A651'),
('CMMC', 'CMMC', 'Cybersecurity Maturity Model Certification - a unified standard for implementing cybersecurity across the Defense Industrial Base.', '2.0', 'cmmc', 'https://dodcio.defense.gov/CMMC', '#FFA500'),
('ISO/IEC 27001', 'ISO 27001', 'International standard for information security management systems (ISMS), providing requirements for establishing, implementing, maintaining and continually improving an ISMS.', '2022', 'iso', 'https://www.iso.org/standard/27001', '#2574A9'),
('ISO/IEC 27002', 'ISO 27002', 'ISO/IEC 27002 provides guidelines and general principles for initiating, implementing, maintaining, and improving information security management.', '2022', 'iso', 'https://www.iso.org/standard/75639.html', '#2574A9'),
('SOX', 'SOX', 'Sarbanes-Oxley Act - US law mandating strict reforms to improve financial disclosures and prevent accounting fraud, including IT security requirements.', '2002', 'sox', 'https://www.sec.gov/oxley-article.htm', '#DC143C'),
('NIST AI Risk Management Framework', 'NIST AI RMF', 'Framework for managing risks associated with artificial intelligence and machine learning systems.', '1.0', 'ai-safety', 'https://www.nist.gov/itl/ai-risk-management-framework', '#00CED1'),
('ISO/IEC 42001', 'ISO 42001', 'AI Management System standard - specifies requirements for establishing, implementing, maintaining, and continually improving an AI management system.', '2023', 'ai-safety', 'https://www.iso.org/standard/81230.html', '#00CED1');

-- Seed sources for scraping
INSERT INTO sources (framework_id, name, url, source_type, scraper_type, refresh_frequency, parse_config) VALUES
-- NIST CSF
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'), 'NIST CSF Official', 'https://www.nist.gov/cyberframework', 'webpage', 'nist-csf', 'monthly', '{"parse_mode": "framework"}'),
-- NIST RMF  
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'), 'NIST RMF Official', 'https://csrc.nist.gov/projects/risk-management', 'webpage', 'nist-rmf', 'monthly', '{"parse_mode": "framework"}'),
-- NIST SP 800-53
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'), 'NIST SP 800-53 Controls', 'https://csrc.nist.gov/Projects/risk-management/sp800-53-controls', 'json', 'nist-json', 'monthly', '{"parse_mode": "controls", "format": "json"}'),
-- FedRAMP
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'FedRAMP'), 'FedRAMP Documents', 'https://www.fedramp.gov/baselines/', 'webpage', 'generic-webpage', 'monthly', '{"parse_mode": "documents"}'),
-- CMMC
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'), 'CMMC Model', 'https://dodcio.defense.gov/CMMC/Model/', 'webpage', 'cmmc-web', 'monthly', '{"parse_mode": "model"}'),
-- ISO 27001
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'), 'ISO 27001 Overview', 'https://www.iso.org/standard/27001', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "overview"}'),
-- ISO 27002
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27002'), 'ISO 27002 Overview', 'https://www.iso.org/standard/75639.html', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "overview"}'),
-- SOX
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SOX'), 'SEC SOX Resources', 'https://www.sec.gov/oxley-article.htm', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "documents"}'),
-- AI RMF
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI RMF'), 'NIST AI RMF', 'https://www.nist.gov/itl/ai-risk-management-framework', 'webpage', 'generic-webpage', 'monthly', '{"parse_mode": "framework"}'),
-- ISO 42001
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 42001'), 'ISO 42001 Overview', 'https://www.iso.org/standard/81230.html', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "overview"}');

-- Seed default templates for each framework type
INSERT INTO templates (framework_id, name, template_type, description, is_default) VALUES
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'), 'CSF Policy Template', 'policy', 'NIST Cybersecurity Framework policy document template covering all five core functions.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'), 'CSF Control Checklist', 'checklist', 'Checklist of NIST CSF controls and subcategories for compliance assessment.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'), 'RMF Package Template', 'policy', 'Risk Management Framework authorization package template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'), 'SP 800-53 Control Template', 'policy', 'Security and privacy control implementation template for SP 800-53.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'), 'SP 800-53 Checklist', 'checklist', 'Comprehensive checklist of SP 800-53 controls.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'FedRAMP'), 'FedRAMP SSP Template', 'policy', 'Federal Risk and Authorization Management Program System Security Plan template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'), 'CMMC Assessment Template', 'checklist', 'CMMC assessment checklist for practices and processes.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'), 'ISO 27001 ISMS Policy', 'policy', 'Information Security Management System policy template aligned with ISO 27001.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'), 'ISO 27001 Controls Checklist', 'checklist', 'Checklist of ISO 27001 Annex A controls.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SOX'), 'SOX IT Controls Template', 'policy', 'Sarbanes-Oxley IT general controls documentation template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SOX'), 'SOX Compliance Checklist', 'checklist', 'SOX Section 404 compliance checklist for IT controls.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI RMF'), 'AI RMF Policy Template', 'policy', 'AI Risk Management Framework policy and governance template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 42001'), 'ISO 42001 AIMS Template', 'policy', 'AI Management System policy template aligned with ISO 42001.', true);

-- Seed template sections for default templates
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required, prompt_template) VALUES
-- Header section (for all templates)
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'header', 'Document Header', 1, true, NULL),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'introduction', 'Introduction', 2, true, 'Purpose and scope of this {framework} compliance document.'),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'controls', 'Controls and Requirements', 3, true, 'Detailed control requirements mapped to the framework.'),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'implementation', 'Implementation Guidance', 4, false, 'Guidance for implementing the controls and requirements.'),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'appendix', 'Appendix', 5, false, 'Additional references and resources.'),

-- Checklist template sections
((SELECT id FROM templates WHERE name = 'CSF Control Checklist'), 'header', 'Document Header', 1, true, NULL),
((SELECT id FROM templates WHERE name = 'CSF Control Checklist'), 'introduction', 'Introduction', 2, true, 'Overview of the {framework} controls covered in this checklist.'),
((SELECT id FROM templates WHERE name = 'CSF Control Checklist'), 'checklist', 'Compliance Checklist', 3, true, NULL);

-- Add sections to other templates similarly
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t WHERE t.id NOT IN (SELECT DISTINCT template_id FROM template_sections)
UNION ALL
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t WHERE t.id NOT IN (SELECT DISTINCT template_id FROM template_sections)
UNION ALL
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t WHERE t.is_default = true AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections);-- Insert NIST CSF 2.0 Core Functions as documents
DO $$
DECLARE
    nist_framework_id UUID;
    nist_source_id UUID;
BEGIN
    -- Get NIST CSF framework ID
    SELECT id INTO nist_framework_id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF';
    
    -- Get NIST CSF source ID
    SELECT id INTO nist_source_id FROM sources WHERE framework_id = nist_framework_id LIMIT 1;
    
    -- Insert Core Functions
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - GOVERN Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'GOVERN establishes and monitors the organization''s cybersecurity risk management strategy, expectations, and policy. The GOVERN function provides leadership with the necessary visibility into cybersecurity risk and the steps being taken to manage it. This includes establishing organizational context, risk management strategy, roles and responsibilities, policies, and oversight.',
     '{"function_name": "GOVERN", "function_abbreviation": "GV", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - IDENTIFY Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'IDENTIFY helps the organization understand and manage cybersecurity risk to systems, people, assets, data, and capabilities. The activities in the IDENTIFY Function are foundational for effective use of the Framework. Understanding the business context, the resources that support critical functions, and the related cybersecurity risks enables an organization to focus and prioritize its efforts, consistent with its risk management strategy.',
     '{"function_name": "IDENTIFY", "function_abbreviation": "ID", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - PROTECT Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'PROTECT supports the ability to limit or contain the impact of a cybersecurity event. Examples of outcomes within this function include: Identity Management and Access Control; Awareness and Training; Data Security; Platform Security; and Technology Infrastructure Resilience. The PROTECT function ensures appropriate safeguards are in place to protect critical infrastructure services.',
     '{"function_name": "PROTECT", "function_abbreviation": "PR", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - DETECT Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'DETECT helps the organization identify the occurrence of a cybersecurity event in a timely manner. Examples of outcomes within this function include: Continuous Monitoring; and Adverse Event Analysis. The DETECT function enables organizations to discover cybersecurity events and potential incidents quickly.',
     '{"function_name": "DETECT", "function_abbreviation": "DE", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - RESPOND Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'RESPOND supports the ability to contain the impact of a cybersecurity event. Examples of outcomes within this function include: Incident Management; Incident Analysis; Incident Response Mitigation; and Incident Response Reporting. The RESPOND function ensures appropriate activities are taken to contain and mitigate incidents.',
     '{"function_name": "RESPOND", "function_abbreviation": "RS", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - RECOVER Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'RECOVER supports timely restoration of any capabilities or services that were impaired due to a cybersecurity event. Examples of outcomes within this function include: Incident Recovery Plan Execution; and Incident Recovery Communication. The RECOVER function supports recovery activities and communicates results.',
     '{"function_name": "RECOVER", "function_abbreviation": "RC", "version": "2.0"}', true);

    -- Insert Category-level documents  
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (nist_source_id, nist_framework_id, 'GV.OC - Organizational Context', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization understands its context and circumstances, including its mission, stakeholders, governing requirements, and dependencies. This category ensures leadership has visibility into the organizational environment and can make informed risk decisions. Key outcomes include understanding mission and values, stakeholder needs, legal requirements, dependencies, and risk appetite.',
     '{"category_id": "GV.OC", "category_name": "Organizational Context", "function_name": "GOVERN", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'GV.RM - Risk Management Strategy', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization establishes and communicates a cybersecurity risk management strategy. This includes defining risk management objectives, risk appetite and tolerance, assessment methods, and response strategies. The strategy should be aligned with organizational goals and communicated to all stakeholders.',
     '{"category_id": "GV.RM", "category_name": "Risk Management Strategy", "function_name": "GOVERN", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.AM - Asset Management', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to business objectives and the organization''s risk strategy. This includes hardware, software, data, personnel, and facility inventories.',
     '{"category_id": "ID.AM", "category_name": "Asset Management", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.RA - Risk Assessment', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization understands and manages cybersecurity risk to organizational operations, organizational assets, individuals, and other organizations. Risk assessment processes identify, estimate, and prioritize risk to organizational operations and assets.',
     '{"category_id": "ID.RA", "category_name": "Risk Assessment", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.AA - Identity Management, Authentication, and Access Control', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Access to physical and logical assets is authorized, managed, and governed appropriately. This includes identity management and authentication processes, access control mechanisms, and review of access privileges.',
     '{"category_id": "PR.AA", "category_name": "Identity Management, Authentication, and Access Control", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.AT - Awareness and Training', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization provides cybersecurity awareness and training. Personnel receive role-specific training and are equipped to perform their information security-related duties and responsibilities consistent with related policies and procedures.',
     '{"category_id": "PR.AT", "category_name": "Awareness and Training", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.DS - Data Security', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Data are managed and protected consistent with the organization''s risk strategy to protect the confidentiality, integrity, and availability of information. This includes data classification, protection processes, encryption, and availability protections.',
     '{"category_id": "PR.DS", "category_name": "Data Security", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'DE.CM - Continuous Monitoring', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization monitors for cybersecurity events and anomalies. Continuous monitoring ensures the organization can identify potential cybersecurity incidents. This includes network monitoring, service monitoring, and detection of unauthorized activity.',
     '{"category_id": "DE.CM", "category_name": "Continuous Monitoring", "function_name": "DETECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RS.MA - Incident Management', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Incidents are managed to ensure appropriate response and recovery activities are executed including incident handling, tracking, and lessons learned.',
     '{"category_id": "RS.MA", "category_name": "Incident Management", "function_name": "RESPOND", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RC.RP - Incident Recovery Plan Execution', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Recovery activities are executed to restore impaired capabilities or services. Recovery plans are executed to ensure timely restoration of operations.',
     '{"category_id": "RC.RP", "category_name": "Incident Recovery Plan Execution", "function_name": "RECOVER", "version": "2.0"}', true);

    -- Insert Control-level documents
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (nist_source_id, nist_framework_id, 'ID.AM-01 - Hardware Asset Inventory', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'All hardware assets are identified and inventoried. Organizations should maintain an up-to-date inventory of all hardware assets including servers, workstations, laptops, mobile devices, and network equipment. The inventory should include asset ownership, location, and business function.',
     '{"control_id": "ID.AM-01", "category_id": "ID.AM", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.AM-02 - Software Asset Inventory', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'All software assets are identified and inventoried. Organizations should maintain an inventory of all software including operating systems, applications, and utilities. The inventory should include version information, licensing status, and business purpose.',
     '{"control_id": "ID.AM-02", "category_id": "ID.AM", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.RA-01 - Risk Assessment Process', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Cybersecurity risk assessment processes are established and managed. Organizations should define and implement a risk assessment methodology that identifies risks, determines their likelihood and impact, and prioritizes them for treatment.',
     '{"control_id": "ID.RA-01", "category_id": "ID.RA", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.AA-01 - Identity Management', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Identity management and authentication processes are established and managed. Organizations should implement identity and access management controls including user provisioning, authentication mechanisms, and access reviews.',
     '{"control_id": "PR.AA-01", "category_id": "PR.AA", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.DS-01 - Data Classification', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Data classification processes are established and managed. Organizations should classify data based on sensitivity and criticality. Classification levels should guide the implementation of appropriate security controls.',
     '{"control_id": "PR.DS-01", "category_id": "PR.DS", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.DS-02 - Data Protection', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Data protection processes are established and managed. Organizations should implement data protection controls appropriate to the classification level, including encryption, access controls, and data loss prevention.',
     '{"control_id": "PR.DS-02", "category_id": "PR.DS", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'DE.CM-01 - Network Monitoring', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Network monitoring processes are established and managed. Organizations should implement network monitoring to detect unauthorized activity, anomalies, and potential security events.',
     '{"control_id": "DE.CM-01", "category_id": "DE.CM", "function_name": "DETECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RS.MA-01 - Incident Management Process', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Incident management processes are established and managed. Organizations should implement incident response capabilities including preparation, detection, containment, eradication, recovery, and lessons learned.',
     '{"control_id": "RS.MA-01", "category_id": "RS.MA", "function_name": "RESPOND", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RC.RP-01 - Recovery Plan Execution', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Recovery plan execution processes are established and managed. Organizations should maintain and test recovery plans to ensure timely restoration of critical capabilities and services following an incident.',
     '{"control_id": "RC.RP-01", "category_id": "RC.RP", "function_name": "RECOVER", "version": "2.0"}', true);

END $$;-- Insert FedRAMP baseline controls
DO $$
DECLARE
    fedramp_framework_id UUID;
    fedramp_source_id UUID;
BEGIN
    SELECT id INTO fedramp_framework_id FROM compliance_frameworks WHERE abbreviation = 'FedRAMP';
    SELECT id INTO fedramp_source_id FROM sources WHERE framework_id = fedramp_framework_id LIMIT 1;
    
    -- FedRAMP Control Families
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (fedramp_source_id, fedramp_framework_id, 'AC - Access Control', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Access Control (AC) controls ensure that information system access is authorized and managed. This control family addresses identification and authentication, access enforcement, information flow enforcement, separation of duties, and least privilege.',
     '{"control_family": "AC", "family_name": "Access Control", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'AU - Audit and Accountability', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Audit and Accountability (AU) controls ensure that organizational actions can be traced to the responsible individuals. This includes audit event generation, audit review and analysis, and audit reporting.',
     '{"control_family": "AU", "family_name": "Audit and Accountability", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'CM - Configuration Management', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Configuration Management (CM) controls ensure that systems are configured securely and changes are managed. This includes baseline configurations, change control, and security impact analysis.',
     '{"control_family": "CM", "family_name": "Configuration Management", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'IA - Identification and Authentication', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Identification and Authentication (IA) controls verify the identity of users, processes, or devices. This includes identifier management, authenticator management, and authenticator type requirements.',
     '{"control_family": "IA", "family_name": "Identification and Authentication", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'IR - Incident Response', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Incident Response (IR) controls ensure organizations respond to and recover from security incidents. This includes incident handling, monitoring, and reporting.',
     '{"control_family": "IR", "family_name": "Incident Response", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'SC - System and Communications Protection', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'System and Communications Protection (SC) controls protect information in transit and at rest. This includes boundary protection, cryptographic protection, and session security.',
     '{"control_family": "SC", "family_name": "System and Communications Protection", "version": "Rev5"}', true);
     
    -- FedRAMP Specific Controls
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (fedramp_source_id, fedramp_framework_id, 'AC-2 - Account Management', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Account Management - Organizations manage information system accounts, including creating, activating, modifying, reviewing, and deactivating accounts. Account management includes user, group, and system accounts.',
     '{"control_id": "AC-2", "control_family": "AC", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'AC-3 - Access Enforcement', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Access Enforcement - Organizations enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.',
     '{"control_id": "AC-3", "control_family": "AC", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'AU-2 - Audit Events', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Audit Events - Organizations identify events that need to be audited and the frequency of auditing for each identified event. Audit events should include start/stop of audit functions, access authorization events, and privilege operations.',
     '{"control_id": "AU-2", "control_family": "AU", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'CM-2 - Baseline Configuration', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Baseline Configuration - Organizations develop, document, and maintain a baseline configuration of the information system. The baseline configuration includes software, hardware, and network topology.',
     '{"control_id": "CM-2", "control_family": "CM", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'IA-2 - Identification and Authentication', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Identification and Authentication - Organizations uniquely identify and authenticate organizational users and processes. Implementation includes multifactor authentication for privileged access and network access.',
     '{"control_id": "IA-2", "control_family": "IA", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'SC-7 - Boundary Protection', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Boundary Protection - Organizations protect the boundaries of information systems. This includes monitoring and controlling communications at external boundaries and key internal boundaries.',
     '{"control_id": "SC-7", "control_family": "SC", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'SC-8 - Transmission Confidentiality and Integrity', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Transmission Confidentiality and Integrity - Organizations protect the confidentiality and integrity of transmitted information using cryptographic mechanisms. Implementation includes TLS for all external connections.',
     '{"control_id": "SC-8", "control_family": "SC", "version": "Rev5"}', true);
END $$;

-- Insert ISO 27001 Annex A Controls
DO $$
DECLARE
    iso_framework_id UUID;
    iso_source_id UUID;
BEGIN
    SELECT id INTO iso_framework_id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001';
    SELECT id INTO iso_source_id FROM sources WHERE framework_id = iso_framework_id LIMIT 1;
    
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.5 - Organizational Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.5 Organizational Controls covers policies, roles, responsibilities, authorities, and the governance of information security. Key controls include information security policies, organization of information security, human resource security, and asset management.',
     '{"annex": "A.5", "annex_name": "Organizational Controls", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.6 - People Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.6 People Controls addresses personnel security from hiring through termination. Covers screening, terms of employment, management responsibilities, information security awareness/education, and disciplinary process.',
     '{"annex": "A.6", "annex_name": "People Controls", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.7 - Physical Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.7 Physical Controls covers physical security perimeters, entry controls, securing offices/rooms, protecting equipment, secure disposal, and supporting utilities.',
     '{"annex": "A.7", "annex_name": "Physical Controls", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.8 - Technological Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.8 Technological Controls addresses user endpoint security, access control, cryptography, operational security, secure development, supplier relationships, and incident management.',
     '{"annex": "A.8", "annex_name": "Technological Controls", "version": "2022"}', true);
     
    -- Specific ISO 27001 Controls
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (iso_source_id, iso_framework_id, 'A.5.1 - Policies for Information Security', 'control', 'https://www.iso.org/standard/27001', '2022',
     'Information security policy and topic-specific policies shall be defined, approved by management, communicated to employees and relevant external parties, and reviewed at planned intervals or if significant changes occur.',
     '{"control_id": "A.5.1", "annex": "A.5", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'A.5.10 - Acceptable Use of Information', 'control', 'https://www.iso.org/standard/27001', '2022',
     'Rules and procedures for the acceptable use of information and other assets associated with information processing facilities shall be identified, documented, and communicated to employees.',
     '{"control_id": "A.5.10", "annex": "A.5", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'A.8.2 - Privileged Access Rights', 'control', 'https://www.iso.org/standard/27001', '2022',
     'The allocation and use of privileged access rights shall be restricted and managed. Privileged access rights shall be authorized and based on the principle of least privilege.',
     '{"control_id": "A.8.2", "annex": "A.8", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'A.8.24 - Cryptography', 'control', 'https://www.iso.org/standard/27001', '2022',
     'The use of cryptographic techniques shall be governed and managed to protect the confidentiality, authenticity, and integrity of information. Cryptographic controls shall be implemented according to organizational policy.',
     '{"control_id": "A.8.24", "annex": "A.8", "version": "2022"}', true);
END $$;-- Security fixes for compliance schema

-- ============================================
-- 1. Fix function search_path mutability
-- ============================================

-- Fix update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. Move vector extension to extensions schema
-- ============================================

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extension to extensions schema (Supabase supports this)
ALTER EXTENSION vector SET SCHEMA extensions;

-- ============================================
-- 3. Remove overly permissive RLS policies
-- ============================================

-- Drop the service_all_* policies that allow unrestricted access
DROP POLICY IF EXISTS "service_all_frameworks" ON compliance_frameworks;
DROP POLICY IF EXISTS "service_all_sources" ON sources;
DROP POLICY IF EXISTS "service_all_documents" ON documents;
DROP POLICY IF EXISTS "service_all_chunks" ON document_chunks;
DROP POLICY IF EXISTS "service_all_templates" ON templates;
DROP POLICY IF EXISTS "service_all_template_sections" ON template_sections;
DROP POLICY IF EXISTS "service_all_generated_docs" ON generated_documents;
DROP POLICY IF EXISTS "service_all_ingest_jobs" ON ingest_jobs;
DROP POLICY IF EXISTS "service_all_mappings" ON framework_mappings;-- Fix match_documents function with proper search_path and vector type references

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding extensions.vector(1536),
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
SECURITY DEFINER
SET search_path = public, extensions
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