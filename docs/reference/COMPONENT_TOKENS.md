  /* Tokens from auth-debug.css */

/* ================================================================ */
  /* AUTH DEBUG TOKENS - Molecule-specific design tokens           */
  /* ================================================================ */
  
  /* Auth Debug Position */
  --auth-debug-position-bottom: 1rem;        /* 16px - bottom offset */
  --auth-debug-position-left: 1rem;          /* 16px - left offset */
  --auth-debug-z-index: 40;                  /* z-index for overlay */
  
  /* Auth Debug Toggle Button */
  --auth-debug-toggle-bg: var(--color-orange-600);
  --auth-debug-toggle-bg-hover: var(--color-orange-700);
  --auth-debug-toggle-text: #ffffff;
  --auth-debug-toggle-size: var(--spacing-8);           /* 32px - button size */
  --auth-debug-toggle-radius: 50%;                      /* fully rounded */
  --auth-debug-toggle-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --auth-debug-toggle-padding: var(--spacing-8);        /* 8px padding */
  
  /* Auth Debug Modal */
  --auth-debug-modal-bg: var(--background-default);
  --auth-debug-modal-bg-dark: var(--color-zinc-800);
  --auth-debug-modal-border: var(--color-zinc-200);
  --auth-debug-modal-border-dark: var(--color-zinc-700);
  --auth-debug-modal-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --auth-debug-modal-radius: var(--radius-lg);
  --auth-debug-modal-padding: var(--spacing-lg);
  --auth-debug-modal-max-width: 28rem;                  /* max-w-md */
  --auth-debug-modal-max-height: 24rem;                 /* max-h-96 */
  
  /* Auth Debug Header */
  --auth-debug-header-margin-bottom: var(--spacing-xs);
  
  /* Auth Debug Title */
  --auth-debug-title-size: var(--spacing-14);           /* text-sm */
  --auth-debug-title-weight: 600;                       /* font-semibold */
  --auth-debug-title-color: var(--color-zinc-900);
  --auth-debug-title-color-dark: #ffffff;
  
  /* Auth Debug Close Button */
  --auth-debug-close-color: var(--color-zinc-400);
  --auth-debug-close-color-hover: var(--color-zinc-600);
  --auth-debug-close-color-hover-dark: var(--color-zinc-200);
  --auth-debug-close-size: var(--spacing-lg);           /* 16px - icon size */
  
  /* Auth Debug Content */
  --auth-debug-content-spacing: var(--spacing-xs);      /* space-y-3 */
  --auth-debug-content-text-size: var(--spacing-12);    /* text-xs */
  
  /* Auth Debug Section */
  --auth-debug-section-title-size: var(--spacing-12);   /* text-xs */
  --auth-debug-section-title-weight: 500;               /* font-medium */
  --auth-debug-section-title-color: var(--color-zinc-700);
  --auth-debug-section-title-color-dark: var(--color-zinc-300);
  --auth-debug-section-title-margin-bottom: var(--spacing-tiny);
  --auth-debug-section-content-spacing: var(--spacing-tiny);
  --auth-debug-section-content-padding-left: var(--spacing-8);
  
  /* Auth Debug Status */
  --auth-debug-status-success-color: var(--color-green-600);
  --auth-debug-status-error-color: var(--color-red-600);
  --auth-debug-status-info-color: var(--color-zinc-600);
  --auth-debug-status-info-color-dark: var(--color-zinc-400);
  --auth-debug-status-mono-font: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  
  /* Auth Debug Actions */
  --auth-debug-actions-padding-top: var(--spacing-8);
  --auth-debug-actions-border-top: 1px solid var(--color-zinc-100);
  --auth-debug-actions-border-top-dark: 1px solid var(--color-zinc-700);
  --auth-debug-actions-spacing: var(--spacing-8);
  --auth-debug-actions-title-margin-bottom: var(--spacing-8);
  
  /* Auth Debug Buttons */
  --auth-debug-button-padding-x: var(--spacing-xs);
  --auth-debug-button-padding-y: var(--spacing-tiny);
  --auth-debug-button-text-size: var(--spacing-12);     /* text-xs */
  --auth-debug-button-radius: var(--radius-sm);
  --auth-debug-button-width: 100%;
  
  --auth-debug-button-danger-bg: var(--color-red-500);
  --auth-debug-button-danger-bg-hover: var(--color-red-600);
  --auth-debug-button-danger-text: #ffffff;
  
  --auth-debug-button-primary-bg: var(--color-blue-500);
  --auth-debug-button-primary-bg-hover: var(--color-blue-600);
  --auth-debug-button-primary-text: #ffffff;

  /* Tokens from badge.css */

/* Badge sizing tokens */
  --badge-padding-sm: var(--spacing-2) var(--spacing-8);    /* 2px 8px */
  --badge-padding-md: var(--spacing-4) var(--spacing-12);   /* 4px 12px */
  --badge-padding-lg: var(--spacing-6) var(--spacing-16);   /* 6px 16px */
  
  --badge-text-sm: 12px;      /* 12px (text-xs) */
  --badge-text-md: 14px;      /* 14px (text-sm) */
  --badge-text-lg: 16px;      /* 16px (text-base) */
  
  --badge-icon-sm: var(--spacing-12);    /* 12px */
  --badge-icon-md: var(--spacing-16);    /* 16px */
  --badge-icon-lg: var(--spacing-20);    /* 20px */
  
  --badge-gap: var(--spacing-4);         /* 4px gap between icon and text */
  
  /* Badge border radius */
  --badge-radius-rounded: var(--radius-md);    /* 6px */
  --badge-radius-pill: var(--radius-full);     /* 9999px */
  
  /* Badge variant colors - using semantic color system */
  
  /* Default variant */
  --badge-default-bg: var(--color-zinc-100);
  --badge-default-text: var(--color-zinc-800);
  --badge-default-border: var(--color-zinc-300);
  
  /* Success variant */
  --badge-success-bg: var(--color-success-100);
  --badge-success-text: var(--color-success-800);
  --badge-success-border: var(--color-success-300);
  
  /* Warning variant */
  --badge-warning-bg: var(--color-warning-100);
  --badge-warning-text: var(--color-warning-800);
  --badge-warning-border: var(--color-warning-300);
  
  /* Error/Danger variant */
  --badge-danger-bg: var(--color-danger-100);
  --badge-danger-text: var(--color-danger-800);
  --badge-danger-border: var(--color-danger-300);
  
  /* Info variant */
  --badge-info-bg: var(--color-primary-100);
  --badge-info-text: var(--color-primary-800);
  --badge-info-border: var(--color-primary-300);
  
  /* Secondary variant */
  --badge-secondary-bg: var(--color-secondary-100);
  --badge-secondary-text: var(--color-secondary-800);
  --badge-secondary-border: var(--color-secondary-300);

  /* Tokens from button-variants.css */

/* ====================================================================== */
  /* SEMANTIC BUTTON TOKENS - Intent-based design decisions                */
  /* ====================================================================== */
  
  /* ================================================================ */
  /* PRIMARY BUTTON - Primary action semantic tokens                 */
  /* ================================================================ */
  --btn-primary-surface: var(--background-brand-default);
  --btn-primary-surface-hover: var(--background-brand-emphasis);
  --btn-primary-surface-active: var(--background-brand-emphasis);
  --btn-primary-surface-disabled: var(--background-disabled);
  --btn-primary-content: var(--text-inverse);
  --btn-primary-content-disabled: var(--text-disabled);
  --btn-primary-border: transparent;
  --btn-primary-focus-ring: var(--border-focus);
  --btn-primary-shadow: var(--shadow-sm);
  --btn-primary-shadow-hover: var(--shadow-md);
  
  /* ================================================================ */
  /* SECONDARY BUTTON - Secondary action semantic tokens             */
  /* ================================================================ */
  --btn-secondary-surface: var(--color-secondary-700);
  --btn-secondary-surface-hover: var(--color-secondary-800);
  --btn-secondary-surface-active: var(--color-secondary-900);
  --btn-secondary-surface-disabled: var(--background-disabled);
  --btn-secondary-content: var(--text-inverse);
  --btn-secondary-content-disabled: var(--text-disabled);
  --btn-secondary-border: transparent;
  --btn-secondary-focus-ring: var(--border-focus);
  --btn-secondary-shadow: var(--shadow-sm);
  --btn-secondary-shadow-hover: var(--shadow-md);
  
  /* ================================================================ */
  /* SUCCESS BUTTON - Success action semantic tokens                 */
  /* ================================================================ */
  --btn-success-surface: var(--background-success-default);
  --btn-success-surface-hover: var(--color-success-700);
  --btn-success-surface-active: var(--color-success-800);
  --btn-success-surface-disabled: var(--background-disabled);
  --btn-success-content: var(--text-inverse);
  --btn-success-content-disabled: var(--text-disabled);
  --btn-success-border: transparent;
  --btn-success-focus-ring: var(--border-success);
  --btn-success-shadow: var(--shadow-sm);
  --btn-success-shadow-hover: var(--shadow-md);
  
  /* ================================================================ */
  /* WARNING BUTTON - Warning action semantic tokens                 */
  /* ================================================================ */
  --btn-warning-surface: var(--background-warning-default);
  --btn-warning-surface-hover: var(--color-warning-700);
  --btn-warning-surface-active: var(--color-warning-800);
  --btn-warning-surface-disabled: var(--background-disabled);
  --btn-warning-content: var(--text-inverse);
  --btn-warning-content-disabled: var(--text-disabled);
  --btn-warning-border: transparent;
  --btn-warning-focus-ring: var(--border-warning);
  --btn-warning-shadow: var(--shadow-sm);
  --btn-warning-shadow-hover: var(--shadow-md);
  
  /* ================================================================ */
  /* DANGER BUTTON - Destructive action semantic tokens              */
  /* ================================================================ */
  --btn-danger-surface: var(--background-danger-default);
  --btn-danger-surface-hover: var(--color-danger-700);
  --btn-danger-surface-active: var(--color-danger-800);
  --btn-danger-surface-disabled: var(--background-disabled);
  --btn-danger-content: var(--text-inverse);
  --btn-danger-content-disabled: var(--text-disabled);
  --btn-danger-border: transparent;
  --btn-danger-focus-ring: var(--border-danger);
  --btn-danger-shadow: var(--shadow-sm);
  --btn-danger-shadow-hover: var(--shadow-md);
  
  /* ================================================================ */
  /* SUBTLE BUTTONS - Low-emphasis action semantic tokens            */
  /* ================================================================ */
  --btn-subtle-primary-surface: var(--background-brand-subtle);
  --btn-subtle-primary-surface-hover: var(--background-brand-muted);
  --btn-subtle-primary-surface-active: var(--background-brand-muted);
  --btn-subtle-primary-content: var(--text-information);
  --btn-subtle-primary-content-hover: var(--color-primary-800);
  --btn-subtle-primary-border: transparent;
  --btn-subtle-primary-focus-ring: var(--border-focus);
  
  --btn-subtle-secondary-surface: var(--color-secondary-50);
  --btn-subtle-secondary-surface-hover: var(--color-secondary-100);
  --btn-subtle-secondary-surface-active: var(--color-secondary-200);
  --btn-subtle-secondary-content: var(--color-secondary-700);
  --btn-subtle-secondary-content-hover: var(--color-secondary-800);
  --btn-subtle-secondary-border: transparent;
  --btn-subtle-secondary-focus-ring: var(--border-focus);
  
  /* ================================================================ */
  /* OUTLINE BUTTONS - Outlined action semantic tokens               */
  /* ================================================================ */
  --btn-outline-primary-surface: transparent;
  --btn-outline-primary-surface-hover: var(--background-brand-subtle);
  --btn-outline-primary-surface-active: var(--background-brand-muted);
  --btn-outline-primary-content: var(--text-information);
  --btn-outline-primary-content-hover: var(--color-primary-800);
  --btn-outline-primary-border: var(--border-information);
  --btn-outline-primary-border-hover: var(--border-information);
  --btn-outline-primary-focus-ring: var(--border-focus);
  
  /* ================================================================ */
  /* NEUTRAL BUTTONS - Neutral action semantic tokens                */
  /* ================================================================ */
  --btn-zinc-surface: var(--background-muted);
  --btn-zinc-surface-hover: var(--background-emphasis);
  --btn-zinc-surface-active: var(--background-emphasis);
  --btn-zinc-content: var(--text-zinc-900 dark:text-zinc-100);
  --btn-zinc-content-hover: var(--text-emphasis);
  --btn-zinc-border: transparent;
  --btn-zinc-focus-ring: var(--border-emphasis);
  --btn-zinc-shadow: var(--shadow-sm);
  
  /* ================================================================ */
  /* GHOST BUTTONS - Minimal action semantic tokens                  */
  /* ================================================================ */
  --btn-ghost-surface: transparent;
  --btn-ghost-surface-hover: var(--background-subtle);
  --btn-ghost-surface-active: var(--background-muted);
  --btn-ghost-content: var(--text-zinc-400 dark:text-zinc-500);
  --btn-ghost-content-hover: var(--text-zinc-900 dark:text-zinc-100);
  --btn-ghost-border: transparent;
  --btn-ghost-focus-ring: var(--border-emphasis);

  /* Tokens from card.css */

/* ====================================================================== */
  /* CARD COMPONENT TOKENS                                                 */
  /* ====================================================================== */
  
  /* Card Component Padding */
  --card-padding-xs: var(--spacing-8);     /* 8px */
  --card-padding-sm: var(--spacing-12);    /* 12px */
  --card-padding-md: var(--spacing-24);    /* 24px */
  --card-padding-lg: var(--spacing-32);    /* 32px */
  --card-padding-xl: var(--spacing-40);    /* 40px */
  
  /* Card Component Gaps */
  --card-gap-xs: var(--spacing-8);         /* 8px */
  --card-gap-sm: var(--spacing-12);        /* 12px */
  --card-gap-md: var(--spacing-16);        /* 16px */
  --card-gap-lg: var(--spacing-24);        /* 24px */
  --card-gap-xl: var(--spacing-32);        /* 32px */

  /* Tokens from command-menu.css */

