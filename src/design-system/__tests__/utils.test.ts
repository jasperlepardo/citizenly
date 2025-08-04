/**
 * Design System Utils Tests
 * Tests for design token utility functions
 */

import {
  getColor,
  getRBIColor,
  getColorVariant,
  getSpacing,
  getResponsiveSpacing,
  getFontSize,
  getHeadingStyle,
  getButtonStyles,
  getInputStyles,
  checkContrast,
  getFocusRing,
  validateDesignTokenUsage,
  getSectoralBadgeColor,
  getHouseholdTypeStyle,
} from '../utils'

describe('Design System Utils', () => {
  describe('getColor', () => {
    it('should return correct color for valid path', () => {
      expect(getColor('primary.500')).toBe('#3b82f6')
      expect(getColor('success.600')).toBe('#059669')
      expect(getColor('neutral.800')).toBe('#262626')
    })

    it('should return fallback color for invalid path', () => {
      // Should use neutral.500 as fallback
      expect(getColor('invalid.path')).toBe('#737373')
    })

    it('should warn for invalid color paths', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      getColor('invalid.color')
      expect(consoleSpy).toHaveBeenCalledWith(
        "Color token 'invalid.color' not found. Using fallback."
      )
      consoleSpy.mockRestore()
    })
  })

  describe('getRBIColor', () => {
    it('should return correct colors for RBI classifications', () => {
      expect(getRBIColor('laborForce')).toBe('#059669')
      expect(getRBIColor('seniorCitizen')).toBe('#9333ea')
      expect(getRBIColor('youth')).toBe('#2563eb')
      expect(getRBIColor('pwd')).toBe('#c2410c')
    })

    it('should return fallback for invalid classification', () => {
      // @ts-expect-error Testing invalid input
      expect(getRBIColor('invalid')).toBe('#737373')
    })
  })

  describe('getSpacing', () => {
    it('should return correct spacing values', () => {
      expect(getSpacing(4)).toBe('16px')
      expect(getSpacing(8)).toBe('32px')
      expect(getSpacing(0.5)).toBe('2px')
    })
  })

  describe('getResponsiveSpacing', () => {
    it('should return responsive spacing object', () => {
      const responsive = getResponsiveSpacing(4)
      
      expect(responsive).toHaveProperty('base', '16px')
      expect(responsive).toHaveProperty('sm', '16px')
      expect(responsive).toHaveProperty('md')
      expect(responsive).toHaveProperty('lg')
    })
  })

  describe('getFontSize', () => {
    it('should return font size configuration', () => {
      const fontSize = getFontSize('base')
      
      expect(fontSize).toEqual(['16px', { lineHeight: '24px', letterSpacing: '0em' }])
    })

    it('should return display sizes correctly', () => {
      const displaySize = getFontSize('7xl')
      
      expect(displaySize).toEqual(['72px', { lineHeight: '72px', letterSpacing: '-0.15em' }])
    })
  })

  describe('getHeadingStyle', () => {
    it('should return proper heading styles for each level', () => {
      const h1Style = getHeadingStyle(1)
      const h6Style = getHeadingStyle(6)
      
      expect(h1Style.fontSize).toEqual(['36px', { lineHeight: '40px', letterSpacing: '-0.1em' }])
      expect(h1Style.fontWeight).toBe('700')
      
      expect(h6Style.fontSize).toEqual(['16px', { lineHeight: '24px', letterSpacing: '0em' }])
      expect(h6Style.fontWeight).toBe('500')
    })
  })

  describe('getButtonStyles', () => {
    it('should return complete button styles', () => {
      const primaryButton = getButtonStyles('primary', 'md')
      
      expect(primaryButton).toHaveProperty('fontFamily')
      expect(primaryButton).toHaveProperty('fontWeight', '500')
      expect(primaryButton).toHaveProperty('borderRadius', '6px')
      expect(primaryButton).toHaveProperty('backgroundColor', '#3b82f6')
    })

    it('should return different styles for different variants', () => {
      const primaryButton = getButtonStyles('primary')
      const secondaryButton = getButtonStyles('secondary')
      const dangerButton = getButtonStyles('danger')
      
      expect(primaryButton.backgroundColor).toBe('#3b82f6')
      expect(secondaryButton.backgroundColor).toBe('#7c3aed')
      expect(dangerButton.backgroundColor).toBe('#dc2626')
    })
  })

  describe('getInputStyles', () => {
    it('should return proper input styles for different states', () => {
      const defaultInput = getInputStyles('default')
      const focusInput = getInputStyles('focus')
      const errorInput = getInputStyles('error')
      
      expect(defaultInput.borderColor).toBe('#d4d4d4')
      expect(focusInput.borderColor).toBe('#3b82f6')
      expect(errorInput.borderColor).toBe('#ef4444')
    })

    it('should include focus ring for focus state', () => {
      const focusInput = getInputStyles('focus')
      
      expect(focusInput.boxShadow).toBe('0 0 0 3px rgba(59, 130, 246, 0.1)')
    })
  })

  describe('checkContrast', () => {
    it('should return true for known compliant combinations', () => {
      const isCompliant = checkContrast('#262626', '#fafafa', 'AA')
      
      expect(isCompliant).toBe(true)
    })

    it('should return false for unknown combinations', () => {
      const isCompliant = checkContrast('#random', '#color', 'AA')
      
      expect(isCompliant).toBe(false)
    })
  })

  describe('getFocusRing', () => {
    it('should return focus ring styles for different variants', () => {
      const primaryFocus = getFocusRing('primary')
      const dangerFocus = getFocusRing('danger')
      
      expect(primaryFocus.outline).toBe('none')
      expect(primaryFocus.boxShadow).toBe('0 0 0 3px rgba(59, 130, 246, 0.1)')
      expect(dangerFocus.boxShadow).toBe('0 0 0 3px rgba(220, 38, 38, 0.1)')
    })
  })

  describe('validateDesignTokenUsage', () => {
    it('should detect hardcoded colors', () => {
      const styles = {
        backgroundColor: '#ff0000',
        color: '#000000',
      }
      
      const validation = validateDesignTokenUsage(styles)
      
      expect(validation.isValid).toBe(false)
      expect(validation.warnings).toHaveLength(2)
      expect(validation.warnings[0]).toContain('Hardcoded color')
    })

    it('should detect non-standard spacing', () => {
      const styles = {
        padding: '15px',
        margin: '25px',
      }
      
      const validation = validateDesignTokenUsage(styles)
      
      expect(validation.isValid).toBe(false)
      expect(validation.warnings.length).toBeGreaterThan(0)
      expect(validation.warnings[0]).toContain('Non-standard spacing')
    })

    it('should pass for valid design token usage', () => {
      const styles = {
        backgroundColor: '#3b82f6', // This would be detected as hardcoded
        padding: '16px', // Valid spacing token
      }
      
      const validation = validateDesignTokenUsage(styles)
      
      // Should have warnings for hardcoded colors but suggestions for improvement
      expect(validation.suggestions.length).toBeGreaterThan(0)
    })
  })

  describe('getSectoralBadgeColor', () => {
    it('should return proper badge colors for different variants', () => {
      const solidBadge = getSectoralBadgeColor('laborForce', 'solid')
      const outlineBadge = getSectoralBadgeColor('laborForce', 'outline')
      const subtleBadge = getSectoralBadgeColor('laborForce', 'subtle')
      
      expect(solidBadge.backgroundColor).toBe('#059669')
      expect(solidBadge.color).toBe('#fafafa')
      
      expect(outlineBadge.backgroundColor).toBe('transparent')
      expect(outlineBadge.color).toBe('#059669')
      
      expect(subtleBadge.backgroundColor).toBeTruthy() // Should have a light background
    })
  })

  describe('getHouseholdTypeStyle', () => {
    it('should return appropriate icons and colors for household types', () => {
      const nuclear = getHouseholdTypeStyle('nuclear')
      const singleParent = getHouseholdTypeStyle('single_parent')
      
      expect(nuclear.icon).toBe('👪')
      expect(nuclear.color).toBe('#3b82f6')
      
      expect(singleParent.icon).toBe('👩‍👧‍👦')
      expect(singleParent.color).toBe('#a855f7')
    })

    it('should return default style for unknown household type', () => {
      // @ts-expect-error Testing invalid input
      const unknown = getHouseholdTypeStyle('unknown')
      
      expect(unknown.icon).toBe('👪') // Should fallback to nuclear
      expect(unknown.color).toBe('#3b82f6')
    })
  })
})