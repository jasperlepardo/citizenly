import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import HouseholdFormWizard, { type HouseholdFormData } from './HouseholdFormWizard'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const meta = {
  title: 'Templates/HouseholdFormWizard',
  component: HouseholdFormWizard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive 4-step household registration form wizard for the RBI System. Features automatic household code generation, PSGC geographic integration, demographic composition tracking, economic data collection, and utilities assessment with complete validation and database integration.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background p-6">
            <Story />
          </div>
        </AuthProvider>
      </ThemeProvider>
    )
  ],
  tags: ['autodocs']
} satisfies Meta<typeof HouseholdFormWizard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Household form submitted:', data)
      alert('Household created successfully!')
    },
    onCancel: () => console.log('Household form cancelled')
  }
}

// Interactive form demonstration
const InteractiveComponent = () => {
  const [submittedData, setSubmittedData] = useState<HouseholdFormData | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (data: HouseholdFormData) => {
    console.log('Submitted household data:', data)
    setSubmittedData(data)
    setIsSubmitted(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Household registration submitted successfully!')
  }

  const handleReset = () => {
    setSubmittedData(null)
    setIsSubmitted(false)
  }

  if (isSubmitted && submittedData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">Household Created Successfully!</h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            The household has been successfully registered in the system with the following details:
          </p>
          
          <div className="bg-background rounded-lg border border-default p-4 mb-4">
            <h4 className="font-medium text-primary mb-3">Household Summary:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Household Code:</strong> {submittedData.householdCode}
              </div>
              <div>
                <strong>Household Type:</strong> {submittedData.householdType}
              </div>
              <div>
                <strong>Head of Household:</strong> {`${submittedData.headFirstName} ${submittedData.headMiddleName} ${submittedData.headLastName} ${submittedData.headExtensionName}`.trim()}
              </div>
              <div>
                <strong>Address:</strong> {submittedData.streetName}
              </div>
              <div>
                <strong>Total Members:</strong> {submittedData.totalMembers}
              </div>
              <div>
                <strong>Dwelling Type:</strong> {submittedData.dwellingType}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create Another Household
          </button>
        </div>
      </div>
    )
  }

  return <HouseholdFormWizard onSubmit={handleSubmit} />
}

export const Interactive: Story = {
  render: InteractiveComponent
}

// Form validation demonstration
export const ValidationDemo: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Form Validation Demo</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            This wizard includes step-by-step validation. Try proceeding without filling required fields to see the validation in action.
          </p>
          
          <div className="bg-background rounded-lg border border-default p-4 mt-4">
            <h4 className="font-medium text-primary mb-2">Validation Rules:</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Step 1: Household type and head of household name are required</li>
              <li>• Step 2: Street name is required for address</li>
              <li>• Step 3: Total members must equal sum of male and female members</li>
              <li>• Step 4: Dwelling type and ownership are required</li>
              <li>• Real-time validation feedback with error messages</li>
            </ul>
          </div>
        </div>
        
        <HouseholdFormWizard
          onSubmit={async (data) => {
            console.log('Validation demo submitted:', data)
            alert('All validation passed! Household created successfully.')
          }}
        />
      </div>
    )
  }
}

// Feature showcase
export const FeatureShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Household Form Wizard Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Automatic Code Generation</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Unique household code generation</li>
              <li>• Timestamp-based unique identifiers</li>
              <li>• Human-readable format</li>
              <li>• Database collision prevention</li>
              <li>• Audit trail integration</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Geographic Integration</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Auto-population from user barangay</li>
              <li>• PSGC code validation</li>
              <li>• Address hierarchy display</li>
              <li>• GPS coordinates support</li>
              <li>• Location-based services</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Demographics Tracking</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Total household members</li>
              <li>• Gender distribution tracking</li>
              <li>• Age group categorization</li>
              <li>• Household composition analysis</li>
              <li>• Population statistics support</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Economic Assessment</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Income range classification</li>
              <li>• Primary income source tracking</li>
              <li>• Utilities access assessment</li>
              <li>• Dwelling type and ownership</li>
              <li>• Socioeconomic profiling</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Data Integration</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This household wizard seamlessly integrates with the resident management system, 
            allowing for complete household-resident relationships and comprehensive demographic 
            analysis across the barangay system.
          </p>
        </div>
      </div>
      
      <HouseholdFormWizard
        onSubmit={async (data) => {
          console.log('Feature showcase submitted:', data)
          alert('Household created successfully!')
        }}
      />
    </div>
  )
}

