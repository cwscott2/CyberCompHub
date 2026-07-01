import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { categoryToGroup, FRAMEWORK_GROUPS } from '../../utils/frameworkGroups';
import type { FrameworkGroup } from '../../utils/frameworkGroups';
import type { ComplianceFramework } from '../../types/compliance';

// Which URL slugs map to which DB categories
const SLUG_TO_GROUPS: Record<string, FrameworkGroup[]> = {
  cybersecurity: ['security'],
  'ai-governance': ['ai'],
  financial: ['financial'],
};

const SLUG_DESCRIPTIONS: Record<string, string> = {
  cybersecurity: 'Search and generate compliance artifacts across NIST, CMMC, FedRAMP, ISO 27001, CIS Controls, and more.',
  'ai-governance': 'Research AI risk frameworks, responsible AI standards, and AI governance regulations — NIST AI RMF, EU AI Act, ISO 42001, MITRE ATLAS, and more.',
  financial: 'Navigate SOX, GDPR, PCI DSS, CCPA, and other financial and privacy compliance frameworks.',
};

interface FrameworkWithStats extends ComplianceFramework {
  doc_count: number;
}

export default function FrameworkCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [frameworks, setFrameworks] = useState<FrameworkWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const groups = category ? SLUG_TO_GROUPS[category] : null;
  if (!groups) return <Navigate to="/app/dashboard" replace />;

  const groupConfig = FRAMEWORK_GROUPS[groups[0]];
  const description = SLUG_DESCRIPTIONS[category!] ?? '';

  useEffect(() => {
    async function load() {
      const { data: allFrameworks } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .order('name');

      if (!allFrameworks) { setLoading(false); return; }

      const filtered = allFrameworks.filter(fw => groups!.includes(categoryToGroup(fw.category)));

      const withCounts = await Promise.all(
        filtered.map(async (fw) => {
          const { count } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('framework_id', fw.id);
          return { ...fw, doc_count: count ?? 0 };
        })
      );

      setFrameworks(withCounts);
      setLoading(false);
    }
    load();
  }, [category]);

  const qualityLabel = (count: number) => {
    if (count >= 40) return { label: 'Good', color: 'bg-green-100 text-green-700' };
    if (count >= 15) return { label: 'Partial', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Thin', color: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${groupConfig.accent} mb-4`}>
          <span className="text-lg" aria-hidden="true">{groupConfig.icon}</span>
          <span className="text-sm font-semibold text-secondary-700 uppercase tracking-wide">
            {groupConfig.label}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">{groupConfig.label}</h2>
        <p className="text-secondary-600 max-w-2xl">{description}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link
          to={`/app/chat`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
          <div className="p-1.5 bg-primary-100 group-hover:bg-primary-200 rounded-md transition-colors">
            <svg className="w-4 h-4 text-primary-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">Ask a question</p>
            <p className="text-xs text-secondary-500">AI assistant</p>
          </div>
        </Link>
        <Link
          to={`/app/search`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
          <div className="p-1.5 bg-accent-100 group-hover:bg-accent-200 rounded-md transition-colors">
            <svg className="w-4 h-4 text-accent-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">Search documents</p>
            <p className="text-xs text-secondary-500">Semantic search</p>
          </div>
        </Link>
        <Link
          to={`/app/wizard`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
        >
          <div className="p-1.5 bg-warning-100 group-hover:bg-warning-200 rounded-md transition-colors">
            <svg className="w-4 h-4 text-warning-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">Generate artifacts</p>
            <p className="text-xs text-secondary-500">Policies, procedures, more</p>
          </div>
        </Link>
      </div>

      {/* Framework grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-secondary-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : frameworks.length === 0 ? (
        <div className="text-center py-12 text-secondary-500">
          No frameworks in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((fw) => {
            const quality = qualityLabel(fw.doc_count);
            return (
              <Link
                key={fw.id}
                to={`/app/search?framework=${fw.id}`}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors text-sm leading-snug">
                      {fw.name}
                    </h3>
                    <p className="text-xs text-secondary-500 font-mono mt-0.5">{fw.abbreviation}</p>
                  </div>
                  {fw.version && (
                    <span className="badge bg-secondary-100 text-secondary-600 ml-2 shrink-0 text-xs">
                      v{fw.version}
                    </span>
                  )}
                </div>
                {fw.description && (
                  <p className="text-xs text-secondary-600 line-clamp-2 mb-3">{fw.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-500">{fw.doc_count.toLocaleString()} documents</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${quality.color}`}>
                    {quality.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
