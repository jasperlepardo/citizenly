/**
 * @jest-environment node
 */

import {
  // String utilities
  capitalize,
  toTitleCase,
  truncateText,
  sanitizeString,
  isValidEmail,
  isValidPhilippineMobile,
  formatPhoneNumber,
  // Data transformation utilities
  isEmpty,
  deepClone,
  groupBy,
  removeDuplicates,
  sortBy,
  formatCurrency,
  formatDate,
  parseQueryString,
  buildQueryString,
  // ID generation utilities
  generateId,
  generateFieldId,
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
  // Async utilities
  debounce,
  throttle,
  sleep,
  retry,
  // CSS utilities
  cn,
  // mergeClassNames - REMOVED: Use `cn` instead
} from '../utilities';

describe('Utilities - String Utils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single characters', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('A')).toBe('A');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(toTitleCase('hello WORLD')).toBe('Hello World');
    });

    it('should handle single words', () => {
      expect(toTitleCase('hello')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that should be truncated';
      expect(truncateText(text, 20)).toBe('This is a very lo...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('should use custom suffix', () => {
      const text = 'This is a long text';
      expect(truncateText(text, 10, '---')).toBe('This is---');
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize special characters', () => {
      expect(sanitizeString('Hello@World#123')).toBe('hello_world_123');
    });

    it('should handle multiple underscores', () => {
      expect(sanitizeString('Hello___World')).toBe('hello_world');
    });

    it('should preserve allowed characters', () => {
      expect(sanitizeString('hello-world_123.txt')).toBe('hello-world_123.txt');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test.example.com')).toBe(false);
    });
  });

  describe('isValidPhilippineMobile', () => {
    it('should validate Philippine mobile numbers', () => {
      expect(isValidPhilippineMobile('09171234567')).toBe(true);
      expect(isValidPhilippineMobile('639171234567')).toBe(true);
      expect(isValidPhilippineMobile('09-17-123-4567')).toBe(true);
    });

    it('should reject invalid mobile numbers', () => {
      expect(isValidPhilippineMobile('081712345678')).toBe(false); // Wrong prefix
      expect(isValidPhilippineMobile('0917123456')).toBe(false); // Too short
      expect(isValidPhilippineMobile('09171234567890')).toBe(false); // Too long
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Philippine mobile numbers', () => {
      expect(formatPhoneNumber('09171234567')).toBe('0917 123 4567');
      expect(formatPhoneNumber('639171234567')).toBe('+63 917 123 4567');
    });

    it('should handle no phone', () => {
      expect(formatPhoneNumber()).toBe('No phone');
      expect(formatPhoneNumber('')).toBe('No phone');
    });

    it('should return original for unrecognized formats', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('123-456-7890');
    });
  });
});

