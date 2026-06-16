const DEFAULT_DIMENSIONS = {
  D1: { name: 'Governance', weight: 0.25, color: '#3D108A', subDims: ['1.1', '1.2', '1.3'] },
  D2: { name: 'Data Quality', weight: 0.20, color: '#188CE5', subDims: ['2.1', '2.2', '2.3'] },
  D3: { name: 'Architecture & Access', weight: 0.20, color: '#27ACAA', subDims: ['3.1', '3.2'] },
  D4: { name: 'Analytics & Tools', weight: 0.20, color: '#2DB757', subDims: ['4.1', '4.2'] },
  D5: { name: 'Skills & Culture', weight: 0.15, color: '#750E5C', subDims: ['5.1', '5.2'], proxy: true },
};

const DEFAULT_SUBDIM_NAMES = {
  '1.1': 'Strategy & data policy',
  '1.2': 'Ownership & responsibilities',
  '1.3': 'Regulatory compliance',
  '2.1': 'Quality dimensions',
  '2.2': 'Controls & processes',
  '2.3': 'Lineage & traceability',
  '3.1': 'Centralization & integration',
  '3.2': 'Pipelines & infrastructure',
  '4.1': 'Tool maturity',
  '4.2': 'Data usage',
  '5.1': 'Data skills (proxy)',
  '5.2': 'Culture & adoption (proxy)',
};

