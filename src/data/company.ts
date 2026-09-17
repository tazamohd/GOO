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
      { id: 'sales-scoring', name: 'Lead Scoring', role: 'Ranks leads by likelihood to convert', skill: 'Score each lead against firmographic and engagement signals from past won deals, and rank the queue.' },
      { id: 'sales-linkedin', name: 'LinkedIn Outreach', role: 'Drafts social-selling touches', skill: 'Write a connection request and follow-up DM sequence for a prospect based on their recent posts and role.' },
      { id: 'sales-objections', name: 'Objection Handling', role: 'Preps responses to common objections', skill: 'Given a prospect’s stated concern, draft two response angles backed by proof points and case studies.' },
      { id: 'sales-territory', name: 'Territory Planning', role: 'Allocates accounts across reps', skill: 'Split a target account list across reps by capacity, geography, and past performance, and flag imbalances.' },
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
      { id: 'deals-redline', name: 'Contract Redlining', role: 'Reviews incoming contract edits', skill: 'Compare a prospect’s redlined contract against our standard paper and flag clauses that need legal review.' },
      { id: 'deals-discount', name: 'Discount Approval', role: 'Routes and justifies discount requests', skill: 'Given a requested discount and deal context, check it against approval thresholds and draft the justification.' },
      { id: 'deals-champion', name: 'Champion Mapping', role: 'Tracks buying-committee influence', skill: 'From call notes and email threads, map the buying committee’s roles (champion, blocker, economic buyer).' },
      { id: 'deals-renewal', name: 'Renewal Forecasting', role: 'Projects upcoming renewal outcomes', skill: 'Score upcoming renewals by usage trend and engagement, and forecast likely outcome with a save-play if at risk.' },
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
      { id: 'mkt-seo', name: 'SEO Research', role: 'Finds keyword and content-gap opportunities', skill: 'Analyze search volume and competitor rankings for a topic cluster and recommend which pieces to write first.' },
      { id: 'mkt-newsletter', name: 'Newsletter Writing', role: 'Drafts the recurring email newsletter', skill: 'Compile the week’s top updates and content into a newsletter draft with subject line options.' },
      { id: 'mkt-adcopy', name: 'Ad Copy Testing', role: 'Generates and ranks ad copy variants', skill: 'Produce multiple ad copy variants for a campaign brief and predict which angles are likeliest to perform.' },
      { id: 'mkt-voiceqa', name: 'Brand Voice QA', role: 'Checks content against brand guidelines', skill: 'Review a piece of content against the brand voice guide and flag tone, terminology, or style violations.' },
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
      { id: 'ops-scheduling', name: 'Resource Scheduling', role: 'Allocates staff time across projects', skill: 'Given project deadlines and team capacity, propose a staffing schedule and flag overallocations.' },
      { id: 'ops-vendor', name: 'Vendor Management', role: 'Tracks vendor contracts and performance', skill: 'Review vendor SLAs against actual performance data and flag renewals that need renegotiation.' },
      { id: 'ops-sop', name: 'SOP Documentation', role: 'Turns team processes into written SOPs', skill: 'Interview a process owner (or read a task log) and produce a step-by-step standard operating procedure.' },
      { id: 'ops-capacity', name: 'Capacity Planning', role: 'Forecasts delivery capacity needs', skill: 'Project upcoming workload against current headcount and flag when hiring or reprioritization is needed.' },
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
      { id: 'intel-pricing', name: 'Pricing Benchmarking', role: 'Tracks how competitors price and package', skill: 'Compile competitor pricing pages and packaging tiers into a benchmark table and flag notable shifts.' },
      { id: 'intel-techwatch', name: 'Tech Watch', role: 'Monitors emerging tools and platform shifts', skill: 'Scan releases, patents, and technical blogs in the space and summarize developments relevant to our roadmap.' },
      { id: 'intel-regulatory', name: 'Regulatory Tracking', role: 'Watches for relevant regulatory change', skill: 'Monitor regulatory and compliance news in our markets and summarize what changed and who it affects.' },
      { id: 'intel-winloss', name: 'Win/Loss Analysis', role: 'Analyzes why deals were won or lost', skill: 'Aggregate closed deal debriefs into a win/loss report identifying recurring themes by competitor and segment.' },
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
      { id: 'cust-checkins', name: 'Onboarding Check-ins', role: 'Runs milestone check-ins for new customers', skill: 'Compare a new customer’s usage against onboarding milestones and draft a check-in message for gaps.' },
      { id: 'cust-nps', name: 'NPS Survey Analysis', role: 'Analyzes survey responses for themes', skill: 'Cluster open-ended NPS responses into themes, quantify each, and flag detractors needing follow-up.' },
      { id: 'cust-upsell', name: 'Upsell Signals', role: 'Flags accounts ready for expansion', skill: 'Identify accounts hitting usage limits or adjacent needs and draft an expansion talking point for the CSM.' },
      { id: 'cust-renewal', name: 'Renewal Reminders', role: 'Coordinates renewal-cycle communications', skill: 'Generate a renewal timeline and reminder sequence for an account based on its contract end date.' },
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
      { id: 'bo-expenses', name: 'Expense Approval', role: 'Reviews and routes expense reports', skill: 'Check submitted expenses against policy limits and receipts, auto-approve compliant ones, and flag exceptions.' },
      { id: 'bo-payroll', name: 'Payroll Prep', role: 'Assembles payroll inputs each cycle', skill: 'Compile hours, bonuses, and changes since last cycle into a payroll input sheet for review before submission.' },
      { id: 'bo-vendorpay', name: 'Vendor Payments', role: 'Tracks and schedules vendor payments', skill: 'Match incoming vendor invoices to POs, flag discrepancies, and schedule approved payments by due date.' },
      { id: 'bo-tax', name: 'Tax Prep Support', role: 'Organizes documentation for tax filings', skill: 'Assemble and categorize the quarter’s financial records into the document set the accountant needs for filing.' },
    ],
  },
]
