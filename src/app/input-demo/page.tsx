'use client'

import { useState } from 'react'
import { AppShell } from '@/components/templates'
import { Button, Checkbox, Radio, RadioGroup, Toggle, Textarea } from '@/components/atoms'
import { InputField, SelectField, FileUpload, FormGroup, Form } from '@/components/molecules'

export default function InputDemoPage() {
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [radioValue, setRadioValue] = useState('')
  const [toggleValue, setToggleValue] = useState(false)

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-6 max-w-4xl">
        <h1 className="font-['Montserrat'] font-semibold text-2xl text-zinc-900 dark:text-white">
          Input Field Component Library
        </h1>

        <Form spacing="lg">
          {/* Input Fields */}
          <FormGroup 
            title="Text Input Fields" 
            description="Various input field states and configurations"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Default Input"
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="This is a helper text"
              />
              
              <InputField
                label="Input with Left Icon"
                placeholder="Search..."
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                }
              />
              
              <InputField
                label="Input with Right Icon"
                placeholder="Email address"
                type="email"
                rightIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                }
              />
              
              <InputField
                label="Clearable Input"
                placeholder="Type something..."
                clearable
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onClear={() => setInputValue('')}
              />
              
              <InputField
                label="Input with Left Addon"
                placeholder="100"
                leftAddon="$"
                helperText="Price in USD"
              />
              
              <InputField
                label="Input with Right Addon"
                placeholder="example"
                rightAddon=".com"
              />
              
              <InputField
                label="Error State"
                placeholder="Enter valid email"
                errorMessage="Please enter a valid email address"
                variant="error"
              />
              
              <InputField
                label="Disabled Input"
                placeholder="Cannot edit this"
                disabled
                value="Disabled value"
              />
              
              <InputField
                label="Read Only Input"
                placeholder="Read only"
                readOnly
                value="This is read only"
              />
            </div>
            
            {/* Input Sizes */}
            <div>
              <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200 mb-3">
                Input Sizes
              </h4>
              <div className="space-y-3">
                <InputField
                  label="Small Input"
                  placeholder="Small size"
                  size="sm"
                />
                <InputField
                  label="Medium Input (Default)"
                  placeholder="Medium size"
                  size="md"
                />
                <InputField
                  label="Large Input"
                  placeholder="Large size"
                  size="lg"
                />
              </div>
            </div>
          </FormGroup>

          {/* Textarea */}
          <FormGroup 
            title="Textarea Fields"
            description="Multi-line text input components"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea
                label="Default Textarea"
                placeholder="Enter your message here..."
                value={textareaValue}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextareaValue(e.target.value)}
                helperText="Share your thoughts"
              />
              
              <Textarea
                label="Textarea with Character Count"
                placeholder="Limited to 200 characters"
                maxLength={200}
                showCharCount
                resizable
              />
              
              <Textarea
                label="Large Textarea"
                placeholder="Larger text area"
                size="lg"
              />
              
              <Textarea
                label="Error State"
                placeholder="This has an error"
                errorMessage="This field is required"
                variant="error"
              />
            </div>
          </FormGroup>

          {/* Select Fields */}
          <FormGroup 
            title="Select/Dropdown Fields"
            description="Dropdown selection components"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Default Select"
                placeholder="Choose an option"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                helperText="Select one option"
              />
              
              <SelectField
                label="Select with Icon"
                placeholder="Choose option"
                options={selectOptions}
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                }
              />
              
              <SelectField
                label="Small Select"
                placeholder="Small size"
                options={selectOptions}
                size="sm"
              />
              
              <SelectField
                label="Error State"
                placeholder="Has error"
                options={selectOptions}
                errorMessage="Please select an option"
                variant="error"
              />
            </div>
          </FormGroup>

          {/* Checkboxes */}
          <FormGroup 
            title="Checkbox Components"
            description="Single and multiple selection checkboxes"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200">
                  Basic Checkboxes
                </h4>
                <Checkbox
                  label="Default Checkbox"
                  checked={checkboxValue}
                  onChange={(e) => setCheckboxValue(e.target.checked)}
                />
                <Checkbox
                  label="Checkbox with Description"
                  description="This checkbox has additional description text"
                />
                <Checkbox
                  label="Primary Variant"
                  variant="primary"
                />
                <Checkbox
                  label="Error State"
                  variant="error"
                  errorMessage="This field is required"
                />
                <Checkbox
                  label="Disabled Checkbox"
                  disabled
                />
                <Checkbox
                  label="Indeterminate State"
                  indeterminate
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200">
                  Checkbox Sizes
                </h4>
                <Checkbox
                  label="Small Checkbox"
                  size="sm"
                />
                <Checkbox
                  label="Medium Checkbox (Default)"
                  size="md"
                />
                <Checkbox
                  label="Large Checkbox"
                  size="lg"
                />
              </div>
            </div>
          </FormGroup>

          {/* Radio Buttons */}
          <FormGroup 
            title="Radio Button Components"
            description="Single selection radio button groups"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200 mb-3">
                  Vertical Radio Group
                </h4>
                <RadioGroup
                  name="radioExample"
                  value={radioValue}
                  onChange={setRadioValue}
                  orientation="vertical"
                >
                  <Radio value="option1" label="Option 1" />
                  <Radio value="option2" label="Option 2" />
                  <Radio value="option3" label="Option 3" />
                  <Radio value="option4" label="Disabled Option" disabled />
                </RadioGroup>
              </div>
              
              <div>
                <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200 mb-3">
                  Horizontal Radio Group
                </h4>
                <RadioGroup
                  name="radioExample2"
                  orientation="horizontal"
                >
                  <Radio value="small" label="Small" size="sm" />
                  <Radio value="medium" label="Medium" size="md" />
                  <Radio value="large" label="Large" size="lg" />
                </RadioGroup>
              </div>
            </div>
          </FormGroup>

          {/* Toggle Switches */}
          <FormGroup 
            title="Toggle/Switch Components"
            description="On/off toggle switches"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200">
                  Toggle Variants
                </h4>
                <Toggle
                  label="Default Toggle"
                  checked={toggleValue}
                  onToggle={setToggleValue}
                />
                <Toggle
                  label="Primary Toggle"
                  variant="primary"
                />
                <Toggle
                  label="Toggle with Description"
                  description="This toggle controls something important"
                />
                <Toggle
                  label="Error State"
                  variant="error"
                  errorMessage="This setting is required"
                />
                <Toggle
                  label="Disabled Toggle"
                  disabled
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-['Montserrat'] font-medium text-base text-zinc-800 dark:text-zinc-200">
                  Toggle Sizes
                </h4>
                <Toggle
                  label="Small Toggle"
                  size="sm"
                />
                <Toggle
                  label="Medium Toggle (Default)"
                  size="md"
                />
                <Toggle
                  label="Large Toggle"
                  size="lg"
                />
              </div>
            </div>
          </FormGroup>

          {/* File Upload */}
          <FormGroup 
            title="File Upload Components"
            description="Drag and drop file upload areas"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="Default File Upload"
                helperText="Drag and drop files here or click to browse"
                acceptedFileTypes=".jpg,.png,.pdf"
                maxFileSize={5}
                showPreview
              />
              
              <FileUpload
                label="Multiple File Upload"
                dragText="Drop multiple files here"
                browseText="or browse for files"
                multiple
                size="sm"
                showPreview
              />
              
              <FileUpload
                label="Large Upload Area"
                size="lg"
                variant="default"
              />
              
              <FileUpload
                label="Error State"
                errorMessage="File type not supported"
                variant="error"
              />
            </div>
          </FormGroup>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <Button variant="neutral-outline" size="md">
              Cancel
            </Button>
            <Button variant="primary" size="md">
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </AppShell>
  )
}