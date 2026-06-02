export const RECOMMENDATIONS = {
  D1: {
    low: [
      'Formally approve a data strategy document at board level',
      'Appoint a CDO or equivalent with executive mandate',
      'Establish a Data Governance Committee with formal charter and meeting schedule',
    ],
    mid: [
      'Document data ownership for all critical domains',
      'Formalize the BCT Circulaire 2025-08 compliance roadmap with milestones and owners',
      'Integrate data governance objectives into the risk management framework',
    ],
    high: [
      'Implement annual data strategy review with KPI-linked targets',
      'Automate regulatory change monitoring and integrate into governance calendar',
      'Benchmark data governance practices against sector peers',
    ],
  },
  D2: {
    low: [
      'Define formal data quality dimensions for all critical data assets',
      'Establish a data quality incident management process with escalation rules',
      'Implement mandatory quality controls on all regulatory reporting data before submission',
    ],
    mid: [
      'Automate key data quality controls in critical pipelines',
      'Document end-to-end data lineage for all regulatory reporting data',
      'Define data quality SLAs for critical data products',
    ],
    high: [
      'Implement a centralized metadata repository with automated lineage harvesting',
      'Deploy real-time data quality dashboards for management',
      'Introduce predictive quality monitoring using anomaly detection',
    ],
  },
  D3: {
    low: [
      'Deploy a centralized data repository covering all major business lines',
      'Implement role-based access controls across all data systems',
      'Document all existing data pipelines with version control',
    ],
    mid: [
      'Integrate all major business lines into the centralized data platform',
      'Implement a Master Data Management solution for critical reference data',
      'Define and execute a data architecture roadmap aligned with digital transformation',
    ],
    high: [
      'Introduce real-time data feeds for critical operational and risk use cases',
      'Implement automated pipeline monitoring with SLA tracking and alerting',
      'Develop a cloud-ready data infrastructure strategy',
    ],
  },
  D4: {
    low: [
      'Deploy a formal BI platform accessible to all business users',
      'Establish a baseline of data-driven decision making with documented analysis processes',
      'Ensure risk models use validated and traceable data inputs',
    ],
    mid: [
      'Launch a self-service analytics capability with training for business users',
      'Integrate analytics tools with the core data infrastructure to eliminate manual extraction',
      'Implement ROI tracking for analytics investments',
    ],
    high: [
      'Deploy advanced analytics and machine learning in operational risk use cases',
      'Build a data product catalog for cross-functional insight sharing',
      'Implement automated model governance with continuous validation',
    ],
  },
  D5: {
    low: [
      'Launch a formal data literacy training program with a defined budget',
      'Include data quality KPIs in employee performance reviews',
      'Secure visible C-suite sponsorship for at least two data initiatives',
    ],
    mid: [
      'Track data-specific certifications and integrate into career development plans',
      'Establish communities of practice around data with structured governance',
      'Implement a formal change management program for data transformation',
    ],
    high: [
      'Measure data culture adoption with an annual survey or index',
      'Benchmark data skills ratio against sector peers',
      'Build a continuous learning ecosystem with external certification partnerships',
    ],
  },
};

export function getBand(score) {
  if (score === null || score === undefined) return 'low';
  if (score < 2.0) return 'low';
  if (score < 3.0) return 'mid';
  return 'high';
}

export function getBandLabel(score) {
  const band = getBand(score);
  if (band === 'low') return 'Critical';
  if (band === 'mid') return 'High';
  return 'Moderate';
}
