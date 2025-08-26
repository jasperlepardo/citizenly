import React from 'react';
import type { FormMode } from '@/types';

interface FormHeaderProps {
  mode: FormMode;
  onModeChange?: (mode: FormMode) => void;
}

export const FormHeader = React.memo(({ mode, onModeChange }: FormHeaderProps) => {
  if (mode === 'create' || !onModeChange) return null;

  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {mode === 'view' ? 'View Resident' : 'Edit Resident'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {mode === 'view' ? 'Viewing resident information' : 'Editing resident information'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onModeChange(mode === 'view' ? 'edit' : 'view')}
        className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors font-medium"
      >
        {mode === 'view' ? '✏️ Edit' : '👁️ View'}
      </button>
    </div>
  );
});