import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../services/supabase';
import type { ComplianceFramework, Template } from '../types/compliance';

type Step = 'framework' | 'template' | 'scope' | 'generate' | 'export';

const FAMILY_FIELD_MAP: Record<string, string> = {
  'CMMC': 'domain_name',
  'SP 800-53': 'family_name',
  'FedRAMP': 'family_name',
  'NIST CSF': 'function_name',
  'ISO 27001': 'annex_name',
};

const FAMILY_SCOPED_TYPES = ['procedure', 'gap_assessment', 'policy'];
const FAMILY_REQUIRED_TYPES = ['procedure', 'gap_assessment'];

const categoryToGroup = (category: string): 'security' | 'ai' | 'financial' => {
  if (category === 'ai-safety') return 'ai';
  if (category === 'sox') return 'financial';
  return 'security';
};

const FRAMEWORK_GROUPS: Record<string, { label: string; icon: string; accent: string }> = {
  security:  { label: 'Cybersecurity Frameworks', icon: '🛡️', accent: 'border-primary-200 bg-primary-50' },
  financial: { label: 'Financial Compliance',      icon: '📋', accent: 'border-amber-200 bg-amber-50' },
  ai:        { label: 'AI Governance Frameworks',  icon: '🤖', accent: 'border-purple-200 bg-purple-50' },
};

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  policy:       'Policy',
  checklist:    'Checklist',
  procedure:    'Procedure',
  poam:         'POA&M',
  gap_assessment: 'Gap Assessment',
  'control-map': 'Control Map',
  raci:         'RACI',
};

