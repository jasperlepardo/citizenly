/**
 * Button Component Tests
 * Tests for the atomic Button component
 */

import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { Button } from '../Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders button with correct default variant and size', () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600'); // primary variant
      expect(button).toHaveClass('px-2'); // regular size
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-purple-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders success variant correctly', () => {
      render(<Button variant="success">Success</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders warning variant correctly', () => {
      render(<Button variant="warning">Warning</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-orange-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders danger variant correctly', () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders outline variants correctly', () => {
      render(<Button variant="primary-outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-blue-600');
      expect(button).toHaveClass('bg-surface');
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-secondary');
      expect(button).not.toHaveClass('bg-');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('text-sm');
    });

    it('renders medium size correctly', () => {
      render(<Button size="md">Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('text-base');
    });

    it('renders large size correctly', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('text-base');
    });
  });

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<LeftIcon />}>With Left Icon</Button>);

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Left Icon')).toBeInTheDocument();
    });

    it('renders right icon correctly', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<RightIcon />}>With Right Icon</Button>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Right Icon')).toBeInTheDocument();
    });

    it('renders icon only button correctly', () => {
      const Icon = () => <span data-testid="icon">★</span>;
      render(
        <Button iconOnly leftIcon={<Icon />}>
          Hidden Text
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('aspect-square');
      expect(button).toHaveClass('p-2');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('adjusts icon-only button size correctly', () => {
      const Icon = () => <span data-testid="icon">★</span>;

      const { unmount } = render(
        <Button iconOnly leftIcon={<Icon />} size="sm">
          Icon
        </Button>
      );
      const smallButton = screen.getByRole('button');
      expect(smallButton).toHaveClass('h-8');
      expect(smallButton).toHaveClass('w-8');

      // Clean up and test large size
      unmount();
      render(
        <Button iconOnly leftIcon={<Icon />} size="lg">
          Icon
        </Button>
      );
      const largeButton = screen.getByRole('button');
      expect(largeButton).toHaveClass('h-10');
      expect(largeButton).toHaveClass('w-10');
    });
  });

  describe('States', () => {
    it('renders loading state correctly', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Should have loading spinner
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('hides icons when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;

      render(
        <Button loading leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Loading
        </Button>
      );

      // Icons should not be visible when loading
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('renders disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:bg-background-muted');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });

    it('renders full width correctly', () => {
      render(<Button fullWidth>Full Width</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      const { user } = render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const { user } = render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      const { user } = render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      const { user } = render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('supports custom ARIA attributes', () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('indicates loading state to screen readers', () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Loading state should be perceivable to screen readers
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('maintains focus visibility', () => {
      render(<Button>Focus Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });
  });

  describe('Form Integration', () => {
    it('works as submit button in forms', async () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      const { user } = render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      await user.click(screen.getByRole('button'));

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button with Ref</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Button with Ref');
    });
  });

  describe('Design System Integration', () => {
    it('uses design system font family', () => {
      render(<Button>Design System Font</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('font-system');
    });

    it('uses consistent transition timing', () => {
      render(<Button>Transition Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('follows focus ring design system', () => {
      render(<Button variant="primary">Focus Ring Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-blue-600');
    });
  });
});
