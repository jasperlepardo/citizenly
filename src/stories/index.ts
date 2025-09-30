/**
 * Stories Index
 *
 * @description Central export file for all Storybook stories.
 * This file provides a programmatic way to access story metadata
 * and is used for automated documentation generation.
 */

// Re-export design system documentation
export * from './AtomicDesign.mdx';
export * from './Atoms.mdx';
export * from './Molecules.mdx';
export * from './Organisms.mdx';
export * from './Templates.mdx';

// Story counts for documentation
export const STORY_COUNTS = {
  atoms: 27,
  molecules: 23,
  organisms: 25,
  templates: 5,
  total: 80,
} as const;

// Atomic design levels
export const ATOMIC_LEVELS = ['atoms', 'molecules', 'organisms', 'templates'] as const;

export type AtomicLevel = (typeof ATOMIC_LEVELS)[number];

// Story metadata for automated tools
export interface StoryMetadata {
  level: AtomicLevel;
  component: string;
  path: string;
  title: string;
}

/**
 * Utility function to generate story title from path
 */
export function generateStoryTitle(level: AtomicLevel, componentPath: string): string {
  const levelTitle = level.charAt(0).toUpperCase() + level.slice(1);
  const componentName = componentPath.split('/').pop() || componentPath;
  return `${levelTitle}/${componentName}`;
}

/**
 * Utility function to validate story organization
 */
export function isValidAtomicLevel(level: string): level is AtomicLevel {
  return ATOMIC_LEVELS.includes(level as AtomicLevel);
}
