import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SearchRequest {
  query: string;
  framework_id?: string;
  document_type?: string;
  limit?: number;
  threshold?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query, framework_id, document_type, limit = 20 }: SearchRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the search query
    let dbQuery = supabase
      .from('documents')
      .select(`
        id,
        title,
        document_type,
        url,
        version,
        published_date,
        raw_content,
        metadata,
        created_at,
        updated_at,
        framework_id,
        compliance_frameworks!inner(id, name, abbreviation, category),
        sources!inner(id, name)
      `)
      .textSearch('title', query, { type: 'websearch', config: 'english' })
      .limit(limit);

    if (framework_id) {
      dbQuery = dbQuery.eq('framework_id', framework_id);
    }

    if (document_type) {
      dbQuery = dbQuery.eq('document_type', document_type);
    }

    const { data: documents, error: searchError } = await dbQuery;

    if (searchError) {
      console.error('Search error:', searchError);
      return new Response(
        JSON.stringify({ error: 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also search in content if available
    let contentResults: any[] = [];
    if (query && query.length > 3) {
      const { data: contentMatches } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          document_type,
          url,
          version,
          published_date,
          raw_content,
          metadata,
          created_at,
          updated_at,
          framework_id,
          compliance_frameworks!inner(id, name, abbreviation, category),
          sources!inner(id, name)
        `)
        .ilike('raw_content', `%${query}%`)
        .limit(limit);

      if (contentMatches) {
        contentResults = contentMatches;
      }
    }

    // Combine and deduplicate results
    const seenIds = new Set<string>();
    const allResults = [...(documents || []), ...contentResults].filter((doc) => {
      if (seenIds.has(doc.id)) return false;
      seenIds.add(doc.id);
      return true;
    });

    // Transform results
    const results = allResults.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      document_type: doc.document_type,
      url: doc.url,
      version: doc.version,
      published_date: doc.published_date,
      raw_content: doc.raw_content,
      metadata: doc.metadata,
      framework: doc.compliance_frameworks ? {
        id: doc.compliance_frameworks.id,
        name: doc.compliance_frameworks.name,
        abbreviation: doc.compliance_frameworks.abbreviation,
        category: doc.compliance_frameworks.category,
      } : null,
      source: doc.sources ? {
        id: doc.sources.id,
        name: doc.sources.name,
      } : null,
      relevance_score: doc.title?.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.7,
    }));

    return new Response(
      JSON.stringify({ results, total: results.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
