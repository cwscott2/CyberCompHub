import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://cybercompliancehub.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateAuth(req: Request): Response | null {
  const auth = req.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  return null;
}

function sanitizeScope(scope: string | undefined): string | undefined {
  if (!scope) return undefined;
  // Cap length and strip anything that looks like a prompt injection attempt
  return scope.slice(0, 500).replace(/ignore (previous|all|above)/gi, '');
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GenerateRequest {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
  selected_family?: string;
  family_metadata_field?: string;
}

const ALLOWED_FAMILY_FIELDS = new Set([
  'family_name',
  'control_family',
  'domain_name',
  'function_name',
  'annex_name',
  'category',
  'step_name',
  'trust_service_category',
  'tactic',
]);

async function callClaude(prompt: string, maxTokens = 4096): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

function resolveControlId(metadata: Record<string, unknown>): string {
  return (metadata?.control_id || metadata?.practice_id || metadata?.criterion_id || '') as string;
}

async function generatePolicyWithClaude(
  frameworkName: string,
  familyName: string,
  controls: Array<{ title: string; raw_content: string; metadata: Record<string, unknown> }>,
  customScope?: string,
): Promise<string> {
  const controlContext = controls
    .filter(d => !d.metadata?.is_enhancement)
    .slice(0, 40)
    .map(d => {
      const id = resolveControlId(d.metadata);
      const content = d.raw_content?.slice(0, 400) || d.title;
      return `**${id} — ${d.title}**\n${content}`;
    })
    .join('\n\n---\n\n');

  const scopeInstruction = customScope
    ? `\nAdditional scope context provided by the requestor: "${customScope}"\n`
    : '';

  const prompt = `You are an expert information security policy writer. Write a formal, professional security policy based on ${frameworkName} control requirements.

Framework: ${frameworkName}
Control Family / Domain: ${familyName}
${scopeInstruction}
Control Requirements for this family:

${controlContext}

Write a complete, production-ready security policy document in Markdown. The policy must:
- Be written in clear organizational policy language (not framework citation language)
- Translate control requirements into actionable organizational commitments
- Include these sections in order:
  1. Title (e.g., "${familyName} Security Policy")
  2. Document Control table: Organization, Version (1.0), Effective Date, Review Cycle, Owner — use [Organization Name] and [Effective Date] placeholders
  3. Purpose (2-3 sentences)
  4. Scope (who and what this policy covers)
  5. Policy Statement (the organization's core commitment)
  6. Policy Requirements (the main body — write one subsection per logical grouping of controls, using plain language requirements an employee can follow)
  7. Roles and Responsibilities (table: Role | Responsibilities)
  8. Compliance and Enforcement
  9. Review and Update (annual review cycle)
  10. Related Documents (placeholder list)

Use [Organization Name] wherever the organization name appears. Do not reference control IDs in prose sentences — translate them into plain requirements. After each paragraph or bulleted requirement in the Policy Requirements section, append the applicable control ID(s) in brackets at the end of the line (e.g., \`[AC-1a]\`, \`[AC.L2-3.1.1]\`, \`[CC6.1]\`). Output only the Markdown document, no preamble.`;

  return callClaude(prompt);
}

async function generateProcedureWithClaude(
  frameworkName: string,
  familyName: string,
  controls: Array<{ title: string; raw_content: string; metadata: Record<string, unknown> }>,
  customScope?: string,
): Promise<string> {
  const controlContext = controls
    .slice(0, 60)
    .map(d => {
      const id = resolveControlId(d.metadata);
      const isEnhancement = d.metadata?.is_enhancement;
      const content = d.raw_content?.slice(0, 500) || d.title;
      return `**${id} — ${d.title}**${isEnhancement ? ' *(Enhancement)*' : ''}\n${content}`;
    })
    .join('\n\n---\n\n');

  const scopeInstruction = customScope
    ? `\nAdditional scope context provided by the requestor: "${customScope}"\n`
    : '';

  const prompt = `You are an expert information security engineer writing implementation procedures for a compliance program. Write formal, actionable procedures based on ${frameworkName} control requirements.

Framework: ${frameworkName}
Control Family / Domain: ${familyName}
${scopeInstruction}
Control Requirements for this family (including enhancements):

${controlContext}

Write a complete, production-ready procedure document in Markdown. The document must:
- Be written for the practitioner who will implement the controls — specific, actionable, and testable
- Translate each control requirement into concrete implementation steps
- Include these sections in order:
  1. Title (e.g., "${familyName} Implementation Procedures")
  2. Document Control table: Organization, Version (1.0), Effective Date, Review Cycle, Owner — use [Organization Name] and [Effective Date] placeholders
  3. Purpose & Scope (who performs these procedures and what systems they apply to)
  4. Roles and Responsibilities (table: Role | Responsibilities — include specific roles like ISSO, System Owner, IT Admin)
  5. Procedures (the main body — organize logically by control grouping, not one section per control ID):
     For each logical grouping write:
     - **Step 1 — Understand the Requirement**: What the control mandates in plain language
     - **Step 2 — Assign Responsibility**: Role accountable for this procedure
     - **Step 3 — Implement**: Specific, numbered implementation actions. Include tool references where applicable ([System/Tool Name] placeholder).
     - **Step 4 — Verify & Document**: What evidence to collect, how to test, what to record. Include example artifact names.
  6. Testing and Verification Summary (table: Control ID | Test Method | Evidence Artifact | Frequency)
  7. Related Policies and References

Use [Organization Name] wherever the organization name appears. After each Step 4 block, append the applicable control ID(s) at sub-component granularity (e.g., \`[AC-2b]\`, \`[AC.L2-3.1.1]\`, \`[CC6.1]\`). Output only the Markdown document, no preamble.`;

  return callClaude(prompt, 6000);
}

async function generateGapAssessmentWithClaude(
  frameworkName: string,
  familyName: string,
  controls: Array<{ title: string; raw_content: string; metadata: Record<string, unknown> }>,
  customScope?: string,
): Promise<string> {
  const controlContext = controls
    .filter(d => !d.metadata?.is_enhancement)
    .slice(0, 40)
    .map(d => {
      const id = resolveControlId(d.metadata);
      const content = d.raw_content?.slice(0, 500) || d.title;
      return `**${id} — ${d.title}**\n${content}`;
    })
    .join('\n\n---\n\n');

  const scopeInstruction = customScope
    ? `\nAdditional scope context provided by the requestor: "${customScope}"\n`
    : '';

  const prompt = `You are an expert information security assessor conducting a compliance gap assessment. Write a formal gap assessment document based on ${frameworkName} control requirements.

Framework: ${frameworkName}
Control Family / Domain: ${familyName}
${scopeInstruction}
Control Requirements for this family:

${controlContext}

Write a complete, production-ready gap assessment document in Markdown. The document must:
- Be structured for a compliance officer or auditor to use as a working assessment tool
- For each control, describe what is required, what typical gaps look like, what evidence to collect, and what risk is introduced if the gap exists
- Include these sections in order:
  1. Title (e.g., "${familyName} Compliance Gap Assessment")
  2. Document Control table: Organization, Assessor, Assessment Date, Framework Version, Review Cycle — use [Organization Name], [Assessor Name], and [Assessment Date] placeholders
  3. Executive Summary (2-3 sentences on purpose and scope of this assessment)
  4. Assessment Methodology (how to use this document, rating scale: Compliant / Partially Compliant / Non-Compliant / Not Applicable)
  5. Gap Analysis (the main body — one subsection per control or logical grouping):
     For each control write:
     - **Requirement**: What the control mandates (plain language)
     - **Current State**: [ ] Compliant  [ ] Partially Compliant  [ ] Non-Compliant  [ ] N/A  *(assessor fills in)*
     - **Gap Description**: Common gaps organizations face for this control; leave a blank line for assessor notes
     - **Required Evidence**: Bulleted list of specific artifacts/evidence an assessor would request
     - **Risk if Non-Compliant**: Risk level (High/Medium/Low) and brief impact statement
  6. Summary Findings Table (Control ID | Requirement Summary | Status | Risk Level | Notes)
  7. Recommended Remediation Roadmap (prioritized by risk — High gaps first, with suggested remediation actions)
  8. Next Steps and Review Schedule

Use [Organization Name] wherever the organization name appears. After each control's Required Evidence section, append the applicable control ID(s) at sub-component granularity (e.g., \`[AC-2a]\`, \`[AC.L2-3.1.1]\`, \`[CC6.1]\`). Output only the Markdown document, no preamble.`;

  return callClaude(prompt, 6000);
}

async function generateChecklistWithClaude(
  frameworkName: string,
  familyName: string,
  controls: Array<{ title: string; raw_content: string; metadata: Record<string, unknown> }>,
  customScope?: string,
): Promise<string> {
  const controlContext = controls
    .slice(0, 60)
    .map(d => {
      const id = resolveControlId(d.metadata);
      const isEnhancement = d.metadata?.is_enhancement;
      const content = d.raw_content?.slice(0, 400) || d.title;
      return `**${id} — ${d.title}**${isEnhancement ? ' *(Enhancement)*' : ''}\n${content}`;
    })
    .join('\n\n---\n\n');

  const scopeInstruction = customScope
    ? `\nAdditional scope context provided by the requestor: "${customScope}"\n`
    : '';

  const prompt = `You are an expert information security compliance engineer writing a compliance verification checklist. Write a concise, actionable checklist based on ${frameworkName} control requirements.

Framework: ${frameworkName}
Control Family / Domain: ${familyName}
${scopeInstruction}
Control Requirements for this family (including enhancements):

${controlContext}

Write a complete, production-ready compliance checklist in Markdown. The document must:
- Be structured for an auditor or compliance engineer to verify implementation
- Each checklist item must be specific enough to answer with Yes/No/Partial/N/A
- Include these sections in order:
  1. Title (e.g., "${familyName} Compliance Checklist")
  2. Document Control table: Organization, Version (1.0), Date, Completed By — use [Organization Name], [Date], [Reviewer Name] placeholders
  3. Instructions (one short paragraph: how to use the checklist, status codes, what to do with findings)
  4. Checklist Items — organized into logical groupings (not one item per control ID):
     For each item use this format:
     \`- [ ] **[Item description as a verifiable statement]** | Evidence: [specific artifact] \`[Control ID(s)]\`\`
     Example: \`- [ ] **User access requests are documented and approved prior to provisioning.** | Evidence: Access request tickets, approval records \`[AC-2a]\`\`
  5. Summary Table (Control ID | Checklist Items Count | Status | Notes) — leave Status and Notes blank for the reviewer to fill in
  6. Sign-off block: Reviewer, Role, Date, Signature — with placeholders

Use [Organization Name] wherever the organization name appears. Include the applicable control ID at sub-component granularity on every checklist item (e.g., \`[AC-2a]\`, \`[AC.L2-3.1.1]\`, \`[CC6.1]\`). Output only the Markdown document, no preamble.`;

  return callClaude(prompt, 5000);
}

async function generatePoamWithClaude(
  frameworkName: string,
  familyName: string,
  controls: Array<{ title: string; raw_content: string; metadata: Record<string, unknown> }>,
  customScope?: string,
): Promise<string> {
  const controlContext = controls
    .filter(d => !d.metadata?.is_enhancement)
    .slice(0, 40)
    .map(d => {
      const id = resolveControlId(d.metadata);
      const content = d.raw_content?.slice(0, 300) || d.title;
      return `**${id} — ${d.title}**\n${content}`;
    })
    .join('\n\n---\n\n');

  const scopeInstruction = customScope
    ? `\nAdditional scope context provided by the requestor: "${customScope}"\n`
    : '';

  // Framework-specific POA&M field guidance
  const frameworkGuidance = frameworkName.includes('FedRAMP')
    ? `This POA&M must follow FedRAMP requirements: include POA&M ID, Control ID (NIST SP 800-53), Weakness Name, System/Asset, Point of Contact, Resources Required, Scheduled Completion Date, Milestones with Completion Dates, Milestone Changes, and Status. Use FedRAMP risk ratings (Very High/High/Moderate/Low/Very Low). Include the FedRAMP-required "Original Detection Date" and "Deviation Rationale" fields.`
    : frameworkName.includes('CMMC')
    ? `This POA&M must follow CMMC requirements: include Practice ID (e.g., AC.L2-3.1.1), Practice Description, Assessment Objective, Current Status, Gap Description, Remediation Plan, Responsible Party, Target Completion Date, Estimated Cost, and CMMC Level (2). Include the DoD-required "Spillover" and "CUI Impact" fields where applicable.`
    : frameworkName.includes('NIST') || frameworkName.includes('SP 800')
    ? `This POA&M should follow NIST SP 800-53A assessment guidance: include Control ID, Control Name, Weakness/Deficiency Description, Risk Level, Remediation Actions, Responsible Official, Scheduled Completion Date, Required Resources, Status, and Milestones.`
    : frameworkName.includes('SOC 2')
    ? `This POA&M should follow SOC 2 remediation tracking format: include Trust Service Criterion ID (e.g., CC6.1), Criterion Description, Finding, Risk Rating, Management Response, Remediation Owner, Target Date, and Evidence of Remediation.`
    : `This POA&M should include: Finding ID, Control/Requirement Reference, Weakness Description, Risk Level, Remediation Plan, Responsible Party, Target Completion Date, Status, and Evidence of Remediation.`;

  const prompt = `You are an expert information security compliance officer writing a Plan of Action and Milestones (POA&M) document. Write a formal POA&M based on ${frameworkName} control requirements.

Framework: ${frameworkName}
Control Family / Domain: ${familyName}
${scopeInstruction}
Framework-Specific Requirements: ${frameworkGuidance}

Control Requirements for this family:

${controlContext}

Write a complete, production-ready POA&M document in Markdown. The document must:
- Represent realistic compliance gaps an organization might face for these controls
- Each finding should be pre-populated with the control requirement and leave fields for the assessor to fill in
- Include these sections in order:
  1. Title (e.g., "${familyName} Plan of Action and Milestones")
  2. Document Control table: Organization, System Name, POA&M Date, Version, Prepared By — use [Organization Name], [System Name], [Date], [Preparer Name] placeholders
  3. Executive Summary (purpose, system description, overall risk posture)
  4. POA&M Items — one row block per control with all framework-required fields as described above. Pre-populate the Control ID, Control/Criterion Name, and a realistic example weakness description. Leave remediation and date fields as [TBD] or blank for the assessor to complete.
  5. Summary Dashboard (table: Total Findings | Very High | High | Moderate | Low | Open | Closed)
  6. Milestone Tracking (table: POA&M ID | Milestone | Planned Date | Actual Date | Status)
  7. Approval and Signature block

Use [Organization Name] wherever the organization name appears. Output only the Markdown document, no preamble.`;

  return callClaude(prompt, 6000);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const authError = validateAuth(req);
  if (authError) return authError;

  try {
    const { framework_id, template_id, custom_scope, selected_controls, selected_family, family_metadata_field }: GenerateRequest = await req.json();

    if (!framework_id || !template_id) {
      return new Response(
        JSON.stringify({ error: 'Framework ID and Template ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!UUID_RE.test(framework_id) || !UUID_RE.test(template_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitized_scope = sanitizeScope(custom_scope);

    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select(`*, template_sections(*)`)
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('id', framework_id)
      .single();

    // Fetch relevant documents
    let docQuery = supabase
      .from('documents')
      .select('id, title, raw_content, metadata, document_type')
      .eq('framework_id', framework_id);

    if (selected_family && family_metadata_field) {
      if (!ALLOWED_FAMILY_FIELDS.has(family_metadata_field)) {
        return new Response(
          JSON.stringify({ error: 'Invalid family_metadata_field' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      docQuery = docQuery.eq(`metadata->>${family_metadata_field}`, selected_family);
    } else if (selected_controls && selected_controls.length > 0) {
      docQuery = docQuery.in('metadata->>practice_id', selected_controls);
    }

    const { data: rawDocuments } = await docQuery
      .eq('document_type', 'control')
      .limit(300);

    // Sort numerically by control_id (AC-1, AC-2 ... AC-10, not AC-1, AC-10, AC-2)
    const documents = (rawDocuments || []).sort((a, b) => {
      const idA = a.metadata?.control_id || a.metadata?.practice_id || a.title || '';
      const idB = b.metadata?.control_id || b.metadata?.practice_id || b.title || '';
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    });

    let content_markdown = '';

    if (template.template_type === 'policy') {
      content_markdown = await generatePolicyWithClaude(
        framework?.name || 'Compliance Framework',
        selected_family || framework?.name || 'Security',
        documents,
        sanitized_scope,
      );
    } else if (template.template_type === 'procedure') {
      content_markdown = await generateProcedureWithClaude(
        framework?.name || 'Compliance Framework',
        selected_family || framework?.name || 'Security',
        documents,
        sanitized_scope,
      );
    } else if (template.template_type === 'gap_assessment') {
      content_markdown = await generateGapAssessmentWithClaude(
        framework?.name || 'Compliance Framework',
        selected_family || framework?.name || 'Security',
        documents,
        sanitized_scope,
      );
    } else if (template.template_type === 'checklist') {
      content_markdown = await generateChecklistWithClaude(
        framework?.name || 'Compliance Framework',
        selected_family || framework?.name || 'Security',
        documents,
        sanitized_scope,
      );
    } else if (template.template_type === 'poam') {
      content_markdown = await generatePoamWithClaude(
        framework?.name || 'Compliance Framework',
        selected_family || framework?.name || 'Security',
        documents,
        sanitized_scope,
      );
    } else {
      // Template assembly for checklist, procedure, poam, etc.
      const sections: Record<string, string> = {};
      const sortedSections = template.template_sections?.sort((a: any, b: any) => a.section_order - b.section_order) || [];

      for (const section of sortedSections) {
        let sectionContent = '';

        if (section.section_key === 'header') {
          sectionContent = `# ${template.name}\n\n`;
          sectionContent += `**Framework:** ${framework?.name || 'Compliance Framework'}\n`;
          sectionContent += `**Generated:** ${new Date().toLocaleDateString()}\n`;
          if (sanitized_scope) sectionContent += `**Scope:** ${sanitized_scope}\n`;
          sectionContent += '\n---\n\n';
        } else if (section.section_key === 'introduction') {
          sectionContent = `## Introduction\n\n`;
          sectionContent += `This document provides guidance for implementing controls from ${framework?.name || 'the compliance framework'}.`;
          if (sanitized_scope) sectionContent += ` The scope of this document is: ${sanitized_scope}.`;
          sectionContent += '\n\n';
        } else if (section.section_key === 'controls' && documents) {
          const isProcedure = template.template_type === 'procedure';
          sectionContent = isProcedure ? `## Procedures\n\n` : `## Controls and Requirements\n\n`;
          for (const doc of documents) {
            if (doc.document_type === 'control') {
              if (isProcedure) {
                const controlId = doc.metadata?.control_id || doc.metadata?.practice_id || '';
                sectionContent += `### ${controlId}${controlId ? ' — ' : ''}${doc.title}\n\n`;
                sectionContent += `**Step 1 — Understand the Requirement**\n`;
                sectionContent += `${doc.raw_content || doc.title}\n\n`;
                sectionContent += `**Step 2 — Assign Responsibility**\n`;
                sectionContent += `Responsible Party: TBD\n\n`;
                sectionContent += `**Step 3 — Implement**\n`;
                sectionContent += `Document implementation steps specific to your environment.\n\n`;
                sectionContent += `**Step 4 — Verify**\n`;
                sectionContent += `Verification method: TBD\n\n`;
                sectionContent += `---\n\n`;
              } else if (doc.raw_content) {
                sectionContent += `${doc.raw_content}\n\n---\n\n`;
              }
            }
          }
        } else if (section.section_key === 'findings' && documents) {
          sectionContent = `## Plan of Action & Milestones\n\n`;
          sectionContent += `| Finding | Control Reference | Risk Level | Remediation Owner | Due Date | Status |\n`;
          sectionContent += `|---|---|---|---|---|---|\n`;
          for (const doc of documents) {
            const controlRef = doc.metadata?.control_id || doc.metadata?.practice_id || doc.title;
            sectionContent += `| [Finding description] | ${controlRef} | High/Med/Low | TBD | TBD | Open |\n`;
          }
          sectionContent += '\n';
        } else if (section.section_key === 'checklist' && documents) {
          sectionContent = `## Compliance Checklist\n\n`;
          for (const doc of documents) {
            if (doc.document_type === 'control') {
              const practiceId = doc.metadata?.practice_id || doc.metadata?.control_id || '';
              const description = doc.metadata?.description ||
                doc.raw_content?.match(/## Requirement\n(.*)/)?.[1] ||
                doc.title;
              sectionContent += `- [ ] **${practiceId}** — ${description}\n`;
            }
          }
          sectionContent += '\n';
        } else {
          sectionContent = `## ${section.display_name}\n\n`;
          if (section.prompt_template) {
            sectionContent += section.prompt_template.replace('{framework}', framework?.name || 'Framework');
          }
          sectionContent += '\n\n';
        }

        sections[section.section_key] = sectionContent;
      }

      content_markdown = Object.values(sections).join('');
    }

    // Build document title
    const docTitle = selected_family && template.template_type === 'policy'
      ? `${selected_family} Security Policy — ${framework?.name}`
      : selected_family && template.template_type === 'procedure'
      ? `${framework?.name} ${selected_family} Procedures - ${new Date().toLocaleDateString()}`
      : `${template.name} - ${new Date().toLocaleDateString()}`;

    const { data: savedDoc, error: saveError } = await supabase
      .from('generated_documents')
      .insert({
        title: docTitle,
        framework_id,
        template_id,
        content_markdown,
        metadata: {
          sanitized_scope,
          selected_controls,
          selected_family: selected_family || null,
          family_metadata_field: family_metadata_field || null,
          generated_at: new Date().toISOString(),
        },
        export_formats: ['markdown'],
      })
      .select('id')
      .single();

    if (saveError) console.error('Save error:', saveError);

    return new Response(
      JSON.stringify({
        document_id: savedDoc?.id,
        content_markdown,
        template_name: template.name,
        framework_name: framework?.name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generation error:', error);
    console.error('Generation error:', String(error));
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
