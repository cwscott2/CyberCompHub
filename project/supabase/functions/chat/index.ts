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

interface ChatRequest {
  message: string;
  framework_id?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
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

    // Search for relevant documents using vector similarity
    let query = supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        metadata,
        documents!inner(
          id,
          title,
          url,
          framework_id,
          document_type,
          compliance_frameworks!inner(id, name, abbreviation)
        )
      `)
      .limit(10);

    if (framework_id) {
      query = query.eq('documents.framework_id', framework_id);
    }

    const { data: chunks, error: searchError } = await query;

    if (searchError) {
      console.error('Search error:', searchError);
      // Continue without context if search fails
    }

    // Build context from relevant chunks
    const context = chunks?.map((chunk: any) => ({
      content: chunk.content,
      document_title: chunk.documents.title,
      framework: chunk.documents.compliance_frameworks?.abbreviation,
      url: chunk.documents.url,
      control_id: chunk.metadata?.control_id,
    })) || [];

    // Build the system prompt
    const systemPrompt = `You are an expert compliance advisor specializing in cybersecurity frameworks including NIST CSF, NIST RMF, ISO 27001, FedRAMP, CMMC, and SOX. You help users understand compliance requirements, controls, and best practices.

When answering questions:
1. Be precise and reference specific controls or requirements when available
2. Explain concepts clearly for both technical and non-technical users
3. Suggest related controls or frameworks when relevant
4. If you don't know something, say so rather than making things up

${context.length > 0 ? `Context from compliance documents:\n${context.map((c, i) => `[${i + 1}] ${c.framework} - ${c.document_title}${c.control_id ? ` (${c.control_id})` : ''}:\n${c.content}`).join('\n\n')}` : 'No relevant documents found in the knowledge base.'}`;

    // For now, return a simulated response (in production, call Claude API)
    // This will be replaced with actual LLM call when ANTHROPIC_API_KEY is configured
    const citations = context.slice(0, 5).map((c: any) => ({
      document_title: c.document_title,
      framework_name: c.framework,
      url: c.url,
      content_snippet: c.content.slice(0, 200),
    }));

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send citations first
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
        );

        // Simulated response based on context
        let response = '';

        if (context.length > 0) {
          response = `Based on the compliance documentation, here's what I found:\n\n`;
          context.slice(0, 3).forEach((c: any, i: number) => {
            response += `**${c.framework} - ${c.document_title}**\n`;
            if (c.control_id) response += `Control: ${c.control_id}\n`;
            response += `${c.content.slice(0, 500)}...\n\n`;
          });
          response += `\nWould you like me to elaborate on any of these points or search for more specific requirements?`;
        } else {
          response = `I don't have specific documents matching your query in the knowledge base yet. The system may need to ingest compliance documents first, or you could try rephrasing your question.\n\nIn the meantime, I can provide general guidance on ${framework_id ? 'the selected framework' : 'compliance frameworks'} if you have specific questions.`;
        }

        // Stream the response character by character
        for (let i = 0; i < response.length; i += 10) {
          const chunk = response.slice(i, i + 10);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'content', text: chunk })}\n\n`)
          );
          await new Promise((r) => setTimeout(r, 5));
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
