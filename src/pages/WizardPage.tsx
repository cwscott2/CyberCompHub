import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../services/supabase';
import type { ComplianceFramework, Template } from '../types/compliance';

type Step = 'framework' | 'template' | 'scope' | 'generate' | 'export';

export default function WizardPage() {
  const [step, setStep] = useState<Step>('framework');
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customScope, setCustomScope] = useState('');
  const [selectedControls, setSelectedControls] = useState<string[]>([]);
  const [availableControls, setAvailableControls] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedDocId, setGeneratedDocId] = useState<string>('');
  const [exporting, setExporting] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Select a Compliance Framework
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {frameworks.map((framework) => (
              <button
                key={framework.id}
                onClick={() => {
                  setSelectedFramework(framework.id);
                  setStep('template');
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary-500 ${
                  selectedFramework === framework.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200'
                }`}
              >
                <h4 className="font-medium text-secondary-900">
                  {framework.name}
                </h4>
                <p className="text-sm text-secondary-600 mt-1">
                  {framework.description || framework.abbreviation}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Template */}
      {step === 'template' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Select Document Type
          </h3>
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
                    <span className="badge bg-secondary-100 text-secondary-700 capitalize">
                      {template.template_type}
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
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Custom Scope (Optional)
              </label>
              <textarea
                value={customScope}
                onChange={(e) => setCustomScope(e.target.value)}
                placeholder="Describe the specific scope or context for this document..."
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
            <button onClick={handleGenerate} className="btn-primary">
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
