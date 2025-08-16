import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileUpload } from './FileUpload';

// Mock the security functions for Storybook
const mockValidateUploadedFile = async (file: File) => ({
  isValid: true,
  errors: [],
  fileInfo: { hash: 'mock-hash' },
});

const mockScanFileForViruses = async (file: File) => ({
  clean: true,
  threats: [],
});

const mockLogFileOperation = (
  operation: string,
  filename: string,
  user: string,
  status: string,
  metadata: any
) => {
  console.log('File operation:', { operation, filename, user, status, metadata });
};

// Mock logger
const mockLogger = {
  error: (message: string, data: any) => console.error(message, data),
};

// Note: This story mocks security dependencies that may not exist in the actual implementation
const meta = {
  title: 'Molecules/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A secure file upload component with drag-and-drop support, file validation, virus scanning, and preview functionality. Note: Security functions are mocked in this story.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'disabled'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    multiple: {
      control: { type: 'boolean' },
    },
    showPreview: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    maxFileSize: {
      control: { type: 'number' },
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [files, setFiles] = useState<FileList | null>(null);

    return (
      <div className="w-96">
        <FileUpload
          {...args}
          onFileSelect={fileList => {
            setFiles(fileList);
            console.log('Files selected:', fileList);
          }}
        />

        {files && (
          <div className="mt-4 rounded-sm bg-gray-100 p-3 text-sm">
            <strong>Selected:</strong>{' '}
            {Array.from(files)
              .map(f => f.name)
              .join(', ')}
          </div>
        )}
      </div>
    );
  },
  args: {
    label: 'Upload Files',
    helperText: 'Drag and drop your files here or click to browse',
  },
};

