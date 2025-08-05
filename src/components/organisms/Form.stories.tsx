import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Form, FormField, FormGroup } from '../molecules/FormField';
import { InputField, SelectField } from '../molecules';
import { Textarea, Checkbox, Radio, RadioGroup, Toggle } from '../atoms';
import { Button } from '../atoms/Button';

const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form components for organizing and structuring form layouts with proper spacing and validation.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// FormField Stories
const FormFieldMeta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A wrapper component that provides consistent spacing and layout for form fields.',
      },
    },
  },
  tags: ['autodocs'],
};

export const SimpleFormField: StoryObj<typeof FormField> = {
  ...FormFieldMeta,
  render: () => (
    <FormField>
      <InputField
        label="Email Address"
        placeholder="Enter your email"
        helperText="We'll never share your email"
      />
    </FormField>
  ),
};

// FormGroup Stories
const FormGroupMeta: Meta<typeof FormGroup> = {
  title: 'UI/FormGroup',
  component: FormGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Groups multiple form fields together with a title and optional description.',
      },
    },
  },
  tags: ['autodocs'],
};

export const BasicFormGroup: StoryObj<typeof FormGroup> = {
  ...FormGroupMeta,
  render: () => (
    <FormGroup title="Personal Information" description="Tell us a bit about yourself">
      <FormField>
        <InputField label="First Name" placeholder="John" />
      </FormField>
      <FormField>
        <InputField label="Last Name" placeholder="Doe" />
      </FormField>
      <FormField>
        <InputField label="Email" type="email" placeholder="john@example.com" />
      </FormField>
    </FormGroup>
  ),
};

// Complete Form Examples
const ContactFormComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: '',
    message: '',
    newsletter: false,
    contactMethod: 'email',
  });

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.checked }));
  };

  const priorityOptions = [
    { value: '', label: 'Select priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="w-full max-w-2xl">
      <Form
        onSubmit={e => {
          e.preventDefault();
          console.log('Form submitted:', formData);
        }}
      >
        <FormGroup title="Contact Information" description="How can we reach you?">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <InputField
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </FormField>

            <FormField>
              <InputField
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </FormField>
          </div>
        </FormGroup>

        <FormGroup title="Message Details" description="Tell us about your inquiry">
          <FormField>
            <InputField
              label="Subject"
              placeholder="What is this about?"
              value={formData.subject}
              onChange={handleInputChange('subject')}
              required
            />
          </FormField>

          <FormField>
            <SelectField
              label="Priority Level"
              options={priorityOptions}
              value={formData.priority}
              onChange={handleInputChange('priority')}
              helperText="How urgent is your request?"
            />
          </FormField>

          <FormField>
            <Textarea
              label="Message"
              placeholder="Please describe your inquiry in detail..."
              value={formData.message}
              onChange={handleInputChange('message')}
              rows={4}
              maxLength={500}
              showCount
              required
            />
          </FormField>
        </FormGroup>

        <FormGroup
          title="Communication Preferences"
          description="How would you like us to respond?"
        >
          <FormField>
            <RadioGroup
              label="Preferred Contact Method"
              value={formData.contactMethod}
              onChange={value => setFormData(prev => ({ ...prev, contactMethod: value }))}
              orientation="horizontal"
            >
              <Radio value="email" label="Email" />
              <Radio value="phone" label="Phone" />
              <Radio value="sms" label="SMS" />
            </RadioGroup>
          </FormField>

          <FormField>
            <Checkbox
              label="Subscribe to newsletter"
              description="Get updates about our products and services"
              checked={formData.newsletter}
              onChange={handleCheckboxChange('newsletter')}
            />
          </FormField>
        </FormGroup>

        <div className="flex justify-end space-x-3">
          <Button variant="neutral-outline" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Send Message
          </Button>
        </div>
      </Form>
    </div>
  );
};

export const ContactForm: Story = {
  render: ContactFormComponent,
  parameters: {
    layout: 'padded',
  },
};

