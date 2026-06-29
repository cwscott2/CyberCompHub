-- Pre-create sources for the 5 new AI frameworks
INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT id, 'EU AI Act — Official Text', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689', 'webpage', 'generic-webpage'
FROM compliance_frameworks WHERE abbreviation = 'EU AI Act';

INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT id, 'NIST AI 100-1 — Trustworthy and Responsible AI', 'https://airc.nist.gov/Docs/1', 'webpage', 'generic-webpage'
FROM compliance_frameworks WHERE abbreviation = 'NIST AI 100-1';

INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT id, 'MITRE ATLAS Knowledge Base', 'https://atlas.mitre.org', 'webpage', 'generic-webpage'
FROM compliance_frameworks WHERE abbreviation = 'MITRE ATLAS';

INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT id, 'DoD AI Ethical Principles', 'https://www.defense.gov/News/Releases/Release/Article/2091996/', 'webpage', 'generic-webpage'
FROM compliance_frameworks WHERE abbreviation = 'DoD AI Ethics';

INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT id, 'OECD AI Principles', 'https://oecd.ai/en/ai-principles', 'webpage', 'generic-webpage'
FROM compliance_frameworks WHERE abbreviation = 'OECD AI Principles';
