import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChatRequest {
  message: string;
  framework_id?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, framework_id, history = [] }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Known framework abbreviations — used to detect named frameworks in the query
    const KNOWN_FRAMEWORKS: Record<string, string> = {
      'eu ai act': 'EU AI Act',
      'nist ai 100-1': 'NIST AI 100-1',
      'nist ai rmf': 'NIST AI RMF',
      'nist csf': 'NIST CSF',
      'nist rmf': 'NIST RMF',
      'sp 800-53': 'SP 800-53',
      '800-53': 'SP 800-53',
      'cmmc': 'CMMC',
      'iso 27001': 'ISO 27001',
      'iso 42001': 'ISO 42001',
      'fedramp': 'FedRAMP',
      'sox': 'SOX',
      'mitre atlas': 'MITRE ATLAS',
      'dod ai': 'DoD AI Ethics',
      'oecd ai': 'OECD AI Principles',
    };

    const messageLower = message.toLowerCase();
    const mentionedFrameworks = Object.entries(KNOWN_FRAMEWORKS)
      .filter(([key]) => messageLower.includes(key))
      .map(([, abbrev]) => abbrev);

    // Generate embedding for the user's query
    const queryEmbedding = await generateEmbedding(message);

    let chunks: any[] = [];

    if (!framework_id && mentionedFrameworks.length >= 2) {
      // Look up framework UUIDs for each mentioned framework
      const { data: frameworkRows } = await supabase
        .from('compliance_frameworks')
        .select('id, abbreviation')
        .in('abbreviation', mentionedFrameworks);

      const frameworkIdMap: Record<string, string> = Object.fromEntries(
        (frameworkRows ?? []).map((f: any) => [f.abbreviation, f.id])
      );

      // Search each framework separately using its UUID as the filter
      const perFrameworkResults = await Promise.all(
        mentionedFrameworks.map((abbrev) =>
          supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.1,
            match_count: 6,
            framework_filter: frameworkIdMap[abbrev] ?? null,
          }).then(({ data }) => data ?? [])
        )
      );

      // Interleave results so each framework gets equal representation
      const maxLen = Math.max(...perFrameworkResults.map((r) => r.length));
      for (let i = 0; i < maxLen; i++) {
        for (const results of perFrameworkResults) {
          if (results[i]) chunks.push(results[i]);
        }
      }
    } else {
      // Standard search — single framework filter or no specific framework mentioned
      const { data, error: searchError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2,
        match_count: 12,
        framework_filter: framework_id ?? null,
      });
      if (searchError) console.error('Vector search error:', searchError);
      chunks = data ?? [];
    }

    // Cross-framework clustering: for each result find similar docs from other frameworks
    const seenIds = new Set(chunks.map((c: any) => c.id));
    const crossFrameworkMap: Record<string, string[]> = {}; // doc id → related framework tags

    if (!framework_id && chunks.length > 0) {
      const crossResults = await Promise.all(
        chunks.slice(0, 6).map((chunk: any) =>
          supabase.rpc('match_documents', {
            query_embedding: chunk.embedding ?? queryEmbedding,
            match_threshold: 0.72,
            match_count: 5,
            framework_filter: null,
          }).then(({ data }) =>
            (data ?? []).filter(
              (c: any) => c.id !== chunk.id && c.framework_abbreviation !== chunk.framework_abbreviation
            )
          )
        )
      );

      chunks.slice(0, 6).forEach((chunk: any, i: number) => {
        const related = crossResults[i] ?? [];
        if (related.length > 0) {
          crossFrameworkMap[chunk.id] = [...new Set(related.map((r: any) => r.framework_abbreviation))];
          // Add unique related docs to chunk list for Claude's context
          related.forEach((r: any) => {
            if (!seenIds.has(r.id)) {
              seenIds.add(r.id);
              chunks.push(r);
            }
          });
        }
      });
    }

    // Build citations — include cross-framework tags where found
    const citations = chunks.slice(0, 8).map((chunk: any) => ({
      document_title: chunk.document_title,
      framework_name: chunk.framework_abbreviation,
      related_frameworks: crossFrameworkMap[chunk.id] ?? [],
      control_id: chunk.metadata?.control_id ?? null,
      url: chunk.url,
      content_snippet: chunk.content.slice(0, 200),
    }));

    const contextBlock = chunks.length > 0
      ? `Relevant compliance documentation:\n\n${chunks.map((chunk: any, i: number) => {
          const related = crossFrameworkMap[chunk.id];
          const alsoIn = related?.length ? ` [Also in: ${related.join(', ')}]` : '';
          return `[${i + 1}] ${chunk.framework_abbreviation}${alsoIn} — ${chunk.document_title}${chunk.metadata?.control_id ? ` (${chunk.metadata.control_id})` : ''}\n${chunk.content}`;
        }).join('\n\n')}`
      : 'No relevant documents found in the knowledge base for this query.';

    const systemPrompt = `You are a cybersecurity compliance expert assistant. Answer questions using ONLY the provided compliance framework documentation. Always cite the specific control ID, framework name, and section for every claim you make. If the documentation does not contain enough information to answer, say so explicitly — do not hallucinate control requirements.

${contextBlock}`;

    const messages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    // Call Anthropic API directly with streaming
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    });

    if (!anthropicResponse.ok || !anthropicResponse.body) {
      const err = await anthropicResponse.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send citations before streaming starts
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
        );

        const reader = anthropicResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const event = JSON.parse(data);
              if (
                event.type === 'content_block_delta' &&
                event.delta?.type === 'text_delta'
              ) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'content', text: event.delta.text })}\n\n`
                  )
                );
              }
            } catch { /* skip malformed lines */ }
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
