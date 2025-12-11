
import { CaseDetails } from '../types';

const STORAGE_KEY = 'clinicalmind_custom_cases';

export const saveCustomCase = (newCase: CaseDetails) => {
  const existing = getCustomCases();
  // Ensure we don't duplicate exact titles or add unique IDs in a real app
  // For now, we prepend new cases
  const updated = [newCase, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getCustomCases = (): CaseDetails[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as CaseDetails[];
  } catch (e) {
    console.error("Failed to parse local cases", e);
    return [];
  }
};

export const deleteCustomCase = (index: number) => {
  const existing = getCustomCases();
  existing.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};
