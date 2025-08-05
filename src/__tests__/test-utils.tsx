/**
 * Test Utilities for Citizenly RBI System
 * Custom render functions and test helpers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// =============================================================================
// CUSTOM RENDER FUNCTIONS
// =============================================================================

interface CustomRenderOptions extends RenderOptions {
  // Add custom options here
  initialProps?: Record<string, any>;
  queryClient?: QueryClient;
}

/**
 * Custom render function with providers
 */
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options;

  // Create wrapper with all providers
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  const user = userEvent.setup();

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Render function specifically for form components
 */
function renderWithForm(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const FormWrapper = ({ children }: { children: React.ReactNode }) => (
    <form data-testid="test-form">{children}</form>
  );

  const { wrapper: ExistingWrapper, ...restOptions } = options;

  const CombinedWrapper = ({ children }: { children: React.ReactNode }) => {
    const content = <FormWrapper>{children}</FormWrapper>;
    return ExistingWrapper ? <ExistingWrapper>{content}</ExistingWrapper> : content;
  };

  return customRender(ui, {
    ...restOptions,
    wrapper: CombinedWrapper,
  });
}

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

/**
 * Create mock resident data
 */
export const createMockResident = (overrides: Partial<any> = {}) => ({
  id: 'test-resident-id',
  first_name: 'Juan',
  middle_name: 'Cruz',
  last_name: 'Dela Cruz',
  suffix: null,
  birthdate: '1990-05-15',
  age: 33,
  gender: 'male',
  civil_status: 'married',
  philsys_number: '1234-5678-9012',
  household_code: 'RRPPMMBBB-SSSS-TTTT-HHHH',
  family_position: 'head',

  // Address information
  region_code: '01',
  province_code: '0128',
  city_municipality_code: '012801',
  barangay_code: '01280101',

  // Sectoral information
  is_labor_force: true,
  is_employed: true,
  is_unemployed: false,
  is_ofw: false,
  is_pwd: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,

  // Contact information
  mobile_number: '09123456789',
  email_address: 'juan.delacruz@example.com',

  // Employment information
  employment_status: 'employed_full_time',
  occupation: 'Software Developer',

  // Education
  highest_educational_attainment: 'college_graduate',

  ...overrides,
});

/**
 * Create mock household data
 */
