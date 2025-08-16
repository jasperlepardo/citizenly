'use client';

import React from 'react';

// =============================================================================
// TYPOGRAPHY TOKEN DEFINITIONS
// =============================================================================

export const typographyTokens = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'Times New Roman', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
  },

  // Font Sizes (rem values)
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px (base)
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SEMANTIC TYPOGRAPHY SCALE
// =============================================================================

export const typographyScale = {
  // Display Typography (Hero sections, large headings)
  display: {
    '2xl': {
      fontSize: typographyTokens.fontSize['7xl'],
      lineHeight: typographyTokens.lineHeight.none,
      fontWeight: typographyTokens.fontWeight.bold,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    xl: {
      fontSize: typographyTokens.fontSize['6xl'],
      lineHeight: typographyTokens.lineHeight.none,
      fontWeight: typographyTokens.fontWeight.bold,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    lg: {
      fontSize: typographyTokens.fontSize['5xl'],
      lineHeight: typographyTokens.lineHeight.tight,
      fontWeight: typographyTokens.fontWeight.bold,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    md: {
      fontSize: typographyTokens.fontSize['4xl'],
      lineHeight: typographyTokens.lineHeight.tight,
      fontWeight: typographyTokens.fontWeight.bold,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    sm: {
      fontSize: typographyTokens.fontSize['3xl'],
      lineHeight: typographyTokens.lineHeight.tight,
      fontWeight: typographyTokens.fontWeight.semibold,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
  },

  // Headings (H1-H6)
  heading: {
    h1: {
      fontSize: typographyTokens.fontSize['4xl'],
      lineHeight: typographyTokens.lineHeight.tight,
      fontWeight: typographyTokens.fontWeight.bold,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    h2: {
      fontSize: typographyTokens.fontSize['3xl'],
      lineHeight: typographyTokens.lineHeight.tight,
      fontWeight: typographyTokens.fontWeight.bold,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    h3: {
      fontSize: typographyTokens.fontSize['2xl'],
      lineHeight: typographyTokens.lineHeight.snug,
      fontWeight: typographyTokens.fontWeight.semibold,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    h4: {
      fontSize: typographyTokens.fontSize.xl,
      lineHeight: typographyTokens.lineHeight.snug,
      fontWeight: typographyTokens.fontWeight.semibold,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    h5: {
      fontSize: typographyTokens.fontSize.lg,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.medium,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    h6: {
      fontSize: typographyTokens.fontSize.base,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.medium,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
  },

  // Body Text
  body: {
    xl: {
      fontSize: typographyTokens.fontSize.xl,
      lineHeight: typographyTokens.lineHeight.relaxed,
      fontWeight: typographyTokens.fontWeight.normal,
    },
    lg: {
      fontSize: typographyTokens.fontSize.lg,
      lineHeight: typographyTokens.lineHeight.relaxed,
      fontWeight: typographyTokens.fontWeight.normal,
    },
    md: {
      fontSize: typographyTokens.fontSize.base,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.normal,
    },
    sm: {
      fontSize: typographyTokens.fontSize.sm,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.normal,
    },
    xs: {
      fontSize: typographyTokens.fontSize.xs,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.normal,
    },
  },

  // Labels & Captions
  label: {
    lg: {
      fontSize: typographyTokens.fontSize.base,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.medium,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    md: {
      fontSize: typographyTokens.fontSize.sm,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.medium,
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
    sm: {
      fontSize: typographyTokens.fontSize.xs,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.medium,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
  },

  // Code Typography
  code: {
    lg: {
      fontSize: typographyTokens.fontSize.base,
      lineHeight: typographyTokens.lineHeight.relaxed,
      fontWeight: typographyTokens.fontWeight.normal,
      fontFamily: typographyTokens.fontFamily.mono,
    },
    md: {
      fontSize: typographyTokens.fontSize.sm,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.normal,
      fontFamily: typographyTokens.fontFamily.mono,
    },
    sm: {
      fontSize: typographyTokens.fontSize.xs,
      lineHeight: typographyTokens.lineHeight.normal,
      fontWeight: typographyTokens.fontWeight.normal,
      fontFamily: typographyTokens.fontFamily.mono,
    },
  },
} as const;

// =============================================================================
// TYPOGRAPHY COMPONENTS
// =============================================================================

interface TypographyExampleProps {
  title: string;
  styles: Record<string, any>;
  sampleText?: string;
}

export const TypographyExample: React.FC<TypographyExampleProps> = ({
  title,
  styles,
  sampleText = 'The quick brown fox jumps over the lazy dog',
}) => (
  <div className="mb-8 rounded-lg border border-gray-200 p-6">
    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    <div className="space-y-4">
      {Object.entries(styles).map(([size, style]) => (
        <div key={size} className="flex items-start gap-6">
          <div className="w-20 shrink-0">
            <span className="font-mono text-sm text-gray-500 dark:text-gray-500">{size}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-gray-900 dark:text-gray-100" style={style}>
              {sampleText}
            </div>
            <div className="font-mono text-xs text-gray-500 dark:text-gray-500">
              {style.fontSize} • {style.lineHeight} • {style.fontWeight}
              {style.letterSpacing && ` • ${style.letterSpacing}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface FontFamilyShowcaseProps {
  title: string;
  fontFamily: readonly string[];
  sampleText?: string;
}

export const FontFamilyShowcase: React.FC<FontFamilyShowcaseProps> = ({
  title,
  fontFamily,
  sampleText = 'The quick brown fox jumps over the lazy dog 0123456789',
}) => (
  <div className="mb-6 rounded-lg border border-gray-200 p-4">
    <h4 className="text-md mb-3 font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
    <div className="mb-2 text-2xl text-gray-900 dark:text-gray-100" style={{ fontFamily: fontFamily.join(', ') }}>
      {sampleText}
    </div>
    <div className="font-mono text-sm text-gray-500 dark:text-gray-500">{fontFamily.join(', ')}</div>
  </div>
);

// =============================================================================
// MAIN TYPOGRAPHY COMPONENT
// =============================================================================

const Typography: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Design Tokens: Typography</h1>
        <p className="max-w-2xl text-gray-600 dark:text-gray-400">
          Typography tokens for the Citizenly design system. These tokens ensure consistent,
          readable, and accessible text across all government applications.
        </p>
      </div>

      {/* Font Families */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Font Families</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Object.entries(typographyTokens.fontFamily).map(([name, fonts]) => (
            <FontFamilyShowcase
              key={name}
              title={name.charAt(0).toUpperCase() + name.slice(1)}
              fontFamily={fonts}
            />
          ))}
        </div>
      </div>

      {/* Display Typography */}
      <TypographyExample
        title="Display Typography"
        styles={typographyScale.display}
        sampleText="Citizenly Government Portal"
      />

      {/* Headings */}
      <TypographyExample
        title="Headings (H1-H6)"
        styles={typographyScale.heading}
        sampleText="Barangay Management System"
      />

      {/* Body Text */}
      <TypographyExample
        title="Body Text"
        styles={typographyScale.body}
        sampleText="This is body text used for paragraphs, descriptions, and general content throughout the application."
      />

      {/* Labels */}
      <TypographyExample
        title="Labels & Form Elements"
        styles={typographyScale.label}
        sampleText="Form Label Text"
      />

      {/* Code Typography */}
      <TypographyExample
        title="Code & Monospace"
        styles={typographyScale.code}
        sampleText="const citizenly = 'government-portal';"
      />

      {/* Usage Guidelines */}
      <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">📝 Typography Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Hierarchy</h4>
            <ul className="space-y-1 text-gray-800 dark:text-gray-200">
              <li>• Use display typography for hero sections</li>
              <li>• Follow H1-H6 hierarchy for content structure</li>
              <li>• Limit to 3-4 text sizes per screen</li>
              <li>• Maintain consistent vertical rhythm</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Accessibility</h4>
            <ul className="space-y-1 text-gray-800 dark:text-gray-200">
              <li>• Minimum 16px font size for body text</li>
              <li>• Line height of 1.5 for readability</li>
              <li>• Adequate color contrast ratios</li>
              <li>• Scalable text for zoom up to 200%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CSS Classes Reference */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">💻 Usage in Code</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Tailwind CSS Classes</h4>
            <pre className="overflow-x-auto rounded-sm border bg-white p-3 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-700">
              {`<!-- Display Typography -->
<h1 class="text-4xl font-bold leading-tight tracking-tight">

<!-- Headings -->  
<h2 class="text-2xl font-semibold leading-snug">
<h3 class="text-xl font-medium leading-normal">

<!-- Body Text -->
<p class="text-base leading-normal">
<p class="text-sm leading-normal">

<!-- Labels -->
<label class="text-sm font-medium tracking-wide">`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Typography;
