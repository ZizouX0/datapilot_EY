import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { roleLabel } from '../lib/roles';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

// Role-aware guide. Reachable any time from the "Guide" button in the top bar,
// so a user who gets lost can re-read what their role does and how the workflow
// fits together. Content adapts to the signed-in role and the chosen language.
const COPY = {
  en: {
    title: 'Your guide',
    sub: 'A quick map of what you do and how everything fits together. You can reopen this any time from the “Guide” button at the top.',
    groupTitle: 'The group assessment workflow',
    groupSub: 'One shared assessment, filled by several departments, finalized by a coordinator. Here’s the whole flow and who does each step.',
    goAdmin: 'Go to the admin area →',
    ownerTitle: 'Administering the platform',
    ownerBody: 'You operate DataPilot across every bank. From the admin area you invite each bank’s Super Admin, maintain the EY master questionnaire, and review submissions from all banks.',
    soloNote: 'Prefer one person to do everything? An analyst can still run a full solo assessment — group mode is optional.',
    analystTitle: 'How you fill an assessment',
    analystGroupTitle: 'Group assessment (if assigned)',
    analystGroupDesc: 'On your Welcome page you’ll see a “Contribute to the group assessment” card if your department owns a dimension. It shows only your dimensions; answers save automatically.',
    analystSoloTitle: 'Solo assessment (any time)',
    analystSoloDesc: 'Use the setup form on the Welcome page to run the full assessment yourself, then view your results, gap analysis and compliance report.',
    goAssessment: 'Go to my assessment →',
    glossaryTitle: 'Words you’ll see',
    steps: [
      { n: 1, who: 'Super Admin', title: 'Set up departments & people', where: 'Admin → Departments', desc: 'Create the departments that will contribute (or use the one-click Tunisian set), then assign each analyst to a department.' },
      { n: 2, who: 'Admin', title: 'Create the assessment & map dimensions', where: 'Admin → Group assessment', desc: 'Start the shared assessment, then map each dimension to the department that owns it — or apply the suggested Tunisian mapping in one click.' },
      { n: 3, who: 'Analysts', title: 'Fill your part', where: 'Welcome → Contribute', desc: 'Each analyst answers only the dimensions assigned to their department. Answers save automatically to the shared assessment.' },
      { n: 4, who: 'Admin', title: 'Review & finalize', where: 'Admin → Group assessment', desc: 'Watch progress and scores update live. When everyone is done, finalize — the result lands in Submissions with full reports.' },
    ],
    roleInfo: {
      owner: { title: 'You are EY (platform owner)', blurb: 'You oversee every bank on DataPilot, maintain the master questionnaire, and can review every submission.', can: ['Invite each bank’s Super Admin and set their bank.', 'Edit the EY master questionnaire that banks copy from.', 'Review submissions across all banks.'], flow: 'owner' },
      superadmin: { title: 'You are a Super Admin', blurb: 'You set up your bank’s structure — departments and people — and oversee its assessments.', can: ['Create departments and assign analysts to them (Departments tab).', 'Create and run group assessments, and finalize them.', 'Invite and manage Admins and Analysts in your bank.'], flow: 'group' },
      admin: { title: 'You are an Admin (coordinator)', blurb: 'You run the whole assessment for your bank — departments, people, and the group assessment.', can: ['Set up departments and assign your analysts to them.', 'Create a group assessment and map dimensions to departments.', 'Track progress and finalize the assessment into a submission.', 'Tailor your bank’s questionnaire and review submissions.'], flow: 'group' },
      analyst: { title: 'You are an Analyst', blurb: 'You fill in assessments — either on your own, or your department’s part of a shared one.', can: ['Run a solo assessment from start to finish.', 'Contribute to a group assessment — you’ll see only your department’s dimensions.', 'See your score, gaps, compliance and download the report.'], flow: 'analyst' },
    },
    glossary: (nDims, nInds) => [
      ['Dimension', `One of the ${nDims} big themes of data maturity (e.g. Governance, Data Quality). Each has a weight in the final score.`],
      ['Indicator', `One specific question. There are ${nInds} in total, grouped under the dimensions.`],
      ['Maturity level', 'A 1–5 rating: 1 Initial, 2 Emerging, 3 Defined, 4 Managed, 5 Optimized (CMMI / Gartner scale).'],
      ['BCT compliance', 'Whether key indicators meet the Banque Centrale de Tunisie data expectations. BCT indicators can’t be skipped.'],
      ['Evidence cap', 'A score of 3 or more with no evidence noted is automatically capped at 2 — so scores stay honest.'],
      ['Department', 'A team in your bank (e.g. DSI, Conformité). In a group assessment, each owns one or more dimensions.'],
      ['Group assessment', 'One shared assessment several departments fill together, finalized by a coordinator.'],
      ['Solo assessment', 'One person fills the whole assessment alone — the classic flow, still available any time.'],
    ],
  },
  fr: {
    title: 'Votre guide',
    sub: 'Un aperçu rapide de votre rôle et de l’articulation de l’ensemble. Vous pouvez le rouvrir à tout moment via le bouton « Guide » en haut.',
    groupTitle: 'Le déroulé de l’évaluation groupée',
    groupSub: 'Une évaluation partagée, remplie par plusieurs départements, finalisée par un coordinateur. Voici tout le déroulé et qui fait chaque étape.',
    goAdmin: 'Aller à l’espace admin →',
    ownerTitle: 'Administration de la plateforme',
    ownerBody: 'Vous gérez DataPilot pour toutes les banques. Depuis l’espace admin, vous invitez le Super Admin de chaque banque, maintenez le questionnaire maître EY et consultez les évaluations de toutes les banques.',
    soloNote: 'Vous préférez qu’une seule personne fasse tout ? Un analyste peut toujours réaliser une évaluation solo complète — le mode groupé est facultatif.',
    analystTitle: 'Comment remplir une évaluation',
    analystGroupTitle: 'Évaluation groupée (si affectée)',
    analystGroupDesc: 'Sur votre page d’accueil, une carte « Contribuer à l’évaluation groupée » apparaît si votre département possède une dimension. Elle n’affiche que vos dimensions ; les réponses sont enregistrées automatiquement.',
    analystSoloTitle: 'Évaluation solo (à tout moment)',
    analystSoloDesc: 'Utilisez le formulaire de la page d’accueil pour réaliser vous-même l’évaluation complète, puis consultez vos résultats, l’analyse des écarts et le rapport de conformité.',
    goAssessment: 'Aller à mon évaluation →',
    glossaryTitle: 'Les termes que vous verrez',
    steps: [
      { n: 1, who: 'Super Admin', title: 'Configurer départements et personnes', where: 'Admin → Départements', desc: 'Créez les départements contributeurs (ou utilisez l’ensemble tunisien en un clic), puis affectez chaque analyste à un département.' },
      { n: 2, who: 'Admin', title: 'Créer l’évaluation et affecter les dimensions', where: 'Admin → Évaluation groupée', desc: 'Lancez l’évaluation partagée, puis affectez chaque dimension au département responsable — ou appliquez l’affectation tunisienne suggérée en un clic.' },
      { n: 3, who: 'Analystes', title: 'Remplir votre partie', where: 'Accueil → Contribuer', desc: 'Chaque analyste ne répond qu’aux dimensions affectées à son département. Les réponses sont enregistrées automatiquement.' },
      { n: 4, who: 'Admin', title: 'Revoir et finaliser', where: 'Admin → Évaluation groupée', desc: 'Suivez l’avancement et les scores en direct. Une fois tout terminé, finalisez — le résultat arrive dans les Évaluations avec les rapports complets.' },
    ],
    roleInfo: {
      owner: { title: 'Vous êtes EY (propriétaire de la plateforme)', blurb: 'Vous supervisez chaque banque sur DataPilot, maintenez le questionnaire maître et pouvez consulter chaque évaluation.', can: ['Inviter le Super Admin de chaque banque et définir sa banque.', 'Modifier le questionnaire maître EY que les banques copient.', 'Consulter les évaluations de toutes les banques.'], flow: 'owner' },
      superadmin: { title: 'Vous êtes Super Admin', blurb: 'Vous configurez la structure de votre banque — départements et personnes — et supervisez ses évaluations.', can: ['Créer des départements et y affecter les analystes (onglet Départements).', 'Créer et piloter des évaluations groupées, et les finaliser.', 'Inviter et gérer les Admins et Analystes de votre banque.'], flow: 'group' },
      admin: { title: 'Vous êtes Admin (coordinateur)', blurb: 'Vous pilotez toute l’évaluation de votre banque — départements, personnes et évaluation groupée.', can: ['Créer des départements et y affecter vos analystes.', 'Créer une évaluation groupée et affecter les dimensions aux départements.', 'Suivre l’avancement et finaliser l’évaluation en une soumission.', 'Adapter le questionnaire de votre banque et consulter les évaluations.'], flow: 'group' },
      analyst: { title: 'Vous êtes Analyste', blurb: 'Vous remplissez les évaluations — seul, ou la partie de votre département dans une évaluation partagée.', can: ['Réaliser une évaluation solo du début à la fin.', 'Contribuer à une évaluation groupée — vous ne voyez que les dimensions de votre département.', 'Voir votre score, vos écarts, la conformité et télécharger le rapport.'], flow: 'analyst' },
    },
    glossary: (nDims, nInds) => [
      ['Dimension', `L’un des ${nDims} grands thèmes de la maturité des données (ex. Gouvernance, Qualité des données). Chacun a un poids dans le score final.`],
      ['Indicateur', `Une question précise. Il y en a ${nInds} au total, regroupés sous les dimensions.`],
      ['Niveau de maturité', 'Une note de 1 à 5 : 1 Initial, 2 Émergent, 3 Défini, 4 Maîtrisé, 5 Optimisé (échelle CMMI / Gartner).'],
      ['Conformité BCT', 'Si les indicateurs clés respectent les attentes de la Banque Centrale de Tunisie. Les indicateurs BCT ne peuvent pas être ignorés.'],
      ['Plafond de preuve', 'Un score de 3 ou plus sans preuve notée est automatiquement plafonné à 2 — pour des scores honnêtes.'],
      ['Département', 'Une équipe de votre banque (ex. DSI, Conformité). Dans une évaluation groupée, chacune possède une ou plusieurs dimensions.'],
      ['Évaluation groupée', 'Une évaluation partagée que plusieurs départements remplissent ensemble, finalisée par un coordinateur.'],
      ['Évaluation solo', 'Une seule personne remplit toute l’évaluation — le flux classique, toujours disponible.'],
    ],
  },
};

