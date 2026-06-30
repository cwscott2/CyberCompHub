import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import {
  Document, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType,
  AlignmentType, Packer, BorderStyle,
  UnderlineType,
} from 'https://esm.sh/docx@8.5.0';

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

// Parse inline markdown: **bold**, *italic*, `code`, plain text
function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      runs.push(new TextRun({ text: text.slice(last, match.index) }));
    }
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], italics: true }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], font: 'Courier New', size: 18 }));
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

// Parse markdown into docx elements
function markdownToDocx(markdown: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith('# ')) {
      elements.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith('## ')) {
      elements.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith('### ')) {
      elements.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 }));
    } else if (line.startsWith('#### ')) {
      elements.push(new Paragraph({ text: line.slice(5), heading: HeadingLevel.HEADING_4 }));

    // Horizontal rule
    } else if (line.trim() === '---') {
      elements.push(new Paragraph({
        children: [new TextRun({ text: '' })],
        border: { bottom: { color: 'CCCCCC', style: BorderStyle.SINGLE, size: 6 } },
      }));

    // Table — collect all consecutive table lines
    } else if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out separator rows (|---|---|)
      const dataRows = tableLines.filter(l => !l.match(/^\|[\s\-:|]+\|$/));
      if (dataRows.length > 0) {
        const rows = dataRows.map((row, rowIndex) => {
          const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
          return new TableRow({
            tableHeader: rowIndex === 0,
            children: cells.map(cell =>
              new TableCell({
                children: [new Paragraph({ children: parseInline(cell) })],
                shading: rowIndex === 0 ? { fill: 'E2E8F0' } : undefined,
              })
            ),
          });
        });
        elements.push(new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }));
      }
      continue; // i already incremented inside the while loop

    // Checkbox list item
    } else if (line.match(/^- \[[ x]\] /)) {
      const checked = line[3] === 'x';
      const text = line.slice(6);
      elements.push(new Paragraph({
        children: [
          new TextRun({ text: checked ? '☑ ' : '☐ ' }),
          ...parseInline(text),
        ],
        bullet: { level: 0 },
      }));

    // Unordered list
    } else if (line.match(/^- /)) {
      elements.push(new Paragraph({
        children: parseInline(line.slice(2)),
        bullet: { level: 0 },
      }));

    // Ordered list
    } else if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\. /, '');
      elements.push(new Paragraph({
        children: parseInline(text),
        numbering: { reference: 'default-numbering', level: 0 },
      }));

    // Non-empty paragraph
    } else if (line.trim()) {
      elements.push(new Paragraph({ children: parseInline(line.trim()) }));

    // Empty line → spacing
    } else {
      elements.push(new Paragraph({ text: '' }));
    }

    i++;
  }

  return elements;
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

    const content = document.content_markdown as string;
    const title = document.title as string;
    const safeFilename = title.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim() || 'compliance-document';

    if (format === 'markdown') {
      return new Response(content, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${safeFilename}.md"`,
        },
      });
    }

    if (format === 'docx') {
      const children = markdownToDocx(content);

      const doc = new Document({
        numbering: {
          config: [{
            reference: 'default-numbering',
            levels: [{
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            }],
          }],
        },
        styles: {
          default: {
            heading1: {
              run: { size: 32, bold: true, color: '0C4A6E' },
              paragraph: { spacing: { before: 240, after: 120 } },
            },
            heading2: {
              run: { size: 26, bold: true, color: '0369A1' },
              paragraph: { spacing: { before: 200, after: 80 } },
            },
            heading3: {
              run: { size: 22, bold: true, color: '0284C7' },
              paragraph: { spacing: { before: 160, after: 60 } },
            },
            heading4: {
              run: { size: 20, bold: true, color: '0EA5E9' },
              paragraph: { spacing: { before: 120, after: 40 } },
            },
          },
        },
        sections: [{ children }],
      });

      const buffer = await Packer.toBuffer(doc);

      return new Response(buffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeFilename}.docx"`,
        },
      });
    }

    if (format === 'pdf') {
      // Return styled HTML — user prints to PDF via browser
      const htmlBody = markdownToHtmlFallback(content);
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; }
    h1 { color: #0c4a6e; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
    h2 { color: #0369a1; margin-top: 30px; }
    h3 { color: #0284c7; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background-color: #f1f5f9; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 4px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>${htmlBody}</body>
</html>`;

      return new Response(fullHtml, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${safeFilename}.html"`,
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
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function markdownToHtmlFallback(markdown: string): string {
  return markdown
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- \[ \] (.+)$/gm, '<li>☐ $1</li>')
    .replace(/^- \[x\] (.+)$/gm, '<li>☑ $1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hlu]|<hr|<li)(.+)$/gm, '<p>$1</p>');
}