const UserProfileFormComponent = () => {
  const [profile, setProfile] = useState({
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    bio: '',
    website: '',
    company: 'Acme Inc',
    location: 'us',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    privacy: {
      showEmail: false,
      showProfile: true,
      allowMessages: true,
    },
  });

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'UTC', label: 'UTC' },
  ];

  return (
    <div className="w-full max-w-3xl">
      <Form
        onSubmit={e => {
          e.preventDefault();
          console.log('Profile updated:', profile);
        }}
      >
        <FormGroup title="Basic Information" description="Your basic profile information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <InputField
                label="Username"
                value={profile.username}
                onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))}
                helperText="This is how others will find you"
              />
            </FormField>

            <FormField>
              <InputField
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                variant="readonly"
                readOnly
                helperText="Contact support to change your email"
              />
            </FormField>

            <FormField>
              <InputField
                label="First Name"
                value={profile.firstName}
                onChange={e => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </FormField>

            <FormField>
              <InputField
                label="Last Name"
                value={profile.lastName}
                onChange={e => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField>
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              value={profile.bio}
              onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              maxLength={200}
              showCount
              helperText="This will appear on your public profile"
            />
          </FormField>
        </FormGroup>

        <FormGroup title="Professional Information" description="Information about your work">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <InputField
                label="Company"
                value={profile.company}
                onChange={e => setProfile(prev => ({ ...prev, company: e.target.value }))}
              />
            </FormField>

            <FormField>
              <InputField
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={profile.website}
                onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
              />
            </FormField>
          </div>
        </FormGroup>

        <FormGroup title="Location & Time" description="Help us provide localized content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField>
              <SelectField
                label="Country"
                options={countryOptions}
                value={profile.location}
                onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
              />
            </FormField>

            <FormField>
              <SelectField
                label="Timezone"
                options={timezoneOptions}
                value={profile.timezone}
                onChange={e => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
              />
            </FormField>
          </div>
        </FormGroup>

        <FormGroup
          title="Notification Preferences"
          description="Choose how you want to be notified"
        >
          <div className="space-y-3">
            <Toggle
              label="Email Notifications"
              description="Receive important updates via email"
              checked={profile.notifications.email}
              onToggle={checked =>
                setProfile(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: checked },
                }))
              }
            />

            <Toggle
              label="Push Notifications"
              description="Get instant notifications on your device"
              checked={profile.notifications.push}
              onToggle={checked =>
                setProfile(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: checked },
                }))
              }
            />

            <Toggle
              label="SMS Notifications"
              description="Receive urgent alerts via text message"
              checked={profile.notifications.sms}
              onToggle={checked =>
                setProfile(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, sms: checked },
                }))
              }
            />
          </div>
        </FormGroup>

        <FormGroup title="Privacy Settings" description="Control what others can see">
          <div className="space-y-3">
            <Toggle
              label="Show Email Address"
              description="Make your email visible on your profile"
              checked={profile.privacy.showEmail}
              onToggle={checked =>
                setProfile(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showEmail: checked },
                }))
              }
            />

            <Toggle
              label="Public Profile"
              description="Make your profile visible to everyone"
              variant="primary"
              checked={profile.privacy.showProfile}
              onToggle={checked =>
                setProfile(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showProfile: checked },
                }))
              }
            />

            <Toggle
              label="Allow Direct Messages"
              description="Let other users send you messages"
              checked={profile.privacy.allowMessages}
              onToggle={checked =>
                setProfile(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, allowMessages: checked },
                }))
              }
            />
          </div>
        </FormGroup>

        <div className="flex justify-between">
          <Button variant="danger-outline" type="button">
            Delete Account
          </Button>
          <div className="space-x-3">
            <Button variant="neutral-outline" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export const UserProfileForm: Story = {
  render: UserProfileFormComponent,
  parameters: {
    layout: 'padded',
  },
};

const ValidationFormComponent = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    terms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18) {
      newErrors.age = 'You must be at least 18 years old';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form is valid:', formData);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Form onSubmit={handleSubmit}>
        <FormGroup title="Create Account" description="Sign up for a new account">
          <FormField>
            <InputField
              label="Username"
              placeholder="Enter username"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
              variant={errors.username ? 'error' : 'default'}
              errorMessage={errors.username}
              required
            />
          </FormField>

          <FormField>
            <InputField
              label="Email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              variant={errors.email ? 'error' : 'default'}
              errorMessage={errors.email}
              required
            />
          </FormField>

          <FormField>
            <InputField
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              variant={errors.password ? 'error' : 'default'}
              errorMessage={errors.password}
              helperText="Must be at least 8 characters"
              required
            />
          </FormField>

          <FormField>
            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              variant={errors.confirmPassword ? 'error' : 'default'}
              errorMessage={errors.confirmPassword}
              required
            />
          </FormField>

          <FormField>
            <InputField
              label="Age"
              type="number"
              placeholder="Enter your age"
              value={formData.age}
              onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
              variant={errors.age ? 'error' : 'default'}
              errorMessage={errors.age}
              required
            />
          </FormField>

          <FormField>
            <Checkbox
              label="I accept the terms and conditions"
              checked={formData.terms}
              onChange={e => setFormData(prev => ({ ...prev, terms: e.target.checked }))}
              variant={errors.terms ? 'error' : 'default'}
              errorMessage={errors.terms}
            />
          </FormField>
        </FormGroup>

        <div className="flex justify-end space-x-3">
          <Button variant="neutral-outline" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Account
          </Button>
        </div>
      </Form>
    </div>
  );
};

export const ValidationForm: Story = {
  render: ValidationFormComponent,
  parameters: {
    layout: 'padded',
  },
};
