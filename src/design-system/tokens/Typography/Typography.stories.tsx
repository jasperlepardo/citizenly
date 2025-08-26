import type { Meta, StoryObj } from '@storybook/react';
import Typography, {
  TypographyExample,
  FontFamilyShowcase,
  typographyTokens,
  typographyScale,
} from './Typography';

const meta = {
  title: 'Design System/Typography',
  component: Typography,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Typography Tokens

Typography system for the Citizenly design system, optimized for Philippine government 
applications with focus on readability and accessibility.

## Typography Philosophy

- **Hierarchy**: Clear information hierarchy using consistent scale
- **Readability**: Optimized line heights and spacing for Filipino content
- **Accessibility**: WCAG 2.1 AA compliant font sizes and contrast
- **Government Context**: Professional and trustworthy appearance

## Font Stack

- **Sans-serif**: Inter (primary) - Modern, readable, supports Filipino characters
- **Display**: Montserrat - For headlines and display purposes
- **Monospace**: JetBrains Mono - For code and technical content
- **Serif**: Georgia - For formal documents and emphasis

## Usage Guidelines

### Semantic HTML
Always use semantic HTML elements with appropriate typography tokens:
- \`h1-h6\` for headings
- \`p\` for paragraphs  
- \`strong\` and \`em\` for emphasis
- \`code\` for technical content

### Responsive Design
Typography scales appropriately across devices:
- Mobile: Slightly smaller base size (14px)
- Desktop: Standard base size (16px)
- Large screens: Larger display sizes

### Accessibility
- Minimum 16px for body text
- 4.5:1 contrast ratio for normal text
- 3:1 contrast ratio for large text (18pt+)
- Scalable to 200% zoom
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// MAIN STORIES
// =============================================================================

export const AllTypography: Story = {
  name: '📝 All Typography',
  render: () => <Typography />,
};

export const FontFamilies: Story = {
  name: '🔤 Font Families',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Font Families</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Object.entries(typographyTokens.fontFamily).map(([name, fonts]) => (
          <FontFamilyShowcase
            key={name}
            title={name.charAt(0).toUpperCase() + name.slice(1)}
            fontFamily={fonts}
          />
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          🎯 Font Selection Rationale
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-800 md:grid-cols-2 dark:text-gray-200">
          <div>
            <strong>Inter (Sans-serif):</strong> Highly legible, excellent Filipino character
            support, optimized for UI text and government forms.
          </div>
          <div>
            <strong>Montserrat (Display):</strong> Strong geometric sans-serif perfect for headings
            and official government branding.
          </div>
          <div>
            <strong>JetBrains Mono:</strong> Clear distinction between similar characters, excellent
            for technical documentation and code.
          </div>
          <div>
            <strong>Georgia (Serif):</strong> Traditional serif for formal documents and official
            government communications.
          </div>
        </div>
      </div>
    </div>
  ),
};

export const DisplayTypography: Story = {
  name: '🏆 Display Typography',
  render: () => (
    <div className="p-6">
      <TypographyExample
        title="Display Typography - Hero & Landing Pages"
        styles={typographyScale.display}
        sampleText="Citizenly Government Portal"
      />

      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 font-semibold text-green-900">✨ When to Use Display Typography</h3>
        <ul className="space-y-1 text-sm text-green-800">
          <li>• Hero sections and landing page headlines</li>
          <li>• Marketing and promotional content</li>
          <li>• Major section dividers</li>
          <li>• Special announcements or alerts</li>
          <li>• Brand-focused content areas</li>
        </ul>
      </div>
    </div>
  ),
};

export const Headings: Story = {
  name: '📑 Headings (H1-H6)',
  render: () => (
    <div className="p-6">
      <TypographyExample
        title="Heading Hierarchy"
        styles={typographyScale.heading}
        sampleText="Barangay Management System"
      />

      {/* Content Hierarchy Example */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          📋 Content Hierarchy Example
        </h3>

        <article className="space-y-4">
          <h1 style={typographyScale.heading.h1}>Records of Barangay Inhabitants</h1>

          <h2 style={typographyScale.heading.h2}>Resident Registration</h2>
          <p style={typographyScale.body.md}>
            This section covers the process of registering new residents in the barangay system.
          </p>

          <h3 style={typographyScale.heading.h3}>Required Documents</h3>
          <p style={typographyScale.body.md}>
            Please prepare the following documents for resident registration.
          </p>

          <h4 style={typographyScale.heading.h4}>Primary Documents</h4>
          <p style={typographyScale.body.sm}>Birth certificate, valid ID, proof of residency.</p>

          <h5 style={typographyScale.heading.h5}>Additional Requirements</h5>
          <p style={typographyScale.body.sm}>Barangay clearance, certificate of residency.</p>

          <h6 style={typographyScale.heading.h6}>Processing Notes</h6>
          <p style={typographyScale.body.xs}>
            All documents will be verified within 3-5 business days.
          </p>
        </article>
      </div>
    </div>
  ),
};

export const BodyText: Story = {
  name: '📄 Body Text',
  render: () => (
    <div className="p-6">
      <TypographyExample
        title="Body Text Scales"
        styles={typographyScale.body}
        sampleText="This is body text used for paragraphs, descriptions, and general content throughout the application. It should be highly readable and accessible for all users."
      />

      {/* Reading Example */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          📖 Reading Example
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Large Body Text (xl)
            </h4>
            <p style={typographyScale.body.xl}>
              Ang Citizenly ay isang digital platform na naglalayong mapabuti ang serbisyong
              barangay sa pamamagitan ng modernong teknolohiya. Nagbibigay ito ng madaling paraan
              para sa mga residente na makipag-ugnayan sa kanilang lokal na pamahalaan.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Regular Body Text (md)
            </h4>
            <p style={typographyScale.body.md}>
              The platform enables efficient management of resident records, household information,
              and barangay services. It streamlines processes like certificate requests, complaint
              filing, and information updates.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Small Body Text (sm)
            </h4>
            <p style={typographyScale.body.sm}>
              Built with accessibility in mind, the system supports multiple languages and ensures
              all residents can access government services regardless of their technical expertise
              or physical abilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const FormTypography: Story = {
  name: '📋 Form & Label Typography',
  render: () => (
    <div className="p-6">
      <TypographyExample
        title="Labels & Form Elements"
        styles={typographyScale.label}
        sampleText="Form Field Label"
      />

      {/* Form Example */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          🏷️ Form Typography Example
        </h3>

        <div className="max-w-md space-y-4">
          <div>
            <label
              style={typographyScale.label.lg}
              className="mb-1 block text-gray-900 dark:text-gray-100"
            >
              First Name *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter your first name"
              style={typographyScale.body.md}
            />
            <p style={typographyScale.body.xs} className="mt-1 text-gray-500 dark:text-gray-500">
              As written on your birth certificate
            </p>
          </div>

          <div>
            <label
              style={typographyScale.label.md}
              className="mb-1 block text-gray-900 dark:text-gray-100"
            >
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="your.email@example.com"
              style={typographyScale.body.sm}
            />
          </div>

          <div>
            <label
              style={typographyScale.label.sm}
              className="mb-1 block text-gray-700 dark:text-gray-300"
            >
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="+63 912 345 6789"
              style={typographyScale.body.sm}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const CodeTypography: Story = {
  name: '💻 Code & Monospace',
  render: () => (
    <div className="p-6">
      <TypographyExample
        title="Code & Monospace Typography"
        styles={typographyScale.code}
        sampleText="const residentData = { name: 'Juan Dela Cruz', barangay: 'Sample' };"
      />

      {/* Code Examples */}
      <div className="mt-8 space-y-6">
        <div className="rounded-lg bg-gray-900 p-4">
          <h4 className="mb-3 font-medium text-white dark:text-black dark:text-white">
            Code Block Example
          </h4>
          <pre style={typographyScale.code.md} className="overflow-x-auto text-green-400">
            {`// Resident registration function
async function registerResident(data) {
  const resident = await supabase
    .from('residents')
    .insert([{
      first_name: data.firstName,
      last_name: data.lastName,
      barangay_code: data.barangayCode
    }]);
  
  return resident;
}`}
          </pre>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 font-medium">Inline Code Example</h4>
          <p style={typographyScale.body.md} className="text-gray-900 dark:text-gray-100">
            To update a resident record, use the{' '}
            <code style={typographyScale.code.sm} className="rounded bg-gray-200 px-1">
              updateResident()
            </code>{' '}
            function with the resident&rsquo;s{' '}
            <code style={typographyScale.code.sm} className="rounded bg-gray-200 px-1">
              philsys_number
            </code>{' '}
            as the identifier.
          </p>
        </div>
      </div>
    </div>
  ),
};

// =============================================================================
// ACCESSIBILITY EXAMPLES
// =============================================================================

export const AccessibilityExamples: Story = {
  name: '♿ Typography Accessibility',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Typography Accessibility
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Good Examples */}
        <div className="overflow-hidden rounded-lg border border-green-200">
          <div className="border-b border-green-200 bg-green-100 px-4 py-2">
            <h3 className="font-semibold text-green-900">✅ Accessible Typography</h3>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <p className="text-base leading-normal text-gray-900 dark:text-gray-100">
                16px body text with 1.5 line height - highly readable
              </p>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                18px large text with 1.625 line height - excellent for important content
              </p>
            </div>
            <div className="rounded bg-blue-600 p-3 text-white dark:text-black">
              <p className="text-sm font-medium">
                White text on blue background - 4.5:1 contrast ratio
              </p>
            </div>
          </div>
        </div>

        {/* Bad Examples */}
        <div className="overflow-hidden rounded-lg border border-red-200">
          <div className="border-b border-red-200 bg-red-100 px-4 py-2">
            <h3 className="font-semibold text-red-900">❌ Poor Typography</h3>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <p className="text-xs leading-tight text-gray-600 dark:text-gray-400">
                12px text with tight line height - hard to read
              </p>
            </div>
            <div>
              <p className="text-base leading-none text-gray-900 dark:text-gray-100">
                16px text with no line height spacing - cramped and difficult
              </p>
            </div>
            <div className="rounded bg-yellow-200 p-3 text-yellow-400">
              <p className="text-sm">Low contrast text - fails accessibility standards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            📏 Size Guidelines
          </h3>
          <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
            <li>• Minimum 16px (1rem) for body text</li>
            <li>• 18px (1.125rem) for large/important text</li>
            <li>• 14px (0.875rem) minimum for secondary text</li>
            <li>• 12px (0.75rem) only for captions/fine print</li>
          </ul>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-900">📐 Spacing Guidelines</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Line height: 1.5 (normal) to 1.625 (relaxed)</li>
            <li>• Letter spacing: normal or slightly wide</li>
            <li>• Paragraph spacing: 1em bottom margin</li>
            <li>• Heading spacing: 1.5em top, 0.5em bottom</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          🧪 Testing Checklist
        </h3>
        <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
          <li>• Test with 200% browser zoom</li>
          <li>• Verify contrast ratios with WebAIM tool</li>
          <li>• Test with screen readers</li>
          <li>• Check readability on mobile devices</li>
          <li>• Validate with users who have dyslexia</li>
        </ul>
      </div>
    </div>
  ),
};
