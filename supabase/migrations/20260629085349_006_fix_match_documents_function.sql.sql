-- Fix match_documents function with proper search_path and vector type references

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