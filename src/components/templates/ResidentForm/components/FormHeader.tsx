import React from 'react';

import type { FormMode } from '@/types';

interface FormHeaderProps {
  mode: FormMode;
  onModeChange?: (mode: FormMode) => void;
}

const FormHeaderComponent = ({ mode, onModeChange }: FormHeaderProps) => {
  if (mode === 'create' || !onModeChange) return null;

  return (
    <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {mode === 'view' ? 'View Resident' : 'Edit Resident'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {mode === 'view' ? 'Viewing resident information' : 'Editing resident information'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onModeChange(mode === 'view' ? 'edit' : 'view')}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        {mode === 'view' ? '✏️ Edit' : '👁️ View'}
      </button>
    </div>
  );
};

FormHeaderComponent.displayName = 'FormHeader';

export const FormHeader = React.memo(FormHeaderComponent);