export const createMockHousehold = (overrides: Partial<any> = {}) => ({
  id: 'test-household-id',
  code: 'RRPPMMBBB-SSSS-TTTT-HHHH',
  household_type: 'nuclear' as const,
  total_members: 4,
  head_name: 'Juan Dela Cruz',
  barangay_code: '01280101',
  street_name: 'Main Street',
  house_number: '123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Create mock sectoral information
 */
export const createMockSectoralInfo = (overrides: Partial<any> = {}) => ({
  is_labor_force: false,
  is_employed: false,
  is_unemployed: false,
  is_ofw: false,
  is_pwd: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
  ...overrides,
});

/**
 * Create mock address selection
 */
export const createMockAddress = (overrides: Partial<any> = {}) => ({
  region: '01',
  province: '0128',
  city: '012801',
  barangay: '01280101',
  ...overrides,
});

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Check if element has proper ARIA attributes
 */
export const expectAccessibleElement = (element: HTMLElement) => {
  // Should have proper role or semantic element
  const hasRole = element.getAttribute('role');
  const hasSemanticTag = ['button', 'input', 'select', 'textarea', 'a', 'label'].includes(
    element.tagName.toLowerCase()
  );

  expect(hasRole || hasSemanticTag).toBe(true);

  // Interactive elements should be focusable
  if (['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase())) {
    expect(element).not.toHaveAttribute('tabindex', '-1');
  }
};

/**
 * Check if element uses design system colors
 */
export const expectDesignSystemColors = (element: HTMLElement) => {
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  // Check if colors are from design system (not hardcoded)
  const designSystemColors = [
    'rgb(59, 130, 246)', // primary-500
    'rgb(124, 58, 237)', // secondary-700
    'rgb(5, 150, 105)', // success-600
    'rgb(234, 88, 12)', // warning-600
    'rgb(220, 38, 38)', // danger-600
    'rgb(64, 64, 64)', // neutral-700
    'rgb(38, 38, 38)', // neutral-800
    'rgb(255, 255, 255)', // white
  ];

  if (backgroundColor !== 'rgba(0, 0, 0, 0)') {
    expect(designSystemColors).toContain(backgroundColor);
  }

  if (color !== 'rgba(0, 0, 0, 0)') {
    expect(designSystemColors).toContain(color);
  }
};

/**
 * Check if component follows RBI naming conventions
 */
export const expectRBINamingConvention = (element: HTMLElement) => {
  const testId = element.getAttribute('data-testid');
  const className = element.className;

  if (testId) {
    // Should use kebab-case
    expect(testId).toMatch(/^[a-z0-9-]+$/);
  }

  // Should not have generic class names
  const genericClasses = ['container', 'wrapper', 'content', 'item'];
  genericClasses.forEach(genericClass => {
    expect(className).not.toContain(genericClass);
  });
};

// =============================================================================
// INTERACTION HELPERS
// =============================================================================

/**
 * Fill out address selector form
 */
export const fillAddressSelector = async (
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  address: ReturnType<typeof createMockAddress>
) => {
  // Select region
  const regionSelect = container.querySelector('[name="region"]') as HTMLSelectElement;
  if (regionSelect) {
    await user.selectOptions(regionSelect, address.region);
  }

  // Select province
  const provinceSelect = container.querySelector('[name="province"]') as HTMLSelectElement;
  if (provinceSelect) {
    await user.selectOptions(provinceSelect, address.province);
  }

  // Select city
  const citySelect = container.querySelector('[name="city"]') as HTMLSelectElement;
  if (citySelect) {
    await user.selectOptions(citySelect, address.city);
  }

  // Select barangay
  const barangaySelect = container.querySelector('[name="barangay"]') as HTMLSelectElement;
  if (barangaySelect) {
    await user.selectOptions(barangaySelect, address.barangay);
  }
};

/**
 * Fill out sectoral info checkboxes
 */
export const fillSectoralInfo = async (
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  sectoralInfo: ReturnType<typeof createMockSectoralInfo>
) => {
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  for (const checkbox of Array.from(checkboxes)) {
    const input = checkbox as HTMLInputElement;
    const name = input.name;

    if (name && sectoralInfo[name as keyof typeof sectoralInfo]) {
      await user.click(input);
    }
  }
};

/**
 * Submit form and wait for completion
 */
export const submitForm = async (
  user: ReturnType<typeof userEvent.setup>,
  form: HTMLFormElement
) => {
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

  if (submitButton) {
    await user.click(submitButton);
  } else {
    // Fallback: trigger form submit event
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
};

// =============================================================================
// MOCK GENERATORS
// =============================================================================

/**
 * Generate mock API responses
 */
export const mockApiResponses = {
  regions: [
    { code: '01', name: 'Region I (Ilocos Region)' },
    { code: '13', name: 'National Capital Region (NCR)' },
  ],

  provinces: [
    { code: '0128', name: 'Ilocos Norte' },
    { code: '0129', name: 'Ilocos Sur' },
  ],

  cities: [
    { code: '012801', name: 'Laoag City', type: 'City' },
    { code: '012802', name: 'Batac City', type: 'City' },
  ],

  barangays: [
    { code: '01280101', name: 'Barangay 1' },
    { code: '01280102', name: 'Barangay 2' },
  ],

  residents: [
    createMockResident(),
    createMockResident({
      id: 'resident-2',
      first_name: 'Maria',
      family_position: 'spouse',
    }),
  ],

  households: [
    createMockHousehold(),
    createMockHousehold({
      id: 'household-2',
      code: 'DIFFERENT-CODE-HERE',
      household_type: 'single_parent',
    }),
  ],
};

// Export custom render as default
export default customRender;

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent, customRender as render, renderWithForm };

// =============================================================================
// TESTS FOR TEST UTILITIES
// =============================================================================

describe('Test Utilities', () => {
  it('should create mock data factories', () => {
    const resident = createMockResident();
    expect(resident).toHaveProperty('first_name', 'Juan');
    expect(resident).toHaveProperty('id', 'test-resident-id');

    const household = createMockHousehold();
    expect(household).toHaveProperty('household_type', 'nuclear');

    const sectoral = createMockSectoralInfo();
    expect(sectoral).toHaveProperty('is_labor_force', false);
  });

  it('should allow overrides in mock factories', () => {
    const resident = createMockResident({ first_name: 'Maria' });
    expect(resident.first_name).toBe('Maria');

    const sectoral = createMockSectoralInfo({ is_labor_force: true });
    expect(sectoral.is_labor_force).toBe(true);
  });
});
