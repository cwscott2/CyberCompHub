import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export interface FrameworkStats {
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

export function useKnowledgeBaseData() {
  const [stats, setStats] = useState<FrameworkStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: frameworks } = await supabase
        .from('compliance_frameworks')
        .select('id, name, abbreviation, category, version')
        .order('name');

      if (!frameworks) { setLoading(false); return; }

      const statsArr: FrameworkStats[] = await Promise.all(
        frameworks.map(async (fw) => {
          const [{ count: docCount }, { count: controlCount }, { data: sources }, { data: latestDoc }] = await Promise.all([
            supabase.from('documents').select('*', { count: 'exact', head: true }).eq('framework_id', fw.id),
            supabase.from('documents').select('*', { count: 'exact', head: true }).eq('framework_id', fw.id).eq('document_type', 'control'),
            supabase.from('sources').select('url, scraper_type').eq('framework_id', fw.id).order('created_at', { ascending: false }).limit(1),
            supabase.from('documents').select('created_at').eq('framework_id', fw.id).order('created_at', { ascending: false }).limit(1),
          ]);

          const source = sources?.[0];
          return {
            ...fw,
            doc_count: docCount ?? 0,
            control_count: controlCount ?? 0,
            source_url: source?.url ?? null,
            source_scraper_type: source?.scraper_type ?? null,
            last_ingested: latestDoc?.[0]?.created_at ?? null,
          };
        })
      );

      setStats(statsArr);
      setLoading(false);
    }
    load();
  }, []);

  const totalDocs = stats.reduce((sum, s) => sum + s.doc_count, 0);

  return { stats, loading, totalDocs, totalFrameworks: stats.length };
}
