import type { FormData } from '../types/formTypes'

export interface ApplicationData extends FormData {
  id: string
  submissionDate: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  reviewScore?: number
  reviewerComments?: string[]
  priority: 'high' | 'medium' | 'low'
  estimatedDuration: string
  researchImpact: string
  budgetBreakdown: {
    personnel: number
    equipment: number
    supplies: number
    travel: number
    other: number
  }
  milestones: Array<{
    title: string
    dueDate: string
    status: 'pending' | 'completed' | 'overdue'
  }>
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
  complianceStatus: {
    irbApproved: boolean
    ethicsCompliant: boolean
    budgetJustified: boolean
    documentsComplete: boolean
  }
}

export const hardcodedApplications: ApplicationData[] = [
  {
    id: 'APP-2024-001',
    submissionDate: '2024-01-15',
    status: 'under_review',
    reviewScore: 94,
    priority: 'high',
    estimatedDuration: '3 years',
    researchImpact: 'High potential for breakthrough discoveries in MS etiology and prevention',
    
    // Applicant Information
    fullName: 'Dr. Alberto Ascherio',
    email: 'alberto.ascherio@hsph.harvard.edu',
    affiliation: 'Professor of Epidemiology and Nutrition, Harvard University',
    orcid: '0000-0002-1234-5678',
    hasPhD: true,
    hasMD: false,
    
    // Research Profile
    scopusId: '7004212771',
    googleScholarUrl: 'https://scholar.google.com/citations?user=ascherio_profile',
    previousSubmissions: 'Previous research on vitamin D and multiple sclerosis risk, Parkinson\'s disease epidemiology, and cardiovascular disease prevention through nutrition.',
    additionalProfileInfo: 'Recipient of the 2022 International Multiple Sclerosis Society Research Award for groundbreaking work on EBV-MS relationship. Director of the Harvard Neuroepidemiology Research Group. Principal Investigator on multiple NIH-funded longitudinal studies. Member of the World Health Organization Expert Panel on Neurological Disorders. Co-founder of the International MS Genetics Consortium. Published over 400 peer-reviewed articles with focus on environmental and genetic factors in neurological diseases.',
    
    // Proposal Submission
    proposalFile: new File([''], 'EBV_MS_Longitudinal_Study_Proposal.pdf', { type: 'application/pdf' }),
    proposalTitle: 'Longitudinal Analysis of Epstein-Barr Virus and Multiple Sclerosis Risk: A Population-Based Cohort Study',
    abstract: 'This study aims to investigate the longitudinal relationship between Epstein-Barr virus (EBV) infection and multiple sclerosis (MS) risk using a large population-based cohort. Building on our recent findings published in Science (2022) showing a strong association between EBV and MS, we propose to extend this research with a comprehensive longitudinal analysis of 50,000+ participants over 10 years. Our study will examine EBV seroconversion patterns, viral load dynamics, and their relationship to MS development, while controlling for genetic and environmental factors. This research has the potential to revolutionize our understanding of MS etiology and inform novel prevention strategies.',
    keywords: 'Epstein-Barr virus, Multiple sclerosis, Longitudinal study, Epidemiology, Neuroinflammation, Autoimmune disease, Population-based cohort',
    
    // Funding & Ethics
    fundingAmount: '500000',
    conflictOfInterest: 'No conflicts of interest. All authors have no financial relationships with pharmaceutical companies or other entities that could influence this research.',
    ethicsDocuments: new File([''], 'Harvard_IRB_Approval_EBV_MS_Longitudinal_Study_2024.pdf', { type: 'application/pdf' }),
    
    // AI-generated data
    aiSummary: 'Dr. Ascherio is a world-renowned epidemiologist with 189,679 citations and an h-index of 170. His research focuses on the epidemiology of neurological diseases, particularly multiple sclerosis and Parkinson\'s disease. He has published extensively on vitamin D, Epstein-Barr virus, and environmental factors in MS. His recent Science publication on EBV and MS has been cited over 2,000 times.',
    researchPriorities: ['Multiple Sclerosis', 'Epstein-Barr Virus', 'Epidemiology', 'Neuroinflammation', 'Environmental Factors'],
    autoKeywords: ['Epstein-Barr virus', 'Multiple sclerosis', 'Longitudinal study', 'Epidemiology', 'Neuroinflammation', 'Autoimmune disease', 'Population-based cohort', 'Vitamin D', 'Environmental factors'],
    
    // AI Analysis responses
    aiResponses: {
      'research_expertise': 'Dr. Ascherio demonstrates exceptional expertise in MS epidemiology with 170 h-index and extensive publication record in top-tier journals including Science, Nature, and NEJM.',
      'methodology_strength': 'Proposed longitudinal cohort study design is methodologically sound and builds on established epidemiological principles. Sample size of 50,000+ provides adequate statistical power.',
      'innovation_potential': 'This research addresses a critical gap in understanding EBV-MS relationship and has potential to identify novel prevention strategies.',
      'nmss_alignment': 'Highly aligned with NMSS research priorities focusing on MS etiology, prevention, and environmental factors.',
      'collaboration_opportunities': 'Strong potential for collaboration with existing NMSS-funded researchers and international MS research networks.'
    },
    
    // Additional reviewer data
    reviewerComments: [
      'Exceptional research track record with groundbreaking EBV-MS findings',
      'Methodologically sound longitudinal study design',
      'High potential for clinical translation and patient impact',
      'Strong international collaboration network',
      'Well-justified budget and timeline'
    ],
    
    budgetBreakdown: {
      personnel: 300000,
      equipment: 100000,
      supplies: 50000,
      travel: 30000,
      other: 20000
    },
    
    milestones: [
      {
        title: 'IRB Approval and Study Setup',
        dueDate: '2024-03-15',
        status: 'completed'
      },
      {
        title: 'Participant Recruitment Phase 1',
        dueDate: '2024-06-30',
        status: 'pending'
      },
      {
        title: 'Baseline Data Collection',
        dueDate: '2024-09-30',
        status: 'pending'
      },
      {
        title: 'First Year Follow-up',
        dueDate: '2025-09-30',
        status: 'pending'
      },
      {
        title: 'Interim Analysis',
        dueDate: '2026-03-31',
        status: 'pending'
      }
    ],
    
    riskAssessment: {
      level: 'low',
      factors: [
        'Large sample size requirements',
        'Long-term participant retention',
        'Complex data analysis needs'
      ],
      mitigation: [
        'Established recruitment networks',
        'Incentive programs for retention',
        'Expert statistical team'
      ]
    },
    
    complianceStatus: {
      irbApproved: true,
      ethicsCompliant: true,
      budgetJustified: true,
      documentsComplete: true
    }
  },
  
  // Additional applications for demo
  {
    id: 'APP-2024-002',
    submissionDate: '2024-01-20',
    status: 'submitted',
    reviewScore: 87,
    priority: 'medium',
    estimatedDuration: '2 years',
    researchImpact: 'Potential for significant advances in MS treatment optimization',
    
    fullName: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@uaeu.ac.ae',
    affiliation: 'Associate Professor of Neurology, UAE University',
    orcid: '0000-0003-4567-8901',
    hasPhD: true,
    hasMD: true,
    
    scopusId: '1234567890',
    googleScholarUrl: 'https://scholar.google.com/citations?user=sarah_johnson',
    previousSubmissions: 'Previous research on MS treatment outcomes in Middle Eastern populations.',
    additionalProfileInfo: 'Specialist in MS treatment optimization with focus on Middle Eastern patient populations. Published 25+ papers on MS treatment outcomes.',
    
    proposalFile: new File([''], 'MS_Treatment_Optimization_UAE_Study.pdf', { type: 'application/pdf' }),
    proposalTitle: 'Optimizing MS Treatment Outcomes in UAE Population: A Real-World Evidence Study',
    abstract: 'This study aims to evaluate the effectiveness of different MS treatments in the UAE population, considering genetic, environmental, and cultural factors unique to the region.',
    keywords: 'Multiple sclerosis, Treatment optimization, UAE population, Real-world evidence, Treatment outcomes',
    
    fundingAmount: '350000',
    conflictOfInterest: 'No conflicts of interest.',
    ethicsDocuments: new File([''], 'UAEU_IRB_Approval_MS_Treatment_Study.pdf', { type: 'application/pdf' }),
    
    aiSummary: 'Dr. Johnson is an experienced neurologist with expertise in MS treatment and Middle Eastern populations.',
    researchPriorities: ['MS Treatment', 'Population Studies', 'Real-world Evidence'],
    autoKeywords: ['MS treatment', 'UAE population', 'Treatment outcomes', 'Real-world evidence'],
    
    aiResponses: {
      'research_expertise': 'Strong clinical expertise in MS treatment with focus on regional populations.',
      'methodology_strength': 'Well-designed real-world evidence study with appropriate controls.',
      'innovation_potential': 'Addresses important gap in understanding MS treatment in Middle Eastern populations.',
      'nmss_alignment': 'Aligned with NMSS priorities for treatment optimization and population-specific research.',
      'collaboration_opportunities': 'Good potential for collaboration with local MS centers.'
    },
    
    reviewerComments: [
      'Strong clinical expertise and regional focus',
      'Well-designed real-world evidence study',
      'Important for understanding MS treatment in UAE',
      'Good collaboration potential with local centers'
    ],
    
    budgetBreakdown: {
      personnel: 200000,
      equipment: 80000,
      supplies: 30000,
      travel: 25000,
      other: 15000
    },
    
    milestones: [
      {
        title: 'Study Protocol Finalization',
        dueDate: '2024-02-28',
        status: 'completed'
      },
      {
        title: 'Patient Recruitment',
        dueDate: '2024-05-31',
        status: 'pending'
      },
      {
        title: 'Baseline Assessment',
        dueDate: '2024-08-31',
        status: 'pending'
      },
      {
        title: '6-Month Follow-up',
        dueDate: '2025-02-28',
        status: 'pending'
      }
    ],
    
    riskAssessment: {
      level: 'medium',
      factors: [
        'Patient recruitment challenges',
        'Treatment adherence monitoring',
        'Data quality control'
      ],
      mitigation: [
        'Multiple recruitment sites',
        'Patient engagement strategies',
        'Quality assurance protocols'
      ]
    },
    
    complianceStatus: {
      irbApproved: true,
      ethicsCompliant: true,
      budgetJustified: true,
      documentsComplete: true
    }
  }
]

export const getApplicationById = (id: string): ApplicationData | undefined => {
  return hardcodedApplications.find(app => app.id === id)
}

export const getApplicationsByStatus = (status: ApplicationData['status']): ApplicationData[] => {
  return hardcodedApplications.filter(app => app.status === status)
}

export const getApplicationsByPriority = (priority: ApplicationData['priority']): ApplicationData[] => {
  return hardcodedApplications.filter(app => app.priority === priority)
}
