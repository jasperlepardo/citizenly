/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Metadata } from 'next';

// Import the metadata export from the layout
import { metadata } from '../layout';

describe('Households Layout', () => {
  describe('Metadata', () => {
    it('should have proper SEO metadata', () => {
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Households Management | Citizenly');
      expect(metadata.description).toContain('household registration');
      expect(metadata.description).toContain('barangay administration');
    });

    it('should have proper keywords', () => {
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('households');
      expect(keywords).toContain('families');
      expect(keywords).toContain('household registration');
      expect(keywords).toContain('barangay management');
    });

    it('should have OpenGraph metadata', () => {
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe('Households Management - Citizenly');
      expect(metadata.openGraph?.description).toContain('household registration');
      expect((metadata.openGraph as any)?.type).toBe('website');
    });

    it('should have all required metadata properties', () => {
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.keywords).toBeTruthy();
      expect(metadata.openGraph).toBeTruthy();
    });

    it('should have proper title format', () => {
      expect(metadata.title).toMatch(/^.+ \| Citizenly$/);
    });

    it('should have description within SEO limits', () => {
      const description = metadata.description as string;
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThan(160);
    });
  });
});