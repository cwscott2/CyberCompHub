export type FrameworkGroup = 'security' | 'ai' | 'financial';

export function categoryToGroup(category: string): FrameworkGroup {
  if (category === 'ai-safety') return 'ai';
  if (category === 'sox' || category === 'healthcare' || category === 'privacy') return 'financial';
  return 'security';
}

export const FRAMEWORK_GROUPS: Record<FrameworkGroup, { label: string; icon: string; accent: string }> = {
  security:  { label: 'Cybersecurity Frameworks',           icon: '🛡️', accent: 'border-primary-200 bg-primary-50' },
  financial: { label: 'Financial / Healthcare Frameworks',  icon: '📋', accent: 'border-amber-200 bg-amber-50' },
  ai:        { label: 'AI Governance Frameworks',           icon: '🤖', accent: 'border-purple-200 bg-purple-50' },
};