// Step-by-step walkthrough
const StepWalkthroughComponent = () => {
  const [currentStep, setCurrentStep] = useState(1)
  
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Household details, automatic code generation, and head of household information.',
      features: [
        'Auto-generated unique household code',
        'Household type selection',
        'Head of household name fields',
        'Required field validation',
        'Code format standardization'
      ]
    },
    {
      id: 2,
      title: 'Location Details',
      description: 'Address information with PSGC integration and GPS coordinates.',
      features: [
        'Auto-populated barangay information',
        'Street address entry',
        'House number and subdivision',
        'Landmark reference points',
        'Optional GPS coordinates'
      ]
    },
    {
      id: 3,
      title: 'Household Composition',
      description: 'Member demographics and age group distribution.',
      features: [
        'Total household members',
        'Gender distribution tracking',
        'Age group categorization',
        'Member count validation',
        'Demographic consistency checks'
      ]
    },
    {
      id: 4,
      title: 'Economic & Utilities',
      description: 'Income assessment, utilities access, and dwelling information.',
      features: [
        'Monthly income range selection',
        'Primary income source tracking',
        'Utilities access checkboxes',
        'Dwelling type classification',
        'Ownership status documentation'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Household Form Steps Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                currentStep === step.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-default bg-surface hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step.id}
                </span>
                <span className="font-medium text-primary text-sm">{step.title}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="bg-surface rounded-lg border border-default p-6">
          <h4 className="font-semibold text-primary mb-2">
            Step {steps[currentStep - 1].id}: {steps[currentStep - 1].title}
          </h4>
          <p className="text-secondary mb-4">{steps[currentStep - 1].description}</p>
          
          <div>
            <h5 className="font-medium text-primary mb-2">Key Features:</h5>
            <ul className="text-sm text-secondary space-y-1">
              {steps[currentStep - 1].features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <HouseholdFormWizard
        onSubmit={async (data) => {
          console.log('Step walkthrough submitted:', data)
          alert('Household created successfully!')
        }}
      />
    </div>
  )
}

export const StepWalkthrough: Story = {
  render: StepWalkthroughComponent
}

// Data collection showcase
export const DataCollection: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Comprehensive Data Collection</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Household Identity</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Unique household codes</li>
              <li>• Household type classification</li>
              <li>• Head of household information</li>
              <li>• Family structure documentation</li>
              <li>• Relationship mapping</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Geographic Data</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• PSGC-compliant addressing</li>
              <li>• GPS coordinate tracking</li>
              <li>• Address hierarchy validation</li>
              <li>• Location-based services</li>
              <li>• Spatial data integration</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Socioeconomic Profile</h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Income range assessment</li>
              <li>• Employment sector tracking</li>
              <li>• Utilities access mapping</li>
              <li>• Housing conditions analysis</li>
              <li>• Economic status indicators</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Statistical Analysis Support</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The collected household data enables comprehensive barangay-level statistics including 
            population density analysis, economic indicators, infrastructure needs assessment, 
            and social service planning. All data follows standardized classification systems 
            for compatibility with national statistics frameworks.
          </p>
        </div>
      </div>
      
      <HouseholdFormWizard
        onSubmit={async (data) => {
          console.log('Data collection demo submitted:', data)
          alert('Comprehensive household data collected successfully!')
        }}
      />
    </div>
  )
}

