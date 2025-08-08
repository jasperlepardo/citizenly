import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/app/globals.css';

// Make React available globally for components that might not import it
(globalThis as any).React = React;

// Global decorator to add Montserrat font
const withGoogleFonts = (StoryFn: any) => {
  React.useEffect(() => {
    // Add Google Fonts link for Montserrat
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add font-family to body
    document.body.style.fontFamily =
      "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
  }, []);

  return <StoryFn />;
};

const preview: Preview = {
  decorators: [withGoogleFonts],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
      },
    },
  },
};

export default preview;
