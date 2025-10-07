interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  onStepClick: (step: number) => void
}

const ProgressIndicator = ({
  currentStep,
  onStepClick
}: ProgressIndicatorProps) => {
  const steps = [
    { number: 1, title: 'Applicant Info', description: 'Personal information' },
    { number: 2, title: 'Research Profile', description: 'Academic background' },
    { number: 3, title: 'Proposal', description: 'Research proposal' },
    { number: 4, title: 'Funding & Ethics', description: 'Financial and ethical considerations' },
    { number: 5, title: 'AI Analysis', description: 'AI review and clarification' },
    { number: 6, title: 'Review & Submit', description: 'Final review and submission' }
  ]

  return (
    <div className="form-steps">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`step ${
            step.number === currentStep 
              ? 'active' 
              : step.number < currentStep 
                ? 'completed' 
                : ''
          }`}
          onClick={() => onStepClick(step.number)}
          style={{ cursor: 'pointer' }}
        >
          <div className="step-number">
            {step.number < currentStep ? '✓' : step.number}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{step.title}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProgressIndicator
