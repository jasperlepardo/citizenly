export interface CommandMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  avatar?: {
    src: string;
    alt: string;
    fallback?: string;
  };
  shortcut?: string[];
  group: string;
  keywords?: string[];
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  recent?: boolean;
}

export interface CommandMenuGroup {
  id: string;
  label: string;
  items: CommandMenuItem[];
  priority?: number;
}

export interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandMenuItem[];
  placeholder?: string;
  emptyStateText?: string;
  className?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  showRecentSection?: boolean;
}

export interface CommandMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: CommandMenuItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  executeCommand: (item: CommandMenuItem) => void;
}

export type CommandMenuVariant = 'default' | 'compact';
export type CommandMenuSize = 'sm' | 'md' | 'lg';
