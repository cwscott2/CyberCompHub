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

    // Generate embedding for the user's query
    const queryEmbedding = await generateEmbedding(message);

    // Vector similarity search via the match_documents RPC
    const { data: chunks, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 8,
      framework_filter: framework_id ?? null,
    });

    if (searchError) {
      console.error('Vector search error:', searchError);
    }

    // Build citations and context from matched chunks
    const citations = (chunks ?? []).slice(0, 5).map((chunk: any) => ({
      document_title: chunk.document_title,
      framework_name: chunk.framework_abbreviation,
      control_id: chunk.metadata?.control_id ?? null,
      url: chunk.url,
      content_snippet: chunk.content.slice(0, 200),
    }));

    const contextBlock = (chunks ?? []).length > 0
      ? `Relevant compliance documentation:\n\n${(chunks as any[]).map((chunk, i) =>
          `[${i + 1}] ${chunk.framework_abbreviation} — ${chunk.document_title}${chunk.metadata?.control_id ? ` (${chunk.metadata.control_id})` : ''}\n${chunk.content}`
        ).join('\n\n')}`
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
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
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
