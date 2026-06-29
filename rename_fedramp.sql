-- Rename FedRAMP to FedRAMP Moderate to distinguish from upcoming High and Low tiers
UPDATE compliance_frameworks
SET name = 'FedRAMP Moderate',
    abbreviation = 'FedRAMP Moderate',
    description = 'Federal Risk and Authorization Management Program — Moderate baseline impact level. Covers systems where compromise could have serious adverse effects on organizational operations, assets, or individuals.'
WHERE abbreviation = 'FedRAMP';
