import { useState } from 'react';
import { useKnowledgeBaseData } from '../../hooks/useKnowledgeBaseData';
import { categoryToGroup, FRAMEWORK_GROUPS } from '../../utils/frameworkGroups';
import type { FrameworkGroup } from '../../utils/frameworkGroups';

const SCRAPER_LABELS: Record<string, string> = {
  'nist-json': 'NIST OSCAL',
  'nist-csf': 'NIST CSF',
  'nist-rmf': 'NIST RMF',
  'iso-api': 'ISO API',
  'fedramp-csv': 'FedRAMP',
  'cmmc-web': 'CMMC Web',
  'generic-pdf': 'PDF',
  'generic-webpage': 'Web',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function QualityBadge({ count }: { count: number }) {
  if (count >= 40) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><span aria-hidden="true">✓</span>Good</span>;
  if (count >= 15) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><span aria-hidden="true">△</span>Partial</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><span aria-hidden="true">✗</span>Thin</span>;
}

export default function AdminKnowledgeBasePage() {
  const { stats, loading, totalDocs, totalFrameworks } = useKnowledgeBaseData();
  const [search, setSearch] = useState('');

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-secondary-500">
        Loading knowledge base…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-1">Knowledge Base Admin</h2>
        <p className="text-secondary-600">
          {totalFrameworks} frameworks &mdash;{' '}
          <span className="font-medium text-secondary-800">{totalDocs.toLocaleString()} documents</span>
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="kb-admin-search" className="sr-only">Filter frameworks</label>
        <input
          id="kb-admin-search"
          type="text"
          placeholder="Filter frameworks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {grouped.map(({ group, config, items }) => (
        <div key={group} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg" aria-hidden="true">{config.icon}</span>
            <h3 className="text-base font-semibold text-secondary-700 uppercase tracking-wide">{config.label}</h3>
            <span className="text-xs text-secondary-400">({items.reduce((s, i) => s + i.doc_count, 0).toLocaleString()} docs)</span>
          </div>

          <div className={`rounded-xl border ${config.accent} overflow-hidden`}>
            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_90px_130px] gap-x-4 px-5 py-2 bg-black/[0.03] border-b border-black/[0.06] text-xs font-medium text-secondary-500 uppercase tracking-wide">
              <div>Framework</div>
              <div className="text-right">Docs</div>
              <div className="text-right">Controls</div>
              <div className="text-center">Source</div>
              <div className="text-center">Quality</div>
              <div className="text-right">Last Ingested</div>
            </div>

            {items.map((fw, idx) => (
              <div
                key={fw.id}
                className={`px-5 py-4 hover:bg-black/[0.02] transition-colors ${idx > 0 ? 'border-t border-black/[0.06]' : ''}`}
              >
                {/* Mobile layout */}
                <div className="sm:hidden">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-secondary-900">{fw.name}</span>
                        <span className="text-xs bg-white border border-secondary-200 rounded px-1.5 py-0.5 text-secondary-500 font-mono">{fw.abbreviation}</span>
                        {fw.version && <span className="text-xs text-secondary-400">{fw.version}</span>}
                      </div>
                      {fw.source_url && (
                        <a
                          href={fw.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-700 underline truncate block mt-1"
                          title={fw.source_url}
                        >
                          {fw.source_url}
                        </a>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-secondary-500">
                        <span>{fw.doc_count.toLocaleString()} docs</span>
                        <span>{fw.control_count.toLocaleString()} controls</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {fw.source_scraper_type && (
                      <span className="text-secondary-600 bg-white border border-secondary-200 rounded px-2 py-1 whitespace-nowrap">
                        {SCRAPER_LABELS[fw.source_scraper_type] ?? fw.source_scraper_type}
                      </span>
                    )}
                    <div className="flex-1" />
                    <span className="text-secondary-500">{formatDate(fw.last_ingested)}</span>
                  </div>
                </div>

                {/* Desktop table layout */}
                <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_90px_130px] gap-x-4 items-start">
                  {/* Framework name */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-secondary-900">{fw.name}</span>
                      <span className="text-xs bg-white border border-secondary-200 rounded px-1.5 py-0.5 text-secondary-500 font-mono">{fw.abbreviation}</span>
                      {fw.version && <span className="text-xs text-secondary-400">{fw.version}</span>}
                    </div>
                    {fw.source_url && (
                      <a
                        href={fw.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700 underline truncate block mt-1"
                        title={fw.source_url}
                      >
                        {fw.source_url}
                      </a>
                    )}
                  </div>
                  {/* Docs */}
                  <div className="text-right">
                    <div className="text-base font-bold text-secondary-900">{fw.doc_count.toLocaleString()}</div>
                  </div>
                  {/* Controls */}
                  <div className="text-right">
                    <div className="text-base font-bold text-secondary-900">{fw.control_count.toLocaleString()}</div>
                  </div>
                  {/* Source type */}
                  <div className="text-center">
                    {fw.source_scraper_type ? (
                      <span className="text-xs font-medium text-secondary-600 bg-white border border-secondary-200 rounded px-2 py-1 whitespace-nowrap">
                        {SCRAPER_LABELS[fw.source_scraper_type] ?? fw.source_scraper_type}
                      </span>
                    ) : <span className="text-secondary-300">—</span>}
                  </div>
                  {/* Quality */}
                  <div className="flex justify-center">
                    <QualityBadge count={fw.doc_count} />
                  </div>
                  {/* Last ingested */}
                  <div className="text-right text-xs text-secondary-500 whitespace-nowrap">
                    {formatDate(fw.last_ingested)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
