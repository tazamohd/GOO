export interface Agent {
  id: string
  name: string
  role: string
  skill: string
  children?: Agent[]
}

export interface Department {
  id: string
  name: string
  icon: string
  color: string
  mission: string
  agents: Agent[]
}

export const companyBrain = {
  name: 'Company Brain',
  mission:
    'The shared knowledge base every department pulls from: company context, past decisions, customer history, and playbooks.',
}

export const departments: Department[] = [
  {
    id: 'sales',
    name: 'Sales',
    icon: '🎯',
    color: '#f97066',
    mission: 'Fill the pipeline with qualified prospects.',
    agents: [
      { id: 'sales-icp', name: 'ICP Definition', role: 'Defines and refines the ideal customer profile', skill: 'Analyze closed-won deals and firmographic data to produce (or update) a written ideal-customer-profile brief: industry, size, buying triggers, disqualifiers.' },
      { id: 'sales-sourcing', name: 'Lead Sourcing', role: 'Finds companies and contacts matching the ICP', skill: 'Query a prospect database against the current ICP and return a de-duplicated list of target accounts and contacts.' },
      { id: 'sales-enrichment', name: 'Enrichment', role: 'Adds firmographic and contact detail to raw leads', skill: 'Take a list of leads and fill in missing fields (title, company size, tech stack, recent news) from available sources.' },
      { id: 'sales-coldemail', name: 'Cold Email', role: 'Drafts first-touch outbound copy', skill: 'Write a personalized first-touch email per lead, referencing one specific, verifiable detail about their company.' },
      { id: 'sales-sequencing', name: 'Sequencing', role: 'Builds multi-step outbound cadences', skill: 'Turn a single email draft into a 4-6 touch multi-channel sequence with timing and branching on reply/no-reply.' },
      { id: 'sales-callprep', name: 'Call Prep', role: 'Prepares briefs before a sales call', skill: 'Summarize a prospect’s company, recent activity, and likely objections into a one-page call brief.' },
    ],
  },
  {
    id: 'deals',
    name: 'Deals',
    icon: '🤝',
    color: '#f79009',
    mission: 'Move qualified conversations to signed contracts.',
    agents: [
      { id: 'deals-triage', name: 'Reply Triage', role: 'Classifies inbound replies and routes them', skill: 'Read an inbound reply and classify it (interested, objection, out-of-office, not-now, unsubscribe) and draft the next action.' },
      { id: 'deals-booking', name: 'Meeting Booking', role: 'Coordinates scheduling with prospects', skill: 'Given a prospect’s availability and calendar constraints, propose times and draft the confirmation message.' },
      { id: 'deals-proposal', name: 'Proposal Writing', role: 'Drafts pricing and scope proposals', skill: 'Generate a proposal document from a discovery-call summary: scope, pricing tiers, timeline, and next steps.' },
      { id: 'deals-debrief', name: 'Deal Debriefs', role: 'Summarizes won/lost deals for learning', skill: 'Summarize a closed deal’s timeline, key objections, and outcome into a structured debrief for the team.' },
      { id: 'deals-pipeline', name: 'Pipeline Reporting', role: 'Rolls up pipeline health for leadership', skill: 'Aggregate open deals by stage, age, and value into a weekly pipeline health report with flagged at-risk deals.' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '🎬',
    color: '#7a5af8',
    mission: 'Create and distribute content that builds demand.',
    agents: [
      { id: 'mkt-perf', name: 'Performance Analysis', role: 'Analyzes what content is working', skill: 'Pull engagement metrics across channels and identify top/bottom performing content with a hypothesis for why.' },
      { id: 'mkt-script', name: 'Scriptwriting', role: 'Writes scripts for video/audio content', skill: 'Turn a content brief into a timed script with hook, body, and call-to-action tailored to the platform.' },
      { id: 'mkt-carousel', name: 'Carousels', role: 'Designs slide-based social posts', skill: 'Convert a long-form idea into a slide-by-slide carousel outline with copy per slide.' },
      { id: 'mkt-repurpose', name: 'Repurposing', role: 'Adapts one asset into many formats', skill: 'Take one piece of long-form content and produce derivative snippets sized for each target channel.' },
      { id: 'mkt-distribution', name: 'Distribution', role: 'Schedules and publishes across channels', skill: 'Given a content calendar, produce channel-specific posting copy and a publishing schedule.' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: '⚙️',
    color: '#12b76a',
    mission: 'Keep delivery running smoothly for every client.',
    agents: [
      { id: 'ops-onboarding', name: 'Client Onboarding', role: 'Guides new clients through setup', skill: 'Generate a personalized onboarding checklist and kickoff message from a new client’s contract details.' },
      { id: 'ops-integrations', name: 'Integrations', role: 'Connects client systems and tools', skill: 'Diagnose why a third-party integration is failing using logs and config, and propose the fix.' },
      { id: 'ops-qa', name: 'QA', role: 'Tests deliverables before handoff', skill: 'Run a deliverable against a QA checklist and produce a pass/fail report with specific defects.' },
      { id: 'ops-status', name: 'Status Reporting', role: 'Summarizes project status for stakeholders', skill: 'Compile task tracker data into a client-facing weekly status update: done, in-progress, blocked.' },
      { id: 'ops-incident', name: 'Incident Response', role: 'Coordinates response to production issues', skill: 'Draft an incident summary and next-step plan from raw error logs and timestamps.' },
    ],
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    icon: '🔭',
    color: '#0ba5ec',
    mission: 'Keep the company informed on markets and competitors.',
    agents: [
      { id: 'intel-research', name: 'Company Research', role: 'Builds dossiers on target companies', skill: 'Compile a structured dossier on a company: business model, leadership, funding, recent news.' },
      { id: 'intel-competitive', name: 'Competitive Intel', role: 'Tracks competitor moves', skill: 'Compare a competitor’s public pricing, features, and messaging against ours and flag material changes.' },
      { id: 'intel-market', name: 'Market Mapping', role: 'Maps the competitive landscape', skill: 'Group known players in a market into a positioning map by segment and differentiator.' },
      { id: 'intel-signal', name: 'Signal Monitoring', role: 'Watches for buying-intent signals', skill: 'Scan news/job-postings/social activity for signals that a target account is ready to buy, and flag them.' },
    ],
  },
  {
    id: 'customer',
    name: 'Customer',
    icon: '💬',
    color: '#ee46bc',
    mission: 'Keep existing customers successful and retained.',
    agents: [
      { id: 'cust-deflection', name: 'Support Deflection', role: 'Resolves common tickets automatically', skill: 'Answer an inbound support ticket using the knowledge base, or route it to a human if outside scope.' },
      { id: 'cust-health', name: 'Health Scoring', role: 'Scores account health from usage data', skill: 'Compute a health score per account from usage, support volume, and NPS, and explain the top drivers.' },
      { id: 'cust-churn', name: 'Churn Prediction', role: 'Flags accounts at risk of churning', skill: 'Identify accounts with declining engagement matching past-churn patterns and draft a save-play recommendation.' },
      { id: 'cust-community', name: 'Community', role: 'Manages community engagement', skill: 'Draft responses to community posts and surface recurring themes worth escalating to product.' },
    ],
  },
  {
    id: 'backoffice',
    name: 'Back Office',
    icon: '💰',
    color: '#667085',
    mission: 'Keep the financial and legal engine running.',
    agents: [
      { id: 'bo-invoicing', name: 'Invoicing', role: 'Generates and tracks invoices', skill: 'Generate an invoice from a signed contract and usage data, and flag any overdue accounts.' },
      { id: 'bo-financial', name: 'Financial Reporting', role: 'Produces recurring financial reports', skill: 'Compile revenue, expenses, and runway into a monthly financial summary for leadership.' },
      { id: 'bo-contracts', name: 'Contracts', role: 'Drafts and reviews contracts', skill: 'Draft a contract from a deal’s agreed terms, or redline an incoming contract against our standard paper.' },
      { id: 'bo-cashflow', name: 'Cash-Flow Forecasting', role: 'Projects future cash position', skill: 'Project 90-day cash flow from committed revenue, receivables, and recurring expenses.' },
    ],
  },
]