/* ================================================================ */
  /* COMMAND MENU TOKENS - Molecule-specific design tokens         */
  /* ================================================================ */
  
  /* Command Menu Container */
  --command-menu-container-bg: var(--background-default);
  --command-menu-container-bg-dark: var(--color-zinc-900);
  --command-menu-container-border: rgba(0, 0, 0, 0.05);
  --command-menu-container-border-dark: rgba(255, 255, 255, 0.1);
  --command-menu-container-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --command-menu-container-radius: var(--radius-xl);
  --command-menu-container-ring: 1px solid var(--command-menu-container-border);
  --command-menu-container-ring-dark: 1px solid var(--command-menu-container-border-dark);
  
  /* Command Menu Backdrop */
  --command-menu-backdrop-bg: rgba(0, 0, 0, 0.25);
  --command-menu-backdrop-bg-dark: rgba(0, 0, 0, 0.5);
  
  /* Command Menu Dialog */
  --command-menu-dialog-padding: var(--spacing-md);
  --command-menu-dialog-padding-top: 25vh;
  --command-menu-dialog-z-index: 50;
  
  /* Command Menu Search */
  --command-menu-search-padding-x: var(--spacing-md);
  --command-menu-search-padding-y: var(--spacing-md);
  --command-menu-search-border: var(--color-zinc-200);
  --command-menu-search-border-dark: var(--color-zinc-700);
  --command-menu-search-icon-size: var(--spacing-20);
  --command-menu-search-icon-color: var(--color-zinc-400);
  --command-menu-search-icon-color-dark: var(--color-zinc-500);
  --command-menu-search-text-color: var(--color-zinc-900);
  --command-menu-search-text-color-dark: var(--color-zinc-100);
  --command-menu-search-placeholder-color: var(--color-zinc-500);
  --command-menu-search-placeholder-color-dark: var(--color-zinc-400);
  
  /* Command Menu Results */
  --command-menu-results-max-height: 24rem; /* max-h-96 */
  
  /* Command Menu Footer */
  --command-menu-footer-padding-x: var(--spacing-md);
  --command-menu-footer-padding-y: var(--spacing-sm);
  --command-menu-footer-border: var(--color-zinc-200);
  --command-menu-footer-border-dark: var(--color-zinc-700);
  --command-menu-footer-text-size: var(--spacing-12);
  --command-menu-footer-text-color: var(--color-zinc-500);
  --command-menu-footer-text-color-dark: var(--color-zinc-400);
  
  /* Command Menu Items */
  --command-menu-item-padding-x: var(--spacing-sm);
  --command-menu-item-padding-y: var(--spacing-xs);
  --command-menu-item-radius: var(--radius-lg);
  --command-menu-item-gap: var(--spacing-sm);
  --command-menu-item-text-size: var(--spacing-14);
  --command-menu-item-icon-size: var(--spacing-20);
  --command-menu-item-shortcut-height: var(--spacing-20);
  --command-menu-item-shortcut-padding: var(--spacing-tiny);
  
  /* Command Menu Item States */
  --command-menu-item-default-bg: transparent;
  --command-menu-item-default-hover-bg: var(--color-zinc-50);
  --command-menu-item-default-hover-bg-dark: var(--color-zinc-800);
  --command-menu-item-selected-bg: var(--color-zinc-100);
  --command-menu-item-selected-bg-dark: var(--color-zinc-700);
  --command-menu-item-disabled-opacity: 0.5;
  
  /* Command Menu Item Text */
  --command-menu-item-text-color: var(--color-zinc-900);
  --command-menu-item-text-color-dark: var(--color-zinc-100);
  --command-menu-item-icon-color: var(--color-zinc-500);
  --command-menu-item-icon-color-dark: var(--color-zinc-400);
  
  /* Command Menu Group */
  --command-menu-group-padding-y: var(--spacing-xs);
  --command-menu-group-header-padding-x: var(--spacing-sm);
  --command-menu-group-header-padding-bottom: var(--spacing-xs);
  --command-menu-group-title-size: var(--spacing-12);
  --command-menu-group-title-weight: 500;
  --command-menu-group-title-color: var(--color-zinc-500);
  --command-menu-group-title-color-dark: var(--color-zinc-400);
  --command-menu-group-clear-size: var(--spacing-12);
  --command-menu-group-clear-color: var(--color-zinc-400);
  --command-menu-group-clear-hover-color: var(--color-zinc-600);
  --command-menu-group-clear-hover-color-dark: var(--color-zinc-300);
  --command-menu-group-spacing: var(--spacing-micro);
  
  /* Command Menu Empty State */
  --command-menu-empty-padding-x: var(--spacing-md);
  --command-menu-empty-padding-y: var(--spacing-xl);
  --command-menu-empty-icon-size: var(--spacing-12);
  --command-menu-empty-icon-container-size: var(--spacing-12);
  --command-menu-empty-icon-bg: var(--color-zinc-100);
  --command-menu-empty-icon-bg-dark: var(--color-zinc-800);
  --command-menu-empty-icon-color: var(--color-zinc-400);
  --command-menu-empty-icon-color-dark: var(--color-zinc-500);
  --command-menu-empty-title-color: var(--color-zinc-900);
  --command-menu-empty-title-color-dark: var(--color-zinc-100);
  --command-menu-empty-desc-color: var(--color-zinc-500);
  --command-menu-empty-desc-color-dark: var(--color-zinc-400);
  --command-menu-empty-suggestion-bg-hover: var(--color-zinc-50);
  --command-menu-empty-suggestion-bg-hover-dark: var(--color-zinc-800);
  --command-menu-empty-tag-bg: var(--color-zinc-100);
  --command-menu-empty-tag-bg-dark: var(--color-zinc-700);
  --command-menu-empty-tag-text: var(--color-zinc-600);
  --command-menu-empty-tag-text-dark: var(--color-zinc-300);
  
  /* Command Menu Keyboard Shortcuts */
  --command-menu-kbd-height-sm: var(--spacing-16);
  --command-menu-kbd-height-lg: var(--spacing-20);
  --command-menu-kbd-min-width-sm: var(--spacing-16);
  --command-menu-kbd-min-width-lg: var(--spacing-20);
  --command-menu-kbd-padding: var(--spacing-tiny);
  --command-menu-kbd-bg: var(--color-zinc-50);
  --command-menu-kbd-bg-dark: var(--color-zinc-700);
  --command-menu-kbd-border: var(--color-zinc-200);
  --command-menu-kbd-border-dark: var(--color-zinc-600);
  --command-menu-kbd-text-color: var(--color-zinc-500);
  --command-menu-kbd-text-color-dark: var(--color-zinc-400);
  --command-menu-kbd-text-size: var(--spacing-12);
  --command-menu-kbd-font-weight: 500;
  --command-menu-kbd-radius: var(--radius-sm);
  
  /* Command Menu Recent Indicator */
  --command-menu-recent-size: 1.5px;
  --command-menu-recent-color: var(--color-blue-500);
  --command-menu-recent-radius: 50%;
  
  /* Command Menu Sizes */
  --command-menu-size-sm: 24rem;    /* max-w-sm */
  --command-menu-size-md: 32rem;    /* max-w-lg */
  --command-menu-size-lg: 42rem;    /* max-w-2xl */

  /* Tokens from connection-status.css */

/* ================================================================== */
  /* LAYER 1: PRIMITIVE TOKENS - Connection Status Specific Values     */
  /* ================================================================== */

  /* Connection Status Banner Sizing */
  --connection-status-banner-height: 3.5rem;
  --connection-status-banner-min-height: 3rem;
  --connection-status-banner-z-index: 50;

  /* Connection Status Content Sizing */
  --connection-status-content-max-width: 80rem;
  --connection-status-icon-size: 1rem;
  --connection-status-button-size: 2rem;

  /* Connection Status Spacing */
  --connection-status-banner-padding-x: var(--spacing-16);
  --connection-status-banner-padding-y: var(--spacing-8);
  --connection-status-content-gap: var(--spacing-12);
  --connection-status-actions-gap: var(--spacing-8);
  --connection-status-button-padding-x: var(--spacing-8);
  --connection-status-button-padding-y: var(--spacing-4);

  /* Connection Status Colors - Status States */
  --connection-status-offline-bg: var(--color-red-500);
  --connection-status-offline-text: var(--color-white);
  --connection-status-offline-icon: var(--color-white);

  --connection-status-syncing-bg: var(--color-blue-500);
  --connection-status-syncing-text: var(--color-white);
  --connection-status-syncing-icon: var(--color-white);

  --connection-status-pending-bg: var(--color-orange-500);
  --connection-status-pending-text: var(--color-white);
  --connection-status-pending-icon: var(--color-white);

  --connection-status-online-bg: var(--color-green-500);
  --connection-status-online-text: var(--color-white);
  --connection-status-online-icon: var(--color-white);

  /* Connection Status Button Colors */
  --connection-status-button-bg: rgba(255, 255, 255, 0.2);
  --connection-status-button-bg-hover: rgba(255, 255, 255, 0.3);
  --connection-status-button-text: var(--color-white);
  --connection-status-button-text-hover: var(--color-white);

  /* Connection Status Dismiss Button */
  --connection-status-dismiss-text: var(--color-white);
  --connection-status-dismiss-text-hover: var(--color-zinc-200);

  /* Connection Status Typography */
  --connection-status-title-font-size: var(--font-size-sm);
  --connection-status-title-font-weight: var(--font-weight-medium);
  --connection-status-title-line-height: var(--line-height-tight);

  --connection-status-detail-font-size: var(--font-size-xs);
  --connection-status-detail-line-height: var(--line-height-tight);
  --connection-status-detail-opacity: 0.9;

  --connection-status-button-font-size: var(--font-size-xs);
  --connection-status-button-font-weight: var(--font-weight-medium);

  /* Connection Status Borders & Effects */
  --connection-status-button-radius: var(--border-radius-sm);
  --connection-status-animation-duration: var(--transition-duration-normal);
  --connection-status-animation-timing: var(--transition-timing-ease-in-out);

  /* Tokens from control.css */

/* ====================================================================== */
  /* CONTROL COMPONENT TOKENS (Checkbox, Radio, Toggle)                   */
  /* ====================================================================== */
  
  /* Control Component Icon Sizes */
  --control-icon-xs: var(--spacing-12);     /* 12px (w-3 h-3) */
  --control-icon-sm: var(--spacing-12);     /* 12px (w-3 h-3) */
  --control-icon-md: var(--spacing-12);     /* 12px (w-3 h-3) */
  --control-icon-lg: var(--spacing-16);     /* 16px (w-4 h-4) */
  --control-icon-xl: var(--spacing-20);     /* 20px (w-5 h-5) */
  
  /* Control Colors */
  --control-bg-white dark:bg-zinc-950: var(--background-primary);
  --control-bg-white dark:bg-zinc-950-dark: var(--color-zinc-800);
  --control-border-zinc-200 dark:border-zinc-800: var(--color-zinc-300);
  --control-border-zinc-200 dark:border-zinc-800-dark: var(--color-zinc-600);
  --control-border-radius: var(--radius-2);  /* rounded-sm */
  
  /* Control Focus */
  --control-focus-ring-width: 2px;
  --control-focus-ring-offset: 1px;
  --control-focus-ring-opacity: 0.2;
  
  /* Control Variants */
  --control-primary-color: var(--color-primary-600);
  --control-primary-color-dark: var(--color-primary-500);
  --control-primary-focus: rgba(59, 130, 246, var(--control-focus-ring-opacity));
  
  --control-error-color: var(--color-red-600);
  --control-error-color-dark: var(--color-red-500);
  --control-error-focus: rgba(220, 38, 38, var(--control-focus-ring-opacity));
  
  --control-disabled-bg: var(--color-zinc-50);
  --control-disabled-bg-dark: var(--color-zinc-700);
  --control-disabled-color: var(--color-zinc-300);
  --control-disabled-color-dark: var(--color-zinc-600);
  
  /* Control Text Colors */
  --control-icon-color: var(--color-white);
  
  /* Transitions */
  --control-transition: all 200ms ease-in-out;
  
  /* Control Text Sizes */
  --control-text-sm: var(--spacing-14);    /* 14px (text-sm) */
  --control-text-md: var(--spacing-16);    /* 16px (text-base) */
  --control-text-lg: var(--spacing-18);    /* 18px (text-lg) */

  /* Tokens from dashboard-layout.css */

/* ================================================================ */
  /* DASHBOARD LAYOUT SEMANTIC TOKENS - Intent-based layout design   */
  /* ================================================================ */
  
  /* Dashboard Container Tokens */
  --dashboard-container-bg: var(--background-default);
  --dashboard-container-min-height: 100vh;
  
  /* ================================================================ */
  /* SIDEBAR SEMANTIC TOKENS - Navigation area styling               */
  /* ================================================================ */
  --sidebar-width: 14rem; /* 224px - w-56 equivalent */
  --sidebar-bg: var(--background-subtle);
  --sidebar-border: var(--border-zinc-200 dark:border-zinc-800);
  --sidebar-shadow: var(--shadow-default);
  
  /* Sidebar Header */
  --sidebar-header-bg: transparent;
  --sidebar-header-border: var(--border-zinc-200 dark:border-zinc-800);
  --sidebar-header-padding: var(--spacing-16) var(--spacing-16);
  --sidebar-header-title-color: var(--text-zinc-500 dark:text-zinc-400);
  --sidebar-header-title-size: 1.25rem; /* text-xl */
  --sidebar-header-title-weight: 600; /* font-semibold */
  
  /* Sidebar Navigation */
  --sidebar-nav-padding: var(--spacing-8) var(--spacing-16);
  
  /* ================================================================ */
  /* HEADER SEMANTIC TOKENS - Top navigation bar styling             */
  /* ================================================================ */
  --header-bg: var(--background-default);
  --header-border: var(--border-zinc-200 dark:border-zinc-800);
  --header-padding: var(--spacing-8) var(--spacing-32);
  --header-shadow: var(--shadow-sm);
  --header-height: auto;
  
  /* Header Actions */
  --header-action-bg: var(--background-muted);
  --header-action-bg-hover: var(--background-emphasis);
  --header-action-padding: var(--spacing-8);
  --header-action-border-radius: 50%;
  --header-action-icon-color: var(--text-zinc-500 dark:text-zinc-400);
  --header-action-icon-size: 1.25rem; /* size-5 */
  
  /* Header Divider */
  --header-divider-color: var(--border-zinc-200 dark:border-zinc-800);
  --header-divider-width: 1px;
  --header-divider-height: var(--spacing-32);
  
  /* ================================================================ */
  /* USER DROPDOWN SEMANTIC TOKENS - User menu styling               */
  /* ================================================================ */
  --user-dropdown-bg: var(--background-default);
  --user-dropdown-border: var(--border-zinc-200 dark:border-zinc-800);
  --user-dropdown-shadow: var(--shadow-overlay);
  --user-dropdown-width: 18rem; /* w-72 equivalent */
  --user-dropdown-border-radius: var(--border-radius-lg);
  
  /* User Dropdown Trigger */
  --user-trigger-bg: transparent;
  --user-trigger-bg-hover: var(--background-subtle);
  --user-trigger-padding: var(--spacing-4) var(--spacing-8);
  --user-trigger-border-radius: var(--border-radius-sm);
  --user-trigger-gap: var(--spacing-8);
  
  /* User Avatar */
  --user-avatar-size: 2rem; /* size-8 */
  --user-avatar-size-large: 3rem; /* size-12 */
  --user-avatar-bg: var(--background-muted);
  --user-avatar-border-radius: 50%;
  
  /* User Info */
  --user-info-name-color: var(--text-zinc-900 dark:text-zinc-100);
  --user-info-name-size: 0.875rem; /* text-sm */
  --user-info-name-weight: 500; /* font-medium */
  --user-info-email-color: var(--text-zinc-500 dark:text-zinc-400);
  --user-info-email-size: 0.875rem; /* text-sm */
  --user-info-role-color: var(--text-zinc-500 dark:text-zinc-400);
  --user-info-role-size: 0.75rem; /* text-xs */
  
  /* User Dropdown Sections */
  --user-section-padding: var(--spacing-16);
  --user-section-border: var(--border-zinc-100 dark:border-zinc-900);
  
  /* User Actions */
  --user-action-bg: transparent;
  --user-action-bg-hover: var(--background-subtle);
  --user-action-padding: var(--spacing-8) var(--spacing-12);
  --user-action-text-color: var(--text-zinc-900 dark:text-zinc-100);
  --user-action-text-size: 0.875rem; /* text-sm */
  --user-action-border-radius: var(--border-radius-sm);
  
  /* Logout Action */
  --user-logout-text-color: var(--text-red-600 dark:text-red-400);
  --user-logout-bg-hover: var(--background-danger-subtle);
  
  /* ================================================================ */
  /* DASHBOARD LAYOUT RESPONSIVE TOKENS                              */
  /* ================================================================ */
  --dashboard-content-margin-left: var(--spacing-224);
  --dashboard-header-padding: var(--spacing-lg) var(--spacing-xs);
  
  /* Header Actions */
  --dashboard-header-action-size: var(--spacing-20);
  --dashboard-header-action-bg: var(--background-muted);
  --dashboard-header-action-padding: var(--spacing-xs);
  --dashboard-header-divider-height: var(--spacing-lg);
  
  /* Notification Styles */
  --dashboard-notification-bg: var(--background-warning-subtle);
  --dashboard-notification-border: var(--color-warning-300);
  --dashboard-notification-text: var(--text-yellow-600 dark:text-yellow-400);
  --dashboard-notification-title: var(--color-warning-800);
  --dashboard-notification-button-bg: var(--background-warning-subtle);
  --dashboard-notification-button-text: var(--text-yellow-600 dark:text-yellow-400);

  /* Tokens from dev-login.css */

