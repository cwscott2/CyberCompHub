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

interface GenerateRequest {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { framework_id, template_id, custom_scope, selected_controls }: GenerateRequest = await req.json();

    if (!framework_id || !template_id) {
      return new Response(
        JSON.stringify({ error: 'Framework ID and Template ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch template and sections
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select(`
        *,
        template_sections(*)
      `)
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch framework
    const { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('id', framework_id)
      .single();

    // Fetch relevant documents
    let docQuery = supabase
      .from('documents')
      .select('id, title, raw_content, metadata, document_type')
      .eq('framework_id', framework_id);

    if (selected_controls && selected_controls.length > 0) {
      docQuery = docQuery.contains('metadata->control_id', selected_controls);
    }

    const { data: documents } = await docQuery.limit(20);

    // Build document content from template sections
    const sections: Record<string, string> = {};
    const sortedSections = template.template_sections?.sort((a: any, b: any) => a.section_order - b.section_order) || [];

    // Generate content for each section
    for (const section of sortedSections) {
      let sectionContent = '';

      if (section.section_key === 'header') {
        sectionContent = `# ${template.name}\n\n`;
        sectionContent += `**Framework:** ${framework?.name || 'Compliance Framework'}\n`;
        sectionContent += `**Generated:** ${new Date().toLocaleDateString()}\n`;
        if (custom_scope) {
          sectionContent += `**Scope:** ${custom_scope}\n`;
        }
        sectionContent += '\n---\n\n';
      } else if (section.section_key === 'introduction') {
        sectionContent = `## Introduction\n\n`;
        sectionContent += `This document provides guidance for implementing controls from ${framework?.name || 'the compliance framework'}.`;
        if (custom_scope) {
          sectionContent += ` The scope of this document is: ${custom_scope}.`;
        }
        sectionContent += '\n\n';
      } else if (section.section_key === 'controls' && documents) {
        sectionContent = `## Controls and Requirements\n\n`;
        for (const doc of documents) {
          if (doc.document_type === 'control' || doc.document_type === 'requirement') {
            const controlId = doc.metadata?.control_id || '';
            sectionContent += `### ${controlId ? controlId + ': ' : ''}${doc.title}\n\n`;
            if (doc.raw_content) {
              sectionContent += `${doc.raw_content.slice(0, 1000)}\n\n`;
            }
          }
        }
      } else if (section.section_key === 'checklist' && documents) {
        sectionContent = `## Compliance Checklist\n\n`;
        for (const doc of documents) {
          if (doc.document_type === 'control' || doc.document_type === 'requirement') {
            const controlId = doc.metadata?.control_id || '';
            sectionContent += `- [ ] **${controlId}** - ${doc.title}\n`;
          }
        }
        sectionContent += '\n';
      } else {
        // Generic section - use prompt template if available
        sectionContent = `## ${section.display_name}\n\n`;
        if (section.prompt_template) {
          sectionContent += section.prompt_template.replace('{framework}', framework?.name || 'Framework');
        }
        sectionContent += '\n\n';
      }

      sections[section.section_key] = sectionContent;
    }

    // Assemble full document
    const content_markdown = Object.values(sections).join('');

    // Save generated document
    const { data: savedDoc, error: saveError } = await supabase
      .from('generated_documents')
      .insert({
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        framework_id,
        template_id,
        content_markdown,
        metadata: {
          custom_scope,
          selected_controls,
          generated_at: new Date().toISOString(),
        },
        export_formats: ['markdown'],
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Save error:', saveError);
    }

    return new Response(
      JSON.stringify({
        document_id: savedDoc?.id,
        content_markdown,
        template_name: template.name,
        framework_name: framework?.name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
