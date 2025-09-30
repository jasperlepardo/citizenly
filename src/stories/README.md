# Stories

This directory contains all Storybook stories organized by atomic design principles.

## Structure

```
src/stories/
├── atoms/           # Basic building blocks (Button, Input, etc.)
├── molecules/       # Simple groups of atoms (SearchBar, Modal, etc.)
├── organisms/       # Complex UI components (Navigation, Forms, etc.)
├── templates/       # Page-level layouts (AppShell, Layout, etc.)
├── AtomicDesign.mdx # Documentation about atomic design
├── Atoms.mdx        # Atoms documentation
├── Molecules.mdx    # Molecules documentation
├── Organisms.mdx    # Organisms documentation
└── Templates.mdx    # Templates documentation
```

## Atomic Design Principles

This project follows Brad Frost's Atomic Design methodology:

- **Atoms**: Basic building blocks of matter (buttons, inputs, labels)
- **Molecules**: Simple groups of atoms functioning together (search bar, card)
- **Organisms**: Relatively complex UI components (header, navigation, forms)
- **Templates**: Page-level objects that place components into a layout
- **Pages**: Specific instances of templates (not included in stories)

## Story Organization

Each story file follows the naming convention:

- File: `ComponentName.stories.tsx`
- Title: `Level/ComponentName` (e.g., "Atoms/Button", "Molecules/SearchBar")

## Running Stories

```bash
npm run storybook
```

The Storybook will be available at `http://localhost:6006`

## Adding New Stories

1. Place story files in the appropriate atomic design level directory
2. Use absolute imports: `import { Button } from '@/components/atoms/Button'`
3. Follow existing story patterns and naming conventions
4. Include proper TypeScript types and JSDoc documentation

## Design System Integration

Stories in this directory showcase components that implement the design system tokens located in `src/design-system/tokens/`. This ensures consistency across the application.
