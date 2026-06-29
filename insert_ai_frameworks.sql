-- Insert 5 new AI frameworks (safe — skips if abbreviation already exists)
INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url)
SELECT 'EU AI Act', 'EU AI Act', 'European Union Artificial Intelligence Act — risk-based regulation governing AI systems placed on the EU market.', '2024', 'ai-safety', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'EU AI Act');

INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url)
SELECT 'NIST AI 100-1', 'NIST AI 100-1', 'Artificial Intelligence Risk Management Framework: Trustworthy and Responsible AI characteristics and practices.', '2023', 'ai-safety', 'https://airc.nist.gov/Docs/1'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'NIST AI 100-1');

INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url)
SELECT 'MITRE ATLAS', 'MITRE ATLAS', 'Adversarial Threat Landscape for AI Systems — tactics and techniques used by adversaries to attack machine learning systems.', '2024', 'ai-safety', 'https://atlas.mitre.org'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'MITRE ATLAS');

INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url)
SELECT 'DoD AI Ethics', 'DoD AI Ethics', 'Department of Defense AI Ethical Principles and Responsible AI adoption strategy for defense AI systems.', '2020', 'ai-safety', 'https://www.defense.gov/News/Releases/Release/Article/2091996/'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'DoD AI Ethics');

INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url)
SELECT 'OECD AI Principles', 'OECD AI Principles', 'OECD Principles on Artificial Intelligence — international standards for trustworthy AI adopted by 46+ countries.', '2024', 'ai-safety', 'https://oecd.ai/en/ai-principles'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'OECD AI Principles');