// Form state management demo
const StateManagementComponent = () => {
  const [formStates, setFormStates] = useState<string[]>([])
  const [currentData, setCurrentData] = useState<Partial<HouseholdFormData>>({})

  const logFormState = (action: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString()
    setFormStates(prev => [...prev.slice(-4), `${timestamp}: ${action}`])
    if (data) {
      setCurrentData(data)
    }
  }

  const mockDataUpdate = (field: keyof HouseholdFormData, value: any) => {
    const newData = { ...currentData, [field]: value }
    setCurrentData(newData)
    logFormState(`Updated ${field}`)
  }

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Household Form State Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Recent Form Actions:</h4>
            {formStates.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded p-3">
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 font-mono">
                  {formStates.map((state, index) => (
                    <li key={index}>• {state}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-secondary">No actions logged yet. Start filling the form to see state changes.</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Current Household Data:</h4>
            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded p-3">
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <div>
                  <strong>Household Code:</strong> {currentData.householdCode || 'Not generated'}
                </div>
                <div>
                  <strong>Household Type:</strong> {currentData.householdType || 'Not selected'}
                </div>
                <div>
                  <strong>Head Name:</strong> {currentData.headFirstName ? `${currentData.headFirstName} ${currentData.headLastName || ''}`.trim() : 'Not provided'}
                </div>
                <div>
                  <strong>Street:</strong> {currentData.streetName || 'Not provided'}
                </div>
                <div>
                  <strong>Total Members:</strong> {currentData.totalMembers || 1}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => mockDataUpdate('householdCode', 'HH-' + Date.now().toString(36).toUpperCase())}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Generate Code
          </button>
          <button
            onClick={() => mockDataUpdate('headFirstName', 'Juan')}
            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Set Head Name
          </button>
          <button
            onClick={() => setFormStates([])}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Log
          </button>
        </div>
      </div>
      
      <HouseholdFormWizard
        onSubmit={async (data) => {
          logFormState('Form submitted', data)
          alert('Household form submitted successfully!')
        }}
        onCancel={() => logFormState('Form cancelled')}
      />
    </div>
  )
}

export const StateManagement: Story = {
  render: StateManagementComponent
}

// Code generation showcase
const CodeGenerationComponent = () => {
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

  const generateSampleCode = () => {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    const newCode = `HH-${timestamp}-${randomStr}`.toUpperCase()
    setGeneratedCodes(prev => [...prev.slice(-9), newCode])
  }

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Household Code Generation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Code Format:</h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
              <div className="font-mono text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                HH-&#123;timestamp&#125;-&#123;random&#125;
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>HH:</strong> Household prefix</li>
                <li>• <strong>&#123;timestamp&#125;:</strong> Base-36 timestamp</li>
                <li>• <strong>&#123;random&#125;:</strong> 6-character random string</li>
                <li>• Ensures uniqueness and traceability</li>
                <li>• Human-readable format</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Sample Generated Codes:</h4>
            <div className="space-y-2 mb-4">
              <button
                onClick={generateSampleCode}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Generate Sample Code
              </button>
            </div>
            
            {generatedCodes.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded p-3 max-h-32 overflow-y-auto">
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 font-mono">
                  {generatedCodes.map((code, index) => (
                    <li key={index}>• {code}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Code Benefits</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Each household receives a unique, automatically generated code that ensures proper identification 
            and traceability throughout the system. The codes are designed to be collision-resistant and 
            provide audit trail capabilities for household management and resident assignment.
          </p>
        </div>
      </div>
      
      <HouseholdFormWizard
        onSubmit={async (data) => {
          console.log('Code generation demo submitted:', data)
          alert(`Household created with code: ${data.householdCode}`)
        }}
      />
    </div>
  )
}

export const CodeGeneration: Story = {
  render: CodeGenerationComponent
}