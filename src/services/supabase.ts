import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for vector search
export async function searchDocuments(
  query: string,
  options: {
    frameworkId?: string;
    documentType?: string;
    limit?: number;
    threshold?: number;
  } = {}
) {
  const { frameworkId, limit = 10 } = options;

  // Call the edge function for vector search
  const response = await fetch(`${supabaseUrl}/functions/v1/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      query,
      framework_id: frameworkId,
      limit,
    }),
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

// Chat API
export async function sendChatMessage(
  message: string,
  options: {
    frameworkId?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  } = {}
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      message,
      framework_id: options.frameworkId,
      history: options.history,
    }),
  });

  if (!response.ok) {
    throw new Error('Chat request failed');
  }

  return response;
}

// Document generation API
export async function generateDocument(request: {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
}) {
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Document generation failed');
  }

  return response.json();
}

// Export document API
export async function exportDocument(
  documentId: string,
  format: 'docx' | 'pdf' | 'markdown'
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/export-document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      document_id: documentId,
      format,
    }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  if (format === 'markdown') {
    return response.text();
  }

  return response.blob();
}
