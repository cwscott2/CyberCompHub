import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../services/supabase';
import type { ComplianceFramework, ChatMessage, Citation } from '../types/compliance';

export default function ChatPage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('compliance_frameworks')
      .select('*')
      .order('name')
      .then(({ data }) => { if (data) setFrameworks(data); });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            framework_id: selectedFramework || null,
            history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          }),
        }
      );

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let citations: Citation[] = [];

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        citations: [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content') {
                  assistantContent += data.text;
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantMessage.id ? { ...m, content: assistantContent } : m)
                  );
                } else if (data.type === 'citations') {
                  citations = data.citations;
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantMessage.id ? { ...m, citations } : m)
                  );
                }
              } catch { /* incomplete chunk */ }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 min-h-0 flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Compliance Assistant</h2>
        <p className="text-secondary-600">
          Ask questions about compliance requirements, controls, and best practices
        </p>
      </div>

      {/* H2: framework filter with explicit label */}
      <div className="mb-4">
        <label htmlFor="framework-filter" className="sr-only">Filter by framework</label>
        <select
          id="framework-filter"
          value={selectedFramework}
          onChange={(e) => setSelectedFramework(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Frameworks</option>
          {frameworks.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-secondary-200 flex flex-col min-h-0">
        {/* L2: role="log" + aria-live on message container */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="flex-1 overflow-y-auto p-4 scrollbar-thin"
        >
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* H1: decorative SVG */}
                <svg className="w-8 h-8 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Ask me anything about compliance
              </h3>
              <p className="text-secondary-600 mb-4">
                I can help with questions about NIST, ISO, FedRAMP, CMMC, SOX, and more
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'What are the NIST CSF categories?',
                  'Explain FedRAMP moderate controls',
                  'ISO 27001 access control requirements',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      // M4: move focus to input after populating suggestion
                      inputRef.current?.focus();
                    }}
                    className="text-sm px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // L2: semantic list for messages
            <ul className="space-y-4 list-none p-0 m-0">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-secondary-800 text-white'
                        : 'bg-secondary-100 text-secondary-900'
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                      {message.role === 'user'
                        ? message.content
                        : <ReactMarkdown>{message.content}</ReactMarkdown>}
                    </div>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-secondary-200 space-y-1">
                        <p className="text-xs text-secondary-500 font-medium">Sources:</p>
                        {message.citations.map((citation, idx) => (
                          <div key={idx} className="text-xs text-secondary-600 flex flex-wrap items-center gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                              {citation.framework_name}
                            </span>
                            {citation.related_frameworks?.map((fw: string) => (
                              <span key={fw} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                {fw}
                              </span>
                            ))}
                            {citation.document_title && (
                              <span className="text-secondary-500 truncate max-w-xs">{citation.document_title}</span>
                            )}
                            {citation.url && (
                              // L3: inform users link opens in new tab
                              <a
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View source (opens in new tab)`}
                                className="text-primary-600 hover:underline shrink-0"
                              >
                                View<span className="sr-only"> (opens in new tab)</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-secondary-200">
          <div className="flex gap-2">
            {/* Label input visually hidden but present for screen readers */}
            <label htmlFor="chat-input" className="sr-only">Message</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about compliance requirements..."
              className="flex-1 input"
              disabled={loading}
              aria-describedby={loading ? 'chat-status' : undefined}
            />
            {/* C1: spinner button with sr-only label */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="sr-only">Sending…</span>
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
          {/* C1: live region for loading state */}
          <div id="chat-status" aria-live="polite" className="sr-only">
            {loading ? 'Waiting for response…' : ''}
          </div>
        </form>
      </div>
    </div>
  );
}
