import React from 'react';
import { StepComponentProps } from '../types';

interface ReviewSectionProps {
  title: string;
  data: Record<string, string | undefined>;
}

function ReviewSection({ title, data }: ReviewSectionProps) {
  const validData = Object.entries(data).filter(([_, value]) => value && value.trim() !== '');
  
  if (validData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-primary border-b border-gray-200 pb-1">
        {title}
      </h5>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {validData.map(([label, value]) => (
          <div key={label} className="flex justify-between py-1">
            <span className="text-sm text-secondary font-medium">{label}:</span>
            <span className="text-sm text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewStep({ formData }: StepComponentProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null || value === undefined) return 'Not specified';
    return value ? 'Yes' : 'No';
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Review & Submit</h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Please review all information carefully before submitting the resident registration.
        </p>
      </div>
      
      <div className="bg-background-muted rounded-lg border border-default p-6">
        <div className="space-y-6">
          {/* Personal Information Summary */}
          <ReviewSection 
            title="Personal Information"
            data={{
              'Full Name': [formData.firstName, formData.middleName, formData.lastName, formData.extensionName]
                .filter(Boolean).join(' '),
              'Birth Date': formatDate(formData.birthdate),
              'Sex': formData.sex ? formData.sex.charAt(0).toUpperCase() + formData.sex.slice(1) : '',
              'Civil Status': formData.civilStatus,
              'Citizenship': formData.citizenship,
            }}
          />
          
          {/* Contact Information Summary */}
          <ReviewSection 
            title="Contact Information"
            data={{
              'Mobile Number': formData.mobileNumber,
              'Telephone Number': formData.telephoneNumber,
              'Email': formData.email,
            }}
          />

          {/* Education & Employment Summary */}
          <ReviewSection 
            title="Education & Employment"
            data={{
              'Education Level': formData.educationAttainment,
              'Graduate Status': formatBoolean(formData.isGraduate),
              'Employment Status': formData.employmentStatus,
              'Occupation': formData.occupationTitle,
              'Workplace': formData.workplace,
            }}
          />

          {/* Physical Characteristics Summary */}
          <ReviewSection 
            title="Physical Characteristics"
            data={{
              'Blood Type': formData.bloodType,
              'Height': formData.height ? `${formData.height} cm` : '',
              'Weight': formData.weight ? `${formData.weight} kg` : '',
              'Ethnicity': formData.ethnicity,
              'Religion': formData.religion === 'other' && formData.religionOthersSpecify 
                ? formData.religionOthersSpecify 
                : formData.religion,
            }}
          />

          {/* Family Information Summary */}
          <ReviewSection 
            title="Family Information"
            data={{
              'Mother\'s Maiden Name': [
                formData.motherMaidenFirstName,
                formData.motherMaidenMiddleName, 
                formData.motherMaidenLastName
              ].filter(Boolean).join(' '),
            }}
          />

          {/* Voting Information Summary */}
          <ReviewSection 
            title="Voting Information"
            data={{
              'Registered Voter': formatBoolean(formData.isVoter),
              'Resident Voter': formatBoolean(formData.isResidentVoter),
              'Last Voted': formatDate(formData.lastVotedDate),
            }}
          />

          {/* Documentation Summary */}
          <ReviewSection 
            title="Documentation"
            data={{
              'PhilSys Card Number': formData.philsysCardNumber,
            }}
          />

          {/* Address Summary */}
          <ReviewSection 
            title="Address Information"
            data={{
              'Street/Building': formData.streetId,
              'Subdivision': formData.subdivisionId,
              'ZIP Code': formData.zipCode,
              'Barangay Code': formData.barangayCode,
            }}
          />

          {/* Household Information */}
          <ReviewSection 
            title="Household Assignment"
            data={{
              'Household Code': formData.householdCode || 'Will be assigned automatically',
            }}
          />
        </div>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Ready to Submit
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Once submitted, this resident will be registered in the system. 
                Make sure all information is correct as some fields cannot be easily modified later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}