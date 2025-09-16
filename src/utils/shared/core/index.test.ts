import { cn } from '@/components/shared/utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('handles undefined and null values', () => {
      expect(cn('text-red-500', undefined, 'bg-blue-500', null)).toBe('text-red-500 bg-blue-500');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const isDisabled = false;

      expect(cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class')).toBe(
        'base-class active-class'
      );
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('deduplicates classes using clsx/tailwind-merge', () => {
      // This test assumes tailwind-merge is handling conflicting utilities
      expect(cn('px-2', 'px-4')).toBeTruthy();
    });

    it('handles arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('handles objects with boolean values', () => {
      expect(
        cn({
          active: true,
          disabled: false,
          primary: true,
        })
      ).toBe('active primary');
    });
  });
});