export const WithLabel: Story = {
  render: () => {
    const [files, setFiles] = useState<FileList | null>(null);

    return (
      <div className="w-96">
        <FileUpload
          label="Document Upload"
          helperText="Upload your supporting documents (PDF, DOC, DOCX)"
          acceptedFileTypes=".pdf,.doc,.docx"
          maxFileSize={10}
          showPreview
          onFileSelect={setFiles}
        />
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [files, setFiles] = useState<FileList | null>(null);

    return (
      <div className="w-96">
        <FileUpload
          label="Multiple File Upload"
          helperText="You can select multiple files at once"
          multiple
          showPreview
          maxFileSize={5}
          onFileSelect={setFiles}
        />
      </div>
    );
  },
};

export const ImageUpload: Story = {
  render: () => {
    const [files, setFiles] = useState<FileList | null>(null);

    return (
      <div className="w-96">
        <FileUpload
          label="Profile Picture"
          dragText="Drop your profile picture here"
          browseText="or choose from device"
          helperText="Upload a profile picture to personalize your account"
          acceptedFileTypes="image/*"
          maxFileSize={2}
          showPreview
          onFileSelect={setFiles}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Small Size</h3>
        <FileUpload
          size="sm"
          label="Small Upload"
          acceptedFileTypes=".txt,.csv"
          onFileSelect={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Medium Size (Default)</h3>
        <FileUpload
          size="md"
          label="Medium Upload"
          acceptedFileTypes=".pdf,.doc"
          onFileSelect={() => {}}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Large Size</h3>
        <FileUpload
          size="lg"
          label="Large Upload"
          acceptedFileTypes="image/*,video/*"
          onFileSelect={() => {}}
        />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="w-96 space-y-8">
      <FileUpload
        label="Normal State"
        helperText="Upload your files here"
        onFileSelect={() => {}}
      />

      <FileUpload
        label="Error State"
        errorMessage="File type not supported. Please upload a valid file."
        variant="error"
        onFileSelect={() => {}}
      />

      <FileUpload
        label="Success State"
        helperText="Files uploaded successfully!"
        variant="success"
        onFileSelect={() => {}}
      />

      <FileUpload
        label="Disabled State"
        helperText="File upload is currently disabled"
        disabled
        onFileSelect={() => {}}
      />
    </div>
  ),
};

export const FileTypes: Story = {
  render: () => (
    <div className="w-96 space-y-8">
      <FileUpload
        label="Documents Only"
        acceptedFileTypes=".pdf,.doc,.docx,.txt"
        helperText="PDF, Word documents, and text files only"
        onFileSelect={() => {}}
      />

      <FileUpload
        label="Images Only"
        acceptedFileTypes="image/*"
        helperText="All image formats accepted"
        onFileSelect={() => {}}
      />

      <FileUpload
        label="Spreadsheets Only"
        acceptedFileTypes=".xlsx,.xls,.csv"
        helperText="Excel and CSV files only"
        onFileSelect={() => {}}
      />

      <FileUpload label="All Files" helperText="Any file type accepted" onFileSelect={() => {}} />
    </div>
  ),
};

export const WithPreview: Story = {
  render: () => {
    const [files, setFiles] = useState<FileList | null>(null);

    return (
      <div className="w-96">
        <FileUpload
          label="Upload with Preview"
          helperText="Files will be shown below after selection"
          multiple
          showPreview
          acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          maxFileSize={10}
          onFileSelect={setFiles}
        />
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      documents: null as FileList | null,
      avatar: null as FileList | null,
      resume: null as FileList | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: Record<string, string> = {};
      if (!formData.documents) newErrors.documents = 'Please upload at least one document';
      if (!formData.resume) newErrors.resume = 'Resume is required';

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        alert('Form submitted successfully!');
        console.log('Form data:', formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <FileUpload
          label="Profile Picture"
          dragText="Drop your photo here"
          browseText="or select from device"
          helperText="Optional: Add a profile picture (max 2MB)"
          acceptedFileTypes="image/*"
          maxFileSize={2}
          showPreview
          onFileSelect={files => setFormData(prev => ({ ...prev, avatar: files }))}
        />

        <FileUpload
          label="Resume/CV *"
          helperText="Upload your resume or CV (PDF preferred)"
          acceptedFileTypes=".pdf,.doc,.docx"
          maxFileSize={5}
          showPreview
          errorMessage={errors.resume}
          variant={errors.resume ? 'error' : 'default'}
          onFileSelect={files => setFormData(prev => ({ ...prev, resume: files }))}
        />

        <FileUpload
          label="Supporting Documents *"
          helperText="Upload any supporting documents (certificates, portfolios, etc.)"
          multiple
          acceptedFileTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          maxFileSize={10}
          showPreview
          errorMessage={errors.documents}
          variant={errors.documents ? 'error' : 'default'}
          onFileSelect={files => setFormData(prev => ({ ...prev, documents: files }))}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
          >
            Submit Application
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ documents: null, avatar: null, resume: null });
              setErrors({});
            }}
            className="rounded bg-gray-500 px-4 py-2 text-white dark:text-black hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>
    );
  },
};

export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="w-96">
        <FileUpload
          label="Custom Upload Area"
          dragText="🎨 Drop your creative files here"
          browseText="or explore your files"
          helperText="We accept all your creative works!"
          acceptedFileTypes="image/*,.psd,.ai,.sketch"
          className="border-purple-300 bg-purple-50 hover:border-purple-400"
          onFileSelect={() => {}}
        />
      </div>

      <div className="w-96">
        <FileUpload
          label="Minimal Upload"
          size="sm"
          dragText="Drop files"
          browseText="browse"
          acceptedFileTypes=".txt,.md"
          className="border-gray-200 bg-gray-50"
          onFileSelect={() => {}}
        />
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Accessibility Features</h3>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>
            • <strong>Keyboard accessible</strong>: Tab to focus, Enter/Space to open file dialog
          </li>
          <li>
            • <strong>Screen reader support</strong>: Proper labels and descriptions
          </li>
          <li>
            • <strong>Drag and drop</strong>: Visual feedback for drag over state
          </li>
          <li>
            • <strong>File validation</strong>: Clear error messages for invalid files
          </li>
          <li>
            • <strong>Progress indication</strong>: Visual feedback during upload process
          </li>
        </ul>
      </div>

      <div className="w-96">
        <FileUpload
          label="Accessible File Upload"
          helperText="This component is fully accessible via keyboard and screen readers"
          acceptedFileTypes=".pdf,.jpg,.png"
          maxFileSize={5}
          showPreview
          onFileSelect={() => {}}
        />
      </div>
    </div>
  ),
};
