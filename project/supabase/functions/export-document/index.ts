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

interface ExportRequest {
  document_id: string;
  format: 'markdown' | 'docx' | 'pdf';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { document_id, format }: ExportRequest = await req.json();

    if (!document_id || !format) {
      return new Response(
        JSON.stringify({ error: 'Document ID and format are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the document
    const { data: document, error: docError } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = document.content_markdown;
    const title = document.title;

    if (format === 'markdown') {
      // Return markdown directly
      return new Response(content, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${title}.md"`,
        },
      });
    }

    if (format === 'docx') {
      // For DOCX, we'd typically use a library like docx
      // For now, return HTML that can be converted
      const html = markdownToHtml(content, title);

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${title}.html"`,
        },
      });
    }

    if (format === 'pdf') {
      // For PDF, return HTML that can be printed to PDF
      const html = markdownToHtml(content, title);

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1e293b;
    }
    h1 { color: #0c4a6e; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
    h2 { color: #0369a1; margin-top: 30px; }
    h3 { color: #0284c7; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background-color: #f1f5f9; }
    code { background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background-color: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #0ea5e9; margin: 0; padding-left: 16px; color: #475569; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 4px; }
    .header-info { color: #64748b; font-size: 0.9em; margin-bottom: 20px; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

      return new Response(fullHtml, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${title}.html"`,
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function markdownToHtml(markdown: string, title: string): string {
  // Simple markdown to HTML conversion
  let html = `<h1>${escapeHtml(title)}</h1>\n`;

  const lines = markdown.split('\n');
  let inList = false;
  let listType = '';

  for (let line of lines) {
    // Skip the title if it's the first line
    if (line.startsWith('# ') && lines.indexOf(line) === 0) {
      continue;
    }

    // Headers
    if (line.startsWith('## ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      html += `<h2>${escapeHtml(line.slice(3))}</h2>\n`;
    } else if (line.startsWith('### ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      html += `<h3>${escapeHtml(line.slice(4))}</h3>\n`;
    } else if (line.startsWith('#### ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      html += `<h4>${escapeHtml(line.slice(5))}</h4>\n`;
    }
    // Lists
    else if (line.match(/^- \[ \] /)) {
      if (!inList) { html += '<ul>\n'; inList = true; listType = 'ul'; }
      html += `<li><input type="checkbox" disabled> ${escapeHtml(line.slice(6))}</li>\n`;
    } else if (line.match(/^- \[x\] /)) {
      if (!inList) { html += '<ul>\n'; inList = true; listType = 'ul'; }
      html += `<li><input type="checkbox" checked disabled> ${escapeHtml(line.slice(6))}</li>\n`;
    } else if (line.match(/^- /)) {
      if (!inList) { html += '<ul>\n'; inList = true; listType = 'ul'; }
      html += `<li>${escapeHtml(line.slice(2))}</li>\n`;
    } else if (line.match(/^\d+\. /)) {
      if (!inList || listType !== 'ol') {
        if (inList) html += `</${listType}>\n`;
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${escapeHtml(line.replace(/^\d+\. /, ''))}</li>\n`;
    }
    // Horizontal rule
    else if (line === '---') {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      html += '<hr>\n';
    }
    // Bold/Italic text
    else if (line.trim()) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      let processed = escapeHtml(line);
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
      processed = processed.replace(/`(.+?)`/g, '<code>$1</code>');
      html += `<p>${processed}</p>\n`;
    } else if (inList) {
      html += `</${listType}>\n`;
      inList = false;
    }
  }

  if (inList) {
    html += `</${listType}>\n`;
  }

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
