import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useKnowledgeBaseData } from '../hooks/useKnowledgeBaseData';
import type { FrameworkStats } from '../hooks/useKnowledgeBaseData';
import { categoryToGroup, FRAMEWORK_GROUPS } from '../utils/frameworkGroups';
import type { FrameworkGroup } from '../utils/frameworkGroups';
import Footer from '../components/Footer';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PublicKnowledgeBasePage() {
  const { stats, loading, totalDocs, totalFrameworks } = useKnowledgeBaseData();
  const [search, setSearch] = useState('');

  const filtered = (stats as FrameworkStats[]).filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.abbreviation.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = (['security', 'ai', 'financial'] as FrameworkGroup[]).map(group => ({
    group,
    config: FRAMEWORK_GROUPS[group],
    items: filtered.filter(s => categoryToGroup(s.category) === group),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-7 h-7 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-lg font-semibold text-secondary-900">CyberComplianceHub</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            <a href="/#features" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Features</a>
            <a href="/#frameworks" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Frameworks</a>
            <a href="/#pricing" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Pricing</a>
            <Link to="/knowledge-base" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">Knowledge Base</Link>
            <Link to="/login" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started free</Link>
          </nav>
          <div className="flex md:hidden items-center gap-3">
            <Link to="/login" className="text-sm text-secondary-600">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="py-16 text-center text-secondary-500">
              Loading knowledge base…
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-1">Knowledge Base</h2>
                <p className="text-secondary-600">
                  {totalFrameworks} frameworks &mdash;{' '}
                  <span className="font-medium text-secondary-800">{totalDocs.toLocaleString()} documents</span>{' '}
                  ingested from primary sources
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="kb-search" className="sr-only">Filter frameworks</label>
                <input
                  id="kb-search"
                  type="text"
                  placeholder="Filter frameworks…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {filtered.length === 0 && search && (
                <p className="text-secondary-500 text-sm">No frameworks match your search.</p>
              )}

              {grouped.map(({ group, config, items }) => (
                <div key={group} className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg" aria-hidden="true">{config.icon}</span>
                    <h3 className="text-base font-semibold text-secondary-700 uppercase tracking-wide">{config.label}</h3>
                    <span className="text-xs text-secondary-400">({items.reduce((s, i) => s + i.doc_count, 0).toLocaleString()} docs)</span>
                  </div>

                  <div className={`rounded-xl border ${config.accent} overflow-hidden`}>
                    {/* Column headers — desktop */}
                    <div className="hidden sm:grid grid-cols-[1fr_80px_80px_130px] gap-x-4 px-5 py-2 bg-black/[0.03] border-b border-black/[0.06] text-xs font-medium text-secondary-500 uppercase tracking-wide">
                      <div>Framework</div>
                      <div className="text-right">Docs</div>
                      <div className="text-right">Controls</div>
                      <div className="text-right">Last Ingested</div>
                    </div>

                    {items.map((fw, idx) => (
                      <div
                        key={fw.id}
                        className={`px-5 py-4 ${idx > 0 ? 'border-t border-black/[0.06]' : ''}`}
                      >
                        {/* Mobile layout */}
                        <div className="sm:hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-secondary-900">{fw.name}</span>
                            <span className="text-xs bg-white border border-secondary-200 rounded px-1.5 py-0.5 text-secondary-500 font-mono">{fw.abbreviation}</span>
                            {fw.version && <span className="text-xs text-secondary-400">{fw.version}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-secondary-500">
                            <span>{fw.doc_count.toLocaleString()} docs</span>
                            <span>{fw.control_count.toLocaleString()} controls</span>
                          </div>
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_130px] gap-x-4 items-center">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-secondary-900">{fw.name}</span>
                              <span className="text-xs bg-white border border-secondary-200 rounded px-1.5 py-0.5 text-secondary-500 font-mono">{fw.abbreviation}</span>
                              {fw.version && <span className="text-xs text-secondary-400">{fw.version}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-bold text-secondary-900">{fw.doc_count.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-bold text-secondary-900">{fw.control_count.toLocaleString()}</div>
                          </div>
                          <div className="text-right text-xs text-secondary-500 whitespace-nowrap">
                            {formatDate(fw.last_ingested)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