describe('Utilities - Data Transformers', () => {
  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should clone objects deeply', () => {
      const original = {
        name: 'test',
        nested: { value: 123 },
        array: [1, 2, { inner: 'value' }],
      };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
      expect(cloned.array).not.toBe(original.array);
    });

    it('should handle primitives', () => {
      expect(deepClone('string')).toBe('string');
      expect(deepClone(123)).toBe(123);
      expect(deepClone(null)).toBe(null);
    });

    it('should handle dates', () => {
      const date = new Date();
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('groupBy', () => {
    it('should group array items by key', () => {
      const items = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];

      const grouped = groupBy(items, 'category');

      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
      expect(grouped.A[0].value).toBe(1);
      expect(grouped.A[1].value).toBe(3);
    });
  });

  describe('removeDuplicates', () => {
    it('should remove primitive duplicates', () => {
      expect(removeDuplicates([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it('should remove object duplicates by key', () => {
      const items = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ];

      const unique = removeDuplicates(items, 'id');
      expect(unique).toHaveLength(2);
      expect(unique[0].id).toBe(1);
      expect(unique[1].id).toBe(2);
    });
  });

  describe('sortBy', () => {
    it('should sort objects by key', () => {
      const items = [
        { name: 'charlie', age: 30 },
        { name: 'alice', age: 25 },
        { name: 'bob', age: 35 },
      ];

      const sortedByName = sortBy(items, 'name');
      expect(sortedByName[0].name).toBe('alice');
      expect(sortedByName[1].name).toBe('bob');
      expect(sortedByName[2].name).toBe('charlie');

      const sortedByAge = sortBy(items, 'age', 'desc');
      expect(sortedByAge[0].age).toBe(35);
      expect(sortedByAge[1].age).toBe(30);
      expect(sortedByAge[2].age).toBe(25);
    });
  });

  describe('formatCurrency', () => {
    it('should format PHP currency', () => {
      expect(formatCurrency(1000)).toContain('₱');
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(1234.56)).toContain('1,235'); // Rounded
    });
  });

  describe('formatDate', () => {
    it('should format dates for Philippine locale', () => {
      const date = new Date('2023-12-25');
      const formatted = formatDate(date);

      expect(formatted).toContain('December');
      expect(formatted).toContain('25');
      expect(formatted).toContain('2023');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2023-12-25');
      expect(formatted).toContain('December');
    });
  });

  describe('parseQueryString and buildQueryString', () => {
    it('should parse query strings', () => {
      const parsed = parseQueryString('name=john&age=30&city=manila');
      expect(parsed).toEqual({
        name: 'john',
        age: '30',
        city: 'manila',
      });
    });

    it('should build query strings', () => {
      const query = buildQueryString({
        name: 'john',
        age: 30,
        active: true,
        empty: null,
        undefined: undefined,
      });

      expect(query).toContain('name=john');
      expect(query).toContain('age=30');
      expect(query).toContain('active=true');
      expect(query).not.toContain('empty');
      expect(query).not.toContain('undefined');
    });
  });
});

describe('Utilities - ID Generators', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^id-\d+-[a-z0-9]+$/);
    });

    it('should use custom prefix', () => {
      const id = generateId('custom');
      expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/);
    });
  });

  describe('getFieldId', () => {
    it('should use provided htmlFor', () => {
      expect(getFieldId('explicit-id')).toBe('explicit-id');
    });

    it('should use componentId as fallback', () => {
      expect(getFieldId(undefined, 'component-id')).toBe('component-id');
    });

    it('should generate ID as final fallback', () => {
      const id = getFieldId();
      expect(id).toMatch(/^field-\d+-\d+$/);
    });
  });

  describe('getFieldIds', () => {
    it('should generate related IDs', () => {
      const ids = getFieldIds('test-field');

      expect(ids.labelId).toBe('test-field-label');
      expect(ids.helperTextId).toBe('test-field-helper');
      expect(ids.errorId).toBe('test-field-error');
    });
  });

  describe('buildAriaDescribedBy', () => {
    it('should build aria-describedby string', () => {
      expect(buildAriaDescribedBy('helper-id', 'error-id')).toBe('helper-id error-id');
      expect(buildAriaDescribedBy('helper-id')).toBe('helper-id');
      expect(buildAriaDescribedBy(undefined, 'error-id')).toBe('error-id');
      expect(buildAriaDescribedBy()).toBeUndefined();
    });
  });
});

describe('Utilities - Async Utils', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');

      jest.advanceTimersByTime(100);

      throttledFn('arg4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('arg4');
    });
  });

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(10);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(9); // Allow for small timing variations
    });
  });

  describe('retry', () => {
    it('should retry failing functions', async () => {
      let attempts = 0;
      const failingFn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      };

      const result = await retry(failingFn, 3, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      const alwaysFailingFn = async () => {
        throw new Error('Always fails');
      };

      await expect(retry(alwaysFailingFn, 2, 10)).rejects.toThrow();
    });
  });
});

describe('Utilities - CSS Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      // mergeClassNames - REMOVED: Use `cn` instead
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'not-included')).toBe('base conditional');
    });

    it('should handle arrays and objects', () => {
      expect(cn(['class1', 'class2'], { active: true, disabled: false })).toBe(
        'class1 class2 active'
      );
    });
  });
});
