'use client';

import React from 'react';

const imgDots = 'http://localhost:3845/assets/ab2f4963fe08a77bf05c65af4e1be5c6eb4c8d1d.svg';
const imgList = 'http://localhost:3845/assets/446e2a5e5c3189109c4e06042fc9f4d68e425e77.svg';
const imgSort = 'http://localhost:3845/assets/bc3fc4b84bc72114e8c931780b6eba6740c31a61.svg';
const imgFilter = 'http://localhost:3845/assets/4f84effa9e72e78bbd4e3956cc3993a53bb161bb.svg';
const imgMore = 'http://localhost:3845/assets/9473b7d86c016dbb025d43bcf84d2d7a6e93f3f3.svg';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return <div className={`flex flex-col ${className}`}>{children}</div>;
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <div className="flex flex-col">{children}</div>;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return (
    <div
      className={`bg-surface hover:bg-surface-hover flex items-center transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  type?: 'content' | 'checkbox' | 'action';
  checkbox?: {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
  };
}

export function TableCell({
  children,
  className = '',
  type = 'content',
  checkbox,
}: TableCellProps) {
  if (type === 'checkbox') {
    return (
      <div className={`p-2 ${className}`}>
        <button
          onClick={() => checkbox?.onChange?.(!checkbox.checked)}
          className="flex items-center justify-center p-0 rounded border border-default"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {checkbox?.checked && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>
      </div>
    );
  }

  if (type === 'action') {
    return (
      <div className={`p-1 ${className}`}>
        <button className="p-2 rounded border border-default bg-surface hover:bg-surface-hover transition-colors">
          <div className="w-5 h-5">
            <img alt="actions" className="block w-full h-full" src={imgDots} />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`p-2 flex-1 ${className}`}>
      <div className="font-['Montserrat'] text-base font-normal leading-5 text-primary">
        {children}
      </div>
    </div>
  );
}

interface TableControlsProps {
  selectAll?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
  };
  actions?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

export function TableControls({ selectAll, actions, search }: TableControlsProps) {
  return (
    <div className="bg-surface flex items-center justify-between p-0">
      <div className="flex items-center">
        {selectAll && (
          <div className="flex items-center gap-2 p-2">
            <button
              onClick={() => selectAll.onChange(!selectAll.checked)}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center p-0 rounded border border-default">
                <div className="w-4 h-4 flex items-center justify-center">
                  {selectAll.checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="#1d4ed8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-['Montserrat'] text-base font-normal text-primary">
                {selectAll.label || 'Select all'}
              </span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-0 p-1">
          <button className="flex items-center gap-1 p-2 rounded border border-default bg-surface hover:bg-surface-hover transition-colors">
            <div className="w-5 h-5">
              <img alt="list" className="block w-full h-full" src={imgList} />
            </div>
            <span className="font-['Montserrat'] font-medium text-base text-secondary px-1">
              Properties
            </span>
          </button>

          <button className="flex items-center gap-1 p-2 rounded border border-default bg-surface hover:bg-surface-hover transition-colors ml-1">
            <div className="w-5 h-5">
              <img alt="sort" className="block w-full h-full" src={imgSort} />
            </div>
            <span className="font-['Montserrat'] font-medium text-base text-secondary px-1">
              Sort
            </span>
          </button>

          <button className="flex items-center gap-1 p-2 rounded border border-default bg-surface hover:bg-surface-hover transition-colors ml-1">
            <div className="w-5 h-5">
              <img alt="filter" className="block w-full h-full" src={imgFilter} />
            </div>
            <span className="font-['Montserrat'] font-medium text-base text-secondary px-1">
              Filter
            </span>
          </button>

          <button className="p-1 rounded border border-default bg-surface hover:bg-surface-hover transition-colors ml-1">
            <div className="w-5 h-5">
              <img alt="more" className="block w-full h-full" src={imgMore} />
            </div>
          </button>
        </div>

        {actions}
      </div>

      {search && (
        <div className="p-1">
          <div className="w-60">
            <div className="relative rounded bg-surface">
              <div className="flex items-center p-2 gap-1">
                <div className="shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M5.5 10C7.98528 10 10 7.98528 10 5.5C10 3.01472 7.98528 1 5.5 1C3.01472 1 1 3.01472 1 5.5C1 7.98528 3.01472 10 5.5 10Z"
                        stroke="rgba(0, 0, 0, 0.32)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.7498 10.75L8.7998 8.8"
                        stroke="rgba(0, 0, 0, 0.32)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 px-1">
                  <input
                    className="w-full bg-transparent font-['Montserrat'] text-base font-normal leading-5 text-primary placeholder:text-muted border-none outline-none"
                    placeholder={search.placeholder || 'Search contact'}
                    value={search.value}
                    onChange={e => search.onChange(e.target.value)}
                  />
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute border border-default border-solid inset-0 pointer-events-none rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