/* ====================================================================== */
  /* DEV LOGIN COMPONENT TOKENS                                            */
  /* ====================================================================== */
  
  /* Dev Login Container Design Tokens */
  --dev-login-bg: var(--color-white);
  --dev-login-bg-dark: var(--color-zinc-800);
  --dev-login-border: var(--color-zinc-300);
  --dev-login-border-dark: var(--color-zinc-600);
  --dev-login-radius: var(--border-radius-lg);
  --dev-login-shadow: var(--shadow-md);
  --dev-login-padding: var(--spacing-24);
  --dev-login-max-width: 28rem; /* max-w-md = 28rem */
  --dev-login-margin: 0 auto;

  /* Dev Login Header Design Tokens */
  --dev-login-header-spacing: var(--spacing-24);
  --dev-login-title-color: var(--color-zinc-600);
  --dev-login-title-color-dark: var(--color-zinc-400);
  --dev-login-title-size: var(--text-xl);
  --dev-login-title-weight: 700;
  --dev-login-title-spacing: var(--spacing-8);
  --dev-login-description-color: var(--color-zinc-600);
  --dev-login-description-color-dark: var(--color-zinc-400);
  --dev-login-description-size: var(--text-sm);

  /* Dev Login Button Design Tokens */
  --dev-login-button-primary-bg: var(--color-blue-600);
  --dev-login-button-primary-hover: var(--color-blue-600);
  --dev-login-button-primary-text: var(--color-white);
  --dev-login-button-primary-border: transparent;
  --dev-login-button-padding: var(--spacing-16) var(--spacing-16);
  --dev-login-button-radius: var(--border-radius-md);
  --dev-login-button-font-size: var(--text-sm);
  --dev-login-button-font-weight: 500;

  /* Dev Login Secondary Button Design Tokens */
  --dev-login-button-secondary-bg: transparent;
  --dev-login-button-secondary-hover: var(--color-zinc-50);
  --dev-login-button-secondary-hover-dark: var(--color-zinc-700);
  --dev-login-button-secondary-text: var(--color-zinc-600);
  --dev-login-button-secondary-text-dark: var(--color-zinc-400);
  --dev-login-button-secondary-border: var(--color-zinc-300);
  --dev-login-button-secondary-border-dark: var(--color-zinc-600);
  --dev-login-button-secondary-padding: var(--spacing-12) var(--spacing-12);

  /* Dev Login Disabled Button Design Tokens */
  --dev-login-button-disabled-bg: var(--color-zinc-100);
  --dev-login-button-disabled-opacity: 0.5;
  --dev-login-button-disabled-cursor: not-allowed;

  /* Dev Login Spinner Design Tokens */
  --dev-login-spinner-size: var(--spacing-20);
  --dev-login-spinner-margin: calc(-1 * var(--spacing-4)) var(--spacing-12) 0 0;
  --dev-login-spinner-color: var(--color-white);

  /* Dev Login Divider Design Tokens */
  --dev-login-divider-color: var(--color-zinc-300);
  --dev-login-divider-color-dark: var(--color-zinc-600);
  --dev-login-divider-padding: var(--spacing-16) 0 0;

  /* Dev Login Status Message Design Tokens */
  --dev-login-status-bg: var(--color-zinc-50);
  --dev-login-status-bg-dark: var(--color-zinc-700);
  --dev-login-status-border: var(--color-zinc-300);
  --dev-login-status-border-dark: var(--color-zinc-600);
  --dev-login-status-padding: var(--spacing-12);
  --dev-login-status-radius: var(--border-radius-md);
  --dev-login-status-text: var(--color-zinc-600);
  --dev-login-status-text-dark: var(--color-zinc-400);
  --dev-login-status-font: monospace;
  --dev-login-status-font-size: var(--text-sm);

  /* Dev Login Instructions Design Tokens */
  --dev-login-instructions-spacing: var(--spacing-4);
  --dev-login-instructions-text: var(--color-zinc-600);
  --dev-login-instructions-text-dark: var(--color-zinc-400);
  --dev-login-instructions-font-size: var(--text-xs);
  --dev-login-error-color: var(--color-red-600);
  --dev-login-warning-color: var(--color-orange-600);
  --dev-login-warning-spacing: var(--spacing-8);

  /* Dev Login Quick Login Design Tokens */
  --dev-login-quick-label-spacing: var(--spacing-8);
  --dev-login-quick-label-text: var(--color-zinc-600);
  --dev-login-quick-label-text-dark: var(--color-zinc-400);
  --dev-login-quick-label-font-size: var(--text-xs);
  --dev-login-quick-buttons-spacing: var(--spacing-8);

  /* Dev Login Layout Design Tokens */
  --dev-login-content-spacing: var(--spacing-16);

  /* Tokens from dev-login.css */

--dev-login-bg: var(--dev-login-bg-dark);
    --dev-login-border: var(--dev-login-border-dark);
    --dev-login-title-color: var(--dev-login-title-color-dark);
    --dev-login-description-color: var(--dev-login-description-color-dark);
    --dev-login-button-secondary-hover: var(--dev-login-button-secondary-hover-dark);
    --dev-login-button-secondary-text: var(--dev-login-button-secondary-text-dark);
    --dev-login-button-secondary-border: var(--dev-login-button-secondary-border-dark);
    --dev-login-divider-color: var(--dev-login-divider-color-dark);
    --dev-login-status-bg: var(--dev-login-status-bg-dark);
    --dev-login-status-border: var(--dev-login-status-border-dark);
    --dev-login-status-text: var(--dev-login-status-text-dark);
    --dev-login-instructions-text: var(--dev-login-instructions-text-dark);
    --dev-login-quick-label-text: var(--dev-login-quick-label-text-dark);

  /* Tokens from fieldset.css */

/* ================================================================ */
  /* FIELDSET TOKENS - Component-specific design tokens             */
  /* ================================================================ */
  
  /* Field Layout Spacing */
  --field-spacing-vertical: var(--spacing-xs);      /* 8px - vertical field spacing */
  --field-spacing-horizontal: var(--spacing-md);    /* 16px - horizontal field spacing */
  --field-content-spacing: var(--spacing-tiny);     /* 4px - content spacing */
  
  /* Field Width Tokens */
  --field-label-width-sm: var(--spacing-96);        /* 96px - small label width */
  --field-label-width-md: var(--spacing-128);       /* 128px - medium label width (w-32) */
  --field-label-width-lg: var(--spacing-160);       /* 160px - large label width */
  
  /* Field Group Spacing */
  --field-group-spacing-xs: var(--spacing-8);       /* 8px - extra small group spacing */
  --field-group-spacing-sm: var(--spacing-12);      /* 12px - small group spacing */
  --field-group-spacing-md: var(--spacing-16);      /* 16px - medium group spacing */
  --field-group-spacing-lg: var(--spacing-24);      /* 24px - large group spacing */
  --field-group-spacing-xl: var(--spacing-32);      /* 32px - extra large group spacing */
  
  /* Form Container Spacing */
  --form-spacing-xs: var(--spacing-16);             /* 16px - extra small forms */
  --form-spacing-sm: var(--spacing-24);             /* 24px - small forms */
  --form-spacing-md: var(--spacing-32);             /* 32px - medium forms */
  --form-spacing-lg: var(--spacing-48);             /* 48px - large forms */
  --form-spacing-xl: var(--spacing-64);             /* 64px - extra large forms */
  
  /* Field Group Title Styling */
  --field-group-title-color: var(--color-zinc-600);
  --field-group-title-color-dark: var(--color-zinc-400);
  --field-group-title-size: var(--spacing-18);      /* 18px (text-lg) */
  --field-group-title-weight: 600;                  /* font-semibold */
  --field-group-title-spacing: var(--spacing-tiny); /* 4px bottom margin */
  
  /* Field Group Description Styling */
  --field-group-desc-color: var(--color-zinc-500);
  --field-group-desc-color-dark: var(--color-zinc-400);
  --field-group-desc-size: var(--spacing-14);       /* 14px (text-sm) */
  --field-group-spacing-bottom: var(--spacing-md);  /* 16px spacing after title/desc */

  /* Tokens from form-organisms.css */

/* ================================================================ */
  /* FORM ORGANISM TOKENS - Organism-specific design tokens         */
  /* ================================================================ */
  
  /* Form Section Spacing */
  --form-section-spacing-sm: var(--spacing-lg);        /* 24px - small section spacing */
  --form-section-spacing-md: var(--spacing-xl);        /* 32px - medium section spacing */
  --form-section-spacing-lg: var(--spacing-2xl);       /* 40px - large section spacing */
  --form-section-spacing-xl: var(--spacing-3xl);       /* 48px - extra large section spacing */
  
  /* Form Container Backgrounds */
  --form-container-bg: var(--background-default);
  --form-container-bg-dark: var(--color-zinc-800);
  --form-container-border: var(--color-zinc-300);
  --form-container-border-dark: var(--color-zinc-600);
  --form-container-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --form-container-radius: var(--radius-lg);
  --form-container-padding: var(--spacing-lg);
  
  /* Form Header Styling */
  --form-header-border: var(--color-zinc-200);
  --form-header-border-dark: var(--color-zinc-700);
  --form-header-spacing: var(--spacing-md);
  
  /* Form Section Headers */
  --form-section-title-size: var(--spacing-18);        /* 18px (text-lg) */
  --form-section-title-weight: 600;                    /* font-semibold */
  --form-section-title-color: var(--color-zinc-900);
  --form-section-title-color-dark: var(--color-zinc-100);
  
  --form-section-subtitle-size: var(--spacing-16);     /* 16px (text-base) */
  --form-section-subtitle-weight: 500;                 /* font-medium */
  --form-section-subtitle-color: var(--color-zinc-900);
  --form-section-subtitle-color-dark: var(--color-zinc-100);
  --form-section-subtitle-spacing: var(--spacing-md);
  
  /* Form Section Descriptions */
  --form-section-desc-size: var(--spacing-14);         /* 14px (text-sm) */
  --form-section-desc-color: var(--color-zinc-600);
  --form-section-desc-color-dark: var(--color-zinc-400);
  --form-section-desc-spacing-top: var(--spacing-tiny);
  
  /* Form Mode Indicators */
  --form-mode-indicator-size: var(--spacing-14);       /* 14px (text-sm) */
  --form-mode-indicator-weight: 400;                   /* font-normal */
  --form-mode-indicator-color: var(--color-zinc-500);
  --form-mode-indicator-spacing: var(--spacing-8);
  
  /* Form Information Boxes */
  --form-info-bg-blue: var(--color-blue-50);
  --form-info-bg-blue-dark: color-mix(in srgb, var(--color-blue-900) 20%, transparent);
  --form-info-text-blue: var(--color-blue-700);
  --form-info-text-blue-dark: var(--color-blue-300);
  --form-info-padding: var(--spacing-md);
  --form-info-radius: var(--radius-md);
  
  /* Form Content Sections */
  --form-content-spacing: var(--spacing-2xl);          /* 32px - spacing between major sections */
  --form-subsection-spacing: var(--spacing-lg);        /* 24px - spacing between subsections */
  
  /* Form Grid Layouts */
  --form-grid-gap: var(--spacing-lg);                  /* 24px - gap between grid items */
  --form-grid-gap-sm: var(--spacing-md);               /* 16px - small gap between grid items */

  /* Tokens from helper-text.css */

/* ================================================================ */
  /* HELPER TEXT TOKENS - Component-specific design tokens           */
  /* ================================================================ */
  
  /* Base Styling */
  --helper-text-display: block;
  --helper-text-margin: var(--spacing-4) 0 0 0;  /* mt-1 */
  --helper-text-font-family: var(--font-system);
  
  /* Size Variants */
  --helper-text-size-xs: var(--spacing-12);      /* 12px */
  --helper-text-size-sm: var(--spacing-14);      /* 14px */
  --helper-text-size-md: var(--spacing-16);      /* 16px */
  
  --helper-text-line-height-xs: var(--spacing-16);  /* 16px */
  --helper-text-line-height-sm: var(--spacing-20);  /* 20px */
  --helper-text-line-height-md: var(--spacing-24);  /* 24px */
  
  /* Color Variants */
  --helper-text-color-default: var(--color-zinc-500);
  --helper-text-color-default-dark: var(--color-zinc-400);
  --helper-text-color-error: var(--color-red-600);
  --helper-text-color-error-dark: var(--color-red-400);

  /* Tokens from icon.css */

