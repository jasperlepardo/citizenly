'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef, InputHTMLAttributes, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components';
import { logger } from '@/lib';
import { validateUploadedFile, logFileOperation, scanFileForViruses } from '@/lib/security';
import { cn, formatFileSize } from '@/lib/utilities';

const fileUploadVariants = cva(
  'relative rounded-lg border-2 border-dashed transition-colors font-system focus-within:outline-hidden focus-within:ring-2 focus-within:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-[#d4d4d4] bg-white focus-within:border-[#2563eb] focus-within:ring-[#2563eb]/20 hover:border-[#a3a3a3]',
        error:
          'border-[#dc2626] bg-white focus-within:border-[#dc2626] focus-within:ring-[#dc2626]/20 hover:border-[#dc2626]',
        success:
          'border-[#059669] bg-white focus-within:border-[#059669] focus-within:ring-[#059669]/20 hover:border-[#059669]',
        disabled: 'cursor-not-allowed border-[#d4d4d4] bg-[#fafafa]',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface FileUploadProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof fileUploadVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  dragText?: string;
  browseText?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  onFileSelect?: (files: FileList | null) => void;
  showPreview?: boolean;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      errorMessage,
      dragText = 'Drag and drop your files here',
      browseText = 'or click here to browse',
      acceptedFileTypes,
      maxFileSize,
      onFileSelect,
      showPreview = false,
      disabled,
      multiple = false,
      ...props
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelection(files);
    };

    const handleFileSelection = async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate each file
      for (const file of fileArray) {
        try {
          // Security validation
          const validation = await validateUploadedFile(file);

          if (!validation.isValid) {
            errors.push(`${file.name}: ${validation.errors.join(', ')}`);
            logFileOperation('upload', file.name, 'current-user', 'blocked', {
              errors: validation.errors,
              fileSize: file.size,
              fileType: file.type,
            });
            continue;
          }

          // Virus scanning
          const virusScan = await scanFileForViruses(file);
          if (!virusScan.clean) {
            errors.push(`${file.name}: Security threat detected - ${virusScan.threats.join(', ')}`);
            logFileOperation('upload', file.name, 'current-user', 'blocked', {
              threats: virusScan.threats,
            });
            continue;
          }

          // Additional size check if maxFileSize is specified
          if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
            errors.push(`${file.name}: File size exceeds maximum allowed (${maxFileSize}MB)`);
            continue;
          }

          validFiles.push(file);
          logFileOperation('upload', file.name, 'current-user', 'success', {
            fileSize: file.size,
            fileType: file.type,
            fileHash: validation.fileInfo?.hash,
          });
        } catch (error) {
          errors.push(`${file.name}: Validation error occurred`);
          logFileOperation('upload', file.name, 'current-user', 'failure', {
            error: String(error),
          });
        }
      }

      // Show errors if any
      if (errors.length > 0) {
        logger.error('File upload validation errors', { errors, filesAttempted: fileArray.length });
        // You might want to show these errors in the UI
        toast.error(`File validation errors: ${errors.join(', ')}`);
      }

      // Only proceed with valid files
      if (validFiles.length > 0) {
        setSelectedFiles(multiple ? [...selectedFiles, ...validFiles] : validFiles);
        onFileSelect?.(files);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelection(e.target.files);
    };

    const handleBrowseClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const removeFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
    };


    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="mb-2 block font-body text-sm font-medium text-[#262626]">{label}</label>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            fileUploadVariants({ variant: actualVariant, size }),
            isDragOver && !disabled && 'border-[#2563eb] bg-[#dbeafe]',
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={ref || inputRef}
            type="file"
            className="sr-only"
            disabled={disabled}
            multiple={multiple}
            accept={acceptedFileTypes}
            onChange={handleInputChange}
            {...props}
          />

          <div className="text-center">
            {/* Upload Icon */}
            <div className="mx-auto mb-4">
              <svg
                className={cn(
                  'mx-auto',
                  size === 'sm' && 'h-8 w-8',
                  size === 'md' && 'h-12 w-12',
                  size === 'lg' && 'h-16 w-16',
                  disabled ? 'text-[#a3a3a3]' : 'text-[#737373]'
                )}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>

            {/* Text */}
            <div
              className={cn(
                'space-y-1',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg'
              )}
            >
              <p className={cn('font-body', disabled ? 'text-[#a3a3a3]' : 'text-[#525252]')}>
                {dragText}
              </p>
              <Button
                onClick={handleBrowseClick}
                disabled={disabled}
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium text-[#2563eb] underline hover:text-[#1d4ed8] hover:no-underline disabled:text-[#a3a3a3]"
              >
                {browseText}
              </Button>
            </div>

            {/* File Type and Size Info */}
            {(acceptedFileTypes || maxFileSize) && (
              <div className="mt-2 font-body text-xs text-[#737373]">
                {acceptedFileTypes && <div>Accepted: {acceptedFileTypes}</div>}
                {maxFileSize && <div>Max size: {maxFileSize}MB</div>}
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        {showPreview && selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-body text-sm font-medium text-[#262626]">Selected Files:</h4>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-sm border border-[#d4d4d4] bg-[#fafafa] p-2"
              >
                <div className="flex min-w-0 flex-1 items-center space-x-2">
                  <svg
                    className="size-4 shrink-0 text-[#737373]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium text-[#262626]">
                      {file.name}
                    </p>
                    <p className="font-body text-xs text-[#737373]">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  className="ml-2 size-6 p-1 text-[#737373] transition-colors hover:text-[#dc2626]"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className="mt-2">
            {errorMessage ? (
              <p className="font-body text-xs text-red-600">{errorMessage}</p>
            ) : (
              <p className="font-body text-xs text-[#737373]">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export { FileUpload, fileUploadVariants };
