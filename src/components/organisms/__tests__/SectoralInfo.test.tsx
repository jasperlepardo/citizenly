/**
 * SectoralInfo Component Tests
 * Tests for the RBI Sectoral Information component
 */

import React from 'react';
import { render, screen, createMockSectoralInfo } from '@/__tests__/test-utils';
import SectoralInfo from '../SectoralInfo';

describe('SectoralInfo Component', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: createMockSectoralInfo(),
    onChange: mockOnChange,
    context: {
      age: 35,
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sectoral information form', () => {
      render(<SectoralInfo {...defaultProps} />);

      expect(screen.getByText('Sectoral Group Classification')).toBeInTheDocument();
      expect(screen.getByText('Auto-Calculated Classifications')).toBeInTheDocument();
      expect(screen.getByText('Manual Classifications')).toBeInTheDocument();
    });

    it('displays auto-calculated flags as disabled checkboxes', () => {
      render(<SectoralInfo {...defaultProps} />);

      const laborForceCheckbox = screen.getByRole('checkbox', { name: /Labor Force/ });
      const employedCheckbox = screen.getByRole('checkbox', { name: /Employed/ });

      expect(laborForceCheckbox).toBeDisabled();
      expect(employedCheckbox).toBeDisabled();
    });

    it('displays manual flags as enabled checkboxes', () => {
      render(<SectoralInfo {...defaultProps} />);

      const ofwCheckbox = screen.getByLabelText(/Overseas Filipino Worker/);
      const pwdCheckbox = screen.getByLabelText(/Person with Disability/);

      expect(ofwCheckbox).not.toBeDisabled();
      expect(pwdCheckbox).not.toBeDisabled();
    });

    it('shows classification summary', () => {
      const sectoralInfo = createMockSectoralInfo({
        is_employed: true,
        is_ofw: true,
      });

      render(<SectoralInfo {...defaultProps} value={sectoralInfo} />);

      expect(screen.getByText('Classification Summary')).toBeInTheDocument();
      expect(screen.getByText(/Active Classifications:/)).toBeInTheDocument();
    });
  });

  describe('Auto-calculation Logic', () => {
    it('calculates labor force status from employment', () => {
      const context = {
        age: 30,
        employment_status: 'employed_full_time',
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const laborForceCheckbox = screen.getByRole('checkbox', { name: /Labor Force/ });
      expect(laborForceCheckbox).toBeChecked();
    });

    it('calculates employment status correctly', () => {
      const context = {
        age: 30,
        employment_status: 'employed_full_time',
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const employedCheckbox = screen.getByRole('checkbox', { name: /Employed/ });
      const unemployedCheckbox = screen.getByRole('checkbox', { name: /Unemployed/ });

      expect(employedCheckbox).toBeChecked();
      expect(unemployedCheckbox).not.toBeChecked();
    });

    it('calculates unemployed status correctly', () => {
      const context = {
        age: 25,
        employment_status: 'unemployed_looking',
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const unemployedCheckbox = screen.getByRole('checkbox', { name: /Unemployed/ });
      const employedCheckbox = screen.getByRole('checkbox', { name: /Employed/ });

      expect(unemployedCheckbox).toBeChecked();
      expect(employedCheckbox).not.toBeChecked();
    });

    it('calculates senior citizen status from age', () => {
      const context = {
        age: 65,
        employment_status: 'retired',
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const seniorCheckbox = screen.getByRole('checkbox', { name: /Senior Citizen/ });
      expect(seniorCheckbox).toBeChecked();
    });

    it('calculates age from birthdate', () => {
      const context = {
        birthdate: '1950-01-01', // Should be ~74 years old
        employment_status: 'retired',
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const seniorCheckbox = screen.getByRole('checkbox', { name: /Senior Citizen/ });
      expect(seniorCheckbox).toBeChecked();
    });

    it('calculates out-of-school children correctly', () => {
      const context = {
        age: 12, // School age
        highest_educational_attainment: undefined, // Not in school
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const outOfSchoolCheckbox = screen.getByRole('checkbox', { name: /Out-of-School Children/ });
      expect(outOfSchoolCheckbox).toBeChecked();
    });

    it('calculates out-of-school youth correctly', () => {
      const context = {
        age: 22, // Youth age
        employment_status: 'unemployed_not_looking', // Not employed
        highest_educational_attainment: 'high_school_graduate', // Not in tertiary education
      };

      render(<SectoralInfo {...defaultProps} context={context} />);

      const outOfSchoolYouthCheckbox = screen.getByRole('checkbox', {
        name: /Out-of-School Youth/,
      });
      expect(outOfSchoolYouthCheckbox).toBeChecked();
    });
  });

  describe('Manual Flag Interactions', () => {
    it('allows toggling manual flags', async () => {
      const { user } = render(<SectoralInfo {...defaultProps} />);

      const ofwCheckbox = screen.getByLabelText(/Overseas Filipino Worker/);

      await user.click(ofwCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_ofw: true,
        })
      );
    });

    it('handles PWD flag correctly', async () => {
      const { user } = render(<SectoralInfo {...defaultProps} />);

      const pwdCheckbox = screen.getByLabelText(/Person with Disability/);

      await user.click(pwdCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_pwd: true,
        })
      );
    });

    it('handles solo parent flag correctly', async () => {
      const { user } = render(<SectoralInfo {...defaultProps} />);

      const soloParentCheckbox = screen.getByLabelText(/Solo Parent/);

      await user.click(soloParentCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_solo_parent: true,
        })
      );
    });

    it('handles indigenous people flag correctly', async () => {
      const { user } = render(<SectoralInfo {...defaultProps} />);

      const indigenousCheckbox = screen.getByLabelText(/Indigenous People/);

      await user.click(indigenousCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_indigenous_people: true,
        })
      );
    });

    it('handles migrant flag correctly', async () => {
      const { user } = render(<SectoralInfo {...defaultProps} />);

      const migrantCheckbox = screen.getByLabelText(/Migrant/);

      await user.click(migrantCheckbox);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_migrant: true,
        })
      );
    });
  });

  describe('Conditional Logic', () => {
    it('shows registered senior citizen only when senior citizen is true', () => {
      const sectoralInfo = createMockSectoralInfo({
        is_senior_citizen: true,
      });

      render(<SectoralInfo {...defaultProps} value={sectoralInfo} />);

      expect(screen.getByLabelText(/Registered Senior Citizen/)).toBeInTheDocument();
    });

    it('does not show registered senior citizen when senior citizen is false', () => {
      const sectoralInfo = createMockSectoralInfo({
        is_senior_citizen: false,
      });

      render(<SectoralInfo {...defaultProps} value={sectoralInfo} />);

      expect(screen.queryByLabelText(/Registered Senior Citizen/)).not.toBeInTheDocument();
    });

    it('resets registered senior citizen when senior citizen becomes false', async () => {
      const sectoralInfo = createMockSectoralInfo({
        is_senior_citizen: true,
        is_registered_senior_citizen: true,
      });

      const context = {
        age: 55, // Not senior citizen age
        employment_status: 'employed_full_time',
      };

      render(<SectoralInfo {...defaultProps} value={sectoralInfo} context={context} />);

      // Component should auto-update when context changes
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_senior_citizen: false,
          is_registered_senior_citizen: false,
        })
      );
    });
  });

  describe('Disabled State', () => {
    it('disables all manual checkboxes when disabled prop is true', () => {
      render(<SectoralInfo {...defaultProps} disabled />);

      const ofwCheckbox = screen.getByLabelText(/Overseas Filipino Worker/);
      const pwdCheckbox = screen.getByLabelText(/Person with Disability/);

      expect(ofwCheckbox).toBeDisabled();
      expect(pwdCheckbox).toBeDisabled();
    });

    it('allows interaction when disabled prop is false', () => {
      render(<SectoralInfo {...defaultProps} disabled={false} />);

      const ofwCheckbox = screen.getByLabelText(/Overseas Filipino Worker/);
      expect(ofwCheckbox).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper headings and structure', () => {
      render(<SectoralInfo {...defaultProps} />);

      expect(
        screen.getByRole('heading', { name: /Sectoral Group Classification/ })
      ).toBeInTheDocument();
    });

    it('has descriptive labels for all checkboxes', () => {
      render(<SectoralInfo {...defaultProps} />);

      // Check that all checkboxes have accessible labels
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName(/./); // Match any accessible name
      });
    });

    it('provides descriptions for complex classifications', () => {
      render(<SectoralInfo {...defaultProps} />);

      expect(screen.getByText(/Based on employment status/)).toBeInTheDocument();
      expect(screen.getByText(/Currently employed/)).toBeInTheDocument();
      expect(screen.getByText(/Age 60 and above/)).toBeInTheDocument();
    });

    it('maintains proper tab order', () => {
      render(<SectoralInfo {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const enabledCheckboxes = checkboxes.filter(cb => !cb.hasAttribute('disabled'));

      // All enabled checkboxes should be focusable
      enabledCheckboxes.forEach(checkbox => {
        expect(checkbox).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Classification Summary', () => {
    it('shows active classifications in summary', () => {
      const sectoralInfo = createMockSectoralInfo({
        is_employed: true,
        is_ofw: true,
        is_senior_citizen: true,
      });

      render(<SectoralInfo {...defaultProps} value={sectoralInfo} />);

      const summary = screen.getByText(/Active Classifications:/);
      expect(summary.parentElement).toHaveTextContent('employed');
      expect(summary.parentElement).toHaveTextContent('ofw');
      expect(summary.parentElement).toHaveTextContent('senior citizen');
    });

    it('shows "None" when no classifications are active', () => {
      const sectoralInfo = createMockSectoralInfo(); // All false by default

      render(<SectoralInfo {...defaultProps} value={sectoralInfo} />);

      expect(screen.getByText('Active Classifications:')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('Context Updates', () => {
    it('updates auto-calculated flags when context changes', () => {
      const { rerender } = render(<SectoralInfo {...defaultProps} />);

      // Change context to make person a senior citizen
      const newContext = {
        age: 65,
        employment_status: 'retired',
      };

      rerender(<SectoralInfo {...defaultProps} context={newContext} />);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          is_senior_citizen: true,
        })
      );
    });

    it('handles empty context gracefully', () => {
      render(<SectoralInfo {...defaultProps} context={{}} />);

      // Should not crash and should show default states
      expect(screen.getByText('Sectoral Group Classification')).toBeInTheDocument();
    });
  });
});