/* ================================================================ */
  /* ICON TOKENS - Component-specific design tokens                  */
  /* ================================================================ */
  
  /* Icon Base Styling */
  --icon-display: inline-block;
  --icon-font-style: normal;
  --icon-line-height: 1;
  
  /* Icon Size Variants */
  --icon-size-xs: var(--spacing-12);      /* 12px (text-xs) */
  --icon-size-sm: var(--spacing-14);      /* 14px (text-sm) */
  --icon-size-md: var(--spacing-16);      /* 16px (text-base) */
  --icon-size-lg: var(--spacing-18);      /* 18px (text-lg) */
  --icon-size-xl: var(--spacing-20);      /* 20px (text-xl) */
  --icon-size-2xl: var(--spacing-24);     /* 24px (text-2xl) */
  --icon-size-3xl: var(--spacing-30);     /* 30px (text-3xl) */
  
  /* Icon Color Variants */
  --icon-color-primary: var(--color-primary-600);
  --icon-color-primary-dark: var(--color-primary-400);
  --icon-color-secondary: var(--color-zinc-500);
  --icon-color-secondary-dark: var(--color-zinc-400);
  --icon-color-success: var(--color-success-600);
  --icon-color-success-dark: var(--color-success-400);
  --icon-color-warning: var(--color-warning-600);
  --icon-color-warning-dark: var(--color-warning-400);
  --icon-color-danger: var(--color-danger-600);
  --icon-color-danger-dark: var(--color-danger-400);
  --icon-color-white: var(--color-white);
  --icon-color-black: var(--color-black);
  --icon-color-black-dark: var(--color-white);
  --icon-color-inherit: currentColor;
  
  /* Philippine Government Colors */
  --icon-color-gov-blue: #0038a8;
  --icon-color-gov-blue-dark: var(--color-primary-400);
  --icon-color-gov-red: #ce1126;
  --icon-color-gov-red-dark: var(--color-danger-400);
  --icon-color-gov-yellow: #fcd116;
  --icon-color-gov-yellow-dark: var(--color-warning-400);
  
  /* Fallback Icon Styling */
  --icon-fallback-bg: var(--color-zinc-200);
  --icon-fallback-bg-dark: var(--color-zinc-700);
  --icon-fallback-text: var(--color-zinc-500);
  --icon-fallback-text-dark: var(--color-zinc-400);
  --icon-fallback-border: 1px solid var(--color-zinc-300);
  --icon-fallback-border-dark: 1px solid var(--color-zinc-600);
  --icon-fallback-border-radius: var(--radius-2);
  --icon-fallback-font-family: monospace;
  --icon-fallback-font-size: var(--spacing-12);
  --icon-fallback-size: var(--spacing-16);
  
  /* FontAwesome Modifiers */
  --icon-fixed-width: 1.25em;
  --icon-spin-duration: 2s;
  --icon-pulse-duration: 1s;

  /* Tokens from input.css */

/* ====================================================================== */
  /* INPUT COMPONENT TOKENS                                                */
  /* ====================================================================== */
  
  /* Input Component Padding */
  --input-padding-xs: var(--spacing-6) var(--spacing-10);    /* 6px 10px */
  --input-padding-sm: var(--spacing-8) var(--spacing-12);    /* 8px 12px */
  --input-padding-md: var(--spacing-10) var(--spacing-16);   /* 10px 16px */
  --input-padding-lg: var(--spacing-12) var(--spacing-20);   /* 12px 20px */
  --input-padding-xl: var(--spacing-16) var(--spacing-24);   /* 16px 24px */
  
  /* Input Component Text Sizes */
  --input-text-xs: 12px;      /* Extra small input text */
  --input-text-sm: 14px;      /* Small input text */
  --input-text-md: 16px;      /* Medium input text */
  --input-text-lg: 18px;      /* Large input text */
  --input-text-xl: 20px;      /* Extra large input text */
  
  /* Input Container States */
  --input-container-bg: var(--background-primary);
  --input-container-bg-dark: var(--color-zinc-800);
  --input-container-border: var(--color-zinc-300);
  --input-container-border-dark: var(--color-zinc-600);
  --input-container-border-focus: var(--color-primary-600);
  --input-container-border-error: var(--color-red-600);
  --input-container-shadow-focus: 0px 0px 0px 4px rgba(59, 130, 246, 0.32);
  --input-container-shadow-error: 0px 0px 0px 4px rgba(220, 38, 38, 0.32);
  
  /* Icon Sizes */
  --input-icon-xs: var(--spacing-12);    /* 12px (w-3 h-3) */
  --input-icon-sm: var(--spacing-16);    /* 16px (w-4 h-4) */
  --input-icon-md: var(--spacing-20);    /* 20px (w-5 h-5) */
  --input-icon-lg: var(--spacing-24);    /* 24px (w-6 h-6) */
  --input-icon-xl: var(--spacing-28);    /* 28px (w-7 h-7) */
  
  /* Input Colors */
  --input-text-color: var(--color-zinc-900);
  --input-text-color-dark: var(--color-zinc-100);
  --input-placeholder-color: var(--color-zinc-500);
  --input-placeholder-color-dark: var(--color-zinc-400);
  --input-text-disabled: var(--color-zinc-400);
  --input-icon-color: var(--color-zinc-400);
  --input-icon-color-dark: var(--color-zinc-500);
  --input-icon-color-hover: var(--color-zinc-600);
  --input-icon-color-hover-dark: var(--color-zinc-300);
  
  /* Transitions */
  --input-transition: all 200ms ease-in-out;

  /* Tokens from label.css */

/* ================================================================ */
  /* LABEL TOKENS - Component-specific design tokens                 */
  /* ================================================================ */
  
  /* Label Base Styling */
  --label-font-family: var(--font-system);
  --label-font-weight: 500;
  --label-transition: color 200ms ease-in-out;
  --label-line-height: 1.5;
  
  /* Label Size Variants */
  --label-text-xs: var(--spacing-12);     /* 12px */
  --label-text-sm: var(--spacing-14);     /* 14px */
  --label-text-md: var(--spacing-16);     /* 16px */
  --label-text-lg: var(--spacing-18);     /* 18px */
  --label-text-xl: var(--spacing-20);     /* 20px */
  
  --label-line-height-xs: var(--spacing-16);  /* 16px */
  --label-line-height-sm: var(--spacing-20);  /* 20px */
  --label-line-height-md: var(--spacing-24);  /* 24px */
  --label-line-height-lg: var(--spacing-28);  /* 28px */
  --label-line-height-xl: var(--spacing-32);  /* 32px */
  
  /* Label Color Variants */
  --label-text-zinc-900 dark:text-zinc-100: var(--color-zinc-600);
  --label-text-zinc-900 dark:text-zinc-100-dark: var(--color-zinc-400);
  --label-text-zinc-500 dark:text-zinc-400: var(--color-zinc-500);
  --label-text-zinc-500 dark:text-zinc-400-dark: var(--color-zinc-400);
  --label-text-error: var(--color-red-600);
  --label-text-error-dark: var(--color-red-400);
  --label-text-green-600 dark:text-green-400: var(--color-green-600);
  --label-text-green-600 dark:text-green-400-dark: var(--color-green-400);
  --label-text-disabled: var(--color-zinc-400);
  --label-text-disabled-dark: var(--color-zinc-500);
  
  /* Required Indicator */
  --label-required-color: var(--color-red-500);
  --label-required-color-dark: var(--color-red-400);
  --label-required-color-disabled: var(--color-zinc-400);
  --label-required-color-disabled-dark: var(--color-zinc-500);
  --label-required-margin: var(--spacing-4);
  
  /* Secondary Text */
  --label-secondary-margin: var(--spacing-2);
  --label-secondary-font-weight: 400;
  
  /* Visually Hidden */
  --label-sr-only-position: absolute;
  --label-sr-only-width: 1px;
  --label-sr-only-height: 1px;
  --label-sr-only-padding: 0;
  --label-sr-only-margin: -1px;
  --label-sr-only-overflow: hidden;
  --label-sr-only-clip: rect(0, 0, 0, 0);
  --label-sr-only-border: 0;

  /* Tokens from link.css */

/* ================================================================ */
  /* LINK TOKENS - Component-specific design tokens                  */
  /* ================================================================ */
  
  /* Base Link Styling */
  --link-font-family: var(--font-system);
  --link-font-weight: 500;
  --link-line-height: 1.25;
  --link-border-radius: var(--radius-2);
  --link-transition: all 200ms ease-in-out;
  --link-text-decoration: none;
  
  /* Focus States */
  --link-focus-outline: 2px solid;
  --link-focus-outline-offset: 2px;
  --link-focus-ring-opacity: 50%;
  
  /* Icon Sizing */
  --link-icon-size-sm: var(--spacing-16);    /* 16px */
  --link-icon-size-md: var(--spacing-18);    /* 18px */
  --link-icon-size-regular: var(--spacing-20); /* 20px */
  --link-icon-size-lg: var(--spacing-24);    /* 24px */
  
  /* External Link Icon */
  --link-external-icon-size: var(--spacing-16); /* 16px */
  --link-external-icon-margin: var(--spacing-4); /* 4px */
  
  /* Size Variants */
  --link-padding-sm: var(--spacing-8) var(--spacing-8);      /* 8px 8px */
  --link-padding-md: var(--spacing-12) var(--spacing-12);    /* 12px 12px */
  --link-padding-regular: var(--spacing-16) var(--spacing-16); /* 16px 16px */
  --link-padding-lg: var(--spacing-24) var(--spacing-12);    /* 24px 12px */
  
  /* Icon-Only Sizes */
  --link-icon-only-sm: var(--spacing-32);    /* 32px (size-8) */
  --link-icon-only-md: var(--spacing-36);    /* 36px (size-9) */
  --link-icon-only-regular: var(--spacing-36); /* 36px (size-9) */
  --link-icon-only-lg: var(--spacing-40);    /* 40px (size-10) */
  
  /* Primary Variants */
  --link-primary-bg: var(--color-primary-600);
  --link-primary-bg-hover: var(--color-primary-500);
  --link-primary-text: var(--color-white);
  --link-primary-focus-ring: var(--color-primary-600);
  
  --link-primary-subtle-bg: var(--color-primary-50);
  --link-primary-subtle-bg-hover: var(--color-primary-100);
  --link-primary-subtle-text: var(--color-zinc-800);
  --link-primary-subtle-text-hover: var(--color-zinc-900);
  --link-primary-subtle-focus-ring: var(--color-primary-800);
  
  --link-primary-faded-bg: var(--color-primary-100);
  --link-primary-faded-bg-hover: var(--color-primary-200);
  
  --link-primary-outline-border: var(--color-primary-600);
  --link-primary-outline-bg: var(--color-white);
  --link-primary-outline-bg-hover: var(--color-primary-50);
  
  /* Secondary Variants */
  --link-secondary-bg: var(--color-secondary-600);
  --link-secondary-bg-hover: var(--color-secondary-500);
  --link-secondary-focus-ring: var(--color-secondary-600);
  
  --link-secondary-subtle-bg: var(--color-secondary-50);
  --link-secondary-subtle-bg-hover: var(--color-secondary-100);
  --link-secondary-subtle-focus-ring: var(--color-secondary-800);
  
  /* Success Variants */
  --link-success-bg: var(--color-success-600);
  --link-success-bg-hover: var(--color-success-500);
  --link-success-focus-ring: var(--color-success-600);
  
  --link-success-subtle-bg: var(--color-success-50);
  --link-success-subtle-bg-hover: var(--color-success-100);
  --link-success-subtle-text: var(--color-success-800);
  --link-success-subtle-text-hover: var(--color-success-900);
  --link-success-subtle-focus-ring: var(--color-success-800);
  
  /* Warning Variants */
  --link-warning-bg: var(--color-warning-600);
  --link-warning-bg-hover: var(--color-warning-500);
  --link-warning-focus-ring: var(--color-warning-600);
  
  --link-warning-subtle-bg: var(--color-warning-50);
  --link-warning-subtle-bg-hover: var(--color-warning-100);
  --link-warning-subtle-text: var(--color-warning-800);
  --link-warning-subtle-text-hover: var(--color-warning-900);
  --link-warning-subtle-focus-ring: var(--color-warning-800);
  
  /* Danger Variants */
  --link-danger-bg: var(--color-danger-600);
  --link-danger-bg-hover: var(--color-danger-500);
  --link-danger-focus-ring: var(--color-danger-600);
  
  --link-danger-subtle-bg: var(--color-danger-50);
  --link-danger-subtle-bg-hover: var(--color-danger-100);
  --link-danger-subtle-text: var(--color-danger-800);
  --link-danger-subtle-text-hover: var(--color-danger-900);
  --link-danger-subtle-focus-ring: var(--color-danger-800);
  
  /* Neutral Variants */
  --link-zinc-bg: var(--color-zinc-300);
  --link-zinc-bg-hover: var(--color-zinc-50);
  --link-zinc-text: var(--color-zinc-600);
  --link-zinc-focus-ring: var(--color-zinc-500);
  
  /* Ghost Variants */
  --link-ghost-bg-hover: var(--color-zinc-50);
  --link-ghost-text: var(--color-zinc-600);
  --link-ghost-text-hover: var(--color-zinc-600);
  --link-ghost-focus-ring: var(--color-zinc-500);
  
  /* Link-specific Variants */
  --link-text-blue-600 dark:text-blue-400: var(--color-primary-600);
  --link-text-blue-600 dark:text-blue-400-hover: var(--color-primary-500);
  --link-text-zinc-400 dark:text-zinc-500: var(--color-zinc-600);
  --link-text-zinc-400 dark:text-zinc-500-hover: var(--color-zinc-800);
  
  /* Dark Mode Overrides */
  --link-primary-bg-dark: var(--color-primary-500);
  --link-primary-bg-hover-dark: var(--color-primary-400);
  --link-primary-subtle-bg-dark: rgba(59, 130, 246, 0.1);
  --link-primary-subtle-bg-hover-dark: rgba(59, 130, 246, 0.2);
  --link-primary-subtle-text-dark: var(--color-primary-200);
  --link-primary-subtle-text-hover-dark: var(--color-primary-100);
  --link-primary-outline-bg-dark: var(--color-zinc-800);
  --link-primary-outline-bg-hover-dark: rgba(59, 130, 246, 0.1);
  
  --link-zinc-bg-dark: var(--color-zinc-600);
  --link-zinc-bg-hover-dark: var(--color-zinc-700);
  --link-zinc-text-dark: var(--color-zinc-400);
  
  --link-ghost-bg-hover-dark: var(--color-zinc-700);
  --link-ghost-text-dark: var(--color-zinc-400);
  
  --link-text-blue-600 dark:text-blue-400-dark: var(--color-primary-400);
  --link-text-blue-600 dark:text-blue-400-hover-dark: var(--color-primary-300);
  --link-text-zinc-400 dark:text-zinc-500-dark: var(--color-zinc-400);
  --link-text-zinc-400 dark:text-zinc-500-hover-dark: var(--color-zinc-200);

  /* Tokens from login-form.css */

