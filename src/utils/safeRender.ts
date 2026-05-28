/**
 * Safe Rendering Utilities
 * ────────────────────────
 * Defensive utilities to handle undefined/null/empty values from dynamic AI payloads.
 * Prevents white screen crashes when the backend returns incomplete or malformed data.
 */

/**
 * Safely join an array with a separator.
 * @param value - The value to join (may be undefined, null, or non-array)
 * @param separator - The separator string (default: ", ")
 * @returns Joined string or empty string if not an array
 */
export const safeJoin = (
  value: any,
  separator: string = ", "
): string => {
  if (!Array.isArray(value)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[safeJoin] Expected array but got ${typeof value}:`,
        value
      );
    }
    return "";
  }
  return value.join(separator);
};

/**
 * Safely ensure a value is an array.
 * @param value - The value to convert (may be undefined, null, or non-array)
 * @returns Array or empty array if not an array
 */
export const safeArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[safeArray] Expected array but got ${typeof value}:`,
      value
    );
  }
  return [];
};

/**
 * Safely convert a value to a string.
 * @param value - The value to convert
 * @param defaultValue - Default to return if value is falsy
 * @returns String or default value
 */
export const safeText = (
  value: any,
  defaultValue: string = ""
): string => {
  if (value === null || value === undefined) return defaultValue;
  return String(value).trim() || defaultValue;
};

/**
 * Safely map over an array with error handling.
 * @param value - The value to map over
 * @param fn - The mapping function
 * @returns Mapped array or empty array
 */
export const safeMap = <T, U>(
  value: any,
  fn: (item: T, index: number) => U
): U[] => {
  if (!Array.isArray(value)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[safeMap] Expected array but got ${typeof value}:`, value);
    }
    return [];
  }
  return value.map(fn);
};

/**
 * Safely filter an array with error handling.
 * @param value - The value to filter
 * @param fn - The filter predicate
 * @returns Filtered array or empty array
 */
export const safeFilter = <T>(
  value: any,
  fn: (item: T) => boolean
): T[] => {
  if (!Array.isArray(value)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[safeFilter] Expected array but got ${typeof value}:`,
        value
      );
    }
    return [];
  }
  return value.filter(fn);
};

/**
 * Safely get the length of an array or string.
 * @param value - The value to get length of
 * @returns Length or 0 if not an array/string
 */
export const safeLength = (value: any): number => {
  if (
    Array.isArray(value) ||
    typeof value === "string"
  ) {
    return value.length;
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[safeLength] Expected array or string but got ${typeof value}:`,
      value
    );
  }
  return 0;
};

/**
 * Safely access a nested property using optional chaining pattern.
 * @param obj - The object to access
 * @param path - The property path (e.g., "personality.values")
 * @param defaultValue - Default to return if path doesn't exist
 * @returns Value at path or default value
 */
export const safeGet = (
  obj: any,
  path: string,
  defaultValue: any = undefined
): any => {
  try {
    const value = path
      .split(".")
      .reduce((current, prop) => current?.[prop], obj);
    return value ?? defaultValue;
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[safeGet] Failed to access path "${path}" on:`, obj);
    }
    return defaultValue;
  }
};

/**
 * Ensure an object has a property with a safe default array.
 * @param obj - The object
 * @param prop - The property name
 * @param defaultArray - Default array to use if undefined/not an array
 * @returns Object with safe array property
 */
export const ensureArray = (
  obj: any,
  prop: string,
  defaultArray: any[] = []
): any => {
  if (!obj) return { [prop]: defaultArray };
  if (!Array.isArray(obj[prop])) {
    return { ...obj, [prop]: defaultArray };
  }
  return obj;
};

/**
 * Ensure an object has a property with a safe default string.
 * @param obj - The object
 * @param prop - The property name
 * @param defaultValue - Default value to use if undefined
 * @returns Object with safe string property
 */
export const ensureString = (
  obj: any,
  prop: string,
  defaultValue: string = ""
): any => {
  if (!obj) return { [prop]: defaultValue };
  const value = obj[prop];
  if (typeof value !== "string") {
    return { ...obj, [prop]: defaultValue };
  }
  return obj;
};

/**
 * Validate and sanitize array data from AI extraction.
 * @param data - The array to validate
 * @param itemValidator - Optional function to validate each item
 * @returns Validated array or empty array
 */
export const validateArray = <T>(
  data: any,
  itemValidator?: (item: any) => boolean
): T[] => {
  if (!Array.isArray(data)) return [];
  
  if (itemValidator) {
    return data.filter(itemValidator);
  }
  
  return data.filter(item => item !== null && item !== undefined);
};

/**
 * Log a warning in development about malformed data.
 * @param context - Where the warning occurred (e.g., "Step2Business")
 * @param field - The field that's malformed
 * @param value - The malformed value
 */
export const warnMalformedData = (
  context: string,
  field: string,
  value: any
): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[${context}] Malformed field "${field}":`,
      value,
      "Expected array but got:",
      typeof value
    );
  }
};

/**
 * Create a safe default for a data object with nested arrays/objects.
 * @param data - The data object
 * @param schema - The expected schema (defines what properties should be arrays)
 * @returns Data object with all required properties safe
 */
export const ensureDataShape = (
  data: any,
  schema: Record<string, any>
): any => {
  if (!data) return schema;
  
  const result = { ...data };
  
  for (const [key, schemaValue] of Object.entries(schema)) {
    if (Array.isArray(schemaValue)) {
      if (!Array.isArray(result[key])) {
        result[key] = schemaValue;
      }
    } else if (typeof schemaValue === "object" && schemaValue !== null) {
      if (typeof result[key] !== "object" || result[key] === null) {
        result[key] = schemaValue;
      }
    }
  }
  
  return result;
};
