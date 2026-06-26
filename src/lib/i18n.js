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
  'nav.group':      { en: 'Group assessment', fr: 'Évaluation groupée' },
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

  // Account — navigation, phone & bank
  'account.back':          { en: 'Back to app',   fr: 'Retour à l’application' },
  'account.phone':         { en: 'Phone number',  fr: 'Numéro de téléphone' },
  'account.phonePlaceholder': { en: 'e.g. +216 20 123 456', fr: 'ex. +216 20 123 456' },
  'account.phoneHint':     { en: 'Used as a recovery contact for your account.', fr: 'Utilisé comme contact de récupération pour votre compte.' },
  'account.bank':          { en: 'Bank',          fr: 'Banque' },
  'account.bankPlaceholder': { en: 'Your organisation’s bank', fr: 'La banque de votre organisation' },
  'account.bankHint':      { en: 'Set by your administrator — shared across your team.', fr: 'Défini par votre administrateur — partagé avec votre équipe.' },
  'account.bankHintSuper': { en: 'As super-admin, this bank is inherited by everyone you invite.', fr: 'En tant que super-admin, cette banque est héritée par toutes les personnes que vous invitez.' },
  'account.bankUnset':     { en: 'Not set yet',   fr: 'Pas encore défini' },

  // Account — SMS verification (Phone MFA)
  'account.sms.title':    { en: 'SMS verification', fr: 'Vérification par SMS' },
  'account.sms.on':       { en: 'On',  fr: 'Activée' },
  'account.sms.off':      { en: 'Off', fr: 'Désactivée' },
  'account.sms.onDesc':   { en: 'A code is texted to your phone when you change your password.', fr: 'Un code est envoyé par SMS lors du changement de mot de passe.' },
  'account.sms.offDesc':  { en: 'Add your mobile to require a texted code when changing your password.', fr: 'Ajoutez votre mobile pour exiger un code par SMS lors du changement de mot de passe.' },
  'account.sms.phoneLabel': { en: 'Mobile number (international format)', fr: 'Numéro mobile (format international)' },
  'account.sms.send':     { en: 'Send code',  fr: 'Envoyer le code' },
  'account.sms.sending':  { en: 'Sending…',   fr: 'Envoi…' },
  'account.sms.codeLabel':{ en: 'Verification code', fr: 'Code de vérification' },
  'account.sms.confirm':  { en: 'Confirm',     fr: 'Confirmer' },
  'account.sms.codeSent': { en: 'We texted a 6-digit code to your phone.', fr: 'Nous avons envoyé un code à 6 chiffres par SMS.' },
  'account.sms.enrolled': { en: 'SMS verification is now on.', fr: 'La vérification par SMS est activée.' },
  'account.sms.removed':  { en: 'SMS verification turned off.', fr: 'Vérification par SMS désactivée.' },
  'account.sms.remove':   { en: 'Turn off SMS verification', fr: 'Désactiver la vérification par SMS' },
  'account.sms.invalidPhone': { en: 'Enter a valid number in international format, e.g. +21620123456.', fr: 'Entrez un numéro valide au format international, ex. +21620123456.' },
  'account.sms.notConfigured': { en: 'SMS verification isn’t available yet — ask your administrator to enable it.', fr: 'La vérification par SMS n’est pas encore disponible — demandez à votre administrateur de l’activer.' },
  'account.pwd.needCode': { en: 'Enter the code we texted you, then change your password.', fr: 'Saisissez le code reçu par SMS, puis changez votre mot de passe.' },
  'account.pwd.sendCode': { en: 'Text me a code', fr: 'M’envoyer un code' },

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

  // Admin shell (hub tabs + header)
  'adm.title':            { en: 'Administration', fr: 'Administration' },
  'adm.signedInAs':       { en: 'Signed in as',   fr: 'Connecté en tant que' },
  'adm.tab.submissions':  { en: 'Submissions',      fr: 'Évaluations' },
  'adm.tab.group':        { en: 'Group assessment', fr: 'Évaluation groupée' },
  'adm.tab.questionnaire':{ en: 'Questionnaire',    fr: 'Questionnaire' },
  'adm.tab.departments':  { en: 'Departments',      fr: 'Départements' },
  'adm.tab.users':        { en: 'Users & roles',    fr: 'Utilisateurs et rôles' },

  // Roles / status (shared)
  'role.owner':      { en: 'EY Admin',    fr: 'Admin EY' },
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