/* ================================================================== */
  /* LAYER 1: PRIMITIVE TOKENS - Login Form Specific Values            */
  /* ================================================================== */

  /* Login Form Container Sizing */
  --login-form-container-max-width: 28rem;
  --login-form-container-width: 100%;
  --login-form-container-margin: auto;

  /* Login Form Card Sizing */
  --login-form-card-padding: var(--spacing-32);
  --login-form-card-radius: var(--border-radius-lg);
  --login-form-card-border-width: 1px;
  --login-form-card-shadow: var(--shadow-lg);

  /* Login Form Header Spacing */
  --login-form-header-margin-bottom: var(--spacing-32);
  --login-form-title-margin-bottom: var(--spacing-8);
  --login-form-subtitle-margin: 0;

  /* Login Form Content Spacing */
  --login-form-content-gap: var(--spacing-24);
  --login-form-footer-margin-top: var(--spacing-24);
  --login-form-footer-gap: var(--spacing-12);

  /* Login Form Colors - Light Mode */
  --login-form-card-bg: var(--color-white);
  --login-form-card-border: var(--color-zinc-300);
  --login-form-title-color: var(--color-zinc-600);
  --login-form-subtitle-color: var(--color-zinc-600);
  --login-form-footer-color: var(--color-zinc-600);
  --login-form-link-color: var(--color-zinc-400);
  --login-form-link-hover-color: var(--color-zinc-300);
  --login-form-help-color: var(--color-zinc-500);

  /* Login Form Colors - Dark Mode */
  --login-form-card-bg-dark: var(--color-zinc-800);
  --login-form-card-border-dark: var(--color-zinc-600);
  --login-form-title-color-dark: var(--color-zinc-400);
  --login-form-subtitle-color-dark: var(--color-zinc-400);
  --login-form-footer-color-dark: var(--color-zinc-400);
  --login-form-link-color-dark: var(--color-zinc-700);
  --login-form-link-hover-color-dark: var(--color-zinc-500);
  --login-form-help-color-dark: var(--color-zinc-400);

  /* Login Form Error States */
  --login-form-error-bg: var(--color-red-50);
  --login-form-error-border: var(--color-red-300);
  --login-form-error-icon-color: var(--color-red-600);
  --login-form-error-title-color: var(--color-red-800);
  --login-form-error-text-color: var(--color-red-700);
  --login-form-error-padding: var(--spacing-16);
  --login-form-error-gap: var(--spacing-12);
  --login-form-error-radius: var(--border-radius-lg);

  /* Login Form Typography */
  --login-form-title-font-size: var(--font-size-2xl);
  --login-form-title-font-weight: var(--font-weight-bold);
  --login-form-title-line-height: var(--line-height-tight);

  --login-form-subtitle-font-size: var(--font-size-sm);
  --login-form-subtitle-font-weight: var(--font-weight-normal);
  --login-form-subtitle-line-height: var(--line-height-normal);

  --login-form-footer-font-size: var(--font-size-sm);
  --login-form-footer-link-font-weight: var(--font-weight-medium);

  --login-form-help-font-size: var(--font-size-xs);
  --login-form-help-line-height: var(--line-height-normal);

  --login-form-error-title-font-weight: var(--font-weight-medium);
  --login-form-error-text-font-size: var(--font-size-sm);

  /* Login Form Icon Sizing */
  --login-form-error-icon-size: 1.25rem;
  --login-form-error-icon-margin-top: 0.125rem;

  /* Login Form Animations */
  --login-form-transition-duration: var(--transition-duration-normal);
  --login-form-transition-timing: var(--transition-timing-ease-in-out);

  /* Login Page Layout */
  --login-page-bg: var(--color-white);
  --login-page-bg-dark: var(--color-zinc-800);
  --login-page-min-height: 100vh;
  --login-page-padding-y: var(--spacing-48);
  --login-page-padding-x-sm: var(--spacing-24);
  --login-page-padding-x-lg: var(--spacing-32);

  /* Login Page Header */
  --login-page-header-max-width: 28rem;
  --login-page-header-margin: auto;
  --login-page-brand-title-font-size: var(--font-size-3xl);
  --login-page-brand-title-font-weight: var(--font-weight-bold);
  --login-page-brand-title-color: var(--color-zinc-600);
  --login-page-brand-title-color-dark: var(--color-zinc-300);
  --login-page-brand-title-margin-bottom: var(--spacing-8);
  --login-page-brand-subtitle-font-size: var(--font-size-sm);
  --login-page-brand-subtitle-color: var(--color-zinc-600);
  --login-page-brand-subtitle-color-dark: var(--color-zinc-400);
  --login-page-brand-subtitle-margin-bottom: var(--spacing-32);

  /* Login Page Theme Toggle */
  --login-page-theme-toggle-position-top: var(--spacing-16);
  --login-page-theme-toggle-position-right: var(--spacing-16);

  /* Login Page Dev Panel */
  --login-page-dev-panel-margin-top: var(--spacing-32);
  --login-page-dev-panel-bg: var(--color-white);
  --login-page-dev-panel-bg-dark: var(--color-zinc-800);
  --login-page-dev-panel-border: var(--color-zinc-200);
  --login-page-dev-panel-border-dark: var(--color-zinc-700);
  --login-page-dev-panel-padding: var(--spacing-16);
  --login-page-dev-panel-radius: var(--border-radius-lg);
  --login-page-dev-title-font-size: var(--font-size-sm);
  --login-page-dev-title-font-weight: var(--font-weight-medium);
  --login-page-dev-title-color: var(--color-zinc-400);
  --login-page-dev-title-color-dark: var(--color-zinc-500);
  --login-page-dev-title-margin-bottom: var(--spacing-8);
  --login-page-dev-content-gap: var(--spacing-8);
  --login-page-dev-text-font-size: var(--font-size-xs);
  --login-page-dev-text-color: var(--color-zinc-600);
  --login-page-dev-text-color-dark: var(--color-zinc-400);
  --login-page-dev-button-color: var(--color-zinc-400);
  --login-page-dev-button-color-dark: var(--color-zinc-600);
  --login-page-dev-button-hover-color: var(--color-zinc-300);
  --login-page-dev-button-hover-color-dark: var(--color-zinc-400);

  /* Login Page Loading State */
  --login-page-loading-spinner-size: 3rem;
  --login-page-loading-spinner-border: 4px;
  --login-page-loading-spinner-color: var(--color-blue-600);
  --login-page-loading-text-margin-top: var(--spacing-16);
  --login-page-loading-text-font-size: var(--font-size-lg);
  --login-page-loading-text-font-weight: var(--font-weight-medium);
  --login-page-loading-text-color: var(--color-zinc-600);
  --login-page-loading-text-color-dark: var(--color-zinc-400);

  /* Tokens from modal.css */

/* ====================================================================== */
  /* MODAL COMPONENT TOKENS                                                */
  /* ====================================================================== */
  
  /* Modal Component Padding */
  --modal-padding-xs: var(--spacing-24);   /* 24px */
  --modal-padding-sm: var(--spacing-32);   /* 32px */
  --modal-padding-md: var(--spacing-40);   /* 40px */
  --modal-padding-lg: var(--spacing-48);   /* 48px */
  --modal-padding-xl: var(--spacing-64);   /* 64px */
  
  /* Modal Component Gaps */
  --modal-gap-xs: var(--spacing-16);       /* 16px */
  --modal-gap-sm: var(--spacing-24);       /* 24px */
  --modal-gap-md: var(--spacing-32);       /* 32px */
  --modal-gap-lg: var(--spacing-40);       /* 40px */
  --modal-gap-xl: var(--spacing-48);       /* 48px */

  /* Tokens from navigation-menu.css */

/* ================================================================ */
  /* NAVIGATION MENU TOKENS - Component-specific design tokens      */
  /* ================================================================ */
  
  /* Navigation Layout Design Tokens */
  --navigation-menu-padding-main-x: var(--spacing-4);
  --navigation-menu-padding-main-y: var(--spacing-16);
  --navigation-menu-padding-bottom-x: var(--spacing-8);
  --navigation-menu-padding-bottom-y: var(--spacing-16);
  
  /* Navigation Item Design Tokens */
  --navigation-item-padding: var(--spacing-8);
  --navigation-item-gap: var(--spacing-8);
  --navigation-item-border-radius: var(--border-radius-base);
  --navigation-item-transition: color 200ms ease-in-out, background-color 200ms ease-in-out;
  
  /* Navigation Icon Design Tokens */
  --navigation-icon-size: var(--spacing-20); /* 20px */
  
  /* Navigation Colors - Active State */
  --navigation-active-bg: var(--color-blue-100);
  --navigation-active-bg-dark: var(--color-zinc-800);
  --navigation-active-text: var(--color-zinc-800);
  --navigation-active-text-dark: var(--color-white);
  --navigation-active-icon: var(--color-blue-600);
  --navigation-active-icon-dark: var(--color-white);
  
  /* Navigation Colors - Inactive State */
  --navigation-inactive-bg: var(--color-zinc-50);
  --navigation-inactive-bg-dark: var(--color-zinc-800);
  --navigation-inactive-text: var(--color-zinc-700);
  --navigation-inactive-text-dark: var(--color-zinc-300);
  --navigation-inactive-icon: var(--color-zinc-400);
  --navigation-inactive-icon-dark: var(--color-zinc-500);
  
  /* Navigation Colors - Hover State */
  --navigation-hover-text: var(--color-blue-600);
  --navigation-hover-text-dark: var(--color-white);
  --navigation-hover-bg: var(--color-zinc-50);
  --navigation-hover-bg-dark: var(--color-zinc-700);
  
  /* Navigation Submenu Design Tokens */
  --navigation-submenu-margin-top: var(--spacing-8); /* mt-xs */
  --navigation-submenu-margin-left: var(--spacing-16); /* ml-md */
  --navigation-submenu-gap: var(--spacing-4); /* space-y-tiny */
  --navigation-submenu-item-padding: var(--spacing-8); /* p-xs */
  --navigation-submenu-item-bg: var(--color-blue-50);
  --navigation-submenu-item-bg-dark: var(--color-zinc-800);
  --navigation-submenu-text: var(--color-zinc-600);
  --navigation-submenu-text-dark: var(--color-zinc-300);
  
  /* Navigation Focus Design Tokens */
  --navigation-focus-ring: 2px solid var(--color-blue-500);
  --navigation-focus-ring-offset: 2px;
  --navigation-focus-ring-offset-bg: var(--color-zinc-50);
  --navigation-focus-ring-offset-bg-dark: var(--color-zinc-950);
  
  /* Navigation Variants - Compact */
  --navigation-compact-item-padding: var(--spacing-4);
  --navigation-compact-section-gap: var(--spacing-4); /* space-y-1 */
  
  /* Navigation Variants - Minimal */
  --navigation-minimal-border-width: 2px;
  --navigation-minimal-border-color: transparent;
  --navigation-minimal-border-active: var(--color-blue-600);
  --navigation-minimal-border-hover: var(--color-zinc-300);
  --navigation-minimal-padding-left: var(--spacing-12); /* pl-3 */
  
  /* Navigation Mobile Design Tokens */
  --navigation-mobile-item-padding: var(--spacing-12);
  --navigation-mobile-section-gap: var(--spacing-8); /* space-y-2 */
  --navigation-mobile-list-gap: var(--spacing-4); /* gap-y-tiny */
  
  /* Navigation Tablet Design Tokens */
  --navigation-tablet-item-padding: var(--spacing-8);

  /* Tokens from navigation-menu.css */

/* Override navigation tokens for dark mode */
    --navigation-active-bg: var(--navigation-active-bg-dark);
    --navigation-active-text: var(--navigation-active-text-dark);
    --navigation-active-icon: var(--navigation-active-icon-dark);
    --navigation-inactive-bg: var(--navigation-inactive-bg-dark);
    --navigation-inactive-text: var(--navigation-inactive-text-dark);
    --navigation-inactive-icon: var(--navigation-inactive-icon-dark);
    --navigation-hover-text: var(--navigation-hover-text-dark);
    --navigation-hover-bg: var(--navigation-hover-bg-dark);
    --navigation-submenu-item-bg: var(--navigation-submenu-item-bg-dark);
    --navigation-submenu-text: var(--navigation-submenu-text-dark);
    --navigation-focus-ring-offset-bg: var(--navigation-focus-ring-offset-bg-dark);

  /* Tokens from population-pyramid.css */

/* ================================================================ */
  /* POPULATION PYRAMID TOKENS - Component-specific design tokens    */
  /* ================================================================ */
  
  /* Bar dimensions */
  --pyramid-bar-height: var(--spacing-16);           /* 16px (h-4) */
  --pyramid-bar-radius: var(--radius-2);             /* 2px (rounded-xs) */
  
  /* Colors using semantic tokens */
  --pyramid-male-color: var(--color-primary-500);     /* Blue */
  --pyramid-male-color-hover: var(--color-primary-400);
  --pyramid-male-color-selected: var(--color-primary-600);
  
  --pyramid-female-color: var(--color-secondary-500); /* Purple */
  --pyramid-female-color-hover: var(--color-secondary-400);
  --pyramid-female-color-selected: var(--color-secondary-600);
  
  /* Row hover states */
  --pyramid-row-hover-bg: var(--background-subtle);
  --pyramid-row-selected-bg: var(--background-brand-subtle);
  
  /* Legend indicators */
  --pyramid-legend-indicator-size: var(--spacing-12); /* 12px (size-3) */
  
  /* Animation timing */
  --pyramid-transition-duration: 200ms;
  --pyramid-bar-transition: opacity 0.3s ease-in-out;
  --pyramid-scale-transform: scale(1, 1.1);

  /* Layout spacing and sizing */
  --pyramid-header-spacing: var(--spacing-24); /* mb-lg */
  --pyramid-empty-padding: var(--spacing-48); /* py-3xl */
  --pyramid-empty-icon-size: var(--spacing-48); /* h-12 w-12 */
  --pyramid-empty-text-spacing: var(--spacing-8); /* mt-xs */
  --pyramid-section-spacing: var(--spacing-4); /* space-y-tiny */
  --pyramid-header-grid-spacing: var(--spacing-12); /* mb-sm */
  --pyramid-legend-spacing: var(--spacing-24); /* mt-lg */
  --pyramid-legend-border-spacing: var(--spacing-16); /* pt-md */
  --pyramid-legend-gap: var(--spacing-24); /* gap-lg */
  --pyramid-legend-item-gap: var(--spacing-8); /* gap-xs */

  /* Grid layout proportions */
  --pyramid-male-width: 45%;
  --pyramid-age-width: 10%;
  --pyramid-female-width: 45%;
  --pyramid-bar-padding: var(--spacing-12); /* pr-sm, pl-sm */
  --pyramid-age-padding: var(--spacing-12); /* px-sm */

  /* Text styling */
  --pyramid-text-xs: var(--text-xs);
  --pyramid-text-sm: var(--text-sm);
  --pyramid-count-min-width: 35px;

  /* Selected group notification */
  --pyramid-selected-notification-margin: var(--spacing-16); /* mt-4 */
  --pyramid-selected-notification-padding: var(--spacing-12); /* p-3 */
  --pyramid-selected-notification-bg: var(--color-blue-50);
  --pyramid-selected-notification-bg-dark: var(--color-blue-900-alpha-20);
  --pyramid-selected-notification-border: var(--color-blue-200);
  --pyramid-selected-notification-border-dark: var(--color-blue-800);
  --pyramid-selected-notification-radius: var(--border-radius-lg);

  /* Empty state colors */
  --pyramid-empty-text-color: var(--color-zinc-500);
  --pyramid-empty-text-color-dark: var(--color-zinc-400);
  --pyramid-empty-icon-color: var(--color-zinc-300);
  --pyramid-empty-icon-color-dark: var(--color-zinc-600);
  --pyramid-empty-secondary-color: var(--color-zinc-400);
  --pyramid-empty-secondary-color-dark: var(--color-zinc-500);

  /* Tokens from population-pyramid.css */

--pyramid-empty-text-color: var(--pyramid-empty-text-color-dark);
    --pyramid-empty-icon-color: var(--pyramid-empty-icon-color-dark);
    --pyramid-empty-secondary-color: var(--pyramid-empty-secondary-color-dark);
    --pyramid-selected-notification-bg: var(--pyramid-selected-notification-bg-dark);
    --pyramid-selected-notification-border: var(--pyramid-selected-notification-border-dark);

  /* Tokens from protected-route.css */

