import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'UI/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile file upload component with drag-and-drop support, file previews, and various states.',
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
    label: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    multiple: {
      control: 'boolean',
    },
    showPreview: {
      control: 'boolean',
    },
    accept: {
      control: 'text',
    },
    maxFileSize: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Upload Document',
    helperText: 'Choose a file or drag and drop it here',
    accept: '.pdf,.doc,.docx',
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
};

export const MultipleFiles: Story = {
  args: {
    label: 'Upload Images',
    helperText: 'Select multiple images to upload',
    multiple: true,
    accept: '.jpg,.jpeg,.png,.gif,.webp',
    showPreview: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB per file
  },
};

export const ImageUpload: Story = {
  args: {
    label: 'Profile Picture',
    helperText: 'Upload your profile picture (max 1MB)',
    accept: 'image/*',
    showPreview: true,
    maxFileSize: 1024 * 1024, // 1MB
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Upload Failed',
    helperText: 'Please try uploading again',
    variant: 'error',
    errorMessage: 'File size exceeds maximum limit of 5MB',
    accept: '.pdf,.doc,.docx',
  },
};

export const SuccessState: Story = {
  args: {
    label: 'Upload Complete',
    helperText: 'Your files have been uploaded successfully',
    variant: 'success',
    accept: '*',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Upload Disabled',
    helperText: 'File upload is currently disabled',
    disabled: true,
    accept: '*',
  },
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small Upload',
    size: 'sm',
    helperText: 'Compact file upload',
    accept: '*',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium Upload',
    size: 'md',
    helperText: 'Default size file upload',
    accept: '*',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Upload',
    size: 'lg',
    helperText: 'Large file upload area',
    accept: '*',
  },
};

// Interactive Examples
export const WithFilePreview: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    
    const handleFilesChange = (newFiles: File[]) => {
      setFiles(newFiles);
    };
    
    return (
      <div className="w-96">
        <FileUpload
          label="Upload with Preview"
          helperText="Select files to see previews"
          multiple
          showPreview
          accept="image/*,.pdf,.txt"
          maxFileSize={5 * 1024 * 1024}
          onFilesChange={handleFilesChange}
        />
        
        {files.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
            <ul className="text-sm space-y-1">
              {files.map((file, index) => (
                <li key={index} className="flex justify-between">
                  <span>{file.name}</span>
                  <span className="text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

export const DocumentUpload: Story = {
  render: () => {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [files, setFiles] = useState<File[]>([]);
    
    const handleFilesChange = (newFiles: File[]) => {
      setFiles(newFiles);
      if (newFiles.length > 0) {
        // Simulate upload
        setUploadStatus('uploading');
        setTimeout(() => {
          setUploadStatus('success');
        }, 2000);
      }
    };
    
    const getVariant = () => {
      switch (uploadStatus) {
        case 'error': return 'error';
        case 'success': return 'success';
        default: return 'default';
      }
    };
    
    const getHelperText = () => {
      switch (uploadStatus) {
        case 'uploading': return 'Uploading files, please wait...';
        case 'success': return 'Files uploaded successfully!';
        case 'error': return 'Upload failed, please try again';
        default: return 'Select PDF, Word, or text documents';
      }
    };
    
    return (
      <div className="w-96 space-y-4">
        <FileUpload
          label="Document Upload"
          helperText={getHelperText()}
          variant={getVariant()}
          accept=".pdf,.doc,.docx,.txt"
          multiple
          maxFileSize={10 * 1024 * 1024} // 10MB
          onFilesChange={handleFilesChange}
          disabled={uploadStatus === 'uploading'}
        />
        
        {uploadStatus === 'uploading' && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Uploading...</span>
          </div>
        )}
        
        {files.length > 0 && uploadStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-1">Upload Complete</h4>
            <p className="text-sm text-green-600">
              {files.length} file{files.length > 1 ? 's' : ''} uploaded successfully
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">File Upload States</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="Default State"
            helperText="Drag and drop or click to select"
            accept="*"
            size="sm"
          />
          
          <FileUpload
            label="Error State"
            helperText="Something went wrong"
            variant="error"
            errorMessage="File type not supported"
            accept="*"
            size="sm"
          />
          
          <FileUpload
            label="Success State"
            helperText="Upload completed successfully"
            variant="success"
            accept="*"
            size="sm"
          />
          
          <FileUpload
            label="Disabled State"
            helperText="Upload is currently disabled"
            disabled
            accept="*"
            size="sm"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        
        <div className="space-y-4">
          <FileUpload
            label="Small Size"
            size="sm"
            helperText="Compact upload area"
            accept="*"
          />
          
          <FileUpload
            label="Medium Size (Default)"
            size="md"
            helperText="Standard upload area"
            accept="*"
          />
          
          <FileUpload
            label="Large Size"
            size="lg"
            helperText="Spacious upload area"
            accept="*"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      avatar: [] as File[],
      resume: [] as File[],
      portfolio: [] as File[],
      certificates: [] as File[],
    });
    
    return (
      <div className="space-y-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold">Job Application Form</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            label="Profile Picture"
            helperText="Upload your profile photo (max 2MB)"
            accept="image/*"
            maxFileSize={2 * 1024 * 1024}
            showPreview
            onFilesChange={(files) => setFormData(prev => ({ ...prev, avatar: files }))}
          />
          
          <FileUpload
            label="Resume/CV"
            helperText="Upload your resume in PDF format"
            accept=".pdf"
            maxFileSize={5 * 1024 * 1024}
            onFilesChange={(files) => setFormData(prev => ({ ...prev, resume: files }))}
          />
          
          <FileUpload
            label="Portfolio Files"
            helperText="Upload your work samples (multiple files allowed)"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            maxFileSize={10 * 1024 * 1024}
            onFilesChange={(files) => setFormData(prev => ({ ...prev, portfolio: files }))}
          />
          
          <FileUpload
            label="Certificates"
            helperText="Upload relevant certificates or qualifications"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            maxFileSize={5 * 1024 * 1024}
            onFilesChange={(files) => setFormData(prev => ({ ...prev, certificates: files }))}
          />
        </div>
        
        <div className="pt-4 border-t text-sm text-gray-600">
          <h4 className="font-medium mb-2">Uploaded Files Summary:</h4>
          <ul className="space-y-1">
            <li>Profile Picture: {formData.avatar.length} file</li>
            <li>Resume: {formData.resume.length} file</li>
            <li>Portfolio: {formData.portfolio.length} files</li>
            <li>Certificates: {formData.certificates.length} files</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};