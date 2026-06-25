// Default department structure for Tunisian banks.
//
// Tunisian banks share a remarkably consistent "Pôle / Direction" organigramme
// (verified against STB, BNA, BIAT, Amen, Zitouna, UIB). Of the ~7 standard
// pôles, about five are the natural contributors to a data-maturity assessment,
// and they line up one-to-one with the DataPilot dimensions. These constants let
// a coordinator pre-configure a bank's departments and map each dimension to its
// owning department in one click; both are fully editable afterwards.
export const TUNISIA_DEFAULT_DEPARTMENTS = [
  'Pôle Gouvernance & Conformité',
  'Direction Qualité',
  'DSI — Systèmes d\'Information',
  'Pilotage & Stratégie',
  'Ressources Humaines',
];

// Suggested dimension (code) → department name. Used by the one-click setup.
//   D1 Governance            → Gouvernance & Conformité
//   D2 Data Quality          → Direction Qualité
//   D3 Architecture & Access → DSI
//   D4 Analytics & Tools     → Pilotage & Stratégie
//   D5 Skills & Culture      → Ressources Humaines
export const TUNISIA_SUGGESTED_MAPPING = {
  D1: 'Pôle Gouvernance & Conformité',
  D2: 'Direction Qualité',
  D3: 'DSI — Systèmes d\'Information',
  D4: 'Pilotage & Stratégie',
  D5: 'Ressources Humaines',
};