/* ====================================================================== */
  /* PROTECTED ROUTE COMPONENT TOKENS                                      */
  /* ====================================================================== */
  
  /* Protected Route Container Design Tokens */
  --protected-route-bg: var(--color-white);
  --protected-route-bg-dark: var(--color-zinc-800);
  --protected-route-min-height: 100vh;

  /* Protected Route Layout Design Tokens */
  --protected-route-layout-display: flex;
  --protected-route-layout-align: center;
  --protected-route-layout-justify: center;

  /* Protected Route Loading Spinner Design Tokens */
  --protected-route-spinner-size: var(--spacing-48); /* size-12 = 3rem = 48px */
  --protected-route-spinner-color: var(--color-zinc-600);
  --protected-route-spinner-color-dark: var(--color-zinc-400);
  --protected-route-spinner-margin: 0 auto;

  /* Protected Route Loading Text Design Tokens */
  --protected-route-loading-text-margin: var(--spacing-16) 0 0; /* mt-4 */
  --protected-route-loading-text-size: var(--text-sm);
  --protected-route-loading-text-color: var(--color-zinc-600);
  --protected-route-loading-text-color-dark: var(--color-zinc-400);

  /* Protected Route Error Card Design Tokens */
  --protected-route-card-bg: var(--color-white);
  --protected-route-card-bg-dark: var(--color-zinc-800);
  --protected-route-card-border: var(--color-zinc-300);
  --protected-route-card-border-dark: var(--color-zinc-600);
  --protected-route-card-radius: var(--border-radius-lg);
  --protected-route-card-padding: var(--spacing-24); /* p-6 */
  --protected-route-card-shadow: var(--shadow-md);
  --protected-route-card-max-width: 28rem; /* max-w-md */
  --protected-route-card-width: 100%;

  /* Protected Route Icon Design Tokens */
  --protected-route-icon-size: var(--spacing-48); /* size-12 */
  --protected-route-icon-margin: 0 auto var(--spacing-16); /* mx-auto mb-4 */
  --protected-route-icon-warning-color: var(--color-yellow-600);
  --protected-route-icon-error-color: var(--color-red-600);

  /* Protected Route Title Design Tokens */
  --protected-route-title-margin: 0 0 var(--spacing-8); /* mb-2 */
  --protected-route-title-size: var(--text-lg);
  --protected-route-title-weight: 600;
  --protected-route-title-color: var(--color-zinc-600);
  --protected-route-title-color-dark: var(--color-zinc-400);

  /* Protected Route Description Design Tokens */
  --protected-route-description-margin: 0 0 var(--spacing-16); /* mb-4 */
  --protected-route-description-size: var(--text-sm);
  --protected-route-description-color: var(--color-zinc-600);
  --protected-route-description-color-dark: var(--color-zinc-400);

  /* Protected Route Meta Text Design Tokens */
  --protected-route-meta-color: var(--color-zinc-500);
  --protected-route-meta-color-dark: var(--color-zinc-400);
  --protected-route-meta-margin: 0 0 var(--spacing-16); /* mb-4 */
  --protected-route-meta-size: var(--text-xs);

  /* Protected Route Container Design Tokens */
  --protected-route-container-display: flex;
  --protected-route-container-direction: column;
  --protected-route-container-align: center;
  --protected-route-container-text-align: center;

  /* Tokens from protected-route.css */

--protected-route-bg: var(--protected-route-bg-dark);
    --protected-route-spinner-color: var(--protected-route-spinner-color-dark);
    --protected-route-loading-text-color: var(--protected-route-loading-text-color-dark);
    --protected-route-card-bg: var(--protected-route-card-bg-dark);
    --protected-route-card-border: var(--protected-route-card-border-dark);
    --protected-route-title-color: var(--protected-route-title-color-dark);
    --protected-route-description-color: var(--protected-route-description-color-dark);
    --protected-route-meta-color: var(--protected-route-meta-color-dark);

  /* Tokens from pwa-components.css */

/* ================================================================== */
  /* LAYER 1: PRIMITIVE TOKENS - PWA Component Values                  */
  /* ================================================================== */

  /* PWA Container Positioning */
  --pwa-position-bottom: 1.25rem;
  --pwa-position-right: 1rem;
  --pwa-position-left: 1rem;
  --pwa-z-index: 50;

  /* PWA Button Sizing */
  --pwa-button-size: 3rem;
  --pwa-button-padding: var(--spacing-xs);
  --pwa-button-border-radius: 9999px;

  /* PWA Panel Sizing */
  --pwa-panel-width: 20rem;
  --pwa-panel-max-width-mobile: calc(100vw - 2rem);
  --pwa-panel-padding: var(--spacing-16);
  --pwa-panel-border-radius: var(--border-radius-lg);

  /* PWA Colors - Light Mode */
  --pwa-bg: var(--color-white);
  --pwa-border: var(--color-zinc-200);
  --pwa-button-bg: var(--color-blue-600);
  --pwa-button-bg-hover: var(--color-blue-700);
  --pwa-button-text: var(--color-white);
  --pwa-text: var(--color-zinc-900);
  --pwa-text-zinc-500 dark:text-zinc-400: var(--color-zinc-600);
  --pwa-shadow: var(--shadow-lg);

  /* PWA Colors - Dark Mode */
  --pwa-bg-dark: var(--color-zinc-800);
  --pwa-border-dark: var(--color-zinc-600);
  --pwa-text-dark: var(--color-zinc-100);
  --pwa-text-zinc-500 dark:text-zinc-400-dark: var(--color-zinc-400);

  /* PWA Status Colors */
  --pwa-status-online: var(--color-green-500);
  --pwa-status-offline: var(--color-red-500);
  --pwa-status-updating: var(--color-yellow-500);
  --pwa-status-ready: var(--color-blue-500);

  /* PWA Transitions */
  --pwa-transition-duration: var(--transition-duration-normal);
  --pwa-transition-timing: var(--transition-timing-ease-in-out);

  /* PWA Typography */
  --pwa-font-family: var(--font-family-sans);
  --pwa-font-size-sm: var(--font-size-sm);
  --pwa-font-size-base: var(--font-size-base);
  --pwa-font-weight-medium: var(--font-weight-medium);
  --pwa-font-weight-semibold: var(--font-weight-semibold);

  /* PWA Install Prompt Specific */
  --pwa-install-gap: var(--spacing-12);
  --pwa-install-icon-size: 4rem;
  --pwa-install-button-padding: var(--spacing-8) var(--spacing-16);

  /* PWA DevTools Specific */
  --pwa-devtools-panel-bottom: 5rem;
  --pwa-devtools-item-padding: var(--spacing-8);
  --pwa-devtools-item-gap: var(--spacing-4);

  /* PWA Status Specific */
  --pwa-status-panel-bottom: 1rem;
  --pwa-status-indicator-size: 0.75rem;
  --pwa-status-gap: var(--spacing-8);

  /* Tokens from readonly.css */

/* ================================================================ */
  /* READONLY TOKENS - Component-specific design tokens              */
  /* ================================================================ */
  
  /* Container Styling */
  --readonly-container-position: relative;
  --readonly-container-display: flex;
  --readonly-container-width: 100%;
  --readonly-container-min-height: var(--spacing-40);  /* min-h-10 */
  --readonly-container-padding: var(--spacing-8) 0;    /* py-2 */
  --readonly-container-font-size: var(--spacing-16);   /* text-base */
  
  /* Alignment */
  --readonly-align-multiline: flex-start;
  --readonly-align-single: center;
  
  /* Icon Styling */
  --readonly-icon-size: var(--spacing-20);         /* 20px */
  --readonly-icon-color: var(--color-zinc-400);
  --readonly-icon-color-dark: var(--color-zinc-500);
  --readonly-icon-margin-left: var(--spacing-8);   /* mr-2 */
  --readonly-icon-margin-right: var(--spacing-8);  /* ml-2 */
  
  /* Content Styling */
  --readonly-content-min-width: 0;
  --readonly-content-min-height: 0;
  --readonly-content-flex-grow: 1;
  --readonly-content-flex-basis: 0;
  --readonly-content-gap: var(--spacing-2);        /* gap-0.5 */
  --readonly-content-padding: var(--spacing-4) 0;  /* px-1 py-0 */
  
  /* Text Styling */
  --readonly-text-font-weight: 400;
  --readonly-text-line-height: 1.25;
  --readonly-text-color: var(--color-zinc-600);
  --readonly-text-color-dark: var(--color-zinc-300);
  
  /* Multiline Text */
  --readonly-text-multiline-whitespace: pre-wrap;
  --readonly-text-multiline-word-break: break-words;
  
  /* Single Line Text */
  --readonly-text-single-overflow: hidden;
  --readonly-text-single-text-overflow: ellipsis;
  --readonly-text-single-white-space: nowrap;
  
  /* Empty State */
  --readonly-empty-content: '—';

  /* Tokens from search-bar.css */

/* ================================================================== */
  /* LAYER 1: PRIMITIVE TOKENS - Search Bar Specific Values            */
  /* ================================================================== */

  /* Search Bar Container Sizing */
  --search-bar-min-height-sm: 2rem;
  --search-bar-min-height-md: 2.5rem;
  --search-bar-min-height-lg: 3rem;
  --search-bar-width: 100%;

  /* Search Bar Padding */
  --search-bar-padding-sm: var(--spacing-6);
  --search-bar-padding-md: var(--spacing-8);
  --search-bar-padding-lg: var(--spacing-12);

  /* Search Bar Border & Styling */
  --search-bar-border-radius: var(--border-radius-sm);
  --search-bar-border-width: 1px;
  --search-bar-transition-duration: var(--transition-duration-normal);
  --search-bar-transition-timing: var(--transition-timing-ease-in-out);

  /* Search Bar Colors - Light Mode */
  --search-bar-bg: var(--color-white);
  --search-bar-border: var(--color-zinc-300);
  --search-bar-border-hover: var(--color-zinc-400);
  --search-bar-border-focus: var(--color-blue-600);
  --search-bar-shadow-focus: 0px 0px 0px 4px rgba(59, 130, 246, 0.32);

  /* Search Bar Colors - Dark Mode */
  --search-bar-bg-dark: var(--color-zinc-800);
  --search-bar-border-dark: var(--color-zinc-600);
  --search-bar-border-hover-dark: var(--color-zinc-500);
  --search-bar-border-focus-dark: var(--color-blue-600);

  /* Search Bar Text Colors */
  --search-bar-text-color: var(--color-zinc-600);
  --search-bar-text-color-dark: var(--color-zinc-300);
  --search-bar-placeholder-color: var(--color-zinc-500);
  --search-bar-placeholder-color-dark: var(--color-zinc-400);
  --search-bar-disabled-text-color: var(--color-zinc-500);
  --search-bar-disabled-text-color-dark: var(--color-zinc-400);

  /* Search Bar Icon Colors */
  --search-bar-icon-color: var(--color-zinc-600);
  --search-bar-icon-color-dark: var(--color-zinc-400);
  --search-bar-icon-hover-color: var(--color-zinc-700);
  --search-bar-icon-hover-color-dark: var(--color-zinc-300);

  /* Search Bar Icon Sizing */
  --search-bar-icon-container-size: 1.25rem;
  --search-bar-icon-size: 1rem;

  /* Search Bar Typography */
  --search-bar-font-family: var(--font-family-sans);
  --search-bar-font-weight: var(--font-weight-normal);
  
  --search-bar-font-size-sm: var(--font-size-sm);
  --search-bar-line-height-sm: var(--line-height-4);
  
  --search-bar-font-size-md: var(--font-size-base);
  --search-bar-line-height-md: var(--line-height-5);
  
  --search-bar-font-size-lg: var(--font-size-lg);
  --search-bar-line-height-lg: var(--line-height-6);

  /* Search Bar Content Layout */
  --search-bar-content-gap: var(--spacing-2);
  --search-bar-content-padding-x: var(--spacing-4);
  --search-bar-content-padding-y: 0;

  /* Search Bar States */
  --search-bar-disabled-opacity: 0.6;
  --search-bar-disabled-cursor: not-allowed;

  /* Tokens from sectoral-info.css */

/* ====================================================================== */
  /* SECTORAL INFO COMPONENT TOKENS                                        */
  /* ====================================================================== */
  
  /* Sectoral Info Container Design Tokens */
  --sectoral-info-spacing: var(--spacing-24); /* space-y-lg */
  --sectoral-info-header-spacing: var(--spacing-4); /* mt-tiny */
  --sectoral-info-grid-gap-x: var(--spacing-16); /* gap-x-md */
  --sectoral-info-grid-gap-y: var(--spacing-24); /* gap-y-lg */

  /* Sectoral Info Header Design Tokens */
  --sectoral-info-title-size: var(--text-lg);
  --sectoral-info-title-weight: 500;
  --sectoral-info-title-color: var(--color-zinc-800);
  --sectoral-info-title-color-dark: var(--color-zinc-200);
  --sectoral-info-description-size: var(--text-sm);
  --sectoral-info-description-color: var(--color-zinc-600);
  --sectoral-info-description-color-dark: var(--color-zinc-400);

  /* Sectoral Info Auto-Calculated Section Design Tokens */
  --sectoral-info-auto-bg: var(--color-zinc-50);
  --sectoral-info-auto-bg-dark: var(--color-zinc-700);
  --sectoral-info-auto-radius: var(--border-radius-lg);
  --sectoral-info-auto-padding: var(--spacing-16); /* p-md */

  /* Sectoral Info Grid Design Tokens */
  --sectoral-info-grid-cols-base: 1;
  --sectoral-info-grid-cols-sm: 2;
  --sectoral-info-view-spacing: var(--spacing-24); /* space-y-lg */

  /* Sectoral Info Summary Design Tokens */
  --sectoral-info-summary-bg: var(--color-blue-50);
  --sectoral-info-summary-bg-dark: var(--color-blue-900-alpha-20);
  --sectoral-info-summary-radius: var(--border-radius-lg);
  --sectoral-info-summary-padding: var(--spacing-16); /* p-md */
  --sectoral-info-summary-title-spacing: var(--spacing-8); /* mb-xs */
  --sectoral-info-summary-title-size: var(--text-sm);
  --sectoral-info-summary-title-weight: 500;
  --sectoral-info-summary-title-color: var(--color-zinc-900);
  --sectoral-info-summary-title-color-dark: var(--color-zinc-100);
  --sectoral-info-summary-text-size: var(--text-xs);
  --sectoral-info-summary-text-color: var(--color-zinc-700);
  --sectoral-info-summary-text-color-dark: var(--color-zinc-300);
  --sectoral-info-summary-label-weight: 500;

  /* Tokens from sectoral-info.css */

--sectoral-info-title-color: var(--sectoral-info-title-color-dark);
    --sectoral-info-description-color: var(--sectoral-info-description-color-dark);
    --sectoral-info-auto-bg: var(--sectoral-info-auto-bg-dark);
    --sectoral-info-summary-bg: var(--sectoral-info-summary-bg-dark);
    --sectoral-info-summary-title-color: var(--sectoral-info-summary-title-color-dark);
    --sectoral-info-summary-text-color: var(--sectoral-info-summary-text-color-dark);

  /* Tokens from select.css */

