# Household Form Components - Usage Guide

## Overview

The Household form components provide a complete solution for managing household data in the Citizenly system. The components follow the same architectural patterns as the existing Resident forms and include all database fields specified in your schema.

## Component Structure

```
src/components/organisms/Form/Household/
├── HouseholdForm.tsx                    # Main orchestrator component
├── HouseholdDetails/
│   ├── HouseholdDetails.tsx            # Section container
│   └── FormField/
│       ├── AddressDetails.tsx          # House number, street, ZIP
│       ├── GeographicLocation.tsx      # Region/Province/City/Barangay
│       └── HouseholdStatistics.tsx     # Family/member/migrant counts
├── types.ts                            # TypeScript interfaces
└── index.ts                            # Barrel exports
```

## Database Fields Covered

The components handle all the household database fields you specified:

- ✅ `house_number` - Physical house identifier
- ✅ `street_id` - Reference to geo_streets table
- ✅ `subdivision_id` - Optional subdivision reference
- ✅ `barangay_code` - PSGC barangay reference
- ✅ `city_municipality_code` - PSGC city/municipality reference
- ✅ `province_code` - PSGC province reference  
- ✅ `region_code` - PSGC region reference
- ✅ `zip_code` - Postal code
- ✅ `no_of_families` - Family count (default: 1)
- ✅ `no_of_household_members` - Member count (default: 0)
- ✅ `no_of_migrants` - Migrant count (default: 0)

## Basic Usage

### 1. Import the Components

```typescript
import { HouseholdForm } from '@/components/organisms/Form/Household';
// or for individual sections:
import { HouseholdDetails } from '@/components/organisms/Form/Household';
```

### 2. Use the Main Form Component

```typescript
import React, { useState } from 'react';
import { HouseholdForm } from '@/components/organisms/Form/Household';

function CreateHouseholdPage() {
  const [householdData, setHouseholdData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleDataChange = (data) => {
    setHouseholdData(data);
    // Clear errors when data changes
    setErrors({});
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Submit to your API
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        return;
      }
      
      // Success - redirect or show success message
      console.log('Household created successfully!');
    } catch (error) {
      console.error('Failed to create household:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <HouseholdForm
        mode="create"
        onDataChange={handleDataChange}
        onSubmit={handleSubmit}
        errors={errors}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### 3. Edit Existing Household

```typescript
function EditHouseholdPage({ householdId }) {
  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch existing household data
    fetch(`/api/households/${householdId}`)
      .then(res => res.json())
      .then(data => setInitialData(data));
  }, [householdId]);

  const handleSubmit = async (data) => {
    try {
      const response = await fetch(`/api/households/${householdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        return;
      }
      
      console.log('Household updated successfully!');
    } catch (error) {
      console.error('Failed to update household:', error);
    }
  };

  if (!initialData) return <div>Loading...</div>;

  return (
    <HouseholdForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      errors={errors}
    />
  );
}
```

### 4. View-Only Mode

```typescript
function ViewHouseholdPage({ household }) {
  return (
    <HouseholdForm
      mode="view"
      initialData={household}
      showActions={false}
    />
  );
}
```

## Advanced Usage

### Individual Section Components

You can use individual sections if you need more control:

```typescript
import { HouseholdDetails } from '@/components/organisms/Form/Household';

function CustomHouseholdForm() {
  const [formData, setFormData] = useState({});
  
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <HouseholdDetails
        formData={formData}
        onChange={handleFieldChange}
        errors={{}}
        mode="edit"
      />
      
      {/* Add other sections here as needed */}
    </div>
  );
}
```

### Custom Validation

```typescript
const validateHouseholdData = (data) => {
  const errors = {};
  
  if (!data.houseNumber) {
    errors.houseNumber = 'House number is required';
  }
  
  if (!data.barangayCode) {
    errors.barangayCode = 'Please select a barangay';
  }
  
  if ((data.noOfMigrants || 0) > (data.noOfHouseholdMembers || 0)) {
    errors.noOfMigrants = 'Migrants cannot exceed household members';
  }
  
  return errors;
};
```

## Data Integration

### API Endpoint Structure

The form data maps to your database schema. Here's how to handle it in your API:

```typescript
// API Route: /api/households
export async function POST(request: Request) {
  const data = await request.json();
  
  // Map form data to database fields
  const householdRecord = {
    house_number: data.houseNumber,
    street_id: data.streetId,
    subdivision_id: data.subdivisionId || null,
    barangay_code: data.barangayCode,
    city_municipality_code: data.cityMunicipalityCode,
    province_code: data.provinceCode,
    region_code: data.regionCode,
    zip_code: data.zipCode,
    no_of_families: data.noOfFamilies || 1,
    no_of_household_members: data.noOfHouseholdMembers || 0,
    no_of_migrants: data.noOfMigrants || 0,
  };
  
  // Insert into database
  const { data: household, error } = await supabase
    .from('households')
    .insert(householdRecord)
    .select()
    .single();
    
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  return Response.json({ household });
}
```

## Styling and Theming

The components use Tailwind CSS and support dark mode:

```typescript
<HouseholdForm
  className="custom-household-form"
  // Dark mode is handled automatically via Tailwind classes
/>
```

## Integration with Existing System

The Household form components integrate seamlessly with your existing:

- ✅ Design system and component library
- ✅ Field components (InputField, SelectField)
- ✅ TypeScript interfaces
- ✅ Storybook documentation
- ✅ Dark mode support
- ✅ Form validation patterns

## Next Steps

1. **Connect to Real Data**: Replace placeholder options with actual data from your geo_* tables
2. **Add Validation**: Implement backend validation for geographic hierarchy
3. **Extend Functionality**: Add more sections like household members, economic information
4. **Test Integration**: Use the Storybook stories to test all scenarios

The components are ready to use and follow all the patterns established in your existing Resident form system!