import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PhysicalCharacteristics, PhysicalCharacteristicsData } from './PhysicalCharacteristics';

const meta = {
  title: 'Organisms/Form/Resident/PhysicalPersonalDetails/FormField/PhysicalCharacteristics',
  component: PhysicalCharacteristics,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive form section for collecting physical characteristics including blood type, complexion, height, weight, citizenship, ethnicity, and religion. Features conditional fields for religion specification.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current form values for physical characteristics',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when any field value changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for each field',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof PhysicalCharacteristics>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const emptyData: PhysicalCharacteristicsData = {
  bloodType: '',
  complexion: '',
  height: '',
  weight: '',
  citizenship: '',
  ethnicity: '',
  religion: '',
  religionOthersSpecify: '',
};

// Sample complete data
const sampleData: PhysicalCharacteristicsData = {
  bloodType: 'o_positive',
  complexion: 'Medium',
  height: '170',
  weight: '65',
  citizenship: 'Filipino',
  ethnicity: 'tagalog',
  religion: 'roman_catholic',
  religionOthersSpecify: '',
};

// Sample data with custom religion
const customReligionData: PhysicalCharacteristicsData = {
  bloodType: 'a_positive',
  complexion: 'Fair',
  height: '165',
  weight: '55',
  citizenship: 'Filipino',
  ethnicity: 'cebuano',
  religion: 'others',
  religionOthersSpecify: 'Buddhist',
};

// Basic Examples
export const Default: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
  },
};

export const WithSampleData: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form filled with sample physical characteristics data.',
      },
    },
  },
};

export const WithCustomReligion: Story = {
  args: {
    value: customReligionData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing conditional religion specification field when "Others" is selected.',
      },
    },
  },
};

// Validation Examples
export const WithValidationErrors: Story = {
  args: {
    value: {
      bloodType: '',
      complexion: '',
      height: 'invalid',
      weight: '-5',
      citizenship: '',
      ethnicity: '',
      religion: 'others',
      religionOthersSpecify: '',
    },
    onChange: () => {},
    errors: {
      bloodType: 'Please select a blood type',
      complexion: 'Complexion is required',
      height: 'Please enter a valid height in centimeters',
      weight: 'Weight must be a positive number',
      citizenship: 'Citizenship is required',
      ethnicity: 'Please select an ethnicity',
      religionOthersSpecify: 'Please specify the religion',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing various validation errors for different field types.',
      },
    },
  },
};

export const PartiallyFilled: Story = {
  args: {
    value: {
      bloodType: 'b_positive',
      complexion: 'Dark',
      height: '175',
      weight: '',
      citizenship: 'Filipino',
      ethnicity: '',
      religion: '',
      religionOthersSpecify: '',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with some fields filled, demonstrating progressive data entry.',
      },
    },
  },
};