export default function WizardPage() {
  const [step, setStep] = useState<Step>('framework');
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customScope, setCustomScope] = useState('');
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [availableControls, setAvailableControls] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [availableFamilies, setAvailableFamilies] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedDocId, setGeneratedDocId] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
  const isFamilyScoped = selectedTemplateObj
    ? FAMILY_SCOPED_TYPES.includes(selectedTemplateObj.template_type)
    : false;

  const isFamilyRequired = selectedTemplateObj
    ? FAMILY_REQUIRED_TYPES.includes(selectedTemplateObj.template_type)
    : false;

  const selectedFrameworkObj = frameworks.find(f => f.id === selectedFramework);
  const familyField = selectedFrameworkObj
    ? (FAMILY_FIELD_MAP[selectedFrameworkObj.abbreviation] || '')
    : '';

  useEffect(() => {
    supabase
      .from('compliance_frameworks')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setFrameworks(data);
      });
  }, []);

  useEffect(() => {
    if (selectedFramework) {
      supabase
        .from('templates')
        .select('*')
        .eq('framework_id', selectedFramework)
        .order('is_default', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setTemplates(data);
            if (data.length > 0 && data[0].is_default) {
              setSelectedTemplate(data[0].id);
            }
          }
        });

      // Fetch available controls for this framework
      supabase
        .from('documents')
        .select('metadata')
        .eq('framework_id', selectedFramework)
        .eq('document_type', 'control')
        .then(({ data }) => {
          if (data) {
            const controls = data
              .map((d) => d.metadata?.control_id as string)
              .filter(Boolean);
            setAvailableControls([...new Set(controls)]);
          }
        });
    }
  }, [selectedFramework]);

  useEffect(() => {
    if (selectedFramework && isFamilyScoped && familyField) {
      setSelectedFamily('');
      supabase
        .from('documents')
        .select('metadata')
        .eq('framework_id', selectedFramework)
        .eq('document_type', 'control')
        .then(({ data }) => {
          if (data) {
            const families = data
              .map((d) => d.metadata?.[familyField] as string)
              .filter(Boolean);
            setAvailableFamilies([...new Set(families)].sort());
          }
        });
    } else {
      setAvailableFamilies([]);
      setSelectedFamily('');
    }
  }, [selectedFramework, selectedTemplate, isFamilyScoped, familyField]);

  const handleGenerate = async () => {
    setGenerating(true);
    setStep('generate');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            framework_id: selectedFramework,
            template_id: selectedTemplate,
            custom_scope: customScope || null,
            selected_controls: selectedControls.length > 0 ? selectedControls : null,
            selected_family: selectedFamily || null,
            family_metadata_field: (selectedFamily && familyField) ? familyField : null,
          }),
        }
      );

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedContent(data.content_markdown);
      setGeneratedDocId(data.document_id);
      setStep('export');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate document. Please try again.');
      setStep('scope');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'docx' | 'pdf') => {
    if (!generatedDocId) return;

    setExporting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            document_id: generatedDocId,
            format,
          }),
        }
      );

      if (!response.ok) throw new Error('Export failed');

      if (format === 'markdown') {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-document-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-document-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const steps: Step[] = ['framework', 'template', 'scope', 'generate', 'export'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Policy Generator
        </h2>
        <p className="text-secondary-600">
          Create compliance documents with AI-powered content generation
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.slice(0, 4).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < currentStepIndex
                    ? 'bg-accent-600 text-white'
                    : i === currentStepIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-600'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-24 h-1 mx-2 ${
                    i < currentStepIndex ? 'bg-accent-600' : 'bg-secondary-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1 text-xs text-secondary-600">
          <span>Framework</span>
          <span>Template</span>
          <span>Scope</span>
          <span>Generate</span>
        </div>
      </div>

      {/* Step 1: Select Framework */}
      {step === 'framework' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">
            Select a Compliance Framework
          </h3>
          {(['security', 'financial', 'ai'] as const).map((group) => {
            const groupFrameworks = frameworks.filter(f => categoryToGroup(f.category) === group);
            if (groupFrameworks.length === 0) return null;
            return (
              <div key={group} className="mb-6 last:mb-0">
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border ${FRAMEWORK_GROUPS[group].accent} w-fit`}>
                  <span className="text-base">{FRAMEWORK_GROUPS[group].icon}</span>
                  <h4 className="text-xs font-semibold text-secondary-700 uppercase tracking-wide">
                    {FRAMEWORK_GROUPS[group].label}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                  {groupFrameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => {
                        setSelectedFramework(framework.id);
                        setStep('template');
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary-500 h-full flex flex-col justify-start ${
                        selectedFramework === framework.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-secondary-900 mb-1">
                            {framework.name}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            {framework.description || framework.abbreviation}
                          </p>
                        </div>
                        {framework.version && (
                          <span className="badge bg-secondary-100 text-secondary-700 ml-2 shrink-0">
                            v{framework.version}
                          </span>
                        )}
                      </div>
                      {framework.abbreviation === 'NIST RMF' && (
                        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                          Process framework — for security control policies (AC, AU, CM…) use SP 800-53 instead.
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 2: Select Template */}
      {step === 'template' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Select Document Type
          </h3>
          {selectedFrameworkObj?.abbreviation === 'NIST RMF' && (
            <div className="mb-4 flex gap-3 items-start rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <span className="text-amber-500 text-lg shrink-0">⚠️</span>
              <div className="text-sm text-amber-800">
                <strong>NIST RMF is a process framework.</strong> It describes how to manage risk (Prepare → Categorize → Select → Implement → Assess → Authorize → Monitor), not what security controls to implement.
                <br />
                If you need a policy for a specific security control family (e.g., Access Control), use <strong>SP 800-53</strong> instead — that's the control catalog RMF points to.
              </div>
            </div>
          )}
          {templates.length === 0 ? (
            <div className="text-center py-8 text-secondary-600">
              No templates available for this framework yet.
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary-500 ${
                    selectedTemplate === template.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-secondary-900">
                      {template.name}
                    </h4>
                    <span className="badge bg-secondary-100 text-secondary-700">
                      {TEMPLATE_TYPE_LABELS[template.template_type] ?? template.template_type}
                    </span>
                  </div>
                  {template.description && (
                    <p className="text-sm text-secondary-600 mt-1">
                      {template.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep('framework')} className="btn-secondary">
              Back
            </button>
            <button
              onClick={() => setStep('scope')}
              disabled={!selectedTemplate}
              className="btn-primary disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customize Scope */}
      {step === 'scope' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Customize Scope
          </h3>
          <div className="space-y-6">
            {isFamilyScoped && familyField && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Control Family {isFamilyRequired && <span className="text-red-500">*</span>}
                  {!isFamilyRequired && <span className="text-secondary-400 font-normal"> (optional)</span>}
                </label>
                {availableFamilies.length > 0 ? (
                  <>
                    <p className="text-sm text-secondary-600 mb-2">
                      {isFamilyRequired
                        ? 'Select the control family to generate procedures for.'
                        : 'Optionally scope this document to a single control family, or leave blank for a full-framework policy.'}
                    </p>
                    <select
                      value={selectedFamily}
                      onChange={(e) => setSelectedFamily(e.target.value)}
                      className="input"
                    >
                      <option value="">— Select a family —</option>
                      {availableFamilies.map((family) => (
                        <option key={family} value={family}>{family}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p className="text-sm text-secondary-500 italic">
                    Loading control families...
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Custom Scope (Optional)
              </label>
              <textarea
                value={customScope}
                onChange={(e) => setCustomScope(e.target.value)}
                placeholder={
                  selectedFrameworkObj?.abbreviation === 'NIST RMF'
                    ? 'Optionally scope to a specific RMF step (e.g. "Prepare step only") or describe the context for this document...'
                    : isFamilyScoped
                    ? 'Optionally add additional context or constraints beyond the selected control family...'
                    : 'Optionally scope to a specific control family (e.g. "Access Control") or describe the context for this document...'
                }
                className="input h-24 resize-none"
              />
            </div>

            {availableControls.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Select Controls (Optional)
                </label>
                <p className="text-sm text-secondary-600 mb-2">
                  Select specific controls to include, or leave empty for all.
                </p>
                <div className="max-h-48 overflow-y-auto border border-secondary-200 rounded-lg p-3 space-y-2 scrollbar-thin">
                  {availableControls.map((control) => (
                    <label key={control} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedControls.includes(control)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedControls([...selectedControls, control]);
                          } else {
                            setSelectedControls(
                              selectedControls.filter((c) => c !== control)
                            );
                          }
                        }}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">{control}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep('template')} className="btn-secondary">
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={isFamilyRequired && !selectedFamily}
              className="btn-primary disabled:opacity-50"
            >
              Generate Document
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Generating */}
      {step === 'generate' && generating && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Generating Document...
          </h3>
          <p className="text-secondary-600">
            This may take a minute while we gather relevant compliance content
          </p>
        </div>
      )}

      {/* Step 5: Export */}
      {step === 'export' && generatedContent && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Document Generated
          </h3>

          {/* Context reminder banner */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 mb-4 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-primary-500 font-medium">Framework: </span>
              <span className="text-primary-900">
                {frameworks.find(f => f.id === selectedFramework)?.name ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-primary-500 font-medium">Document type: </span>
              <span className="text-primary-900 capitalize">
                {templates.find(t => t.id === selectedTemplate)?.name ?? '—'}
              </span>
            </div>
            {selectedFamily && (
              <div>
                <span className="text-primary-500 font-medium">Family: </span>
                <span className="text-primary-900">{selectedFamily}</span>
              </div>
            )}
            {customScope && (
              <div>
                <span className="text-primary-500 font-medium">Scope: </span>
                <span className="text-primary-900">{customScope}</span>
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none bg-secondary-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto scrollbar-thin">
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('scope')}
              className="btn-secondary"
            >
              Regenerate
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('markdown')}
                disabled={exporting}
                className="btn-secondary"
              >
                Export MD
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={exporting}
                className="btn-secondary"
              >
                Export DOCX
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="btn-primary"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
