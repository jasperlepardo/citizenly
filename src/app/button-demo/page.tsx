'use client'

import AppShell from '@/components/layout/AppShell'
import { Button, IconButton, ButtonGroup } from '@/components/ui'

export default function ButtonDemoPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8 p-6">
        <h1 className="font-['Montserrat'] font-semibold text-2xl text-zinc-900 dark:text-white">
          Button Component Library
        </h1>

        {/* Primary Variants */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Primary Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="primary-subtle">Primary Subtle</Button>
            <Button variant="primary-faded">Primary Faded</Button>
            <Button variant="primary-outline">Primary Outline</Button>
          </div>
        </section>

        {/* Secondary Variants */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Secondary Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Secondary</Button>
            <Button variant="secondary-subtle">Secondary Subtle</Button>
            <Button variant="secondary-faded">Secondary Faded</Button>
            <Button variant="secondary-outline">Secondary Outline</Button>
          </div>
        </section>

        {/* Success Variants */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Success Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="success">Success</Button>
            <Button variant="success-subtle">Success Subtle</Button>
            <Button variant="success-faded">Success Faded</Button>
            <Button variant="success-outline">Success Outline</Button>
          </div>
        </section>

        {/* Warning Variants */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Warning Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="warning">Warning</Button>
            <Button variant="warning-subtle">Warning Subtle</Button>
            <Button variant="warning-faded">Warning Faded</Button>
            <Button variant="warning-outline">Warning Outline</Button>
          </div>
        </section>

        {/* Danger Variants */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Danger Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="danger">Danger</Button>
            <Button variant="danger-subtle">Danger Subtle</Button>
            <Button variant="danger-faded">Danger Faded</Button>
            <Button variant="danger-outline">Danger Outline</Button>
          </div>
        </section>

        {/* Neutral Variants */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Neutral & Ghost Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="neutral">Neutral</Button>
            <Button variant="neutral-subtle">Neutral Subtle</Button>
            <Button variant="neutral-faded">Neutral Faded</Button>
            <Button variant="neutral-outline">Neutral Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        {/* Sizes */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Button Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </section>

        {/* With Icons */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Buttons with Icons
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              }
            >
              Add Item
            </Button>
            <Button 
              variant="secondary" 
              rightIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              }
            >
              Next
            </Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Icon Buttons
          </h2>
          <div className="flex flex-wrap gap-3">
            <IconButton
              variant="primary"
              size="sm"
              aria-label="Add"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              }
            />
            <IconButton
              variant="secondary"
              size="md"
              aria-label="Settings"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="m12 1 4 6 6-4-4 6 4 6-6-4-6 4 4-6-4-6 6 4z"></path>
                </svg>
              }
            />
            <IconButton
              variant="danger"
              size="lg"
              aria-label="Delete"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 6-12 12"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              }
            />
          </div>
        </section>

        {/* Button Groups */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Button Groups
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-['Montserrat'] text-sm text-zinc-700 dark:text-zinc-300 mb-2">Attached Horizontal</h3>
              <ButtonGroup attached>
                <Button variant="neutral-outline" size="sm">First</Button>
                <Button variant="neutral-outline" size="sm">Second</Button>
                <Button variant="neutral-outline" size="sm">Third</Button>
              </ButtonGroup>
            </div>
            <div>
              <h3 className="font-['Montserrat'] text-sm text-zinc-700 dark:text-zinc-300 mb-2">Spaced Horizontal</h3>
              <ButtonGroup spacing="md">
                <Button variant="primary" size="sm">Save</Button>
                <Button variant="neutral-outline" size="sm">Cancel</Button>
              </ButtonGroup>
            </div>
          </div>
        </section>

        {/* States */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Button States
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Normal</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </div>
        </section>

        {/* Full Width */}
        <section>
          <h2 className="font-['Montserrat'] font-medium text-lg text-zinc-800 dark:text-zinc-200 mb-4">
            Full Width Button
          </h2>
          <Button variant="primary" fullWidth>
            Full Width Button
          </Button>
        </section>
      </div>
    </AppShell>
  )
}