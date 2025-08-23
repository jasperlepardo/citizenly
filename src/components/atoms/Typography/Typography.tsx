'use client';

import React, { ElementType, HTMLAttributes } from 'react';
import { typography, type TypographyVariant } from '@/lib/ui/typography';
import { cn } from '@/lib/utilities/css-utils';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: ElementType;
  children: React.ReactNode;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'bodyMedium', as: Component = 'p', className, children, ...props }, ref) => {
    return (
      <Component ref={ref} className={cn(typography[variant], className)} {...props}>
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

// Convenience components for common use cases
export const Heading1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>(({ className, children, ...props }, ref) => (
  <Typography ref={ref} as="h1" variant="h1" className={className} {...props}>
    {children}
  </Typography>
));

export const Heading2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>(({ className, children, ...props }, ref) => (
  <Typography ref={ref} as="h2" variant="h2" className={className} {...props}>
    {children}
  </Typography>
));

export const Heading3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, 'variant' | 'as'>
>(({ className, children, ...props }, ref) => (
  <Typography ref={ref} as="h3" variant="h3" className={className} {...props}>
    {children}
  </Typography>
));

export const BodyText = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, 'variant' | 'as'>
>(({ className, children, ...props }, ref) => (
  <Typography ref={ref} as="p" variant="bodyMedium" className={className} {...props}>
    {children}
  </Typography>
));

export const Caption = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, 'variant' | 'as'>
>(({ className, children, ...props }, ref) => (
  <Typography ref={ref} as="p" variant="caption" className={className} {...props}>
    {children}
  </Typography>
));

Heading1.displayName = 'Heading1';
Heading2.displayName = 'Heading2';
Heading3.displayName = 'Heading3';
BodyText.displayName = 'BodyText';
Caption.displayName = 'Caption';

export default Typography;
