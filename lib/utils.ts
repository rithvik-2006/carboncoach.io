import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines tailwind CSS classes using clsx and tailwind-merge to avoid class conflicts.
 * 
 * @param {...ClassValue[]} inputs - Array of class values or objects to be combined.
 * @returns {string} The resolved class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
