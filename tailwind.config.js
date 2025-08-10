/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const colors = require('tailwindcss/colors');

// Define your brand colors first (keeping your existing colors)
const brandColors = {
  primary: colors.blue, // Your government blue
  secondary: colors.purple, // Your secondary purple
  success: colors.green, // Your success green
  warning: colors.orange, // Your warning orange
  danger: colors.red, // Your danger red
  neutral: colors.gray, // Your neutral gray
  white: '#FFFFFF',
  black: '#000000',
};

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Your custom fonts
      fontFamily: {
        primary: ['Montserrat', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'], // Add font-display class
        body: ['Montserrat', 'sans-serif'], // Add font-body class
        system: ['Montserrat', 'sans-serif'], // Add font-system class
      },

      colors: {
        // Brand colors (your existing colors)
        ...brandColors,

        // =============================================================================
        // FIGMA-STYLE UTILITY COLORS WITH DARK MODE
        // =============================================================================
        // Professional utility color system following Figma design patterns
        // Use classes like: text-utility-gray-500, bg-utility-success-50, border-utility-error-600

        utility: {
          // Red utilities
          red: {
            50: { DEFAULT: colors.red[50], dark: colors.red[950] },
            100: { DEFAULT: colors.red[100], dark: colors.red[900] },
            200: { DEFAULT: colors.red[200], dark: colors.red[800] },
            300: { DEFAULT: colors.red[300], dark: colors.red[700] },
            400: { DEFAULT: colors.red[400], dark: colors.red[600] },
            500: { DEFAULT: colors.red[500], dark: colors.red[500] },
            600: { DEFAULT: colors.red[600], dark: colors.red[400] },
            700: { DEFAULT: colors.red[700], dark: colors.red[300] },
            800: { DEFAULT: colors.red[800], dark: colors.red[200] },
            900: { DEFAULT: colors.red[900], dark: colors.red[100] },
            950: { DEFAULT: colors.red[950], dark: colors.red[50] },
          },

          // Orange utilities
          orange: {
            50: { DEFAULT: colors.orange[50], dark: colors.orange[950] },
            100: { DEFAULT: colors.orange[100], dark: colors.orange[900] },
            200: { DEFAULT: colors.orange[200], dark: colors.orange[800] },
            300: { DEFAULT: colors.orange[300], dark: colors.orange[700] },
            400: { DEFAULT: colors.orange[400], dark: colors.orange[600] },
            500: { DEFAULT: colors.orange[500], dark: colors.orange[500] },
            600: { DEFAULT: colors.orange[600], dark: colors.orange[400] },
            700: { DEFAULT: colors.orange[700], dark: colors.orange[300] },
            800: { DEFAULT: colors.orange[800], dark: colors.orange[200] },
            900: { DEFAULT: colors.orange[900], dark: colors.orange[100] },
            950: { DEFAULT: colors.orange[950], dark: colors.orange[50] },
          },

          // Amber utilities
          amber: {
            50: { DEFAULT: colors.amber[50], dark: colors.amber[950] },
            100: { DEFAULT: colors.amber[100], dark: colors.amber[900] },
            200: { DEFAULT: colors.amber[200], dark: colors.amber[800] },
            300: { DEFAULT: colors.amber[300], dark: colors.amber[700] },
            400: { DEFAULT: colors.amber[400], dark: colors.amber[600] },
            500: { DEFAULT: colors.amber[500], dark: colors.amber[500] },
            600: { DEFAULT: colors.amber[600], dark: colors.amber[400] },
            700: { DEFAULT: colors.amber[700], dark: colors.amber[300] },
            800: { DEFAULT: colors.amber[800], dark: colors.amber[200] },
            900: { DEFAULT: colors.amber[900], dark: colors.amber[100] },
            950: { DEFAULT: colors.amber[950], dark: colors.amber[50] },
          },

          // Yellow utilities
          yellow: {
            50: { DEFAULT: colors.yellow[50], dark: colors.yellow[950] },
            100: { DEFAULT: colors.yellow[100], dark: colors.yellow[900] },
            200: { DEFAULT: colors.yellow[200], dark: colors.yellow[800] },
            300: { DEFAULT: colors.yellow[300], dark: colors.yellow[700] },
            400: { DEFAULT: colors.yellow[400], dark: colors.yellow[600] },
            500: { DEFAULT: colors.yellow[500], dark: colors.yellow[500] },
            600: { DEFAULT: colors.yellow[600], dark: colors.yellow[400] },
            700: { DEFAULT: colors.yellow[700], dark: colors.yellow[300] },
            800: { DEFAULT: colors.yellow[800], dark: colors.yellow[200] },
            900: { DEFAULT: colors.yellow[900], dark: colors.yellow[100] },
            950: { DEFAULT: colors.yellow[950], dark: colors.yellow[50] },
          },

          // Lime utilities
          lime: {
            50: { DEFAULT: colors.lime[50], dark: colors.lime[950] },
            100: { DEFAULT: colors.lime[100], dark: colors.lime[900] },
            200: { DEFAULT: colors.lime[200], dark: colors.lime[800] },
            300: { DEFAULT: colors.lime[300], dark: colors.lime[700] },
            400: { DEFAULT: colors.lime[400], dark: colors.lime[600] },
            500: { DEFAULT: colors.lime[500], dark: colors.lime[500] },
            600: { DEFAULT: colors.lime[600], dark: colors.lime[400] },
            700: { DEFAULT: colors.lime[700], dark: colors.lime[300] },
            800: { DEFAULT: colors.lime[800], dark: colors.lime[200] },
            900: { DEFAULT: colors.lime[900], dark: colors.lime[100] },
            950: { DEFAULT: colors.lime[950], dark: colors.lime[50] },
          },

          // Green utilities
          green: {
            50: { DEFAULT: colors.green[50], dark: colors.green[950] },
            100: { DEFAULT: colors.green[100], dark: colors.green[900] },
            200: { DEFAULT: colors.green[200], dark: colors.green[800] },
            300: { DEFAULT: colors.green[300], dark: colors.green[700] },
            400: { DEFAULT: colors.green[400], dark: colors.green[600] },
            500: { DEFAULT: colors.green[500], dark: colors.green[500] },
            600: { DEFAULT: colors.green[600], dark: colors.green[400] },
            700: { DEFAULT: colors.green[700], dark: colors.green[300] },
            800: { DEFAULT: colors.green[800], dark: colors.green[200] },
            900: { DEFAULT: colors.green[900], dark: colors.green[100] },
            950: { DEFAULT: colors.green[950], dark: colors.green[50] },
          },

          // Emerald utilities
          emerald: {
            50: { DEFAULT: colors.emerald[50], dark: colors.emerald[950] },
            100: { DEFAULT: colors.emerald[100], dark: colors.emerald[900] },
            200: { DEFAULT: colors.emerald[200], dark: colors.emerald[800] },
            300: { DEFAULT: colors.emerald[300], dark: colors.emerald[700] },
            400: { DEFAULT: colors.emerald[400], dark: colors.emerald[600] },
            500: { DEFAULT: colors.emerald[500], dark: colors.emerald[500] },
            600: { DEFAULT: colors.emerald[600], dark: colors.emerald[400] },
            700: { DEFAULT: colors.emerald[700], dark: colors.emerald[300] },
            800: { DEFAULT: colors.emerald[800], dark: colors.emerald[200] },
            900: { DEFAULT: colors.emerald[900], dark: colors.emerald[100] },
            950: { DEFAULT: colors.emerald[950], dark: colors.emerald[50] },
          },

          // Teal utilities
          teal: {
            50: { DEFAULT: colors.teal[50], dark: colors.teal[950] },
            100: { DEFAULT: colors.teal[100], dark: colors.teal[900] },
            200: { DEFAULT: colors.teal[200], dark: colors.teal[800] },
            300: { DEFAULT: colors.teal[300], dark: colors.teal[700] },
            400: { DEFAULT: colors.teal[400], dark: colors.teal[600] },
            500: { DEFAULT: colors.teal[500], dark: colors.teal[500] },
            600: { DEFAULT: colors.teal[600], dark: colors.teal[400] },
            700: { DEFAULT: colors.teal[700], dark: colors.teal[300] },
            800: { DEFAULT: colors.teal[800], dark: colors.teal[200] },
            900: { DEFAULT: colors.teal[900], dark: colors.teal[100] },
            950: { DEFAULT: colors.teal[950], dark: colors.teal[50] },
          },

          // Cyan utilities
          cyan: {
            50: { DEFAULT: colors.cyan[50], dark: colors.cyan[950] },
            100: { DEFAULT: colors.cyan[100], dark: colors.cyan[900] },
            200: { DEFAULT: colors.cyan[200], dark: colors.cyan[800] },
            300: { DEFAULT: colors.cyan[300], dark: colors.cyan[700] },
            400: { DEFAULT: colors.cyan[400], dark: colors.cyan[600] },
            500: { DEFAULT: colors.cyan[500], dark: colors.cyan[500] },
            600: { DEFAULT: colors.cyan[600], dark: colors.cyan[400] },
            700: { DEFAULT: colors.cyan[700], dark: colors.cyan[300] },
            800: { DEFAULT: colors.cyan[800], dark: colors.cyan[200] },
            900: { DEFAULT: colors.cyan[900], dark: colors.cyan[100] },
            950: { DEFAULT: colors.cyan[950], dark: colors.cyan[50] },
          },

          // Sky utilities
          sky: {
            50: { DEFAULT: colors.sky[50], dark: colors.sky[950] },
            100: { DEFAULT: colors.sky[100], dark: colors.sky[900] },
            200: { DEFAULT: colors.sky[200], dark: colors.sky[800] },
            300: { DEFAULT: colors.sky[300], dark: colors.sky[700] },
            400: { DEFAULT: colors.sky[400], dark: colors.sky[600] },
            500: { DEFAULT: colors.sky[500], dark: colors.sky[500] },
            600: { DEFAULT: colors.sky[600], dark: colors.sky[400] },
            700: { DEFAULT: colors.sky[700], dark: colors.sky[300] },
            800: { DEFAULT: colors.sky[800], dark: colors.sky[200] },
            900: { DEFAULT: colors.sky[900], dark: colors.sky[100] },
            950: { DEFAULT: colors.sky[950], dark: colors.sky[50] },
          },

          // Blue utilities
          blue: {
            50: { DEFAULT: colors.blue[50], dark: colors.blue[950] },
            100: { DEFAULT: colors.blue[100], dark: colors.blue[900] },
            200: { DEFAULT: colors.blue[200], dark: colors.blue[800] },
            300: { DEFAULT: colors.blue[300], dark: colors.blue[700] },
            400: { DEFAULT: colors.blue[400], dark: colors.blue[600] },
            500: { DEFAULT: colors.blue[500], dark: colors.blue[500] },
            600: { DEFAULT: colors.blue[600], dark: colors.blue[400] },
            700: { DEFAULT: colors.blue[700], dark: colors.blue[300] },
            800: { DEFAULT: colors.blue[800], dark: colors.blue[200] },
            900: { DEFAULT: colors.blue[900], dark: colors.blue[100] },
            950: { DEFAULT: colors.blue[950], dark: colors.blue[50] },
          },

          // Indigo utilities
          indigo: {
            50: { DEFAULT: colors.indigo[50], dark: colors.indigo[950] },
            100: { DEFAULT: colors.indigo[100], dark: colors.indigo[900] },
            200: { DEFAULT: colors.indigo[200], dark: colors.indigo[800] },
            300: { DEFAULT: colors.indigo[300], dark: colors.indigo[700] },
            400: { DEFAULT: colors.indigo[400], dark: colors.indigo[600] },
            500: { DEFAULT: colors.indigo[500], dark: colors.indigo[500] },
            600: { DEFAULT: colors.indigo[600], dark: colors.indigo[400] },
            700: { DEFAULT: colors.indigo[700], dark: colors.indigo[300] },
            800: { DEFAULT: colors.indigo[800], dark: colors.indigo[200] },
            900: { DEFAULT: colors.indigo[900], dark: colors.indigo[100] },
            950: { DEFAULT: colors.indigo[950], dark: colors.indigo[50] },
          },

          // Violet utilities
          violet: {
            50: { DEFAULT: colors.violet[50], dark: colors.violet[950] },
            100: { DEFAULT: colors.violet[100], dark: colors.violet[900] },
            200: { DEFAULT: colors.violet[200], dark: colors.violet[800] },
            300: { DEFAULT: colors.violet[300], dark: colors.violet[700] },
            400: { DEFAULT: colors.violet[400], dark: colors.violet[600] },
            500: { DEFAULT: colors.violet[500], dark: colors.violet[500] },
            600: { DEFAULT: colors.violet[600], dark: colors.violet[400] },
            700: { DEFAULT: colors.violet[700], dark: colors.violet[300] },
            800: { DEFAULT: colors.violet[800], dark: colors.violet[200] },
            900: { DEFAULT: colors.violet[900], dark: colors.violet[100] },
            950: { DEFAULT: colors.violet[950], dark: colors.violet[50] },
          },

          // Purple utilities
          purple: {
            50: { DEFAULT: colors.purple[50], dark: colors.purple[950] },
            100: { DEFAULT: colors.purple[100], dark: colors.purple[900] },
            200: { DEFAULT: colors.purple[200], dark: colors.purple[800] },
            300: { DEFAULT: colors.purple[300], dark: colors.purple[700] },
            400: { DEFAULT: colors.purple[400], dark: colors.purple[600] },
            500: { DEFAULT: colors.purple[500], dark: colors.purple[500] },
            600: { DEFAULT: colors.purple[600], dark: colors.purple[400] },
            700: { DEFAULT: colors.purple[700], dark: colors.purple[300] },
            800: { DEFAULT: colors.purple[800], dark: colors.purple[200] },
            900: { DEFAULT: colors.purple[900], dark: colors.purple[100] },
            950: { DEFAULT: colors.purple[950], dark: colors.purple[50] },
          },

          // Fuchsia utilities
          fuchsia: {
            50: { DEFAULT: colors.fuchsia[50], dark: colors.fuchsia[950] },
            100: { DEFAULT: colors.fuchsia[100], dark: colors.fuchsia[900] },
            200: { DEFAULT: colors.fuchsia[200], dark: colors.fuchsia[800] },
            300: { DEFAULT: colors.fuchsia[300], dark: colors.fuchsia[700] },
            400: { DEFAULT: colors.fuchsia[400], dark: colors.fuchsia[600] },
            500: { DEFAULT: colors.fuchsia[500], dark: colors.fuchsia[500] },
            600: { DEFAULT: colors.fuchsia[600], dark: colors.fuchsia[400] },
            700: { DEFAULT: colors.fuchsia[700], dark: colors.fuchsia[300] },
            800: { DEFAULT: colors.fuchsia[800], dark: colors.fuchsia[200] },
            900: { DEFAULT: colors.fuchsia[900], dark: colors.fuchsia[100] },
            950: { DEFAULT: colors.fuchsia[950], dark: colors.fuchsia[50] },
          },

          // Pink utilities
          pink: {
            50: { DEFAULT: colors.pink[50], dark: colors.pink[950] },
            100: { DEFAULT: colors.pink[100], dark: colors.pink[900] },
            200: { DEFAULT: colors.pink[200], dark: colors.pink[800] },
            300: { DEFAULT: colors.pink[300], dark: colors.pink[700] },
            400: { DEFAULT: colors.pink[400], dark: colors.pink[600] },
            500: { DEFAULT: colors.pink[500], dark: colors.pink[500] },
            600: { DEFAULT: colors.pink[600], dark: colors.pink[400] },
            700: { DEFAULT: colors.pink[700], dark: colors.pink[300] },
            800: { DEFAULT: colors.pink[800], dark: colors.pink[200] },
            900: { DEFAULT: colors.pink[900], dark: colors.pink[100] },
            950: { DEFAULT: colors.pink[950], dark: colors.pink[50] },
          },

          // Rose utilities
          rose: {
            50: { DEFAULT: colors.rose[50], dark: colors.rose[950] },
            100: { DEFAULT: colors.rose[100], dark: colors.rose[900] },
            200: { DEFAULT: colors.rose[200], dark: colors.rose[800] },
            300: { DEFAULT: colors.rose[300], dark: colors.rose[700] },
            400: { DEFAULT: colors.rose[400], dark: colors.rose[600] },
            500: { DEFAULT: colors.rose[500], dark: colors.rose[500] },
            600: { DEFAULT: colors.rose[600], dark: colors.rose[400] },
            700: { DEFAULT: colors.rose[700], dark: colors.rose[300] },
            800: { DEFAULT: colors.rose[800], dark: colors.rose[200] },
            900: { DEFAULT: colors.rose[900], dark: colors.rose[100] },
            950: { DEFAULT: colors.rose[950], dark: colors.rose[50] },
          },

          // Slate utilities
          slate: {
            50: { DEFAULT: colors.slate[50], dark: colors.slate[950] },
            100: { DEFAULT: colors.slate[100], dark: colors.slate[900] },
            200: { DEFAULT: colors.slate[200], dark: colors.slate[800] },
            300: { DEFAULT: colors.slate[300], dark: colors.slate[700] },
            400: { DEFAULT: colors.slate[400], dark: colors.slate[600] },
            500: { DEFAULT: colors.slate[500], dark: colors.slate[500] },
            600: { DEFAULT: colors.slate[600], dark: colors.slate[400] },
            700: { DEFAULT: colors.slate[700], dark: colors.slate[300] },
            800: { DEFAULT: colors.slate[800], dark: colors.slate[200] },
            900: { DEFAULT: colors.slate[900], dark: colors.slate[100] },
            950: { DEFAULT: colors.slate[950], dark: colors.slate[50] },
          },

          // Gray utilities
          gray: {
            50: { DEFAULT: colors.gray[50], dark: colors.gray[950] },
            100: { DEFAULT: colors.gray[100], dark: colors.gray[900] },
            200: { DEFAULT: colors.gray[200], dark: colors.gray[800] },
            300: { DEFAULT: colors.gray[300], dark: colors.gray[700] },
            400: { DEFAULT: colors.gray[400], dark: colors.gray[600] },
            500: { DEFAULT: colors.gray[500], dark: colors.gray[500] },
            600: { DEFAULT: colors.gray[600], dark: colors.gray[400] },
            700: { DEFAULT: colors.gray[700], dark: colors.gray[300] },
            800: { DEFAULT: colors.gray[800], dark: colors.gray[200] },
            900: { DEFAULT: colors.gray[900], dark: colors.gray[100] },
            950: { DEFAULT: colors.gray[950], dark: colors.gray[50] },
          },

          // Zinc utilities
          zinc: {
            50: { DEFAULT: colors.zinc[50], dark: colors.zinc[950] },
            100: { DEFAULT: colors.zinc[100], dark: colors.zinc[900] },
            200: { DEFAULT: colors.zinc[200], dark: colors.zinc[800] },
            300: { DEFAULT: colors.zinc[300], dark: colors.zinc[700] },
            400: { DEFAULT: colors.zinc[400], dark: colors.zinc[600] },
            500: { DEFAULT: colors.zinc[500], dark: colors.zinc[500] },
            600: { DEFAULT: colors.zinc[600], dark: colors.zinc[400] },
            700: { DEFAULT: colors.zinc[700], dark: colors.zinc[300] },
            800: { DEFAULT: colors.zinc[800], dark: colors.zinc[200] },
            900: { DEFAULT: colors.zinc[900], dark: colors.zinc[100] },
            950: { DEFAULT: colors.zinc[950], dark: colors.zinc[50] },
          },

          // Neutral utilities
          neutral: {
            50: { DEFAULT: colors.neutral[50], dark: colors.neutral[950] },
            100: { DEFAULT: colors.neutral[100], dark: colors.neutral[900] },
            200: { DEFAULT: colors.neutral[200], dark: colors.neutral[800] },
            300: { DEFAULT: colors.neutral[300], dark: colors.neutral[700] },
            400: { DEFAULT: colors.neutral[400], dark: colors.neutral[600] },
            500: { DEFAULT: colors.neutral[500], dark: colors.neutral[500] },
            600: { DEFAULT: colors.neutral[600], dark: colors.neutral[400] },
            700: { DEFAULT: colors.neutral[700], dark: colors.neutral[300] },
            800: { DEFAULT: colors.neutral[800], dark: colors.neutral[200] },
            900: { DEFAULT: colors.neutral[900], dark: colors.neutral[100] },
            950: { DEFAULT: colors.neutral[950], dark: colors.neutral[50] },
          },

          // Stone utilities
          stone: {
            50: { DEFAULT: colors.stone[50], dark: colors.stone[950] },
            100: { DEFAULT: colors.stone[100], dark: colors.stone[900] },
            200: { DEFAULT: colors.stone[200], dark: colors.stone[800] },
            300: { DEFAULT: colors.stone[300], dark: colors.stone[700] },
            400: { DEFAULT: colors.stone[400], dark: colors.stone[600] },
            500: { DEFAULT: colors.stone[500], dark: colors.stone[500] },
            600: { DEFAULT: colors.stone[600], dark: colors.stone[400] },
            700: { DEFAULT: colors.stone[700], dark: colors.stone[300] },
            800: { DEFAULT: colors.stone[800], dark: colors.stone[200] },
            900: { DEFAULT: colors.stone[900], dark: colors.stone[100] },
            950: { DEFAULT: colors.stone[950], dark: colors.stone[50] },
          },
        },
      },

      // =============================================================================
      // CLEAN SEMANTIC COLORS (Option 2: Tailwind-specific extensions)
      // =============================================================================
      // Result: text-primary, bg-primary, border-primary (no double prefixes)

      // Clean text colors (becomes text-primary, text-secondary, etc.)
      textColor: {
        // Primary text hierarchy
        default: {
          DEFAULT: brandColors.neutral[900], // Main text
          dark: brandColors.neutral[100],
        },
        default_onBrand: {
          DEFAULT: brandColors.white, // White text on brand colors
          dark: brandColors.neutral[50],
        },

        // Secondary text hierarchy
        default_secondary: {
          DEFAULT: brandColors.neutral[700], // Secondary text
          dark: brandColors.neutral[300],
        },
        default_secondary_hover: {
          DEFAULT: brandColors.neutral[800], // Secondary text hover
          dark: brandColors.neutral[200],
        },
        default_secondary_onBrand: {
          DEFAULT: brandColors.primary[200], // Secondary text on brand
          dark: brandColors.neutral[300],
        },

        // Tertiary text hierarchy
        default_tertiary: {
          DEFAULT: brandColors.neutral[600], // Tertiary text
          dark: brandColors.neutral[400],
        },
        default_tertiary_hover: {
          DEFAULT: brandColors.neutral[700], // Tertiary text hover
          dark: brandColors.neutral[300],
        },
        default_tertiary_onBrand: {
          DEFAULT: brandColors.primary[200], // Tertiary text on brand
          dark: brandColors.neutral[400],
        },

        // Quaternary text hierarchy
        default_quaternary: {
          DEFAULT: brandColors.neutral[500], // Quaternary text
          dark: brandColors.neutral[400],
        },

        // Utility text colors
        disabled: {
          DEFAULT: brandColors.neutral[400], // Disabled text
          dark: brandColors.neutral[600],
        },
        placeholder: {
          DEFAULT: brandColors.neutral[500], // Form placeholder
          dark: brandColors.neutral[400],
        },
        placeholder_subtle: {
          DEFAULT: brandColors.neutral[300], // Subtle placeholder
          dark: brandColors.neutral[700],
        },

        // Brand text colors
        primary: {
          DEFAULT: brandColors.primary[600], // Your government blue
          dark: brandColors.primary[400],
        },
        secondary: {
          DEFAULT: brandColors.secondary[600], // Your purple
          dark: brandColors.secondary[400],
        },

        // Status text colors
        success: {
          DEFAULT: brandColors.success[600],
          dark: brandColors.success[400],
        },
        warning: {
          DEFAULT: brandColors.warning[600],
          dark: brandColors.warning[400],
        },
        error: {
          DEFAULT: brandColors.danger[600],
          dark: brandColors.danger[400],
        },
      },

      // Clean background colors (becomes bg-primary, bg-secondary, etc.)
      backgroundColor: {
        // Primary backgrounds
        default: {
          DEFAULT: brandColors.white, // Main background
          dark: brandColors.neutral[900],
        },
        default_alt: {
          DEFAULT: brandColors.white, // Alternative primary
          dark: brandColors.neutral[900],
        },
        default_hover: {
          DEFAULT: brandColors.neutral[50], // Primary hover
          dark: brandColors.neutral[800],
        },

        // Secondary backgrounds
        default_secondary: {
          DEFAULT: brandColors.neutral[50], // Secondary background
          dark: brandColors.neutral[800],
        },
        default_secondary_alt: {
          DEFAULT: brandColors.neutral[50], // Alternative secondary
          dark: brandColors.neutral[800],
        },
        default_secondary_hover: {
          DEFAULT: brandColors.neutral[100], // Secondary hover
          dark: brandColors.neutral[700],
        },
        default_secondary_subtle: {
          DEFAULT: brandColors.neutral[50], // Very subtle secondary
          dark: brandColors.neutral[950],
        },

        // Additional backgrounds
        default_tertiary: {
          DEFAULT: brandColors.neutral[100], // Tertiary background
          dark: brandColors.neutral[700],
        },
        default_quaternary: {
          DEFAULT: brandColors.neutral[200], // Quaternary background
          dark: brandColors.neutral[600],
        },

        // Utility backgrounds
        disabled: {
          DEFAULT: brandColors.neutral[100], // Disabled background
          dark: brandColors.neutral[700],
        },
        overlay: {
          DEFAULT: brandColors.neutral[900], // Modal overlay
          dark: brandColors.neutral[950],
        },

        // Brand backgrounds
        primary: {
          DEFAULT: brandColors.primary[50], // Light brand background
          dark: brandColors.primary[950],
        },
        primary_solid: {
          DEFAULT: brandColors.primary[600], // Solid brand background
          dark: brandColors.primary[600],
        },
        primary_solid_hover: {
          DEFAULT: brandColors.primary[700], // Solid brand hover
          dark: brandColors.primary[500],
        },

        // Status backgrounds
        success: {
          DEFAULT: brandColors.success[50],
          dark: brandColors.success[950],
        },
        success_solid: {
          DEFAULT: brandColors.success[600],
          dark: brandColors.success[600],
        },
        warning: {
          DEFAULT: brandColors.warning[50],
          dark: brandColors.warning[950],
        },
        warning_solid: {
          DEFAULT: brandColors.warning[600],
          dark: brandColors.warning[600],
        },
        error: {
          DEFAULT: brandColors.danger[50],
          dark: brandColors.danger[950],
        },
        error_solid: {
          DEFAULT: brandColors.danger[600],
          dark: brandColors.danger[600],
        },
      },

      // Clean border colors (becomes border-primary, border-secondary, etc.)
      borderColor: {
        default: {
          DEFAULT: brandColors.neutral[300], // Primary border
          dark: brandColors.neutral[700],
        },
        default_secondary: {
          DEFAULT: brandColors.neutral[200], // Secondary border
          dark: brandColors.neutral[800],
        },
        default_tertiary: {
          DEFAULT: brandColors.neutral[100], // Tertiary border
          dark: brandColors.neutral[800],
        },

        // Utility borders
        disabled: {
          DEFAULT: brandColors.neutral[300], // Disabled border
          dark: brandColors.neutral[700],
        },
        disabled_subtle: {
          DEFAULT: brandColors.neutral[200], // Subtle disabled border
          dark: brandColors.neutral[800],
        },

        // Brand borders
        primary: {
          DEFAULT: brandColors.primary[300], // Light brand border
          dark: brandColors.primary[700],
        },
        brand_solid: {
          DEFAULT: brandColors.primary[600], // Solid brand border
          dark: brandColors.primary[600],
        },

        // Status borders
        success: {
          DEFAULT: brandColors.success[300],
          dark: brandColors.success[700],
        },
        success_solid: {
          DEFAULT: brandColors.success[600],
          dark: brandColors.success[600],
        },
        warning: {
          DEFAULT: brandColors.warning[300],
          dark: brandColors.warning[700],
        },
        warning_solid: {
          DEFAULT: brandColors.warning[600],
          dark: brandColors.warning[600],
        },
        error: {
          DEFAULT: brandColors.danger[300],
          dark: brandColors.danger[700],
        },
        error_solid: {
          DEFAULT: brandColors.danger[600],
          dark: brandColors.danger[600],
        },
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms'),
    
    // Semantic color plugin - converts your textColor structure to automatic dark mode classes
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss/plugin')(function({ addUtilities }) {
      const semanticUtilities = {
        // Text colors (17 classes matching your textColor structure exactly)
        '.text-default': {
          '@apply text-neutral-900 dark:text-neutral-100': {},
        },
        '.text-default-onBrand': {
          '@apply text-white dark:text-neutral-50': {},
        },
        '.text-default-secondary': {
          '@apply text-neutral-700 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-200': {},
        },
        '.text-default-secondary-onBrand': {
          '@apply text-blue-200 dark:text-neutral-300': {},
        },
        '.text-default-tertiary': {
          '@apply text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300': {},
        },
        '.text-default-tertiary-onBrand': {
          '@apply text-blue-200 dark:text-neutral-400': {},
        },
        '.text-default-quaternary': {
          '@apply text-neutral-500 dark:text-neutral-400': {},
        },
        '.text-disabled': {
          '@apply text-neutral-400 dark:text-neutral-600': {},
        },
        '.text-placeholder': {
          '@apply text-neutral-500 dark:text-neutral-400': {},
        },
        '.text-placeholder-subtle': {
          '@apply text-neutral-300 dark:text-neutral-700': {},
        },
        '.text-primary': {
          '@apply text-blue-600 dark:text-blue-400': {},
        },
        '.text-secondary': {
          '@apply text-purple-600 dark:text-purple-400': {},
        },
        '.text-success': {
          '@apply text-green-600 dark:text-green-400': {},
        },
        '.text-warning': {
          '@apply text-orange-600 dark:text-orange-400': {},
        },
        '.text-error': {
          '@apply text-red-600 dark:text-red-400': {},
        },
      }
      
      addUtilities(semanticUtilities)
    }),
  ],
};
