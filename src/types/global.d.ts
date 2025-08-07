/**
 * Global type declarations for testing
 */

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(name: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeChecked(): R;
      toBeDisabled(): R;
      toHaveAccessibleName(name: string | RegExp): R;
      toHaveValue(value: string | number | string[]): R;
      toBeVisible(): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedFormValues: Record<string, unknown>): R;
      toHaveStyle(css: string | Record<string, unknown>): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toHaveErrorMessage(text: string | RegExp): R;
    }
  }

  interface Global {
    testUtils: {
      mockUser: {
        id: string;
        email: string;
        role: string;
        barangay_code: string;
      };
      mockResident: {
        id: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        suffix: string | null;
        birthdate: string;
        gender: string;
        civil_status: string;
        philsys_number: string;
        household_code: string;
        family_position: string;
        is_labor_force: boolean;
        is_employed: boolean;
        is_senior_citizen: boolean;
        is_pwd: boolean;
      };
      mockHousehold: {
        id: string;
        code: string;
        household_type: string;
        total_members: number;
        head_name: string;
        barangay_code: string;
      };
      mockProps: {
        disabled: boolean;
        required: boolean;
        className: string;
        onChange: jest.Mock;
        onSubmit: jest.Mock;
        onError: jest.Mock;
      };
    };
  }

  const testUtils: Global['testUtils'];
}

export {};
