// Minimal i18n for the application shell (top bar, navigation, account page).
// The language preference is stored per user (and in localStorage for instant
// application); see useSettingsStore. Assessment *content* (the 47 indicators,
// rubrics, report copy) is not translated here yet — that is a larger,
// follow-up effort — so those screens remain in English regardless of toggle.

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

const STRINGS = {
  // Top bar
  'top.subtitle':   { en: 'Data Maturity Steering Tool', fr: 'Outil de pilotage de la maturité des données' },
  'top.account':    { en: 'Account',  fr: 'Compte' },
  'top.signOut':    { en: 'Sign out', fr: 'Déconnexion' },

  // Navigation tabs
  'nav.profile':    { en: 'Bank Profile',  fr: 'Profil de la banque' },
  'nav.assessment': { en: 'Assessment',    fr: 'Évaluation' },
  'nav.results':    { en: 'Results',       fr: 'Résultats' },
  'nav.gap':        { en: 'Gap Analysis',  fr: 'Analyse des écarts' },
  'nav.compliance': { en: 'Compliance',    fr: 'Conformité' },
  'nav.admin':      { en: 'Admin',         fr: 'Admin' },
  'nav.locked':     { en: 'Complete the full assessment to unlock results.', fr: 'Terminez toute l’évaluation pour débloquer les résultats.' },

  // Account page
  'account.title':        { en: 'My account',        fr: 'Mon compte' },
  'account.subtitle':     { en: 'Manage your personal settings and password.', fr: 'Gérez vos paramètres personnels et votre mot de passe.' },
  'account.section.info': { en: 'Account information', fr: 'Informations du compte' },
  'account.displayName':  { en: 'Display name',       fr: 'Nom affiché' },
  'account.namePlaceholder': { en: 'Your full name',  fr: 'Votre nom complet' },
  'account.email':        { en: 'Login email',        fr: 'E-mail de connexion' },
  'account.emailNote':    { en: 'Managed by your administrator.', fr: 'Géré par votre administrateur.' },
  'account.position':     { en: 'Position',           fr: 'Poste' },
  'account.role':         { en: 'Role',               fr: 'Rôle' },
  'account.status':       { en: 'Status',             fr: 'Statut' },
  'account.memberSince':  { en: 'Member since',       fr: 'Membre depuis' },
  'account.language':     { en: 'Language',           fr: 'Langue' },
  'account.save':         { en: 'Save changes',       fr: 'Enregistrer' },
  'account.saving':       { en: 'Saving…',            fr: 'Enregistrement…' },
  'account.saved':        { en: 'Changes saved.',     fr: 'Modifications enregistrées.' },
  'account.section.security': { en: 'Security',       fr: 'Sécurité' },
  'account.newPassword':  { en: 'New password',       fr: 'Nouveau mot de passe' },
  'account.confirmPassword': { en: 'Confirm password', fr: 'Confirmer le mot de passe' },
  'account.changePassword':  { en: 'Change password', fr: 'Changer le mot de passe' },
  'account.passwordHint': { en: 'At least 8 characters.', fr: 'Au moins 8 caractères.' },
  'account.passwordChanged': { en: 'Password updated.', fr: 'Mot de passe mis à jour.' },
  'account.passwordMismatch': { en: 'Passwords do not match.', fr: 'Les mots de passe ne correspondent pas.' },

  // Account — profile photo
  'account.photo':        { en: 'Profile photo',  fr: 'Photo de profil' },
  'account.changePhoto':  { en: 'Change photo',   fr: 'Changer la photo' },
  'account.removePhoto':  { en: 'Remove',         fr: 'Supprimer' },
  'account.photoHint':    { en: 'JPG or PNG, up to 2 MB.', fr: 'JPG ou PNG, jusqu’à 2 Mo.' },
  'account.uploading':    { en: 'Uploading…',     fr: 'Téléversement…' },
  'account.photoTooLarge':{ en: 'Image is too large (max 2 MB).', fr: 'Image trop volumineuse (max 2 Mo).' },
  'account.photoInvalid': { en: 'Please choose an image file.',   fr: 'Veuillez choisir un fichier image.' },

  // Account — my submissions
  'account.section.submissions': { en: 'My submissions', fr: 'Mes évaluations' },
  'account.sub.subtitle': { en: 'Assessments you have submitted for review.', fr: 'Évaluations que vous avez soumises pour revue.' },
  'account.sub.bank':      { en: 'Bank',      fr: 'Banque' },
  'account.sub.maturity':  { en: 'Maturity',  fr: 'Maturité' },
  'account.sub.submitted': { en: 'Submitted', fr: 'Soumise le' },
  'account.sub.delete':    { en: 'Delete',    fr: 'Supprimer' },
  'account.sub.empty':     { en: 'You haven’t submitted any assessments yet.', fr: 'Vous n’avez encore soumis aucune évaluation.' },
  'account.sub.confirmDelete': { en: 'Delete this submission? This cannot be undone.', fr: 'Supprimer cette soumission ? Action irréversible.' },

  // Roles / status (shared)
  'role.superadmin': { en: 'Super Admin', fr: 'Super Admin' },
  'role.admin':      { en: 'Admin',       fr: 'Admin' },
  'role.analyst':    { en: 'Analyst',     fr: 'Analyste' },
  'status.active':   { en: 'Active',      fr: 'Actif' },
  'status.disabled': { en: 'Disabled',    fr: 'Désactivé' },
};

// Translate a key for a language, falling back to English then the key itself.
export function translate(lang, key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}
