import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { categoryToGroup, FRAMEWORK_GROUPS } from '../utils/frameworkGroups';
import type { FrameworkGroup } from '../utils/frameworkGroups';

interface FrameworkStats {
  id: string;
  name: string;
  abbreviation: string;
  category: string;
  version: string | null;
  doc_count: number;
  control_count: number;
  source_url: string | null;
  source_scraper_type: string | null;
  last_ingested: string | null;
}

const SCRAPER_LABELS: Record<string, string> = {
  'nist-json': 'NIST OSCAL JSON',
  'nist-csf': 'NIST CSF JSON',
  'nist-rmf': 'NIST RMF',
  'iso-api': 'ISO API',
  'fedramp-csv': 'FedRAMP OSCAL',
  'cmmc-web': 'CMMC Web',
  'generic-pdf': 'PDF',
  'generic-webpage': 'Web',
};

export default function KnowledgeBasePage() {
  const [stats, setStats] = useState<FrameworkStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [docTitles, setDocTitles] = useState<Record<string, string[]>>({});
  const [loadingDocs, setLoadingDocs] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Fetch all frameworks with their source info
      const { data: frameworks } = await supabase
        .from('compliance_frameworks')
        .select('id, name, abbreviation, category, version')
        .order('name');

      if (!frameworks) { setLoading(false); return; }

      // Fetch document counts and source info per framework
      const statsArr: FrameworkStats[] = await Promise.all(
        frameworks.map(async (fw) => {
          const [{ count: docCount }, { count: controlCount }, { data: sources }] = await Promise.all([
            supabase.from('documents').select('*', { count: 'exact', head: true }).eq('framework_id', fw.id),
            supabase.from('documents').select('*', { count: 'exact', head: true }).eq('framework_id', fw.id).eq('document_type', 'control'),
            supabase.from('sources').select('url, scraper_type, created_at').eq('framework_id', fw.id).order('created_at').limit(1),
          ]);

          const source = sources?.[0];
          return {
            ...fw,
            doc_count: docCount ?? 0,
            control_count: controlCount ?? 0,
            source_url: source?.url ?? null,
            source_scraper_type: source?.scraper_type ?? null,
            last_ingested: source?.created_at ?? null,
          };
        })
      );

      setStats(statsArr);
      setLoading(false);
    }
    load();
  }, []);

  async function loadDocTitles(frameworkId: string) {
    if (docTitles[frameworkId]) {
      setExpandedId(expandedId === frameworkId ? null : frameworkId);
      return;
    }
    setLoadingDocs(frameworkId);
    const { data } = await supabase
      .from('documents')
      .select('title')
      .eq('framework_id', frameworkId)
      .eq('document_type', 'control')
      .order('title')
      .limit(200);

    setDocTitles(prev => ({ ...prev, [frameworkId]: data?.map(d => d.title) ?? [] }));
    setExpandedId(frameworkId);
    setLoadingDocs(null);
  }

  const filtered = stats.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = (['security', 'ai', 'financial'] as FrameworkGroup[]).map(group => ({
    group,
    config: FRAMEWORK_GROUPS[group],
    items: filtered.filter(s => categoryToGroup(s.category) === group),
  })).filter(g => g.items.length > 0);

  const totalDocs = stats.reduce((sum, s) => sum + s.doc_count, 0);
  const totalFrameworks = stats.length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-secondary-500">
        Loading knowledge base…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-1">Knowledge Base</h2>
        <p className="text-secondary-600">
          Audit what's ingested before trusting citations —{' '}
          <span className="font-medium text-secondary-800">{totalFrameworks} frameworks</span>,{' '}
          <span className="font-medium text-secondary-800">{totalDocs.toLocaleString()} documents</span>
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter frameworks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Framework groups */}
      {grouped.map(({ group, config, items }) => (
        <div key={group} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{config.icon}</span>
            <h3 className="text-base font-semibold text-secondary-700 uppercase tracking-wide">
              {config.label}
            </h3>
            <span className="text-xs text-secondary-400 font-normal">
              ({items.reduce((s, i) => s + i.doc_count, 0).toLocaleString()} docs)
            </span>
          </div>

          <div className="space-y-3">
            {items.map(fw => (
              <div key={fw.id} className={`rounded-xl border ${config.accent} overflow-hidden`}>
                {/* Row */}
                <button
                  onClick={() => loadDocTitles(fw.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-black/[0.02] transition-colors"
                >
                  {/* Framework name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-secondary-900">{fw.name}</span>
                      <span className="text-xs bg-white border border-secondary-200 rounded px-1.5 py-0.5 text-secondary-500 font-mono">
                        {fw.abbreviation}
                      </span>
                      {fw.version && (
                        <span className="text-xs text-secondary-400">{fw.version}</span>
                      )}
                    </div>
                    {fw.source_url && (
                      <a
                        href={fw.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-primary-600 hover:underline truncate block mt-0.5 max-w-md"
                      >
                        {fw.source_url}
                      </a>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{fw.doc_count.toLocaleString()}</div>
                      <div className="text-xs text-secondary-500">docs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{fw.control_count.toLocaleString()}</div>
                      <div className="text-xs text-secondary-500">controls</div>
                    </div>
                    {fw.source_scraper_type && (
                      <div className="hidden sm:block">
                        <div className="text-xs font-medium text-secondary-600 bg-white border border-secondary-200 rounded px-2 py-1">
                          {SCRAPER_LABELS[fw.source_scraper_type] ?? fw.source_scraper_type}
                        </div>
                      </div>
                    )}
                    {/* Quality badge */}
                    <div className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      fw.doc_count >= 40
                        ? 'bg-green-100 text-green-700'
                        : fw.doc_count >= 15
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {fw.doc_count >= 40 ? '✓ Good' : fw.doc_count >= 15 ? '△ Partial' : '✗ Thin'}
                    </div>
                    {/* Expand chevron */}
                    <span className="text-secondary-400 text-sm">
                      {loadingDocs === fw.id ? '…' : expandedId === fw.id ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {/* Expanded doc list */}
                {expandedId === fw.id && docTitles[fw.id] && (
                  <div className="border-t border-black/[0.06] px-5 py-4 bg-white/60">
                    <p className="text-xs text-secondary-500 mb-3 font-medium">
                      Showing up to 200 control documents
                    </p>
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-x-6 space-y-0.5">
                      {docTitles[fw.id].map(title => (
                        <div key={title} className="text-xs text-secondary-700 truncate break-inside-avoid py-0.5">
                          {title}
                        </div>
                      ))}
                    </div>
                    {fw.control_count > 200 && (
                      <p className="text-xs text-secondary-400 mt-3">
                        …and {(fw.control_count - 200).toLocaleString()} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