/* ================================================================ */
  /* SELECT TOKENS - Component-specific design tokens                */
  /* ================================================================ */
  
  /* Dropdown Positioning */
  --select-dropdown-z-index: 50;
  --select-dropdown-max-height: 15rem;      /* 240px - max-h-60 */
  --select-dropdown-max-height-sm: 20rem;   /* 320px - max-h-80 */
  --select-dropdown-margin: var(--spacing-2);
  --select-dropdown-border-radius: var(--radius-6);
  --select-dropdown-shadow: var(--shadow-overlay);
  
  /* Dropdown Background and Border */
  --select-dropdown-bg: var(--background-primary);
  --select-dropdown-bg-dark: var(--color-zinc-800);
  --select-dropdown-border: var(--color-zinc-300);
  --select-dropdown-border-dark: var(--color-zinc-600);
  
  /* Dropdown Icon */
  --select-icon-size: var(--spacing-16);  /* 16px (size-4) */
  --select-icon-transition: transform 200ms ease-in-out;
  --select-icon-rotation: 180deg;
  
  /* Empty State */
  --select-empty-padding: var(--spacing-12) var(--spacing-16); /* px-md py-xl equivalent */
  --select-empty-text-color: var(--color-zinc-500);
  --select-empty-text-color-dark: var(--color-zinc-400);
  --select-empty-icon-size: var(--spacing-32);  /* 32px (w-8 h-8) */
  --select-empty-icon-color: var(--color-zinc-400);
  --select-empty-gap: var(--spacing-8);     /* gap-sm */
  
  /* Loading State */
  --select-loading-spinner-size: var(--spacing-24);  /* 24px (h-6 w-6) */
  --select-loading-border-width: 2px;
  --select-loading-border-color: var(--color-primary-600);
  --select-loading-border-color-dark: var(--color-primary-400);
  
  /* Option Container */
  --select-options-padding: var(--spacing-2);  /* py-tiny */
  
  /* Search Requirements */
  --select-search-min-length: 2;
  
  /* Typography */
  --select-text-sm: var(--spacing-14);      /* 14px */
  --select-text-xs: var(--spacing-12);      /* 12px */
  --select-font-medium: 500;

  /* Tokens from skip-navigation.css */

/* ================================================================ */
  /* SKIP NAVIGATION TOKENS - Component-specific design tokens       */
  /* ================================================================ */
  
  /* Skip Link Base Styling */
  --skip-nav-position: absolute;
  --skip-nav-left: var(--spacing-16);      /* left-4 */
  --skip-nav-top: var(--spacing-16);       /* top-4 */
  --skip-nav-z-index: 50;
  --skip-nav-border-radius: var(--radius-6);
  --skip-nav-padding: var(--spacing-8) var(--spacing-16); /* px-4 py-2 */
  --skip-nav-shadow: var(--shadow-overlay);
  --skip-nav-outline: none;
  
  /* Skip Link Colors */
  --skip-nav-bg: var(--color-primary-600);
  --skip-nav-text: var(--color-white);
  --skip-nav-text-dark: var(--color-black);
  
  /* Skip Link Focus Ring */
  --skip-nav-ring-width: 2px;
  --skip-nav-ring-color: var(--color-primary-600);
  --skip-nav-ring-offset: 2px;
  
  /* Visually Hidden */
  --skip-nav-sr-only-position: absolute;
  --skip-nav-sr-only-width: 1px;
  --skip-nav-sr-only-height: 1px;
  --skip-nav-sr-only-padding: 0;
  --skip-nav-sr-only-margin: -1px;
  --skip-nav-sr-only-overflow: hidden;
  --skip-nav-sr-only-clip: rect(0, 0, 0, 0);
  --skip-nav-sr-only-border: 0;
  
  /* Skip Links Container */
  --skip-nav-container-gap: var(--spacing-8); /* gap-2 */

  /* Tokens from statistics-chart.css */

--chart-container-border-radius: var(--border-radius-lg);
  --chart-container-padding: var(--spacing-24);
  --chart-container-shadow: var(--shadow-sm);
  
  /* ================================================================ */
  /* CHART LAYOUT SEMANTIC TOKENS - Grid and positioning             */
  /* ================================================================ */
  --chart-layout-gap: var(--spacing-24);
  --chart-layout-min-width: 0;
  
  /* Stories Showcase Layout */
  --chart-showcase-gap: var(--spacing-24);
  --chart-showcase-padding: var(--spacing-24);
  --chart-showcase-columns-mobile: 1;
  --chart-showcase-columns-desktop: 2;
  
  /* Chart SVG Area */
  --chart-svg-container-padding: var(--spacing-16);
  --chart-svg-max-width: 15rem; /* 240px - max-w-60 equivalent */
  --chart-svg-viewbox: 0 0 100 100;
  
  /* ================================================================ */
  /* PIE CHART SEMANTIC TOKENS - Chart visualization styling         */
  /* ================================================================ */
  --pie-chart-radius-default: 45;
  --pie-chart-radius-hover: 47;
  --pie-chart-transition: all 200ms ease-in-out;
  
  /* Pie Slice States */
  --pie-slice-opacity-default: 1;
  --pie-slice-opacity-hover: 0.9;
  --pie-slice-opacity-dimmed: 0.6;
  --pie-slice-shadow-hover: var(--shadow-emphasis);
  
  /* ================================================================ */
  /* CHART LEGEND SEMANTIC TOKENS - Legend styling and states        */
  /* ================================================================ */
  --legend-container-gap: var(--spacing-4);
  --legend-container-width: 100%;
  
  /* Legend Item */
  --legend-item-bg: transparent;
  --legend-item-bg-hover: var(--background-subtle);
  --legend-item-padding: var(--spacing-8) var(--spacing-8);
  --legend-item-border-radius: var(--border-radius-sm);
  --legend-item-transition: var(--pie-chart-transition);
  
  /* Legend Item States */
  --legend-item-opacity-disabled: 0.5;
  --legend-item-opacity-dimmed: 0.6;
  --legend-item-cursor-disabled: default;
  --legend-item-cursor-interactive: pointer;
  
  /* Legend Color Indicator */
  --legend-indicator-size: var(--spacing-12); /* size-3 equivalent */
  --legend-indicator-border-radius: 50%;
  --legend-indicator-scale-hover: 1.25;
  --legend-indicator-shadow-hover: var(--shadow-default);
  --legend-indicator-ring-hover: 2px solid var(--interactive-subtle-hover);
  
  /* Legend Typography */
  --legend-label-size: 0.875rem; /* text-sm */
  --legend-label-weight: 400; /* font-normal */
  --legend-label-weight-hover: 500; /* font-medium */
  --legend-label-color: var(--text-zinc-900 dark:text-zinc-100);
  --legend-label-color-hover: var(--text-emphasis);
  --legend-label-color-disabled: var(--text-disabled);
  
  --legend-value-size: 0.875rem; /* text-sm */
  --legend-value-weight: 600; /* font-semibold */
  --legend-value-weight-hover: 700; /* font-bold */
  --legend-value-color: var(--text-emphasis);
  --legend-value-color-hover: var(--text-emphasis);
  --legend-value-color-disabled: var(--text-disabled);
  
  /* ================================================================ */
  /* CHART TOOLTIP SEMANTIC TOKENS - Tooltip styling                 */
  /* ================================================================ */
  --chart-tooltip-bg: var(--surface-overlay);
  --chart-tooltip-border: var(--border-emphasis);
  --chart-tooltip-border-radius: var(--border-radius-md);
  --chart-tooltip-padding: var(--spacing-8) var(--spacing-12);
  --chart-tooltip-shadow: var(--shadow-overlay);
  --chart-tooltip-z-index: 50;
  
  /* Tooltip Typography */
  --chart-tooltip-text-color: var(--text-zinc-900 dark:text-zinc-100);
  --chart-tooltip-text-size: 0.875rem; /* text-sm */
  --chart-tooltip-label-weight: 500; /* font-medium */
  --chart-tooltip-value-weight: 600; /* font-semibold */
  
  /* ================================================================ */
  /* CHART TITLE SEMANTIC TOKENS - Chart title styling               */
  /* ================================================================ */
  --chart-title-color: var(--text-emphasis);
  --chart-title-size: 1.125rem; /* text-lg */
  --chart-title-weight: 600; /* font-semibold */
  --chart-title-line-height: 1.4;
  --chart-title-margin-bottom: var(--spacing-16);
  
  /* ================================================================ */
  /* CHART EMPTY STATE SEMANTIC TOKENS - No data state styling       */
  /* ================================================================ */
  --chart-empty-state-color: var(--text-zinc-500 dark:text-zinc-400);
  --chart-empty-state-size: 0.875rem; /* text-sm */
  --chart-empty-state-padding: var(--spacing-32);
  --chart-empty-state-bg: var(--background-muted);
  --chart-empty-state-border: 2px dashed var(--border-muted);
  --chart-empty-state-border-radius: var(--border-radius-md);
  
  /* ================================================================ */
  /* CHART VARIANT SEMANTIC TOKENS - Type-specific styling          */
  /* ================================================================ */
  
  /* Demographic Chart Colors */
  --chart-dependency-primary: var(--color-blue-600);
  --chart-dependency-secondary: var(--color-blue-400);
  --chart-dependency-tertiary: var(--color-blue-200);
  
  --chart-sex-primary: var(--color-pink-500);
  --chart-sex-secondary: var(--color-blue-500);
  
  --chart-civil-status-primary: var(--color-green-600);
  --chart-civil-status-secondary: var(--color-green-400);
  --chart-civil-status-tertiary: var(--color-green-300);
  --chart-civil-status-quaternary: var(--color-green-200);
  
  --chart-employment-primary: var(--color-purple-600);
  --chart-employment-secondary: var(--color-purple-400);
  --chart-employment-tertiary: var(--color-purple-300);
  --chart-employment-quaternary: var(--color-purple-200);
  
  /* Chart Variant Sizing */
  --chart-compact-container-padding: var(--spacing-12);
  --chart-compact-svg-max-width: 10rem; /* 160px */
  --chart-compact-title-size: 1rem; /* text-base */
  --chart-compact-title-margin: var(--spacing-8);
  
  --chart-detailed-container-padding: var(--spacing-32);
  --chart-detailed-svg-max-width: 20rem; /* 320px */
  --chart-detailed-title-size: 1.25rem; /* text-xl */
  --chart-detailed-title-margin: var(--spacing-20);

  /* ================================================================ */
  /* RESPONSIVE BREAKPOINTS - Chart layout adaptations               */
  /* ================================================================ */
  --chart-layout-columns-mobile: 1;
  --chart-layout-columns-tablet: 2;
  --chart-container-padding-mobile: var(--spacing-16);
  --chart-svg-max-width-mobile: 12rem; /* 192px */

  /* Tokens from table.css */

/* ====================================================================== */
  /* TABLE COMPONENT TOKENS                                                */
  /* ====================================================================== */
  
  /* Table Component Cell Padding */
  --table-cell-padding-xs: var(--spacing-4) var(--spacing-8);   /* 4px 8px */
  --table-cell-padding-sm: var(--spacing-6) var(--spacing-12);  /* 6px 12px */
  --table-cell-padding-md: var(--spacing-8) var(--spacing-16);  /* 8px 16px */
  --table-cell-padding-lg: var(--spacing-12) var(--spacing-24); /* 12px 24px */
  --table-cell-padding-xl: var(--spacing-16) var(--spacing-32); /* 16px 32px */
  
  /* Table Component Text Sizes */
  --table-text-xs: 12px;      /* Extra small table text */
  --table-text-sm: 14px;      /* Small table text */
  --table-text-md: 16px;      /* Medium table text */
  --table-text-lg: 18px;      /* Large table text */
  --table-text-xl: 20px;      /* Extra large table text */

  /* Table Container Design Tokens */
  --table-container-bg: var(--color-white);
  --table-container-bg-dark: var(--color-zinc-800);
  --table-container-border: var(--color-zinc-300);
  --table-container-border-dark: var(--color-zinc-600);
  --table-container-radius: var(--border-radius-lg);

  /* Table Header Design Tokens */
  --table-header-bg: var(--color-zinc-100);
  --table-header-bg-dark: var(--color-zinc-700);
  --table-header-text: var(--color-zinc-600);
  --table-header-text-dark: var(--color-zinc-400);
  --table-header-hover-bg: var(--color-zinc-50);
  --table-header-hover-bg-dark: var(--color-zinc-700);

  /* Table Body Design Tokens */
  --table-body-bg: var(--color-white);
  --table-body-bg-dark: var(--color-zinc-800);
  --table-body-text: var(--color-zinc-600);
  --table-body-text-dark: var(--color-zinc-400);
  --table-row-hover-bg: var(--color-zinc-50);
  --table-row-hover-bg-dark: var(--color-zinc-700);
  --table-row-selected-bg: var(--color-blue-50);
  --table-row-selected-bg-dark: var(--color-blue-900-alpha-20);

  /* Table Selection Design Tokens */
  --table-checkbox-bg: var(--color-white);
  --table-checkbox-bg-dark: var(--color-zinc-800);
  --table-checkbox-border: var(--color-zinc-300);
  --table-checkbox-border-dark: var(--color-zinc-600);
  --table-checkbox-text: var(--color-zinc-600);
  --table-checkbox-text-dark: var(--color-zinc-400);
  --table-checkbox-focus: var(--color-blue-500);
  --table-checkbox-size: var(--spacing-16);

  /* Table Sort Design Tokens */
  --table-sort-icon-size: var(--spacing-12);
  --table-sort-icon-active: var(--color-zinc-600);
  --table-sort-icon-active-dark: var(--color-zinc-400);
  --table-sort-icon-inactive: var(--color-zinc-500);
  --table-sort-icon-inactive-dark: var(--color-zinc-600);

  /* Table Actions Design Tokens */
  --table-actions-spacing: var(--spacing-8);
  --table-action-link-text: var(--color-zinc-600);
  --table-action-link-text-dark: var(--color-zinc-400);
  --table-action-link-hover: var(--color-zinc-800);
  --table-action-link-hover-dark: var(--color-zinc-200);
  --table-action-icon-spacing: var(--spacing-4);

  /* Table Pagination Design Tokens */
  --table-pagination-bg: var(--color-white);
  --table-pagination-bg-dark: var(--color-zinc-800);
  --table-pagination-border: var(--color-zinc-300);
  --table-pagination-border-dark: var(--color-zinc-600);
  --table-pagination-padding: var(--spacing-16) var(--spacing-16);
  --table-pagination-spacing: var(--spacing-8);
  --table-pagination-text: var(--color-zinc-600);
  --table-pagination-text-dark: var(--color-zinc-400);

  /* Table Empty State Design Tokens */
  --table-empty-padding: var(--spacing-16) var(--spacing-24);
  --table-empty-text: var(--color-zinc-600);
  --table-empty-text-dark: var(--color-zinc-400);

  /* Table Loading Design Tokens */
  --table-loading-padding: var(--spacing-48);
  --table-loading-spinner-size: var(--spacing-24);
  --table-loading-spinner-border: var(--spacing-2);
  --table-loading-spinner-color: var(--color-blue-600);
  --table-loading-text: var(--color-zinc-600);
  --table-loading-text-dark: var(--color-zinc-400);
  --table-loading-spacing: var(--spacing-8);

  /* Tokens from table.css */

