import type { ARLMilestone } from '../types/arlTypes'

// ARL Knowledge Pack - Complete milestone definitions based on NASA framework
export const ARL_MILESTONES: ARLMilestone[] = [
  // ARL 1-3: Discovery & Feasibility
  {
    level: 1,
    code: 'ARL1',
    title: 'Basic Research',
    description: 'Baseline science identified; ideas for how results could enhance decisions',
    acceptanceCriteria: [
      'Scientific foundation established',
      'Potential decision impact identified',
      'Research questions formulated'
    ],
    evidencePatterns: [
      'literature review', 'baseline study', 'research question',
      'scientific foundation', 'preliminary findings'
    ],
    actionTemplate: 'Provide literature review and research question formulation',
    required: true
  },
  {
    level: 2,
    code: 'ARL2',
    title: 'Application Concept',
    description: 'Decision activity to be enhanced identified; components of the application formulated',
    acceptanceCriteria: [
      'Decision process identified',
      'Application components defined',
      'Enhancement strategy outlined'
    ],
    evidencePatterns: [
      'decision process', 'application concept', 'component design',
      'enhancement strategy', 'use case'
    ],
    actionTemplate: 'Define decision process and application components',
    required: true
  },
  {
    level: 3,
    code: 'ARL3',
    title: 'Proof of Concept',
    description: 'Components tested independently; decision process characterized; viability case made',
    acceptanceCriteria: [
      'Components tested independently',
      'Decision process characterized',
      'Viability demonstrated'
    ],
    evidencePatterns: [
      'proof of concept', 'component testing', 'viability study',
      'feasibility analysis', 'pilot test'
    ],
    actionTemplate: 'Provide component testing results and viability analysis',
    required: true
  },

  // ARL 4-6: Development & Validation
  {
    level: 4,
    code: 'ARL4',
    title: 'Initial Integration',
    description: 'Components brought together; technical integration + org/process issues identified/managed',
    acceptanceCriteria: [
      'Components integrated',
      'Technical issues resolved',
      'Organizational issues identified'
    ],
    evidencePatterns: [
      'integration', 'technical issues', 'organizational challenges',
      'system architecture', 'interface design'
    ],
    actionTemplate: 'Document integration approach and organizational considerations',
    required: true
  },
  {
    level: 5,
    code: 'ARL5',
    title: 'Validation in Relevant Environment',
    description: 'Functioning prototype with realistic supports; projected performance gain articulated',
    acceptanceCriteria: [
      'Prototype demonstrated in relevant environment',
      'Support systems identified',
      'Performance metrics defined'
    ],
    evidencePatterns: [
      'beta test', 'pilot study', 'operational prototype',
      'support system', 'performance metrics', 'validation'
    ],
    actionTemplate: 'Provide validation results and support system documentation',
    required: true
  },
  {
    level: 6,
    code: 'ARL6',
    title: 'Demonstration in Relevant/Operational Environment',
    description: 'Beta-tested; improvements demonstrated in simulated operational context',
    acceptanceCriteria: [
      'Beta testing completed',
      'Improvements demonstrated',
      'Operational context validated'
    ],
    evidencePatterns: [
      'beta testing', 'operational demonstration', 'improvement results',
      'simulated environment', 'performance validation'
    ],
    actionTemplate: 'Provide beta testing results and operational demonstration',
    required: true
  },

  // ARL 7-9: Deployment & Sustained Use
  {
    level: 7,
    code: 'ARL7',
    title: 'Prototype in Partner Workflow',
    description: 'Integrated in end-user operations; functionality demonstrated live',
    acceptanceCriteria: [
      'Integrated in partner operations',
      'Live functionality demonstrated',
      'User acceptance confirmed'
    ],
    evidencePatterns: [
      'partner integration', 'live demonstration', 'operational use',
      'user acceptance', 'workflow integration'
    ],
    actionTemplate: 'Provide partner integration documentation and user acceptance',
    required: true
  },
  {
    level: 8,
    code: 'ARL8',
    title: 'Completed & Qualified',
    description: 'Final system approved/qualified by user; user/training docs complete',
    acceptanceCriteria: [
      'System approved by users',
      'Qualification completed',
      'Training documentation complete'
    ],
    evidencePatterns: [
      'user approval', 'system qualification', 'training documentation',
      'final approval', 'user manual'
    ],
    actionTemplate: 'Provide user approval and complete training documentation',
    required: true
  },
  {
    level: 9,
    code: 'ARL9',
    title: 'Sustained Operational Use',
    description: 'Repeated, successful use in real decisions',
    acceptanceCriteria: [
      'Repeated successful use',
      'Real decision impact',
      'Sustained operations'
    ],
    evidencePatterns: [
      'sustained use', 'repeated success', 'real decisions',
      'operational metrics', 'long-term impact'
    ],
    actionTemplate: 'Provide evidence of sustained use and real decision impact',
    required: true
  }
]

