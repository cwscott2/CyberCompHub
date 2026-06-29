import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { ComplianceFramework, IngestJob } from '../types/compliance';

const categoryToGroup = (category: string): 'security' | 'ai' | 'financial' => {
  if (category === 'ai-safety') return 'ai';
  if (category === 'sox') return 'financial';
  return 'security'; // nist, iso, fedramp, cmmc
};

const groupConfig: Record<string, { label: string; icon: string; accent: string }> = {
  security: { label: 'Cybersecurity Frameworks', icon: '🛡️', accent: 'border-primary-200 bg-primary-50' },
  ai:       { label: 'AI Governance Frameworks', icon: '🤖', accent: 'border-purple-200 bg-purple-50' },
  financial:{ label: 'Financial Compliance',      icon: '📋', accent: 'border-amber-200 bg-amber-50' },
};

export default function Dashboard() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [recentJobs, setRecentJobs] = useState<IngestJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [frameworksRes, jobsRes] = await Promise.all([
          supabase.from('compliance_frameworks').select('*').order('name'),
          supabase.from('ingest_jobs').select('*, sources(name, framework_id, compliance_frameworks(name, abbreviation))').neq('status', 'failed').order('created_at', { ascending: false }).limit(10),
        ]);

        if (frameworksRes.data) setFrameworks(frameworksRes.data);
        if (jobsRes.data) setRecentJobs(jobsRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-accent-100 text-accent-800',
    in_progress: 'bg-warning-100 text-warning-800',
    failed: 'bg-error-100 text-error-800',
    pending: 'bg-secondary-100 text-secondary-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900">Compliance Frameworks</h2>
        <p className="mt-1 text-secondary-600">
          Manage and explore compliance documents across multiple frameworks
        </p>
      </div>

      {(['security', 'financial', 'ai'] as const).map((group) => {
        const groupFrameworks = frameworks.filter((f) => categoryToGroup(f.category) === group);
        if (groupFrameworks.length === 0) return null;
        const config = groupConfig[group];
        return (
          <div key={group} className="mb-10">
            <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border ${config.accent} w-fit`}>
              <span className="text-lg">{config.icon}</span>
              <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wide">
                {config.label}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupFrameworks.map((framework) => (
                <a
                  key={framework.id}
                  href={`/search?framework=${framework.id}`}
                  className="card hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">
                        {framework.name}
                      </h4>
                      <p className="text-sm text-secondary-600 line-clamp-2">
                        {framework.description || framework.abbreviation}
                      </p>
                    </div>
                    {framework.version && (
                      <span className="badge bg-secondary-100 text-secondary-700 ml-2 shrink-0">
                        v{framework.version}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/chat"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-secondary-900">Ask a Question</h3>
              <p className="text-sm text-secondary-600">Get AI-powered compliance answers</p>
            </div>
          </a>

          <a
            href="/search"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 bg-accent-100 rounded-lg group-hover:bg-accent-200 transition-colors">
              <svg className="w-6 h-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-secondary-900">Search Documents</h3>
              <p className="text-sm text-secondary-600">Find specific compliance requirements</p>
            </div>
          </a>

          <a
            href="/wizard"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 bg-warning-100 rounded-lg group-hover:bg-warning-200 transition-colors">
              <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-secondary-900">Generate Policy</h3>
              <p className="text-sm text-secondary-600">Create compliance documents</p>
            </div>
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent Ingest Activity</h2>
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">
              No ingest jobs yet. Documents will appear after the first data refresh.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {job.sources?.compliance_frameworks?.abbreviation || job.sources?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {job.documents_ingested}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {job.completed_at
                        ? new Date(job.completed_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