const DEFAULT_INDICATORS = [
  // ═══════════════════════════════════════════════════
  // D1 — Governance (25%) — 12 indicators
  // ═══════════════════════════════════════════════════

  // 1.1 Strategy & data policy (4)
  {
    id: 'D1.1-01',
    dim: 'D1',
    sub: '1.1',
    subName: 'Strategy & data policy',
    bct: true,
    q: 'Is there a formally approved and dated data strategy document?',
    hint: 'BCT Art. 7.2 — The strategy must be formally approved by executive management, dated, and accessible to all relevant stakeholders. An informal or verbal strategy does not satisfy this requirement.',
    rubric: [
      'No data strategy document exists. Data direction is entirely informal and undocumented. Individual decisions made ad hoc with no shared direction.',
      'A draft or informal strategy exists but has not been formally approved, dated, or signed by executive management. Not officially communicated.',
      'Strategy document exists, formally approved by executive management, dated, and shared with all relevant teams. BCT Art. 7.2 satisfied.',
      'Strategy actively tracked via KPIs, reviewed at least quarterly, and formally updated with a documented revision history and change log.',
      'Strategy fully embedded in corporate planning cycles, benchmarked against sector peers, and drives measurable business outcomes enterprise-wide.',
    ],
  },
  {
    id: 'D1.1-02',
    dim: 'D1',
    sub: '1.1',
    subName: 'Strategy & data policy',
    bct: false,
    q: 'Does executive sponsorship exist — CDO or equivalent role with a formal mandate?',
    hint: 'A CDO or equivalent must have a formal mandate letter, dedicated budget authority, and board-level reporting access. A job title alone is insufficient — the role must have real decision power.',
    rubric: [
      'No data leadership role exists. Data responsibilities distributed informally with no clear ownership at the executive level. No budget allocated.',
      'A data-related title exists (e.g. IT Director) but no formal data mandate, dedicated budget, or board visibility is in place. Role is informal.',
      'CDO or equivalent appointed with formal charter, dedicated budget, and direct reporting line to CEO or board. Role is publicly recognized internally.',
      'CDO drives measurable outcomes: data strategy KPIs tracked, governance committee active, CDO presents to board on a defined cadence.',
      'CDO recognized as sector leader. Data strategy co-owned with CEO. Governance outcomes benchmarked externally and published annually.',
    ],
  },
  {
    id: 'D1.1-03',
    dim: 'D1',
    sub: '1.1',
    subName: 'Strategy & data policy',
    bct: false,
    q: 'Is there a data roadmap with defined milestones and tracking indicators?',
    hint: 'The roadmap must be a formal document with specific milestones, named owners, target dates, and KPIs. It must be reviewed at least quarterly by the governance committee and updated based on progress.',
    rubric: [
      'No data roadmap exists. Data initiatives launched ad hoc with no planning horizon, sequencing, or success criteria defined.',
      'An informal roadmap or project list exists but lacks milestones, named owners, target dates, or formal approval. Not reviewed regularly.',
      'Formal roadmap approved with milestones, owners, and target dates. Reviewed quarterly by governance committee. KPIs defined and tracked.',
      'Roadmap dynamically updated based on measured outcomes. Milestone achievement tracked as a KPI. Deviations trigger formal review and re-planning.',
      'Roadmap co-created with all business units and directly tied to corporate strategy. Outcomes published and benchmarked externally.',
    ],
  },
  {
    id: 'D1.1-04',
    dim: 'D1',
    sub: '1.1',
    subName: 'Strategy & data policy',
    bct: true,
    q: 'Is there a periodic review process for the data policy in place?',
    hint: 'The data policy must be formally reviewed on a defined schedule (at least annually), with a documented change log, and approved by the governance committee after each review cycle.',
    rubric: [
      'Data policy has never been reviewed since its creation — or no policy exists at all. No review process defined anywhere.',
      'Ad hoc reviews occur when major incidents happen or regulations change, but no scheduled cycle or change log exists.',
      'Annual review process formally scheduled. Results documented with a change log. Governance committee approves all policy updates.',
      'Bi-annual review with a structured change log tracking each modification, its rationale, and its approval date. Communicated org-wide.',
      'Continuous review embedded in operations. Policy updates triggered automatically by regulatory changes. Review process itself is KPI-tracked.',
    ],
  },

  // 1.2 Ownership & responsibilities (4)
  {
    id: 'D1.2-01',
    dim: 'D1',
    sub: '1.2',
    subName: 'Ownership & responsibilities',
    bct: true,
    q: 'Are data owners formally identified for each critical business domain?',
    hint: 'BCT Art. 7.4 — Data owners must be named individuals with documented accountability per domain (credit, risk, compliance, finance, operations). A RACI matrix must exist and be communicated.',
    rubric: [
      'No data owners identified anywhere. Accountability for data assets completely unclear. No one formally responsible for data quality in any domain.',
      'Some informal stewards exist but ownership not formally documented. No RACI. Coverage incomplete and dependent on key individuals.',
      'Data owners formally named for all critical domains. RACI documented, approved by CDO, and communicated to all relevant stakeholders.',
      'Data owners actively monitor KPIs for their domains, participate in governance committee, and follow a documented escalation process.',
      'Data ownership embedded in all job descriptions and performance reviews. Ownership transitions formally managed. Zero gaps in coverage.',
    ],
  },
  {
    id: 'D1.2-02',
    dim: 'D1',
    sub: '1.2',
    subName: 'Ownership & responsibilities',
    bct: false,
    q: 'Are operational data stewards designated and active across business domains?',
    hint: 'Data stewards are operational-level roles (distinct from data owners) responsible for day-to-day data quality, issue resolution, and policy enforcement within their domain.',
    rubric: [
      'No stewards exist. Day-to-day data quality is managed reactively by whoever encounters the problem. No formal operational accountability.',
      'Informal stewardship occurs — individuals take care of data in their area but this is not recognized, documented, or supported organizationally.',
      'Stewards formally designated per domain, listed in the RACI, and supported by the CDO office. Role is part of the governance structure.',
      'Stewards operate with defined SLAs, participate in regular data governance reviews, and report quality metrics to their data owners.',
      'Stewards embedded in all business processes. Stewardship outcomes tracked and linked to performance evaluation. Zero unresolved data issues.',
    ],
  },
  {
    id: 'D1.2-03',
    dim: 'D1',
    sub: '1.2',
    subName: 'Ownership & responsibilities',
    bct: false,
    q: 'Are accountability chains documented and communicated organization-wide?',
    hint: 'Accountability chains define who is responsible for each data element from creation to use. This means a documented RACI matrix that has been formally communicated to all relevant teams.',
    rubric: [
      'No accountability chains documented. When data issues occur, no one knows who is responsible. Escalation is ad hoc and informal.',
      'Partial RACI documentation exists for some domains but not approved, not current, and not communicated systematically to the organization.',
      'RACI fully documented for all domains, formally approved by CDO, and communicated to all relevant stakeholders in writing.',
      'RACI enforced and audited. Exceptions are formally managed. Accountability tracked as a governance KPI. Violations escalated automatically.',
      'RACI integrated into HR processes, onboarding materials, and job descriptions. Accountability is a cultural norm, not just a document.',
    ],
  },
  {
    id: 'D1.2-04',
    dim: 'D1',
    sub: '1.2',
    subName: 'Ownership & responsibilities',
    bct: false,
    q: 'Is there an active data governance committee with a formal charter?',
    hint: 'The committee must have documented terms of reference, defined membership, a regular meeting cadence (at least monthly), and documented decisions. Ad hoc meetings do not qualify.',
    rubric: [
      'No governance committee exists. Data decisions made in silos with no cross-functional coordination or formal escalation path.',
      'Informal data meetings occur occasionally but no formal committee, charter, or documented decisions. No regular cadence.',
      'Formal governance committee with charter, defined membership, and regular meetings (at least monthly). Decisions documented and tracked.',
      'Committee reviews KPIs, approves policies, and tracks action items to closure. Meeting minutes circulated and archived systematically.',
      'Governance committee drives sector-level data policy. Decisions transparent, measurable, and directly linked to business outcomes.',
    ],
  },

  // 1.3 Regulatory compliance (4)
  {
    id: 'D1.3-01',
    dim: 'D1',
    sub: '1.3',
    subName: 'Regulatory compliance',
    bct: true,
    q: 'Is there a formal mapping to BCT Circular N°2025-08 requirements?',
    hint: 'BCT Art. 12.1 — This is a mandatory BCT indicator. Cannot be skipped. Must include article-by-article mapping with evidence status and responsible owner per article.',
    rubric: [
      'No mapping to BCT Circular 2025-08 exists. The bank has not begun to assess its compliance obligations under this regulation.',
      'Informal awareness of BCT requirements exists but no structured article-by-article mapping completed. No evidence package exists.',
      'Formal mapping completed for all BCT articles. Evidence status tracked per article. Responsible owner assigned per requirement.',
      'BCT mapping actively maintained and updated when circular guidance changes. Evidence packages pre-prepared and ready for inspection.',
      'BCT compliance fully automated with real-time monitoring. Evidence packages auto-generated. Zero preparation time for inspections.',
    ],
  },
  {
    id: 'D1.3-02',
    dim: 'D1',
    sub: '1.3',
    subName: 'Regulatory compliance',
    bct: true,
    q: 'Is the bank audit-ready for BCT inspections — documentary evidence available?',
    hint: 'BCT Art. 12.1 — Audit readiness means having a pre-assembled evidence package per article: approved documents, system logs, dashboards, and named responsible owners — all accessible within 48 hours.',
    rubric: [
      'Not ready for audit. Key documents do not exist or cannot be located. An inspection today would result in significant non-compliance findings.',
      'Partial documentation exists but is scattered, inconsistent, and would require weeks to compile. Not audit-ready in any practical sense.',
      'Key documents available and organized. Audit package can be assembled within one week. Responsible owners identified per article.',
      'Full audit trail maintained. Evidence packages pre-assembled and updated quarterly. Can be delivered to BCT within 48 hours.',
      'Pre-audit self-assessment conducted semi-annually. Evidence packages auto-generated. Real-time compliance dashboard available to BCT.',
    ],
  },
  {
    id: 'D1.3-03',
    dim: 'D1',
    sub: '1.3',
    subName: 'Regulatory compliance',
    bct: true,
    q: 'Is BCBS 239 data traceability maintained for risk reporting?',
    hint: 'BCBS 239 Principle 2 — Every critical risk data element used in regulatory reports must have documented lineage from source to report. Traceability must be auditable and current.',
    rubric: [
      'No traceability whatsoever. Origin of risk data completely unknown. BCBS 239 Principle 2 not met. Significant regulatory risk.',
      'Partial coverage — some critical flows are traced informally but lineage is incomplete, outdated, and not systematically maintained.',
      'Full traceability documented for all critical risk data flows in a dedicated tool. Source, transformations, and targets mapped and current.',
      'Lineage maintained automatically by ETL tooling. Changes trigger lineage updates. Impact analysis available for any data element.',
      'Real-time automated lineage. Any pipeline change instantly reflected. Lineage used proactively to prevent regulatory reporting errors.',
    ],
  },
  {
    id: 'D1.3-04',
    dim: 'D1',
    sub: '1.3',
    subName: 'Regulatory compliance',
    bct: true,
    q: 'Is a data retention and classification policy formally adopted?',
    hint: 'The policy must define retention periods per data category, classification levels (public/internal/confidential/restricted), and enforcement mechanisms. It must be formally approved and communicated.',
    rubric: [
      'No retention or classification policy exists. Data kept indefinitely by default or deleted randomly. No classification of sensitive data.',
      'Informal rules exist based on system defaults or individual team practices. Nothing formally documented, approved, or communicated.',
      'Policy documented and formally approved. Retention periods defined per data category. Classification levels defined and communicated.',
      'Policy enforced with automated monitoring. Violations flagged and remediated. Policy reviewed annually with documented change log.',
      'Policy fully automated and audited. Classification applied at data creation. Retention enforcement integrated into all systems.',
    ],
  },

  // ═══════════════════════════════════════════════════
  // D2 — Data Quality (20%) — 11 indicators
  // ═══════════════════════════════════════════════════

  // 2.1 Quality dimensions (4)
  {
    id: 'D2.1-01',
    dim: 'D2',
    sub: '2.1',
    subName: 'Quality dimensions',
    bct: true,
    q: 'Is the completeness rate of critical datasets measured and actively tracked?',
    hint: 'Completeness must be measured programmatically — not estimated. A dashboard or monitoring report must show trends over time for each critical dataset. Manual spot-checks do not qualify.',
    rubric: [
      'No completeness measurement exists. Data gaps discovered reactively when reports fail or users notice missing values. No metrics defined.',
      'Ad hoc spot-checks performed when issues arise. No systematic tracking. No defined thresholds or SLAs for any dataset.',
      'Completeness measured automatically for all critical datasets. Dashboard shows trends. SLAs defined and monitored. Alerts configured.',
      'Completeness SLAs enforced. Breaches trigger documented remediation. Root cause analysis performed and tracked to closure.',
      'Completeness predicted via ML models. Proactive remediation before breaches occur. Zero-defect targets achieved on critical reporting chains.',
    ],
  },
  {
    id: 'D2.1-02',
    dim: 'D2',
    sub: '2.1',
    subName: 'Quality dimensions',
    bct: false,
    q: 'Are cross-system accuracy and consistency controls in place?',
    hint: 'Accuracy controls verify that data values are correct and consistent across systems. This requires automated reconciliation checks between source systems and downstream platforms — not manual comparisons.',
    rubric: [
      'No accuracy controls exist. Cross-system discrepancies only discovered when they cause visible errors in reports or operations.',
      'Manual reconciliation done periodically by the data team. No automated controls. Discrepancies resolved informally without root cause analysis.',
      'Periodic automated reconciliation process in place. Discrepancies logged, categorized, and escalated. SLAs defined for resolution.',
      'Automated consistency checks run continuously across all critical systems. Discrepancy rate tracked as a KPI and reported to governance.',
      'Real-time accuracy monitoring with automated reconciliation. Zero tolerance for undetected cross-system discrepancies. ML anomaly detection.',
    ],
  },
  {
    id: 'D2.1-03',
    dim: 'D2',
    sub: '2.1',
    subName: 'Quality dimensions',
    bct: false,
    q: 'Are data freshness and timeliness SLAs defined and monitored?',
    hint: 'Freshness SLAs define the maximum acceptable age of data for each use case. They must be formally documented, monitored automatically, and tied to an alert and escalation process.',
    rubric: [
      'No freshness SLAs exist. Data age is completely unknown. Users receive stale data without any warning or notification mechanism.',
      'Informal expectations exist ("data should be updated daily") but nothing is formally documented, monitored, or enforced.',
      'SLAs documented for all critical data flows. Automated monitoring in place. Alerts triggered when SLAs are breached.',
      'SLAs monitored and reported in governance dashboards. Breach trends analyzed. Root causes tracked and remediation SLAs enforced.',
      'SLAs enforced with auto-alerts and escalation workflows. Freshness guaranteed for all critical data. Real-time streaming where required.',
    ],
  },
  {
    id: 'D2.1-04',
    dim: 'D2',
    sub: '2.1',
    subName: 'Quality dimensions',
    bct: false,
    q: 'Is there an active deduplication process for critical data entities?',
    hint: 'Deduplication must be an active, documented process — not a one-time cleanup. It should apply to all critical master data entities (clients, counterparties, products) with defined matching rules.',
    rubric: [
      'No deduplication process exists. Duplicates accumulate freely across systems. No awareness of duplicate rate or its business impact.',
      'Manual deduplication performed occasionally as a one-off project. No ongoing process. Duplicates reappear between cleanup cycles.',
      'Deduplication process formally defined with matching rules, ownership, and a regular execution schedule. Applied to all critical entities.',
      'Automated deduplication runs continuously. Duplicate rate tracked as a KPI. Master data records governed centrally.',
      'Real-time master data management with instant deduplication at the point of data creation. Zero duplicates in any critical entity.',
    ],
  },

  // 2.2 Controls & processes (4)
  {
    id: 'D2.2-01',
    dim: 'D2',
    sub: '2.2',
    subName: 'Controls & processes',
    bct: true,
    q: 'Are automated data validation rules documented and applied in production?',
    hint: 'BCT Art. 9.1 — Rules must be automated (not manual), documented with owner and last-review date, and actively applied to incoming data flows in production systems.',
    rubric: [
      'No validation rules exist. Data enters systems without any automated checks. Errors discovered downstream by business users or in reports.',
      'Some manual validation steps exist in operational processes but no automated rules deployed. Rules not documented.',
      'Automated validation rules deployed in production for all critical data flows. Rules documented with owner, logic, and last-review date.',
      'Rules version-controlled, reviewed quarterly, and optimized based on incident trends. Coverage tracked as a KPI.',
      'Validation fully automated and self-learning. Rules evolve based on data pattern analysis. 100% coverage of critical flows. Zero manual checks.',
    ],
  },
  {
    id: 'D2.2-02',
    dim: 'D2',
    sub: '2.2',
    subName: 'Controls & processes',
    bct: false,
    q: 'Is the quality incident rate tracked and formally reported?',
    hint: 'A quality incident is any data error that impacts business operations or reporting. Incidents must be logged in a ticketing system, categorized, assigned, and tracked to resolution with root cause analysis.',
    rubric: [
      'No incident tracking exists. Data quality issues discovered reactively and resolved informally with no documentation or learning.',
      'Issues tracked informally (email, spreadsheets) but no categorization, no trend analysis, and no formal reporting to management.',
      'Formal incident log in place. Incidents categorized by type and severity. Reported to governance committee monthly.',
      'Incident rate tracked as a KPI. Root cause analysis mandatory for all P1 incidents. Trend analysis drives preventive controls.',
      'Predictive quality monitoring detects issues before they become incidents. Incident rate approaching zero. Fully automated resolution for known types.',
    ],
  },
  {
    id: 'D2.2-03',
    dim: 'D2',
    sub: '2.2',
    subName: 'Controls & processes',
    bct: false,
    q: 'Is there a formalized remediation process with follow-up tracking?',
    hint: 'Remediation means more than fixing the immediate issue — it requires root cause analysis, corrective actions, and a documented process to prevent recurrence. All steps must be tracked to closure.',
    rubric: [
      'No remediation process exists. Issues fixed ad hoc by whoever notices them. No documentation. Same problems recur indefinitely.',
      'Ad hoc fixes applied when issues surface. No process, no root cause analysis, no tracking. Fixes not documented or shared.',
      'Remediation process documented with steps: triage, root cause analysis, fix, verification, and closure. Tracked in a system.',
      'SLA-bound remediation enforced. Root cause required for all critical issues. Closure rate tracked and reported in governance.',
      'Automated remediation for known issue types. Preventive controls updated automatically after each incident. Self-healing data pipelines.',
    ],
  },
  {
    id: 'D2.2-04',
    dim: 'D2',
    sub: '2.2',
    subName: 'Controls & processes',
    bct: false,
    q: 'Are operational data quality dashboards active and driving decisions?',
    hint: 'A quality dashboard must be live (not a monthly report), cover all critical datasets, and be actively used by data owners and the governance committee to make decisions — not just as a reporting artifact.',
    rubric: [
      'No quality dashboard or reporting exists. Data quality state is completely unknown to management and governance.',
      'Manual reports produced occasionally (monthly/quarterly) but not interactive, not real-time, and rarely reviewed by decision-makers.',
      'Dashboard exists, automated, and covers all critical datasets. Reviewed regularly by data owners and governance committee.',
      'Dashboard actively drives governance decisions. Alerts trigger escalation. KPI trends visible. Used in management committee meetings.',
      'Real-time dashboard with ML anomaly detection. Proactive alerts before issues impact operations. Embedded in management workflows.',
    ],
  },

  // 2.3 Lineage & traceability (3)
  {
    id: 'D2.3-01',
    dim: 'D2',
    sub: '2.3',
    subName: 'Lineage & traceability',
    bct: true,
    q: 'Is end-to-end data lineage documented for critical data flows?',
    hint: 'BCBS 239 Principle 2 — Lineage must cover source-to-report for all critical risk reporting data flows. A dedicated lineage tool or catalog should be in use — Word documents are insufficient.',
    rubric: [
      'No lineage documentation exists. The origin and transformation history of critical data is completely unknown. BCBS 239 P2 not met.',
      'Partial lineage exists for some flows, typically documented informally. Not systematically maintained or current after system changes.',
      'End-to-end lineage documented for all critical flows in a dedicated tool or catalog. Source, transformations, and targets mapped.',
      'Lineage maintained automatically by ETL/ELT tooling. Changes trigger lineage updates. Impact analysis available for any data element.',
      'Real-time lineage with full automation. Any pipeline change instantly reflected. Lineage used proactively to prevent reporting errors.',
    ],
  },
  {
    id: 'D2.3-02',
    dim: 'D2',
    sub: '2.3',
    subName: 'Lineage & traceability',
    bct: false,
    q: 'Is there an active and maintained data catalog accessible to users?',
    hint: 'A data catalog must be a live system (not a spreadsheet), actively maintained by data stewards, and accessible to all business users who need to find and understand data assets.',
    rubric: [
      'No catalog exists. Data discovery is completely informal. Users spend significant time finding data assets and understanding their content.',
      'A spreadsheet or shared document lists some datasets but is incomplete, outdated, and not actively maintained.',
      'Formal catalog tool deployed. Core datasets documented with descriptions, owners, and update frequency. Accessible to business users.',
      'Catalog actively maintained by stewards. Search capability. Business glossary integrated. Usage metrics tracked. Updated in near-real time.',
      'Automated metadata harvesting from all systems. Catalog is the single source of truth for all data assets. AI-assisted data discovery.',
    ],
  },
  {
    id: 'D2.3-03',
    dim: 'D2',
    sub: '2.3',
    subName: 'Lineage & traceability',
    bct: false,
    q: 'Is metadata governed and accessible to relevant users across the organization?',
    hint: 'Metadata governance means formal definitions for all critical data elements — business name, technical name, owner, definition, format, and source — managed in a system and accessible without IT intervention.',
    rubric: [
      'No metadata management. Data elements have inconsistent names across systems. Users cannot tell what data means without asking an expert.',
      'Some informal documentation exists (system manuals, data dictionaries in Excel) but inconsistent and not centrally accessible.',
      'Business and technical metadata formally defined for all critical data elements. Managed in a centralized system. Accessible to relevant users.',
      'Metadata managed in a dedicated system with workflow for change management. Changes require approval. Version history maintained.',
      'Metadata automatically harvested and synchronized across all systems. AI-assisted classification. Integrated into governance workflows.',
    ],
  },

  // ═══════════════════════════════════════════════════
  // D3 — Architecture & Access (20%) — 8 indicators
  // ═══════════════════════════════════════════════════

  // 3.1 Centralization & integration (4)
  {
    id: 'D3.1-01',
    dim: 'D3',
    sub: '3.1',
    subName: 'Centralization & integration',
    bct: false,
    q: 'What is the degree of data centralization across the organization?',
    hint: 'Centralization means data is accessible from a central repository or data platform — not locked in departmental silos. Measure the proportion of critical data accessible without going through individual departments.',
    rubric: [
      'Data fully siloed by department. No central repository. Every team manages its own data independently. No cross-department sharing.',
      'Some shared datasets exist (e.g. finance reports to risk) but the majority of data remains in departmental silos with no central control.',
      'Central repository established for key data domains. Most critical data accessible centrally. Controlled exceptions documented.',
      'Centralized platform used across all business units. Access governed by RBAC. Exceptions require formal approval and time limits.',
      'Unified data platform enterprise-wide. No silos. All data accessible with appropriate permissions. Real-time data sharing standard.',
    ],
  },
  {
    id: 'D3.1-02',
    dim: 'D3',
    sub: '3.1',
    subName: 'Centralization & integration',
    bct: false,
    q: 'Are standardized APIs in use to enable system interoperability?',
    hint: 'Standardized APIs (REST/SOAP with documented contracts) must be formally documented, versioned, and used across critical systems. Point-to-point integrations or file-based transfers do not qualify.',
    rubric: [
      'No APIs in place. All system integrations manual, file-based, or point-to-point. Data flows are brittle, slow, and completely undocumented.',
      'Some APIs exist but ad hoc, undocumented, and inconsistently implemented. No standards enforced across the organization.',
      'Standardized APIs implemented across all critical systems. API catalog maintained. Versioning in place. API gateway deployed.',
      'API usage monitored with SLAs on availability and latency. Deprecation policy enforced. All integrations go through the API layer.',
      'Event-driven API architecture. Real-time data flows. APIs published in a marketplace. Self-service consumption by business units.',
    ],
  },
  {
    id: 'D3.1-03',
    dim: 'D3',
    sub: '3.1',
    subName: 'Centralization & integration',
    bct: false,
    q: 'Is there measurable progress on eliminating data silos?',
    hint: 'Silo reduction requires a formal action plan with identified silos, owners, target dates, and measurable progress indicators. The plan must be tracked in the governance committee.',
    rubric: [
      'No effort made to address silos. Data silos identified in assessments but no action taken. Silos continue to grow as systems are added.',
      'Silos have been inventoried and acknowledged but no formal reduction plan exists. No ownership assigned. No target dates set.',
      'Silo reduction plan in place with identified silos, owners, target dates, and progress tracked in governance committee.',
      'Key silos eliminated according to plan. Progress reported quarterly. Remaining silos have documented timelines and mitigation strategies.',
      'Organization is silo-free by design. New system additions require approval to prevent silo creation. Architectural standard enforced.',
    ],
  },
  {
    id: 'D3.1-04',
    dim: 'D3',
    sub: '3.1',
    subName: 'Centralization & integration',
    bct: true,
    q: 'Is there a single source of truth (Golden Record) for critical data entities?',
    hint: 'A Golden Record is the authoritative, consolidated record for a data entity (e.g. client, counterparty, product) — one version, trusted by all systems, no conflicting copies across departments.',
    rubric: [
      'No Golden Record concept exists. Multiple conflicting versions of the same entity across systems. No authority defined for any data element.',
      'Golden Record identified as a need but no implementation underway. Data conflicts resolved ad hoc when discovered.',
      'Golden Record implemented for 1-2 critical entities (e.g. client). Authoritative source defined, published, and used by key systems.',
      'Golden Record implemented across all key entities. Master data management platform in place. Conflicts automatically detected and resolved.',
      'Enterprise-wide master data management. All entities have authoritative Golden Records. Real-time synchronization across all systems.',
    ],
  },

  // 3.2 Pipelines & infrastructure (4)
  {
    id: 'D3.2-01',
    dim: 'D3',
    sub: '3.2',
    subName: 'Pipelines & infrastructure',
    bct: false,
    q: 'What is the maturity level of ETL/ELT pipelines — documentation and monitoring?',
    hint: 'Every critical data pipeline must have documentation (source, target, transformation logic, schedule, owner) and automated monitoring with alerting on failures. Manual data moves do not qualify.',
    rubric: [
      'Data moved manually (file exports, copy-paste). No automated pipelines. Failures discovered reactively when downstream systems are affected.',
      'Basic automated pipelines exist but completely undocumented. Failures discovered by end users. No monitoring or alerting in place.',
      'All critical pipelines documented with source, target, logic, schedule, and owner. Automated monitoring with failure alerts to responsible team.',
      'Pipelines monitored via SLAs. Performance trends tracked. Degradation alerts trigger before failures occur. Ownership and escalation documented.',
      'Self-healing pipelines. Automated recovery on failure. Real-time monitoring with predictive alerting. Pipeline inventory 100% complete and current.',
    ],
  },
  {
    id: 'D3.2-02',
    dim: 'D3',
    sub: '3.2',
    subName: 'Pipelines & infrastructure',
    bct: false,
    q: 'Are data access time SLAs defined and consistently met?',
    hint: 'Access time SLAs define the maximum acceptable time for a user or system to retrieve data. They must be formally documented, continuously measured, and reported to the governance committee.',
    rubric: [
      'No SLA defined. Data access is ad hoc and unpredictable. Some requests take days. Users have no visibility on expected delivery time.',
      'Informal expectations exist but no formal SLA document, no monitoring, and no accountability for access time performance.',
      'SLAs formally documented for all data access scenarios. Measured continuously. Reported monthly to governance committee.',
      'SLAs consistently met. Breach rate tracked as a KPI. Root cause analysis required for all SLA breaches. Trend used to improve infrastructure.',
      'Real-time access guaranteed for all critical data. SLAs expressed in seconds, not hours. Self-service data access for all business users.',
    ],
  },
  {
    id: 'D3.2-03',
    dim: 'D3',
    sub: '3.2',
    subName: 'Pipelines & infrastructure',
    bct: false,
    q: 'Are infrastructure availability and resilience targets formally defined and met?',
    hint: 'Availability targets (e.g. 99.9% uptime) must be formally documented, monitored, and reported. Resilience means the ability to recover from failures within a defined Recovery Time Objective (RTO).',
    rubric: [
      'Frequent outages. No availability targets defined. No monitoring. Recovery is chaotic and depends on whoever is available at the time.',
      'Basic monitoring exists (server uptime alerts) but no formal availability SLAs, no RTO defined, and no documented recovery procedures.',
      'SLA-based availability targets defined (e.g. 99.5%). Monitored continuously. Recovery procedures documented and tested annually.',
      'High availability with automated failover. RTO measured and consistently met. Availability trend reported to governance committee.',
      'Active-active redundancy with zero planned downtime. RTO in minutes. Disaster recovery fully automated and tested quarterly.',
    ],
  },
  {
    id: 'D3.2-04',
    dim: 'D3',
    sub: '3.2',
    subName: 'Pipelines & infrastructure',
    bct: true,
    q: 'Are access rights managed through RBAC with complete audit trails?',
    hint: 'BCT requires role-based access control (RBAC) for all critical data systems. Every access grant or revoke must be logged. Access reviews must be conducted at least annually and documented.',
    rubric: [
      'No access controls beyond basic system logins. Anyone with system access can view any data. No audit trail. Major security risk.',
      'Basic user management (usernames and passwords) but no role-based structure. Access granted ad hoc. No audit log maintained.',
      'RBAC implemented across all critical systems. Role definitions documented. Access granted based on roles. Audit log maintained.',
      'RBAC with full audit trails. Annual access review conducted and documented. Excess permissions flagged and removed automatically.',
      'Zero-trust security model. Continuous access validation. Real-time anomaly detection. Audit trail feeds into automated compliance reporting.',
    ],
  },

  // ═══════════════════════════════════════════════════
  // D4 — Analytics & Tools (20%) — 8 indicators
  // ═══════════════════════════════════════════════════

  // 4.1 Tool maturity (4)
  {
    id: 'D4.1-01',
    dim: 'D4',
    sub: '4.1',
    subName: 'Tool maturity',
    bct: false,
    q: 'What is the modernity level of BI and analytics platforms in use?',
    hint: 'Modern BI means interactive, self-service platforms (e.g. Power BI, Tableau, Qlik) accessible to business users — not IT-generated Excel reports or legacy reporting tools that require developer intervention.',
    rubric: [
      'All reporting done manually in Excel or via custom scripts run by IT. No BI platform exists. Reporting is slow, error-prone, and not scalable.',
      'A BI tool exists but limited to 1-2 departments. No enterprise rollout. Business users cannot create their own reports without IT help.',
      'Modern BI platform deployed enterprise-wide. All business units have access. Self-service analytics available. Training program in place.',
      'BI platform adoption tracked as a KPI. Certified report library maintained. Usage metrics monitored. Governance framework for report management.',
      'AI-augmented analytics embedded in BI platform. Natural language queries available. Proactive insights pushed to decision-makers automatically.',
    ],
  },
  {
    id: 'D4.1-02',
    dim: 'D4',
    sub: '4.1',
    subName: 'Tool maturity',
    bct: false,
    q: 'What proportion of analytical needs are covered by current tools?',
    hint: 'Coverage means the percentage of analytical use cases (reports, dashboards, analyses) that can be fulfilled by current tools without custom development or manual workarounds.',
    rubric: [
      'Less than 25% of analytical needs met. Most analysis done manually. Business users routinely request data from IT or do their own calculations.',
      '25-50% of analytical needs covered. Significant gaps remain. Many business decisions rely on Excel files not integrated with any platform.',
      '50-75% of analytical needs covered by current tools. Key use cases supported. Gaps identified and on the roadmap.',
      '75-90% of needs covered. Self-service available for most use cases. Gaps are edge cases with documented workarounds.',
      'All analytical needs met with self-service capability. No manual workarounds. Business users fully autonomous for all standard analysis.',
    ],
  },
  {
    id: 'D4.1-03',
    dim: 'D4',
    sub: '4.1',
    subName: 'Tool maturity',
    bct: false,
    q: 'What is the level of data processing automation for key workflows?',
    hint: 'Automation means data preparation, transformation, and delivery happens without manual intervention. Key workflows include regulatory reporting, management dashboards, and risk calculations.',
    rubric: [
      'Fully manual data processing. All reports, transformations, and deliveries require human intervention. High error rate and slow delivery.',
      'Some automation exists for recurring tasks but the majority of key workflows still involve significant manual steps.',
      'Key processes automated end-to-end. Manual intervention only required for exception handling. Automation coverage documented.',
      'End-to-end automation for all critical workflows. Exceptions handled automatically. Automation rate tracked as a KPI.',
      'ML-driven intelligent automation. Workflows self-optimize based on usage patterns. Near-zero manual intervention for any standard process.',
    ],
  },
  {
    id: 'D4.1-04',
    dim: 'D4',
    sub: '4.1',
    subName: 'Tool maturity',
    bct: false,
    q: 'What is the AI/ML readiness level — infrastructure and skills baseline?',
    hint: 'AI/ML readiness means having the foundational elements: clean data at scale, a data science team, ML infrastructure (compute, MLOps platform), and at least one pilot use case in progress.',
    rubric: [
      'No plans for AI/ML. Leadership has no awareness of AI/ML applicability to banking data use cases. No skills, no infrastructure.',
      'Awareness exists at leadership level but no concrete action. No data science team, no infrastructure, no approved use cases.',
      'Pilot projects underway. At least one data science use case in production. Basic ML infrastructure in place. Small data science team hired.',
      'AI/ML in production for several use cases (e.g. fraud detection, credit scoring). MLOps platform deployed. Data science team scaled.',
      'AI/ML fully embedded in core banking processes. Real-time inference. Model monitoring automated. AI strategy aligned with business strategy.',
    ],
  },

  // 4.2 Data usage (4)
  {
    id: 'D4.2-01',
    dim: 'D4',
    sub: '4.2',
    subName: 'Data usage',
    bct: false,
    q: 'What proportion of strategic decisions are formally data-driven?',
    hint: 'Data-driven means decisions made based on documented analysis with traceable data sources — not intuition alone. Management committee decisions must formally reference data and this must be documented.',
    rubric: [
      'Strategic decisions made purely on intuition and experience. No data analysis required or referenced. No data in management committee meetings.',
      'Data occasionally referenced in decisions but not systematically. No requirement to document data sources. Intuition dominates (>60%).',
      'Formal requirement for data-backed decisions at management committee level. Decision templates include data source documentation.',
      'Data-driven decision rate tracked as a KPI (>70%). Decision outcomes measured against predictions. Feedback loop to improve data quality.',
      'All strategic decisions require data documentation. Decision quality scored retrospectively. Data-first culture fully embedded at all levels.',
    ],
  },
  {
    id: 'D4.2-02',
    dim: 'D4',
    sub: '4.2',
    subName: 'Data usage',
    bct: false,
    q: 'Is self-service analytics available for business units without IT involvement?',
    hint: 'Self-service means business users can create their own reports, explore data, and answer analytical questions using approved tools — without submitting requests to IT or the data team.',
    rubric: [
      'All reports go through IT. Business users have no direct data access. Analytics requests take days or weeks to fulfill.',
      'Limited self-service for one or two teams using shared Excel files or a basic BI tool. Most users still depend on IT.',
      'Self-service analytics available to key teams using the BI platform. Training provided. Users can create reports without IT for standard use cases.',
      'Broad self-service adoption across most business units. Data literacy training completed. IT only involved for complex or new data sources.',
      'Full data democratization. All business users can access, explore, and share data within governance guardrails. IT not needed for standard work.',
    ],
  },
  {
    id: 'D4.2-03',
    dim: 'D4',
    sub: '4.2',
    subName: 'Data usage',
    bct: false,
    q: 'What is the actual frequency of dashboard and report utilization?',
    hint: 'Utilization means dashboards are actively consulted by their intended users. Low utilization (reports produced but not read) indicates the analytics investment is not delivering value.',
    rubric: [
      'Dashboards and reports rarely accessed. Most are produced but not consulted. No data on usage. Analytics investment delivering no value.',
      'Monthly usage by a few champions. Most stakeholders do not use available dashboards. Reports produced for compliance, not decisions.',
      'Weekly usage by key teams and data owners. Dashboards consulted before major decisions. Usage tracked and reported.',
      'Daily usage by most business units. Dashboards embedded in operational workflows. Usage rate tracked as a KPI and optimized.',
      'Real-time analytics embedded in daily work. Dashboards consulted multiple times per day. Usage drives continuous improvement of reports.',
    ],
  },
  {
    id: 'D4.2-04',
    dim: 'D4',
    sub: '4.2',
    subName: 'Data usage',
    bct: true,
    q: 'Are regulatory reports to BCT fully automated with validation trails?',
    hint: 'BCT regulatory reports must be produced automatically from source data — not assembled manually. A complete validation trail (data source → calculation → output) must exist and be auditable.',
    rubric: [
      'All regulatory reports prepared fully manually. High error risk. No audit trail. Production takes several days before each deadline.',
      'Some steps partially automated (e.g. data extraction automated but calculations manual). No end-to-end automation. No validation trail.',
      'Key regulatory reports automated. Calculation logic documented. Validation trail available for audit. Manual review still required.',
      'All regulatory reports automated with full validation trails. Output reviewed automatically against prior periods. Anomalies flagged.',
      'Automated end-to-end with real-time validation. Reports generated and submitted automatically. Audit trail available instantly to BCT.',
    ],
  },

  // ═══════════════════════════════════════════════════
  // D5 — Skills & Culture (15%) — 8 indicators
  // ═══════════════════════════════════════════════════

  // 5.1 Data skills (proxy) (4)
  {
    id: 'D5.1-01',
    dim: 'D5',
    sub: '5.1',
    subName: 'Data skills (proxy)',
    bct: false,
    q: 'Do formal data training programs exist with an allocated annual budget? (Proxy)',
    hint: 'D5 uses proxy indicators only — direct self-assessment is not used. A formal program must have an approved budget line, a defined curriculum by role, and tracked participation rates.',
    rubric: [
      'No data training program. No budget. Staff learn data skills entirely informally or not at all. Skills gaps not identified or tracked.',
      'Occasional ad hoc training happens (conferences, online courses) but no formal program, no curriculum, and no dedicated budget line.',
      'Formal data training program with approved annual budget, defined curriculum by role, and tracked participation rates.',
      'Ongoing curriculum integrated with L&D function. Completion tracked as KPI. Skills assessed before and after. >80% completion rate.',
      'Data academy with certification paths. AI-personalized training. Skills fully mapped to roles and career progression. Benchmark target met.',
    ],
  },
  {
    id: 'D5.1-02',
    dim: 'D5',
    sub: '5.1',
    subName: 'Data skills (proxy)',
    bct: false,
    q: 'What is the ratio of data roles to total staff headcount? (Proxy)',
    hint: 'Data roles include data analysts, data engineers, data scientists, data stewards, and data architects. Headcount ratio is an objective proxy for organizational investment in data skills.',
    rubric: [
      'Data role ratio below 0.5%. Data capabilities almost entirely absent in the organizational structure. IT handles all data tasks ad hoc.',
      'Ratio between 0.5% and 1%. A few data roles exist but insufficient to drive data maturity across the organization.',
      'Ratio between 1% and 2%. Core data team established with key roles covered: analyst, engineer, steward. Team has CDO support.',
      'Ratio between 2% and 5%. Data team scaled to cover all domains. Specialized roles (data scientist, ML engineer) present.',
      'Ratio above 5%. Dedicated talent pipeline. Data roles embedded across all business units, not just central team.',
    ],
  },
  {
    id: 'D5.1-03',
    dim: 'D5',
    sub: '5.1',
    subName: 'Data skills (proxy)',
    bct: false,
    q: 'How many data certifications were obtained by staff in the past 12 months? (Proxy)',
    hint: 'Count only formal, recognized data certifications (CDMP, AWS Data, Azure Data, Google Data, Databricks, dbt, etc.) obtained in the last 12 months. This is an objective proxy for skills investment.',
    rubric: [
      'Zero certifications obtained in past 12 months. No organizational support for professional development in data disciplines.',
      '1 to 2 certifications obtained, typically self-funded. No formal certification support policy or reimbursement scheme.',
      '3 to 5 certifications obtained. Organization supports with reimbursement. Certification goal set for the data team.',
      '6 to 10 certifications obtained. Certification roadmap by role. Organization funds and tracks certifications as a KPI.',
      'More than 10 certifications annually. Dedicated certification budget. Role-specific paths. Certifications linked to career progression.',
    ],
  },
  {
    id: 'D5.1-04',
    dim: 'D5',
    sub: '5.1',
    subName: 'Data skills (proxy)',
    bct: false,
    q: 'How many data-specific roles were hired in the past 12 months? (Proxy)',
    hint: 'Count only roles explicitly defined as data roles (data analyst, data engineer, data scientist, CDO, data steward, data architect). General IT hires do not qualify.',
    rubric: [
      'No data-specific hires in past 12 months. Existing staff absorb all data tasks informally. No recognition of data as a distinct discipline.',
      '1 to 2 data-specific hires. Data roles starting to be recognized but not yet systematically prioritized in hiring plans.',
      '3 to 5 data-specific hires. Data team being actively built. Roles defined in job descriptions. Hiring manager trained.',
      '6 to 10 data hires. Dedicated data talent pipeline in place. Partnerships with universities. Time-to-fill below 60 days.',
      'More than 10 data hires annually. Data talent pipeline fully operational. Employer brand in data community recognized.',
    ],
  },

  // 5.2 Culture & adoption (proxy) (4)
  {
    id: 'D5.2-01',
    dim: 'D5',
    sub: '5.2',
    subName: 'Culture & adoption (proxy)',
    bct: false,
    q: 'Are active and documented data literacy initiatives running across the organization? (Proxy)',
    hint: 'Data literacy initiatives must be active (not planned), documented, and reaching staff at multiple levels — not just the data team. Examples: workshops, e-learning modules, data champion networks.',
    rubric: [
      'No data literacy initiatives exist. The concept of data literacy is not on the agenda. Staff have no formal exposure to data skills or thinking.',
      'One-off awareness session held (e.g. a single workshop or webinar) but no structured, recurring, or organization-wide program.',
      'Structured data literacy program exists and runs regularly. Multiple formats (workshops, e-learning). Reaches beyond the data team.',
      'Program reaches all staff levels from executives to operational staff. Completion tracked. Literacy assessed before and after.',
      'Data literacy embedded in onboarding. Continuous learning. Literacy scores tracked organization-wide. External benchmark achieved.',
    ],
  },
  {
    id: 'D5.2-02',
    dim: 'D5',
    sub: '5.2',
    subName: 'Culture & adoption (proxy)',
    bct: false,
    q: 'Is there an active data change management program? (Proxy)',
    hint: 'Data change management addresses the human side of data transformation — stakeholder communication, resistance management, behavioral change plans, and regular progress tracking.',
    rubric: [
      'No change management. Data initiatives imposed top-down with no stakeholder engagement. Resistance encountered but not addressed.',
      'Informal communication about data initiatives (emails, mentions in all-hands meetings) but no structured change management plan.',
      'Change management plan documented for all major data initiatives. Stakeholder mapping done. Communication cadence defined.',
      'Active change program running. Resistance tracked and managed. Progress measured. Feedback incorporated into initiative planning.',
      'Change management fully embedded in the operating model. Every data initiative includes a change plan. Culture metrics tracked quarterly.',
    ],
  },
  {
    id: 'D5.2-03',
    dim: 'D5',
    sub: '5.2',
    subName: 'Culture & adoption (proxy)',
    bct: false,
    q: 'What is the level of business unit involvement in data-related decisions? (Proxy)',
    hint: 'Business involvement means business units co-own data decisions — not just receive outputs from IT or the data team. Data champions in each business unit are an indicator of strong involvement.',
    rubric: [
      'Data seen as an IT problem. Business units have no involvement in data governance or quality decisions. No data champions exist.',
      'Occasional business input on specific issues but no systematic involvement. Data governance committees have no business representation.',
      'Business data champions formally designated per business unit. Business units participate in governance committee with voting rights.',
      'Business units co-own data initiatives. Champions active and trained. Business-driven data quality improvements tracked and reported.',
      'Business units drive the data agenda. Data ownership fully decentralized to business. IT plays a supporting role only.',
    ],
  },
  {
    id: 'D5.2-04',
    dim: 'D5',
    sub: '5.2',
    subName: 'Culture & adoption (proxy)',
    bct: false,
    q: 'Are internal data communities of practice operational? (Proxy)',
    hint: 'A community of practice is a group of practitioners who share knowledge, best practices, and learning on a regular basis. It must meet regularly, produce documented outputs, and be formally supported.',
    rubric: [
      'No data communities exist. Data practitioners work in complete isolation. No knowledge sharing mechanisms across the organization.',
      'Informal groups exist (e.g. a chat channel, occasional lunches) but no formal community, no meetings, no shared outputs.',
      'Formal community of practice with regular meetings (at least monthly), documented outputs, and organizational support.',
      'Active community producing shared assets (templates, playbooks, reusable code). Multiple communities by specialty (quality, governance, analytics).',
      'Multi-community ecosystem. Communities connected across departments and with external networks. Knowledge sharing drives measurable improvements.',
    ],
  },
];

