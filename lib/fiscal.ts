// Constantes fiscales 2026 (revenus 2025)
// Sources : service-public.gouv.fr, urssaf.fr, legifrance.gouv.fr

export const ANNEE_FISCALE = 2026;

// --- Plafonds ---
export const PASS = 48_060; // Plafond Annuel Sécurité Sociale 2026
export const MICRO_CAP = 83_600; // Plafond micro-entreprise BNC 2026

// --- Barème IR 2026 (revenus 2025) ---
// [seuil, taux marginal]
export const BAREME_IR: [number, number][] = [
  [11_600, 0],
  [29_579, 0.11],
  [84_577, 0.30],
  [181_917, 0.41],
  [Infinity, 0.45],
];

export const ABATTEMENT_IR = 0.1; // 10% abattement forfaitaire frais pro
export const PLAFOND_QF = 1_807; // Plafonnement quotient familial par demi-part

// --- Micro-entreprise BNC ---
export const MICRO_BNC_TAUX = 0.256; // Taux global URSSAF 2026
export const MICRO_BNC_ABATTEMENT = 0.34; // Abattement forfaitaire BNC (34%)
// Revenu imposable micro = CA × (1 - 0.34) = CA × 0.66

// Ventilation micro BNC (ajustée proportionnellement pour totaliser 25.6%)
export const MICRO_DETAIL = {
  maladie: 0.077, // ~7.7%
  retraite: 0.128, // ~12.8%
  csgCrds: 0.051, // ~5.1%
};

// --- TNS (Travailleur Non Salarié) ---
// Coefficient global ~43% (réforme assiette unique 2025-2026, "à effort constant")
export const TNS_COEFF = 1.43; // net = bénéfice / 1.43

// Ventilation TNS sur revenu net
export const TNS_DETAIL = {
  maladie: 0.065, // 6.5% (progressif 1.5%-8.5%, 6.5% = moyenne)
  retraiteBase: 0.1775, // 17.75% plafonné au PASS
  retraiteCompl: 0.081, // 8.1% (hausse 2026, était 7%)
  csgCrds: 0.097, // 9.7%
};

// --- SASU (Assimilé salarié) ---
export const SASU_CHARGES_PAT = 0.55; // ~55% charges patronales / brut
export const SASU_CHARGES_SAL = 0.22; // ~22% charges salariales / brut
export const SASU_COEFF_TOTAL = 1.55; // coût total = brut × 1.55
export const SASU_COEFF_NET = 0.78; // net = brut × 0.78

// Ventilation SASU sur brut
export const SASU_DETAIL = {
  maladie: 0.135, // 13.5%
  retraiteBase: 0.1545, // 15.45%
  agircArrco: 0.19, // 19%
  csgCrds: 0.097, // 9.7%
};

// --- IS (Impôt sur les Sociétés) ---
export const IS_SEUIL_REDUIT = 42_500; // Seuil taux réduit confirmé
export const IS_SEUIL_PLF2026 = 100_000; // PLF 2026 — amendement voté, non promulgué
export const IS_TAUX_REDUIT = 0.15;
export const IS_TAUX_NORMAL = 0.25;

// --- Charges fixes estimées ---
export const CHARGES_FIXES_SOCIETE = 3_000; // Charges annuelles société (compta, etc.)
export const CHARGES_FIXES_HOLDING = 4_000; // Charges annuelles holding

// --- Retraite : validation trimestres ---
// Basé sur 150h × SMIC horaire 2026 (12.02€)
export const TRIMESTRE_SEUIL = 1_803; // Revenu minimum pour valider 1 trimestre
export const QUATRE_TRIMESTRES = 7_212; // Revenu minimum pour 4 trimestres/an
