import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { ComplianceFramework, Document } from '../types/compliance';

export default function SearchPage() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    supabase
      .from('compliance_frameworks')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setFrameworks(data);
      });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            query: query.trim(),
            framework_id: selectedFramework || null,
            limit: 20,
          }),
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const frameworkBadges: Record<string, string> = {
    nist: 'badge-nist',
    iso: 'badge-iso',
    fedramp: 'badge-fedramp',
    cmmc: 'badge-cmmc',
    sox: 'badge-sox',
    'ai-safety': 'badge-ai',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Document Search
        </h2>
        <p className="text-secondary-600">
          Search across compliance documents using semantic similarity
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for controls, requirements, guidelines..."
              className="input w-full"
            />
          </div>
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Frameworks</option>
            {frameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
              <svg
                className="w-12 h-12 text-secondary-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Search compliance documents
              </h3>
              <p className="text-secondary-600">
                Enter a query to find relevant controls and requirements
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`w-full text-left card hover:shadow-md transition-shadow ${
                    selectedDocument?.id === doc.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-secondary-900">
                      {doc.title}
                    </h3>
                    {doc.framework && (
                      <span
                        className={`badge ${
                          frameworkBadges[doc.framework.category] || 'bg-secondary-100'
                        }`}
                      >
                        {doc.framework.abbreviation}
                      </span>
                    )}
                  </div>
                  {doc.document_type && (
                    <p className="text-sm text-secondary-600 capitalize mb-2">
                      {doc.document_type}
                    </p>
                  )}
                  {doc.raw_content && (
                    <p className="text-sm text-secondary-700 line-clamp-3">
                      {doc.raw_content.slice(0, 200)}...
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedDocument ? (
            <div className="card sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-secondary-900">
                  Document Details
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h4 className="text-lg font-medium text-secondary-900 mb-2">
                {selectedDocument.title}
              </h4>
              {selectedDocument.url && (
                <a
                  href={selectedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm"
                >
                  View Framework Source
                </a>
              )}
              <div className="mt-4 space-y-2 text-sm">
                {selectedDocument.version && (
                  <div>
                    <span className="text-secondary-500">Version:</span>{' '}
                    <span className="text-secondary-900">{selectedDocument.version}</span>
                  </div>
                )}
                {selectedDocument.published_date && (
                  <div>
                    <span className="text-secondary-500">Published:</span>{' '}
                    <span className="text-secondary-900">
                      {new Date(selectedDocument.published_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-secondary-500">Type:</span>{' '}
                  <span className="text-secondary-900 capitalize">
                    {selectedDocument.document_type}
                  </span>
                </div>
              </div>
              {selectedDocument.raw_content && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <h5 className="text-sm font-medium text-secondary-900 mb-2">
                    Content Preview
                  </h5>
                  <div className="prose prose-sm max-h-96 overflow-y-auto scrollbar-thin text-secondary-700">
                    {selectedDocument.raw_content}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-secondary-100 rounded-xl p-6 text-center text-secondary-600">
              Select a document to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
