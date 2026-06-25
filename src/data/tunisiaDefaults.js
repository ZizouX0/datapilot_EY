// Department reference data for Tunisian banks.
//
// Tunisian banks share a remarkably consistent "Pôle / Direction" organigramme
// (verified against STB, BNA, BIAT, Amen, Zitouna, UIB). This file turns that
// into pickable data for the group-assessment (Model B) setup:
//   • TUNISIA_DEPARTMENT_CATALOG  — the full list a coordinator can pick from
//     (grouped by pôle) when creating a bank's departments, plus a free-text
//     "add your own" that is saved to the bank.
//   • TUNISIA_DEFAULT_DEPARTMENTS — the five primary contributors, seeded by the
//     one-click "use suggested setup".
//   • TUNISIA_SUGGESTED_MAPPING   — recommended DIMENSION → department owner.
//   • TUNISIA_SUBDIM_RECOMMENDATIONS — finer, advisory SUB-DIMENSION → department
//     hints (assignment itself is per dimension; these just guide the choice).
// All names are editable; nothing here is hard-coded into the assessment logic.

// Full catalog, grouped by pôle, for the department picker. The labels are the
// canonical names; a bank can rename them or add its own.
export const TUNISIA_DEPARTMENT_CATALOG = [
  { pole: 'Gouvernance & Contrôle', departments: [
    'Pôle Gouvernance & Conformité',
    'Direction Conformité (LAB-FT)',
    'Direction Contrôle Interne',
    'Direction Audit Interne / Inspection Générale',
    'Direction Juridique',
  ] },
  { pole: 'Risques', departments: [
    'Direction Gestion des Risques',
    'Direction Risques Crédit',
  ] },
  { pole: 'Systèmes d\'Information & Digital', departments: [
    'Direction Systèmes d\'Information (DSI)',
    'Direction Data & Gouvernance des Données',
    'Direction Organisation & Référentiels',
    'Direction Monétique & Banque Digitale',
  ] },
  { pole: 'Pilotage & Qualité', departments: [
    'Direction Qualité',
    'Direction Pilotage & Stratégie',
    'Direction Pilotage de la Performance',
  ] },
  { pole: 'Métiers & Support', departments: [
    'Direction Commerciale & Réseau',
    'Direction Marketing',
    'Direction des Opérations',
    'Direction Financière',
    'Direction Ressources Humaines',
    'Direction RSE & Développement Durable',
  ] },
];

// Flattened catalog (handy for a single dropdown / autocomplete).
export const TUNISIA_DEPARTMENT_NAMES = TUNISIA_DEPARTMENT_CATALOG.flatMap(g => g.departments);

// The five primary contributors to a data-maturity assessment, one per
// dimension. Seeded by the one-click setup.
export const TUNISIA_DEFAULT_DEPARTMENTS = [
  'Pôle Gouvernance & Conformité',
  'Direction Qualité',
  'Direction Systèmes d\'Information (DSI)',
  'Direction Pilotage & Stratégie',
  'Direction Ressources Humaines',
];

// Recommended DIMENSION → department owner.
//   D1 Governance            → Gouvernance & Conformité
//   D2 Data Quality          → Direction Qualité
//   D3 Architecture & Access → DSI
//   D4 Analytics & Tools     → Pilotage & Stratégie
//   D5 Skills & Culture      → Ressources Humaines
export const TUNISIA_SUGGESTED_MAPPING = {
  D1: 'Pôle Gouvernance & Conformité',
  D2: 'Direction Qualité',
  D3: 'Direction Systèmes d\'Information (DSI)',
  D4: 'Direction Pilotage & Stratégie',
  D5: 'Direction Ressources Humaines',
};

// Advisory SUB-DIMENSION → department hints. Assignment is per dimension, so
// these only help a coordinator decide who should own a dimension when its
// sub-dimensions naturally split across functions (e.g. D1's compliance bit).
export const TUNISIA_SUBDIM_RECOMMENDATIONS = {
  '1.1': 'Direction Pilotage & Stratégie',          // Strategy & data policy
  '1.2': 'Pôle Gouvernance & Conformité',           // Ownership & responsibilities
  '1.3': 'Direction Conformité (LAB-FT)',           // Regulatory compliance
  '2.1': 'Direction Qualité',                       // Quality dimensions
  '2.2': 'Direction Qualité',                       // Controls & processes
  '2.3': 'Direction Systèmes d\'Information (DSI)',  // Lineage & traceability
  '3.1': 'Direction Systèmes d\'Information (DSI)',  // Centralization & integration
  '3.2': 'Direction Systèmes d\'Information (DSI)',  // Pipelines & infrastructure
  '4.1': 'Direction Systèmes d\'Information (DSI)',  // Tool maturity
  '4.2': 'Direction Pilotage & Stratégie',          // Data usage
  '5.1': 'Direction Ressources Humaines',           // Data skills (proxy)
  '5.2': 'Direction Ressources Humaines',           // Culture & adoption (proxy)
};