// STB Interview Questions (6 ultra-focused questions)
export const STB_QUESTIONS = [
  {
    id: 'decision_owner',
    question: 'Which decision will your work change, and who makes it?',
    maxWords: 20,
    schema: {
      fields: ['decision_type', 'decision_maker', 'impact_description'],
      required: ['decision_type', 'decision_maker']
    },
    evidenceMapping: 'ARL2',
    arlLevel: 2
  },
  {
    id: 'components_status',
    question: 'List core components and mark tested (Y/N) and integrated (Y/N).',
    maxWords: 50,
    schema: {
      fields: ['components', 'tested_status', 'integrated_status'],
      required: ['components', 'tested_status']
    },
    evidenceMapping: 'ARL3-4',
    arlLevel: 3
  },
  {
    id: 'validation_metric',
    question: 'Where did you test (simulated/relevant) and what metric changed (before→after, n=)?',
    maxWords: 30,
    schema: {
      fields: ['test_environment', 'metric_name', 'before_value', 'after_value', 'sample_size'],
      required: ['test_environment', 'metric_name']
    },
    evidenceMapping: 'ARL5-6',
    arlLevel: 5
  },
  {
    id: 'operational_embedding',
    question: 'Is it embedded in a partner\'s workflow? Where and how is it invoked?',
    maxWords: 25,
    schema: {
      fields: ['embedded_status', 'partner_name', 'invocation_method'],
      required: ['embedded_status']
    },
    evidenceMapping: 'ARL7',
    arlLevel: 7
  },
  {
    id: 'qualification_docs',
    question: 'Has a partner qualified/approved the final form? Which docs exist (SOP, training, manual)?',
    maxWords: 30,
    schema: {
      fields: ['qualified_status', 'approving_partner', 'existing_docs'],
      required: ['qualified_status']
    },
    evidenceMapping: 'ARL8',
    arlLevel: 8
  },
  {
    id: 'sustained_use',
    question: 'Evidence of sustained use (cadence, users, ops metric)? Give one stat.',
    maxWords: 25,
    schema: {
      fields: ['use_cadence', 'user_count', 'operational_metric'],
      required: ['use_cadence']
    },
    evidenceMapping: 'ARL9',
    arlLevel: 9
  }
]

// Benchmarking weights and criteria
export const BENCHMARK_WEIGHTS = {
  feasibility: 0.25,
  ethics: 0.20,
  budget: 0.20,
  novelty: 0.20,
  reproducibility: 0.15
}

// UAE/NMSS specific compliance requirements
export const COMPLIANCE_REQUIREMENTS = {
  mohap: [
    'MoHAP approval for human subjects research',
    'Local IRB approval',
    'Data privacy compliance'
  ],
  nmss: [
    'NMSS research priorities alignment',
    'MS-specific relevance',
    'Patient impact assessment'
  ],
  ethics: [
    'Informed consent procedures',
    'Vulnerable population protection',
    'Data management plan',
    'Conflict of interest disclosure'
  ]
}

// Evidence verification prompts
export const EVIDENCE_VERIFICATION_PROMPTS = {
  arl2: 'Find evidence of decision process identification and application concept formulation',
  arl3: 'Find evidence of component testing and viability demonstration',
  arl4: 'Find evidence of component integration and organizational issue management',
  arl5: 'Find evidence of validation in relevant environment with realistic supports',
  arl6: 'Find evidence of operational demonstration and improvement validation',
  arl7: 'Find evidence of partner workflow integration and live functionality',
  arl8: 'Find evidence of user qualification and training documentation',
  arl9: 'Find evidence of sustained operational use and real decision impact'
}