export default function Guide() {
  const navigate = useNavigate();
  const role = useAuthStore(s => s.role) || 'analyst';
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const info = c.roleInfo[role] || c.roleInfo.analyst;
  const glossary = c.glossary(Object.keys(DIMENSIONS).length, INDICATORS.length);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">{c.title}</h1>
          <span className="bg-ey-purple text-white text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
            {roleLabel(role)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{c.sub}</p>
      </div>

      {/* Your role */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-800">{info.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{info.blurb}</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {info.can.map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-600 mt-0.5">✓</span><span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Workflow */}
      {info.flow === 'owner' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{c.ownerTitle}</h2>
          <p className="text-sm text-gray-600">{c.ownerBody}</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400"
          >{c.goAdmin}</button>
        </div>
      ) : info.flow === 'analyst' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">{c.analystTitle}</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-ey-yellow text-ey-charcoal text-xs font-bold flex items-center justify-center flex-shrink-0">A</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{c.analystGroupTitle}</div>
                <p className="text-sm text-gray-600">{c.analystGroupDesc}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-ey-charcoal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">B</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{c.analystSoloTitle}</div>
                <p className="text-sm text-gray-600">{c.analystSoloDesc}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400"
          >{c.goAssessment}</button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{c.groupTitle}</h2>
          <p className="text-sm text-gray-500 mb-4">{c.groupSub}</p>
          <div className="flex flex-col">
            {c.steps.map((step, i) => (
              <div key={step.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-ey-charcoal text-ey-yellow text-sm font-bold flex items-center justify-center flex-shrink-0">{step.n}</div>
                  {i < c.steps.length - 1 && <div className="w-px flex-1 bg-gray-300 my-1" />}
                </div>
                <div className={i < c.steps.length - 1 ? 'pb-4' : ''}>
                  <div className="text-sm font-semibold text-gray-800">{step.title}
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-ey-purple/10 text-ey-purple px-1.5 py-0.5 rounded">{step.who}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{step.where}</div>
                  <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400"
          >{c.goAdmin}</button>
          <p className="text-xs text-gray-400 mt-2">{c.soloNote}</p>
        </div>
      )}

      {/* Glossary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">{c.glossaryTitle}</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {glossary.map(([term, def]) => (
            <div key={term}>
              <dt className="text-sm font-semibold text-gray-800">{term}</dt>
              <dd className="text-sm text-gray-600">{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
