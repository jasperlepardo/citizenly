/**
 * Select Keyboard Navigation Hook
 * Handles keyboard interactions and navigation for the Select component
 */

import { createDropdownKeyHandler } from '@/utils/dom/keyboardUtils';
import type { SelectOption } from '@/utils/ui/selectUtils';

export interface UseSelectKeyboardProps {
  showDropdown: boolean;
  focusedIndex: number;
  filteredOptions: SelectOption[];
  normalizedOptions: SelectOption[];
  selectedOption: SelectOption | null;
  searchable: boolean;
  onSearch?: (query: string) => void;
  setShowDropdown: (show: boolean) => void;
  setDropdownPosition: (position: 'below' | 'above') => void;
  setFocusedIndex: (index: number) => void;
  setJustSelected: (selected: boolean) => void;
  setFilteredOptions: (options: SelectOption[]) => void;
  calculateDropdownPosition: () => 'below' | 'above';
  handleOptionSelect: (option: SelectOption) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const useSelectKeyboard = ({
  showDropdown,
  focusedIndex,
  filteredOptions,
  normalizedOptions,
  selectedOption,
  searchable,
  onSearch,
  setShowDropdown,
  setDropdownPosition,
  setFocusedIndex,
  setJustSelected,
  setFilteredOptions,
  calculateDropdownPosition,
  handleOptionSelect,
  inputRef,
}: UseSelectKeyboardProps) => {
  // Handle keyboard navigation using consolidated utility
  const handleKeyDown = createDropdownKeyHandler({
    isOpen: showDropdown,
    selectedIndex: focusedIndex,
    itemCount: filteredOptions.length,
    searchable: searchable,
    onOpen: () => {
      // Reset just selected flag to allow dropdown to show
      setJustSelected(false);

      if (onSearch) {
        // For API-driven selects, show dropdown immediately without triggering API call
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());
      } else {
        // Show all options when opening dropdown via keyboard for static data
        setFilteredOptions(normalizedOptions);
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());

        // Highlight and scroll to the currently selected item
        if (selectedOption) {
          const selectedIndex = normalizedOptions.findIndex(
            opt => opt.value === selectedOption.value
          );
          setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          setFocusedIndex(0);
        }
      }
    },
    onClose: () => {
      setShowDropdown(false);
      setFocusedIndex(-1);
      inputRef.current?.blur();
    },
    onSelect: (index: number) => {
      if (index >= 0 && index < filteredOptions.length) {
        handleOptionSelect(filteredOptions[index]);
      } else if (showDropdown) {
        // If dropdown is open but no option focused, just close it
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    },
    onNavigate: (index: number) => {
      setFocusedIndex(index);
    },
  });

  return {
    handleKeyDown,
  };
};