// Different Blood Types
export const DifferentBloodTypes: Story = {
  render: () => {
    const [currentType, setCurrentType] = useState(0);
    
    const bloodTypeExamples = [
      { type: 'a_positive', label: 'A+' },
      { type: 'a_negative', label: 'A-' },
      { type: 'b_positive', label: 'B+' },
      { type: 'b_negative', label: 'B-' },
      { type: 'ab_positive', label: 'AB+' },
      { type: 'ab_negative', label: 'AB-' },
      { type: 'o_positive', label: 'O+' },
      { type: 'o_negative', label: 'O-' },
    ];

    const currentExample = bloodTypeExamples[currentType];
    const currentData = {
      ...sampleData,
      bloodType: currentExample.type,
    };

    return (
      <div className="space-y-6">
        <PhysicalCharacteristics
          value={currentData}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {bloodTypeExamples.map((example, index) => (
              <button
                key={example.type}
                onClick={() => setCurrentType(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentType === index
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Current Blood Type: {currentExample.label}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of different blood type selections.',
      },
    },
  },
};

// Different Ethnicities
export const DifferentEthnicities: Story = {
  render: () => {
    const [currentEthnicity, setCurrentEthnicity] = useState(0);
    
    const ethnicityExamples = [
      { value: 'tagalog', label: 'Tagalog' },
      { value: 'cebuano', label: 'Cebuano' },
      { value: 'ilocano', label: 'Ilocano' },
      { value: 'bisaya', label: 'Bisaya' },
      { value: 'kapampangan', label: 'Kapampangan' },
      { value: 'pangasinan', label: 'Pangasinan' },
      { value: 'bikol', label: 'Bikol' },
      { value: 'waray', label: 'Waray' },
    ];

    const currentExample = ethnicityExamples[currentEthnicity];
    const currentData = {
      ...sampleData,
      ethnicity: currentExample.value,
    };

    return (
      <div className="space-y-6">
        <PhysicalCharacteristics
          value={currentData}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ethnicityExamples.map((example, index) => (
              <button
                key={example.value}
                onClick={() => setCurrentEthnicity(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentEthnicity === index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Current Ethnicity: {currentExample.label}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of different ethnicity selections.',
      },
    },
  },
};

// Physical Measurements Examples
export const PhysicalMeasurements: Story = {
  render: () => {
    const [currentProfile, setCurrentProfile] = useState(0);
    
    const profiles = [
      {
        name: 'Average Adult Male',
        data: { ...sampleData, height: '175', weight: '70', complexion: 'Medium' },
      },
      {
        name: 'Average Adult Female',
        data: { ...sampleData, height: '160', weight: '55', complexion: 'Fair' },
      },
      {
        name: 'Tall Person',
        data: { ...sampleData, height: '190', weight: '85', complexion: 'Dark' },
      },
      {
        name: 'Petite Person',
        data: { ...sampleData, height: '150', weight: '45', complexion: 'Fair' },
      },
      {
        name: 'Athletic Build',
        data: { ...sampleData, height: '180', weight: '80', complexion: 'Medium' },
      },
    ];

    const currentData = profiles[currentProfile];

    return (
      <div className="space-y-6">
        <PhysicalCharacteristics
          value={currentData.data}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profiles.map((profile, index) => (
              <button
                key={profile.name}
                onClick={() => setCurrentProfile(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentProfile === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
          
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">Current Profile: {currentData.name}</h4>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div><strong>Height:</strong> {currentData.data.height} cm</div>
              <div><strong>Weight:</strong> {currentData.data.weight} kg</div>
              <div><strong>Complexion:</strong> {currentData.data.complexion}</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different physical measurement profiles for various body types.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<PhysicalCharacteristicsData>(emptyData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (newValue: PhysicalCharacteristicsData) => {
      setValue(newValue);
      
      // Clear errors for fields that now have values
      const newErrors = { ...errors };
      Object.keys(newValue).forEach(key => {
        const field = key as keyof PhysicalCharacteristicsData;
        if (newValue[field] && errors[field]) {
          delete newErrors[field];
        }
      });
      setErrors(newErrors);
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};
      
      if (!value.bloodType) {
        newErrors.bloodType = 'Please select a blood type';
      }
      
      if (!value.complexion.trim()) {
        newErrors.complexion = 'Complexion is required';
      }
      
      if (value.height && (isNaN(Number(value.height)) || Number(value.height) <= 0)) {
        newErrors.height = 'Please enter a valid height';
      }
      
      if (value.weight && (isNaN(Number(value.weight)) || Number(value.weight) <= 0)) {
        newErrors.weight = 'Please enter a valid weight';
      }
      
      if (!value.citizenship.trim()) {
        newErrors.citizenship = 'Citizenship is required';
      }
      
      if (value.religion === 'others' && !value.religionOthersSpecify.trim()) {
        newErrors.religionOthersSpecify = 'Please specify the religion';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const fillSampleData = () => {
      setValue(sampleData);
      setErrors({});
    };

    const fillCustomReligion = () => {
      setValue(customReligionData);
      setErrors({});
    };

    const reset = () => {
      setValue(emptyData);
      setErrors({});
    };

    return (
      <div className="space-y-6">
        <PhysicalCharacteristics
          value={value}
          onChange={handleChange}
          errors={errors}
        />
        
        <div className="flex space-x-4">
          <button
            onClick={validate}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Validate
          </button>
          <button
            onClick={fillSampleData}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Fill Sample
          </button>
          <button
            onClick={fillCustomReligion}
            className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Custom Religion
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="rounded bg-gray-100 p-4">
          <h4 className="font-medium">Current Values:</h4>
          <pre className="mt-2 text-sm">{JSON.stringify(value, null, 2)}</pre>
        </div>
        
        {Object.keys(errors).length > 0 && (
          <div className="rounded bg-red-100 p-4">
            <h4 className="font-medium text-red-800">Validation Errors:</h4>
            <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form with real-time validation and different data scenarios.',
      },
    },
  },
};

// BMI Calculator Example
export const BMICalculator: Story = {
  render: () => {
    const [value, setValue] = useState<PhysicalCharacteristicsData>({
      ...emptyData,
      height: '170',
      weight: '65',
    });

    const calculateBMI = () => {
      const height = Number(value.height);
      const weight = Number(value.weight);
      
      if (height > 0 && weight > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        return bmi.toFixed(1);
      }
      return null;
    };

    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
      if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
      if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' };
      return { category: 'Obese', color: 'text-red-600' };
    };

    const bmi = calculateBMI();
    const bmiNumber = bmi ? Number(bmi) : 0;
    const bmiInfo = bmi ? getBMICategory(bmiNumber) : null;

    return (
      <div className="space-y-6">
        <PhysicalCharacteristics
          value={value}
          onChange={setValue}
          errors={{}}
        />
        
        {bmi && (
          <div className="rounded bg-blue-50 p-4">
            <h4 className="font-medium">BMI Calculator</h4>
            <div className="mt-2 space-y-1">
              <p><strong>BMI:</strong> {bmi}</p>
              {bmiInfo && (
                <p><strong>Category:</strong> <span className={bmiInfo.color}>{bmiInfo.category}</span></p>
              )}
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>BMI is calculated as weight (kg) ÷ height (m)²</p>
          <p>Enter height and weight to see BMI calculation</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with integrated BMI calculator based on height and weight inputs.',
      },
    },
  },
};

// Validation Patterns
export const ValidationPatterns: Story = {
  render: () => {
    const [currentPattern, setCurrentPattern] = useState(0);
    
    const patterns = [
      {
        label: 'Valid Data',
        data: sampleData,
        errors: {},
      },
      {
        label: 'Required Fields Empty',
        data: emptyData,
        errors: {
          bloodType: 'Blood type is required',
          complexion: 'Complexion is required',
          citizenship: 'Citizenship is required',
        },
      },
      {
        label: 'Invalid Measurements',
        data: { ...emptyData, height: 'abc', weight: '-10' },
        errors: {
          height: 'Height must be a valid number',
          weight: 'Weight must be positive',
        },
      },
      {
        label: 'Custom Religion Required',
        data: { ...customReligionData, religionOthersSpecify: '' },
        errors: {
          religionOthersSpecify: 'Please specify the religion when "Others" is selected',
        },
      },
    ];

    const currentData = patterns[currentPattern];

    return (
      <div className="space-y-6">
        <PhysicalCharacteristics
          value={currentData.data}
          onChange={() => {}}
          errors={currentData.errors}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern, index) => (
              <button
                key={pattern.label}
                onClick={() => setCurrentPattern(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentPattern === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pattern.label}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Current Pattern: {currentData.label}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different validation patterns and error states for form fields.',
      },
    },
  },
};