--table-container-bg: var(--table-container-bg-dark);
    --table-container-border: var(--table-container-border-dark);
    --table-header-bg: var(--table-header-bg-dark);
    --table-header-text: var(--table-header-text-dark);
    --table-header-hover-bg: var(--table-header-hover-bg-dark);
    --table-body-bg: var(--table-body-bg-dark);
    --table-body-text: var(--table-body-text-dark);
    --table-row-hover-bg: var(--table-row-hover-bg-dark);
    --table-row-selected-bg: var(--table-row-selected-bg-dark);
    --table-checkbox-bg: var(--table-checkbox-bg-dark);
    --table-checkbox-border: var(--table-checkbox-border-dark);
    --table-checkbox-text: var(--table-checkbox-text-dark);
    --table-sort-icon-active: var(--table-sort-icon-active-dark);
    --table-sort-icon-inactive: var(--table-sort-icon-inactive-dark);
    --table-action-link-text: var(--table-action-link-text-dark);
    --table-action-link-hover: var(--table-action-link-hover-dark);
    --table-pagination-bg: var(--table-pagination-bg-dark);
    --table-pagination-border: var(--table-pagination-border-dark);
    --table-pagination-text: var(--table-pagination-text-dark);
    --table-empty-text: var(--table-empty-text-dark);
    --table-loading-text: var(--table-loading-text-dark);

  /* Tokens from template-forms.css */

/* ================================================================ */
  /* TEMPLATE FORM TOKENS - Template-specific design tokens         */
  /* ================================================================ */
  
  /* Template Container Spacing */
  --template-form-spacing-sm: var(--spacing-lg);        /* 24px - small template spacing */
  --template-form-spacing-md: var(--spacing-xl);        /* 32px - medium template spacing */
  --template-form-spacing-lg: var(--spacing-2xl);       /* 40px - large template spacing */
  --template-form-spacing-xl: var(--spacing-3xl);       /* 48px - extra large template spacing */
  
  /* Template Form Containers */
  --template-form-bg: var(--background-default);
  --template-form-bg-dark: var(--color-zinc-800);
  --template-form-border: var(--color-zinc-300);
  --template-form-border-dark: var(--color-zinc-600);
  --template-form-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --template-form-radius: var(--radius-lg);
  --template-form-padding: var(--spacing-lg);
  
  /* Template Form Headers */
  --template-form-header-bg: var(--background-default);
  --template-form-header-bg-dark: var(--color-zinc-800);
  --template-form-header-border: var(--color-zinc-300);
  --template-form-header-border-dark: var(--color-zinc-600);
  --template-form-header-padding: var(--spacing-md);
  --template-form-header-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  
  /* Template Form Titles */
  --template-form-title-size: var(--spacing-20);        /* 20px (text-xl) */
  --template-form-title-weight: 600;                    /* font-semibold */
  --template-form-title-color: var(--color-zinc-900);
  --template-form-title-color-dark: var(--color-zinc-100);
  
  /* Template Form Descriptions */
  --template-form-desc-size: var(--spacing-14);         /* 14px (text-sm) */
  --template-form-desc-color: var(--color-zinc-600);
  --template-form-desc-color-dark: var(--color-zinc-400);
  
  /* Template Form Buttons */
  --template-form-button-size: var(--spacing-14);       /* 14px (text-sm) */
  --template-form-button-weight: 500;                   /* font-medium */
  --template-form-button-padding-x: var(--spacing-md);  /* 16px */
  --template-form-button-padding-y: var(--spacing-xs);  /* 8px */
  --template-form-button-radius: var(--radius-md);
  --template-form-button-border-width: 1px;
  
  /* Template Form Button Colors */
  --template-form-button-primary-bg: var(--color-blue-600);
  --template-form-button-primary-bg-hover: var(--color-blue-700);
  --template-form-button-primary-text: #ffffff;
  --template-form-button-primary-border: transparent;
  
  --template-form-button-success-bg: var(--color-green-600);
  --template-form-button-success-bg-hover: var(--color-green-700);
  --template-form-button-success-text: #ffffff;
  --template-form-button-success-border: transparent;
  
  --template-form-button-secondary-bg: var(--background-default);
  --template-form-button-secondary-bg-dark: var(--color-zinc-800);
  --template-form-button-secondary-bg-hover: var(--color-zinc-50);
  --template-form-button-secondary-bg-hover-dark: var(--color-zinc-700);
  --template-form-button-secondary-text: var(--color-zinc-700);
  --template-form-button-secondary-text-dark: var(--color-zinc-300);
  --template-form-button-secondary-border: var(--color-zinc-300);
  --template-form-button-secondary-border-dark: var(--color-zinc-600);
  
  /* Template Form Button Focus States */
  --template-form-button-focus-ring: 2px;
  --template-form-button-focus-color: var(--color-blue-500);
  --template-form-button-focus-offset: 2px;
  
  /* Template Form Button Disabled States */
  --template-form-button-disabled-opacity: 0.5;
  --template-form-button-disabled-cursor: not-allowed;
  
  /* Template Form Actions */
  --template-form-actions-spacing: var(--spacing-md);   /* 16px - gap between action buttons */
  --template-form-actions-padding-top: var(--spacing-lg);
  --template-form-actions-border-top: 1px solid var(--color-zinc-200);
  --template-form-actions-border-top-dark: 1px solid var(--color-zinc-700);

  /* Tokens from textarea.css */

/* ================================================================ */
  /* TEXTAREA TOKENS - Component-specific design tokens              */
  /* ================================================================ */
  
  /* Container Styling */
  --textarea-container-bg: var(--background-primary);
  --textarea-container-bg-dark: var(--color-zinc-800);
  --textarea-container-border: var(--color-zinc-300);
  --textarea-container-border-dark: var(--color-zinc-600);
  --textarea-container-border-focus: var(--color-primary-600);
  --textarea-container-border-error: var(--color-red-600);
  --textarea-container-border-radius: var(--radius-6);
  --textarea-container-padding: var(--spacing-12);  /* p-sm */
  --textarea-container-shadow-focus: 0px 0px 0px 4px rgba(59, 130, 246, 0.32);
  --textarea-container-shadow-error: 0px 0px 0px 4px rgba(220, 38, 38, 0.32);
  --textarea-container-transition: colors 200ms ease-in-out;
  
  /* Field Styling */
  --textarea-field-bg: transparent;
  --textarea-field-border: none;
  --textarea-field-outline: none;
  --textarea-field-shadow: none;
  --textarea-field-font-size: var(--spacing-16);  /* text-base */
  --textarea-field-font-weight: 400;
  --textarea-field-line-height: 1.25;
  --textarea-field-text-color: var(--color-zinc-600);
  --textarea-field-text-color-dark: var(--color-zinc-300);
  --textarea-field-placeholder-color: var(--color-zinc-500);
  --textarea-field-placeholder-color-dark: var(--color-zinc-400);
  --textarea-field-disabled-color: var(--color-zinc-400);
  --textarea-field-disabled-cursor: not-allowed;
  
  /* Inner Container */
  --textarea-inner-padding: var(--spacing-2) var(--spacing-4);  /* px-tiny py-none */
  --textarea-inner-gap: var(--spacing-2);  /* gap-tiny */
  
  /* Character Count */
  --textarea-count-margin: var(--spacing-4);  /* mt-xs */
  --textarea-count-font-size: var(--spacing-12);  /* text-xs */
  --textarea-count-color: var(--color-zinc-500);
  --textarea-count-color-dark: var(--color-zinc-400);
  --textarea-count-color-warning: var(--color-red-500);
  
  /* Min Height Calculation */
  --textarea-row-height: 1.25rem;  /* 20px per row */

  /* Tokens from theme-toggle.css */

/* ================================================================== */
  /* LAYER 1: PRIMITIVE TOKENS - Theme Toggle Values                   */
  /* ================================================================== */

  /* Theme Toggle Sizing */
  --theme-toggle-size-sm: 2rem;
  --theme-toggle-size-md: 2.25rem;
  --theme-toggle-size-lg: 2.5rem;

  /* Theme Toggle Colors - Light Mode */
  --theme-toggle-bg: var(--color-white);
  --theme-toggle-bg-hover: var(--color-zinc-50);
  --theme-toggle-border: var(--color-zinc-300);
  --theme-toggle-border-hover: var(--color-zinc-400);
  --theme-toggle-text: var(--color-zinc-600);
  --theme-toggle-text-hover: var(--color-zinc-900);

  /* Theme Toggle Colors - Dark Mode */
  --theme-toggle-bg-dark: var(--color-zinc-800);
  --theme-toggle-bg-hover-dark: var(--color-zinc-700);
  --theme-toggle-border-dark: var(--color-zinc-600);
  --theme-toggle-border-hover-dark: var(--color-zinc-500);
  --theme-toggle-text-dark: var(--color-zinc-400);
  --theme-toggle-text-hover-dark: var(--color-zinc-100);

  /* Theme Toggle Transparent Variant */
  --theme-toggle-transparent-bg: transparent;
  --theme-toggle-transparent-border: var(--color-zinc-300);
  --theme-toggle-transparent-border-dark: var(--color-zinc-600);

  /* Theme Toggle Padding */
  --theme-toggle-padding-sm: var(--spacing-4);
  --theme-toggle-padding-md: var(--spacing-6);
  --theme-toggle-padding-lg: var(--spacing-8);

  /* Theme Toggle Transitions */
  --theme-toggle-transition-duration: var(--transition-duration-normal);
  --theme-toggle-transition-timing: var(--transition-timing-ease-in-out);

  /* Theme Toggle Border Radius */
  --theme-toggle-border-radius: var(--border-radius-md);

  /* Theme Toggle Icon Size */
  --theme-toggle-icon-size: 1rem;

  /* Theme Toggle Focus */
  --theme-toggle-focus-ring: 2px solid var(--color-blue-500);
  --theme-toggle-focus-offset: 2px;

  /* Tokens from title-description.css */

/* ================================================================ */
  /* TITLE DESCRIPTION TOKENS - Component-specific design tokens     */
  /* ================================================================ */
  
  /* Container Styling */
  --title-desc-container-margin: 0 0 0 var(--spacing-12); /* ml-3 */
  --title-desc-container-display: flex;
  --title-desc-container-direction: column;
  
  /* Title Styling */
  --title-font-weight: 500;
  --title-user-select: none;
  
  /* Title Size Variants */
  --title-size-sm: var(--spacing-14);     /* text-sm */
  --title-size-md: var(--spacing-16);     /* text-base */
  --title-size-lg: var(--spacing-18);     /* text-lg */
  
  /* Title Color Variants */
  --title-color-default: var(--color-zinc-900);
  --title-color-default-dark: var(--color-zinc-100);
  --title-color-primary: var(--color-zinc-900);
  --title-color-primary-dark: var(--color-zinc-100);
  --title-color-error: var(--color-zinc-900);
  --title-color-error-dark: var(--color-zinc-100);
  --title-color-disabled: var(--color-zinc-400);
  --title-color-disabled-dark: var(--color-zinc-500);
  
  /* Description Styling */
  --desc-user-select: none;
  
  /* Description Size Variants */
  --desc-size-sm: var(--spacing-12);      /* text-xs */
  --desc-size-md: var(--spacing-14);      /* text-sm */
  --desc-size-lg: var(--spacing-16);      /* text-base */
  
  /* Description Color Variants */
  --desc-color-default: var(--color-zinc-500);
  --desc-color-default-dark: var(--color-zinc-400);
  --desc-color-primary: var(--color-zinc-500);
  --desc-color-primary-dark: var(--color-zinc-400);
  --desc-color-error: var(--color-zinc-500);
  --desc-color-error-dark: var(--color-zinc-400);
  --desc-color-disabled: var(--color-zinc-400);
  --desc-color-disabled-dark: var(--color-zinc-500);
  
  /* Error Message Styling */
  --error-user-select: none;
  --error-color: var(--color-red-600);
  --error-color-dark: var(--color-red-400);
  
  /* Error Size Variants */
  --error-size-sm: var(--spacing-12);     /* text-xs */
  --error-size-md: var(--spacing-14);     /* text-sm */
  --error-size-lg: var(--spacing-16);     /* text-base */

  /* Tokens from version-tag.css */

/* ================================================================== */
  /* LAYER 1: PRIMITIVE TOKENS - Version Tag Values                    */
  /* ================================================================== */

  /* Version Tag Positioning */
  --version-tag-position-bottom: var(--spacing-16);
  --version-tag-position-left: var(--spacing-16);
  --version-tag-position-right: var(--spacing-16);
  --version-tag-z-index: 50;

  /* Version Tag Sizing */
  --version-tag-padding-x: var(--spacing-8);
  --version-tag-padding-y: var(--spacing-2);
  --version-tag-border-radius: var(--border-radius-lg);
  --version-tag-gap: var(--spacing-4);

  /* Version Tag Typography */
  --version-tag-font-size: var(--font-size-xs);
  --version-tag-font-weight: var(--font-weight-medium);
  --version-tag-line-height: 1.4;

  /* Version Tag Effects */
  --version-tag-shadow: var(--shadow-sm);
  --version-tag-backdrop-blur: 4px;
  --version-tag-border-width: 1px;

  /* Version Tag Colors - Development */
  --version-tag-dev-bg: rgba(59, 130, 246, 0.9);
  --version-tag-dev-text: var(--color-white);
  --version-tag-dev-border: rgba(59, 130, 246, 0.3);

  /* Version Tag Colors - Staging */
  --version-tag-staging-bg: rgba(245, 158, 11, 0.9);
  --version-tag-staging-text: var(--color-white);
  --version-tag-staging-border: rgba(245, 158, 11, 0.3);

  /* Version Tag Colors - Production */
  --version-tag-production-bg: rgba(34, 197, 94, 0.9);
  --version-tag-production-text: var(--color-white);
  --version-tag-production-border: rgba(34, 197, 94, 0.3);

  /* Version Tag Colors - Preview */
  --version-tag-preview-bg: rgba(168, 85, 247, 0.9);
  --version-tag-preview-text: var(--color-white);
  --version-tag-preview-border: rgba(168, 85, 247, 0.3);

  /* Version Tag Colors - Default */
  --version-tag-default-bg: rgba(107, 114, 128, 0.9);
  --version-tag-default-text: var(--color-white);
  --version-tag-default-border: rgba(107, 114, 128, 0.3);

  /* Version Tag Transitions */
  --version-tag-transition-duration: var(--transition-duration-normal);
  --version-tag-transition-timing: var(--transition-timing-ease-in-out);

  /* Version Tag Hover Effects */
  --version-tag-hover-scale: 1.02;
  --version-tag-hover-shadow: var(--shadow-md);