// ── Live, mutable content the app reads from ────────────────────────────────
// These begin as deep copies of the bundled defaults. When an admin has edited
// the questionnaire in Supabase, hydrateContent() replaces their contents at
// boot. We mutate IN PLACE so any module that imported these bindings keeps
// seeing the current content without needing to re-import.
export const DIMENSIONS = structuredClone(DEFAULT_DIMENSIONS);
export const SUBDIM_NAMES = structuredClone(DEFAULT_SUBDIM_NAMES);
export const INDICATORS = structuredClone(DEFAULT_INDICATORS);

// Pristine bundled defaults — used to seed an empty database and as the
// always-available fallback when Supabase is unconfigured or unreachable.
export const DEFAULT_CONTENT = {
  dimensions: DEFAULT_DIMENSIONS,
  subDimNames: DEFAULT_SUBDIM_NAMES,
  indicators: DEFAULT_INDICATORS,
};

// Replace the live content in place from Supabase rows. Each dimension's
// ordered sub-dimension list and the sub-dimension name map are derived from
// the indicator rows, so only the two tables need to be persisted.
export function hydrateContent(dimRows, indRows) {
  const dims = [...dimRows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const inds = [...indRows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  INDICATORS.length = 0;
  inds.forEach(r => INDICATORS.push({
    id: r.id,
    dim: r.dim,
    sub: r.sub,
    subName: r.sub_name,
    bct: !!r.bct,
    q: r.q,
    hint: r.hint || '',
    rubric: Array.isArray(r.rubric) ? r.rubric : [],
  }));

  Object.keys(SUBDIM_NAMES).forEach(k => delete SUBDIM_NAMES[k]);
  inds.forEach(r => { if (r.sub && r.sub_name) SUBDIM_NAMES[r.sub] = r.sub_name; });

  Object.keys(DIMENSIONS).forEach(k => delete DIMENSIONS[k]);
  dims.forEach(d => {
    const subDims = [];
    inds.forEach(i => { if (i.dim === d.code && !subDims.includes(i.sub)) subDims.push(i.sub); });
    DIMENSIONS[d.code] = {
      name: d.name,
      weight: Number(d.weight) || 0,
      color: d.color,
      proxy: !!d.proxy,
      subDims,
    };
  });
}
